const Schedule = require('../models/schedule.model');
const Tour = require('../models/tour.model');
const Booking = require('../models/booking.model');

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

const completeSchedule = async (id, actorUser) => {
  const schedule = await Schedule.findById(id);
  if (!schedule) return null;

  const role = actorUser?.role;
  if (!role) {
    throw new Error('Không xác định người thực hiện');
  }

  // Staff can only complete schedules assigned to them.
  if (role === 'staff') {
    if (!schedule.tourGuideId) {
      throw new Error('Lịch này chưa được gán trưởng đoàn');
    }
    if (String(schedule.tourGuideId) !== String(actorUser._id)) {
      throw new Error('Bạn không có quyền hoàn thành lịch khởi hành này');
    }
  } else if (role !== 'admin') {
    throw new Error('Không có quyền thực hiện thao tác này');
  }

  if (schedule.status === 'Cancelled') {
    throw new Error('Không thể hoàn thành lịch đã hủy');
  }
  if (schedule.status === 'Completed') {
    return schedule;
  }

  if (schedule.status !== 'Started') {
    throw new Error('Vui lòng chuyển trạng thái Khởi hành trước khi hoàn thành');
  }

  const now = new Date();
  if (schedule.endDate && schedule.endDate > now) {
    throw new Error('Chỉ có thể hoàn thành sau khi tour kết thúc');
  }

  schedule.status = 'Completed';
  const saved = await schedule.save();

  // When the tour is completed, mark all bookings in this schedule as COMPLETED (except cancelled)
  await Booking.updateMany(
    { scheduleId: schedule._id, status: { $ne: 'CANCELLED' } },
    { $set: { status: 'COMPLETED' } },
  );

  return saved;
};

const startSchedule = async (id, actorUser) => {
  const schedule = await Schedule.findById(id);
  if (!schedule) return null;

  const role = actorUser?.role;
  if (!role) {
    throw new Error('Không xác định người thực hiện');
  }

  // Staff can only start schedules assigned to them.
  if (role === 'staff') {
    if (!schedule.tourGuideId) {
      throw new Error('Lịch này chưa được gán trưởng đoàn');
    }
    if (String(schedule.tourGuideId) !== String(actorUser._id)) {
      throw new Error('Bạn không có quyền khởi hành lịch khởi hành này');
    }
  } else if (role !== 'admin') {
    throw new Error('Không có quyền thực hiện thao tác này');
  }

  if (schedule.status === 'Cancelled') {
    throw new Error('Không thể khởi hành lịch đã hủy');
  }
  if (schedule.status === 'Completed') {
    throw new Error('Lịch đã hoàn thành');
  }
  if (schedule.status === 'Started') {
    return schedule;
  }

  const now = new Date();
  if (schedule.startDate && schedule.startDate > now) {
    throw new Error('Chỉ có thể khởi hành khi đến ngày khởi hành');
  }

  // Auto-cancel HOLD bookings (still pending) when tour starts
  const holdBookings = await Booking.find({ scheduleId: schedule._id, status: 'HOLD' }).select('_id totalGuests');
  if (holdBookings.length > 0) {
    const holdGuests = holdBookings.reduce((sum, b) => sum + (Number(b.totalGuests) || 0), 0);
    if (holdGuests > 0) {
      schedule.bookedSlots = Math.max(0, Number(schedule.bookedSlots || 0) - holdGuests);
    }
    await Booking.updateMany(
      { _id: { $in: holdBookings.map((b) => b._id) } },
      { $set: { status: 'CANCELLED', cancelReason: 'Tự động hủy do tour đã khởi hành' } },
    );
  }

  // Move CONFIRMED bookings to DEPARTED so they can no longer be cancelled/refunded
  await Booking.updateMany(
    { scheduleId: schedule._id, status: 'CONFIRMED' },
    { $set: { status: 'DEPARTED' } },
  );

  schedule.status = 'Started';
  return await schedule.save();
};

const cancelSchedule = async (id, actorUser) => {
  const schedule = await Schedule.findById(id);
  if (!schedule) return null;

  const role = actorUser?.role;
  if (!role) {
    throw new Error('Không xác định người thực hiện');
  }

  if (role === 'staff') {
    if (!schedule.tourGuideId) {
      throw new Error('Lịch này chưa được gán trưởng đoàn');
    }
    if (String(schedule.tourGuideId) !== String(actorUser._id)) {
      throw new Error('Bạn không có quyền hủy lịch khởi hành này');
    }
  } else if (role !== 'admin') {
    throw new Error('Không có quyền thực hiện thao tác này');
  }

  if (schedule.status === 'Cancelled') {
    return schedule;
  }
  if (schedule.status === 'Completed') {
    throw new Error('Không thể hủy lịch đã hoàn thành');
  }

  schedule.status = 'Cancelled';
  schedule.bookedSlots = 0;
  const saved = await schedule.save();

  // Cancel all non-cancelled/non-completed bookings linked to this schedule
  await Booking.updateMany(
    { scheduleId: schedule._id, status: { $nin: ['CANCELLED', 'COMPLETED'] } },
    { $set: { status: 'CANCELLED', cancelReason: 'Lịch khởi hành đã bị hủy' } },
  );

  return saved;
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
  startSchedule,
  completeSchedule,
  cancelSchedule,
  deleteScheduleById
};
