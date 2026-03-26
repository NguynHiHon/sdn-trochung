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

const getCertificateByCode = async (req, res) => {
    try {
        const cert = await certificateService.getCertificateByCode(req.params.certificateCode);
        if (!cert) return res.status(404).json({ success: false, message: 'Chứng chỉ không tồn tại' });
        return res.status(200).json({ success: true, data: cert });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getCertificateByParticipant, getCertificateByCode };
