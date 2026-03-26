const certificateService = require('../services/certificate.service');

const getCertificateByParticipant = async (req, res) => {
    try {
        const cert = await certificateService.getCertificateByParticipant(req.params.participantId);
        if (!cert) return res.status(404).json({ success: false, message: 'Chứng chỉ không tồn tại' });
        res.status(200).json({ success: true, data: cert });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getCertificateByParticipant };
