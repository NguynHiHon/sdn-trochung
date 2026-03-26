const assignmentService = require('../services/assignment.service');

const assignBooking = async (req, res) => {
    try {
        const { bookingId, staffId, note } = req.body;
        const assignment = await assignmentService.assignBooking({
            bookingId, staffId, assignedBy: req.user._id, note,
        });
        res.status(201).json({ success: true, data: assignment, message: 'Phân công thành công' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Booking này đã được phân công cho nhân viên này rồi' });
        }
        if (error.message === 'Booking not found') {
            return res.status(404).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAssignments = async (req, res) => {
    try {
        const result = await assignmentService.getAssignments(req.query);
        res.status(200).json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const assignment = await assignmentService.updateAssignmentStatus(req.params.id, status, req.user._id);
        res.status(200).json({ success: true, data: assignment, message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        if (error.message === 'Assignment not found') {
            return res.status(404).json({ success: false, message: 'Yêu cầu tư vấn không tồn tại' });
        }
        if (error.message.includes('không có quyền')) {
            return res.status(403).json({ success: false, message: error.message });
        }
        if (error.message.includes('chỉ có thể') || error.message.includes('đã được xử lý')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { assignBooking, getAssignments, updateStatus };
