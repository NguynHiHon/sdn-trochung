const Certificate = require('../models/certificate.model');
const Booking = require('../models/booking.model');
const crypto = require('crypto');

const generateCertificateCode = () => {
    const year = new Date().getFullYear();
    const hex = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `CERT-${year}-${hex}`;
};

const createCertificate = async (participant) => {
    const booking = await Booking.findById(participant.bookingId)
        .populate('tourId', 'name code')
        .populate('scheduleId', 'startDate endDate');

    if (!booking) throw new Error('Booking không tồn tại');

    const tour = booking.tourId;
    const schedule = booking.scheduleId;

    let certCode;
    let attempts = 0;
    do {
        certCode = generateCertificateCode();
        attempts++;
        if (attempts > 10) throw new Error('Không thể tạo mã chứng chỉ duy nhất');
    } while (await Certificate.exists({ certificateCode: certCode }));

    const cert = new Certificate({
        certificateCode: certCode,
        participantId: participant._id,
        bookingId: booking._id,
        tourId: tour._id,
        scheduleId: schedule._id,
        participantName: participant.fullName,
        tourName: tour?.name?.vi || tour?.name || '',
        startDate: schedule.startDate,
        endDate: schedule.endDate,
    });

    return await cert.save();
};

const getCertificateByParticipant = async (participantId) => {
    return await Certificate.findOne({ participantId });
};

const getCertificateByCode = async (certificateCode) => {
    const normalized = String(certificateCode || '').trim().toUpperCase();
    if (!normalized) throw new Error('Mã chứng chỉ không hợp lệ');
    return await Certificate.findOne({ certificateCode: normalized });
};

module.exports = { createCertificate, getCertificateByParticipant, getCertificateByCode };
