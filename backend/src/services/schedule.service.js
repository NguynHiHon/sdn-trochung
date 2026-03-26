const Schedule = require('../models/schedule.model');
const Tour = require('../models/tour.model');

const getAllSchedules = async ({ tourId, status, hidden = 'all', month, year, tourGuideId, page = 1, limit = 20 }) => {
  const filter = {};

  if (tourId && tourId !== 'all') {
    filter.tourId = tourId;
  }
  if (status && status !== 'all') {
    filter.status = status;
  }
  if (hidden === 'visible') {
    filter.isHidden = false;
  } else if (hidden === 'hidden') {
    filter.isHidden = true;
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
  try {
    const newSchedule = new Schedule(data);
    return await newSchedule.save();
  } catch (error) {
    if (error?.code === 11000) {
      throw new Error('Lịch khởi hành cho tour này đã tồn tại tại thời điểm đã chọn. Vui lòng chọn ngày/giờ khác.');
    }
    throw error;
  }
};

const bulkCreateSchedules = async (tourId, dates) => {
  const tour = await Tour.findById(tourId);
  if (!tour) throw new Error('Tour không tồn tại');

  const durationMs = (tour.durationDays - 1) * 24 * 60 * 60 * 1000;

  const starts = dates.map((date) => new Date(date));
  const existed = await Schedule.find({ tourId, startDate: { $in: starts } }).select('startDate');
  if (existed.length > 0) {
    const existedDates = existed
      .map((s) => new Date(s.startDate).toLocaleDateString('vi-VN'))
      .join(', ');
    throw new Error(`Tour đã có lịch trùng ngày: ${existedDates}. Vui lòng bỏ các ngày trùng rồi thử lại.`);
  }

  const schedules = dates.map(date => {
    const start = new Date(date);
    const end = new Date(start.getTime() + durationMs);
    return {
      tourId,
      startDate: start,
      endDate: end,
      capacity: tour.groupSize || 10,
      bookedSlots: 0,
      status: 'Available',
      isHidden: false,
    };
  });

  try {
    return await Schedule.insertMany(schedules);
  } catch (error) {
    if (error?.code === 11000) {
      throw new Error('Có lịch trùng với dữ liệu hiện có, vui lòng kiểm tra lại danh sách ngày.');
    }
    throw error;
  }
};

const updateScheduleById = async (id, updateData) => {
  // Triggers pre-save hook? findByIdAndUpdate doesn't trigger pre-save by default unless configured or manually handled.
  // So we fetch, update, and save.
  const schedule = await Schedule.findById(id);
  if (!schedule) return null;

  if (Object.prototype.hasOwnProperty.call(updateData, 'startDate') || Object.prototype.hasOwnProperty.call(updateData, 'endDate')) {
    throw new Error('Không cho phép sửa ngày khởi hành/kết thúc. Vui lòng tạo lịch mới nếu cần đổi ngày.');
  }

  Object.assign(schedule, updateData);
  try {
    return await schedule.save();
  } catch (error) {
    if (error?.code === 11000) {
      throw new Error('Lịch khởi hành cho tour này đã tồn tại tại thời điểm đã chọn.');
    }
    throw error;
  }
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
