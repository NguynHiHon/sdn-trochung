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
    res.status(400).json({ success: false, message: error.message });
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
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateSchedule = async (req, res) => {
  try {
    const updated = await ScheduleService.updateScheduleById(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch khởi hành' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const completeSchedule = async (req, res) => {
  try {
    const updated = await ScheduleService.completeSchedule(req.params.id, req.user);
    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch khởi hành' });
    res.status(200).json({ success: true, data: updated, message: 'Đã cập nhật trạng thái lịch khởi hành: Hoàn thành' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const startSchedule = async (req, res) => {
  try {
    const updated = await ScheduleService.startSchedule(req.params.id, req.user);
    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch khởi hành' });
    res.status(200).json({ success: true, data: updated, message: 'Đã cập nhật trạng thái lịch khởi hành: Khởi hành' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const cancelSchedule = async (req, res) => {
  try {
    const updated = await ScheduleService.cancelSchedule(req.params.id, req.user);
    if (!updated) return res.status(404).json({ success: false, message: 'Không tìm thấy lịch khởi hành' });
    res.status(200).json({ success: true, data: updated, message: 'Đã hủy lịch khởi hành' });
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

module.exports = { getAllSchedules, getScheduleById, createSchedule, bulkCreateSchedules, updateSchedule, startSchedule, completeSchedule, cancelSchedule, deleteSchedule };
