const Schedule = require('../models/schedule.model');
const Tour = require('../models/tour.model');
const User = require('../models/users');

const toDateOnlyIso = (date) => new Date(date).toISOString().slice(0, 10);

const makeDetailedDuplicateError = (tour, duplicates) => {
  const header = `Lịch khởi hành bị trùng cho tour ${tour?.code || ''} (${tour?._id || ''})`;
  const lines = duplicates.map((d, idx) => `${idx + 1}. ${d.date} - nguồn: ${d.source}`);
  const err = new Error(`${header}. Các ngày trùng:\n${lines.join('\n')}`);
  err.statusCode = 409;
  err.code = 'SCHEDULE_DUPLICATE';
  err.details = {
    tour: {
      id: String(tour?._id || ''),
      code: tour?.code || '',
      name: tour?.name?.vi || tour?.name?.en || '',
    },
    duplicates,
  };
  return err;
};

const parseMongoDuplicateKeyError = (error, tour) => {
  if (!error || error.code !== 11000) return null;

  const duplicateDate = error?.keyValue?.startDate
    ? toDateOnlyIso(error.keyValue.startDate)
    : null;

  const duplicates = duplicateDate
    ? [{ date: duplicateDate, source: 'database' }]
    : [];

  return makeDetailedDuplicateError(tour, duplicates.length ? duplicates : [{ date: 'unknown', source: 'database' }]);
};

const getAllSchedules = async ({ tourId, status, month, year, tourGuideId, page = 1, limit = 20 }) => {
  const filter = {};

  if (tourId && tourId !== 'all') {
    filter.tourId = tourId;
  }
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (tourGuideId && tourGuideId !== 'all') {
    filter.tourGuideId = tourGuideId;
  }
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    filter.startDate = { $gte: startDate, $lte: endDate };
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const data = await Schedule.find(filter)
    .populate('tourId', 'name code durationDays')
    .populate('tourGuideId', 'fullName username email phone')
    .sort({ startDate: 1 })
    .skip(skip)
    .limit(limitNum);

  const normalizedData = data.map((item) => {
    const s = item.toObject();
    const history = Array.isArray(s.guideAssignmentHistory) ? s.guideAssignmentHistory : [];
    s.lastGuideAction = history.length > 0 ? history[history.length - 1] : null;
    return s;
  });

  const total = await Schedule.countDocuments(filter);

  return {
    data: normalizedData,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum)
  };
};

const getScheduleById = async (id) => {
  return await Schedule.findById(id)
    .populate('tourId', 'name code durationDays groupSize ageMin ageMax')
    .populate('tourGuideId', 'fullName username email phone');
};

const createSchedule = async (data) => {
  const tour = await Tour.findById(data.tourId).select('_id code name');
  const newSchedule = new Schedule(data);

  try {
    return await newSchedule.save();
  } catch (error) {
    const parsedDuplicate = parseMongoDuplicateKeyError(error, tour);
    if (parsedDuplicate) throw parsedDuplicate;
    throw error;
  }
};

const bulkCreateSchedules = async (tourId, dates) => {
  const tour = await Tour.findById(tourId).select('_id code name durationDays groupSize');
  if (!tour) throw new Error('Tour không tồn tại');

  const durationMs = (tour.durationDays - 1) * 24 * 60 * 60 * 1000;

  const normalizedStarts = dates.map((date, index) => {
    const start = new Date(date);
    if (Number.isNaN(start.getTime())) {
      const err = new Error(`Ngày không hợp lệ tại vị trí ${index + 1}: ${date}`);
      err.statusCode = 400;
      throw err;
    }
    return start;
  });

  const seenDates = new Set();
  const duplicateInRequest = [];
  normalizedStarts.forEach((start) => {
    const key = toDateOnlyIso(start);
    if (seenDates.has(key)) {
      duplicateInRequest.push({ date: key, source: 'request' });
    } else {
      seenDates.add(key);
    }
  });

  const existingSchedules = await Schedule.find({
    tourId,
    startDate: { $in: normalizedStarts },
  }).select('startDate');

  const duplicateInDatabase = existingSchedules.map((s) => ({
    date: toDateOnlyIso(s.startDate),
    source: 'database',
  }));

  const allDuplicates = [...duplicateInRequest, ...duplicateInDatabase].reduce((acc, item) => {
    const key = `${item.date}-${item.source}`;
    if (!acc.some((x) => `${x.date}-${x.source}` === key)) acc.push(item);
    return acc;
  }, []);

  if (allDuplicates.length > 0) {
    throw makeDetailedDuplicateError(tour, allDuplicates);
  }

  const schedules = normalizedStarts.map(start => {
    const end = new Date(start.getTime() + durationMs);
    return {
      tourId,
      startDate: start,
      endDate: end,
      capacity: tour.groupSize || 10,
      bookedSlots: 0,
      status: 'Available'
    };
  });

  try {
    return await Schedule.insertMany(schedules);
  } catch (error) {
    const parsedDuplicate = parseMongoDuplicateKeyError(error, tour);
    if (parsedDuplicate) throw parsedDuplicate;
    throw error;
  }
};

const updateScheduleById = async (id, updateData, changedBy = null) => {
  // Triggers pre-save hook? findByIdAndUpdate doesn't trigger pre-save by default unless configured or manually handled.
  // So we fetch, update, and save.
  const schedule = await Schedule.findById(id);
  if (!schedule) return null;

  const hasTourGuideField = Object.prototype.hasOwnProperty.call(updateData, 'tourGuideId');
  if (hasTourGuideField) {
    const previousGuideId = schedule.tourGuideId ? String(schedule.tourGuideId) : null;
    const nextGuideId = updateData.tourGuideId ? String(updateData.tourGuideId) : null;

    if (nextGuideId && previousGuideId !== nextGuideId) {
      const guideUser = await User.findById(nextGuideId).select('role');
      if (!guideUser || guideUser.role !== 'staff') {
        throw new Error('tourGuideId phải là tài khoản nhân viên hợp lệ');
      }
    }

    if (previousGuideId !== nextGuideId) {
      if (nextGuideId) {
        schedule.guideAssignmentHistory.push({
          action: 'assigned',
          guideId: nextGuideId,
          changedBy,
          note: 'Admin phân công trưởng đoàn',
        });
      } else {
        schedule.guideAssignmentHistory.push({
          action: 'unassigned',
          guideId: previousGuideId,
          changedBy,
          note: 'Admin bỏ phân công trưởng đoàn',
        });
      }
    }
  }

  Object.assign(schedule, updateData);
  return await schedule.save();
};

const deleteScheduleById = async (id) => {
  // Prevent deletion if there are booked slots?
  const schedule = await Schedule.findById(id);
  if (schedule && schedule.bookedSlots > 0) {
    throw new Error('Không thể xóa lịch trình đã có người đặt chỗ.');
  }
  return await Schedule.findByIdAndDelete(id);
};

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  bulkCreateSchedules,
  updateScheduleById,
  deleteScheduleById
};
