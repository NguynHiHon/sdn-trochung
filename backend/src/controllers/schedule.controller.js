const ScheduleService = require('../services/schedule.service');

const getAllSchedules = async (req, res) => {
  try {
    const result = await ScheduleService.getAllSchedules(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getScheduleById = async (req, res) => {
  try {
    const schedule = await ScheduleService.getScheduleById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch khởi hành' });
    res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createSchedule = async (req, res) => {
  try {
    const newSchedule = await ScheduleService.createSchedule(req.body);
    res.status(201).json({ success: true, data: newSchedule });
  } catch (error) {
    const status = error.statusCode || 400;
    if (error.code === 'SCHEDULE_DUPLICATE') {
      console.warn('[schedule.create] duplicate detected', {
        tour: error.details?.tour,
        duplicates: error.details?.duplicates,
      });
    }
    res.status(status).json({ success: false, message: error.message, details: error.details || null });
  }
};

const bulkCreateSchedules = async (req, res) => {
  try {
    const { tourId, dates } = req.body;
    if (!tourId || !dates || !Array.isArray(dates)) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin tourId hoặc danh sách dates hợp lệ.' });
    }
    const created = await ScheduleService.bulkCreateSchedules(tourId, dates);
    res.status(201).json({ success: true, data: created, message: `Đã tạo ${created.length} lịch khởi hành.` });
  } catch (error) {
    const status = error.statusCode || 400;
    if (error.code === 'SCHEDULE_DUPLICATE') {
      console.warn('[schedule.bulkCreate] duplicate detected', {
        requestedCount: Array.isArray(req.body?.dates) ? req.body.dates.length : 0,
        tour: error.details?.tour,
        duplicates: error.details?.duplicates,
      });
    }
    res.status(status).json({ success: false, message: error.message, details: error.details || null });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const updated = await ScheduleService.updateScheduleById(req.params.id, req.body, req.user?._id || null);
    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch khởi hành' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    await ScheduleService.deleteScheduleById(req.params.id);
    res.status(200).json({ success: true, message: 'Xóa lịch khởi hành thành công' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getAllSchedules, getScheduleById, createSchedule, bulkCreateSchedules, updateSchedule, deleteSchedule };
