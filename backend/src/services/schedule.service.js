const Schedule = require('../models/schedule.model');
const Tour = require('../models/tour.model');

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

  const total = await Schedule.countDocuments(filter);

  return {
    data,
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
  const newSchedule = new Schedule(data);
  return await newSchedule.save();
};

const bulkCreateSchedules = async (tourId, dates) => {
  const tour = await Tour.findById(tourId);
  if (!tour) throw new Error('Tour không tồn tại');

  const durationMs = (tour.durationDays - 1) * 24 * 60 * 60 * 1000;

  const schedules = dates.map(date => {
    const start = new Date(date);
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

  return await Schedule.insertMany(schedules);
};

const updateScheduleById = async (id, updateData) => {
  // Triggers pre-save hook? findByIdAndUpdate doesn't trigger pre-save by default unless configured or manually handled.
  // So we fetch, update, and save.
  const schedule = await Schedule.findById(id);
  if (!schedule) return null;

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
