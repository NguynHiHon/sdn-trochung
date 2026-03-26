const { body, param, query } = require('express-validator');

const isMongoIdOrEmpty = (value) => {
    if (value === undefined || value === null || value === '') return true;
    return /^[a-f\d]{24}$/i.test(String(value));
};

const validateCaveCreate = [
    body('name.vi').trim().notEmpty().withMessage('Tên hang động (VI) là bắt buộc').isLength({ max: 120 }).withMessage('Tên hang động (VI) tối đa 120 ký tự'),
    body('name.en').trim().notEmpty().withMessage('Tên hang động (EN) là bắt buộc').isLength({ max: 120 }).withMessage('Tên hang động (EN) tối đa 120 ký tự'),
    body('description.vi').optional().isString().isLength({ max: 5000 }).withMessage('Mô tả (VI) tối đa 5000 ký tự'),
    body('description.en').optional().isString().isLength({ max: 5000 }).withMessage('Mô tả (EN) tối đa 5000 ký tự'),
    body('address.vi').optional().isString().isLength({ max: 255 }).withMessage('Địa chỉ (VI) tối đa 255 ký tự'),
    body('address.en').optional().isString().isLength({ max: 255 }).withMessage('Địa chỉ (EN) tối đa 255 ký tự'),
    body('system.vi').optional().isString().isLength({ max: 255 }).withMessage('Hệ thống hang (VI) tối đa 255 ký tự'),
    body('system.en').optional().isString().isLength({ max: 255 }).withMessage('Hệ thống hang (EN) tối đa 255 ký tự'),
    body('location').optional().isObject().withMessage('location phải là object'),
    body('location.lat').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }).withMessage('Vĩ độ (lat) phải trong khoảng -90 đến 90'),
    body('location.lng').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }).withMessage('Kinh độ (lng) phải trong khoảng -180 đến 180'),
    body().custom((data) => {
        const lat = data?.location?.lat;
        const lng = data?.location?.lng;
        const hasLat = lat !== undefined && lat !== null && String(lat).trim() !== '';
        const hasLng = lng !== undefined && lng !== null && String(lng).trim() !== '';
        if (hasLat !== hasLng) {
            throw new Error('Phải nhập đồng thời cả vĩ độ và kinh độ');
        }
        return true;
    }),
    body('length').optional({ values: 'falsy' }).isFloat({ min: 0, max: 1000000 }).withMessage('Chiều dài phải từ 0 đến 1,000,000 mét'),
    body('depth').optional({ values: 'falsy' }).isFloat({ min: 0, max: 20000 }).withMessage('Độ sâu phải từ 0 đến 20,000 mét'),
    body('heritageLevel').optional().isIn(['world', 'national', 'provincial', 'none']).withMessage('heritageLevel không hợp lệ'),
    body('thumbnail').optional({ nullable: true }).custom(isMongoIdOrEmpty).withMessage('thumbnail không hợp lệ'),
    body('gallery').optional().isArray({ max: 50 }).withMessage('gallery phải là mảng, tối đa 50 ảnh'),
    body('gallery.*').optional().custom(isMongoIdOrEmpty).withMessage('gallery chứa media id không hợp lệ'),
];

const validateCaveUpdate = [
    param('id').isMongoId().withMessage('Cave ID không hợp lệ'),
    body('name.vi').optional().trim().notEmpty().withMessage('Tên hang động (VI) không được để trống').isLength({ max: 120 }).withMessage('Tên hang động (VI) tối đa 120 ký tự'),
    body('name.en').optional().trim().notEmpty().withMessage('Tên hang động (EN) không được để trống').isLength({ max: 120 }).withMessage('Tên hang động (EN) tối đa 120 ký tự'),
    body('description.vi').optional().isString().isLength({ max: 5000 }).withMessage('Mô tả (VI) tối đa 5000 ký tự'),
    body('description.en').optional().isString().isLength({ max: 5000 }).withMessage('Mô tả (EN) tối đa 5000 ký tự'),
    body('address.vi').optional().isString().isLength({ max: 255 }).withMessage('Địa chỉ (VI) tối đa 255 ký tự'),
    body('address.en').optional().isString().isLength({ max: 255 }).withMessage('Địa chỉ (EN) tối đa 255 ký tự'),
    body('system.vi').optional().isString().isLength({ max: 255 }).withMessage('Hệ thống hang (VI) tối đa 255 ký tự'),
    body('system.en').optional().isString().isLength({ max: 255 }).withMessage('Hệ thống hang (EN) tối đa 255 ký tự'),
    body('location').optional().isObject().withMessage('location phải là object'),
    body('location.lat').optional({ values: 'falsy' }).isFloat({ min: -90, max: 90 }).withMessage('Vĩ độ (lat) phải trong khoảng -90 đến 90'),
    body('location.lng').optional({ values: 'falsy' }).isFloat({ min: -180, max: 180 }).withMessage('Kinh độ (lng) phải trong khoảng -180 đến 180'),
    body().custom((data) => {
        const lat = data?.location?.lat;
        const lng = data?.location?.lng;
        const hasLat = lat !== undefined && lat !== null && String(lat).trim() !== '';
        const hasLng = lng !== undefined && lng !== null && String(lng).trim() !== '';
        if (hasLat !== hasLng) {
            throw new Error('Phải nhập đồng thời cả vĩ độ và kinh độ');
        }
        return true;
    }),
    body('length').optional({ values: 'falsy' }).isFloat({ min: 0, max: 1000000 }).withMessage('Chiều dài phải từ 0 đến 1,000,000 mét'),
    body('depth').optional({ values: 'falsy' }).isFloat({ min: 0, max: 20000 }).withMessage('Độ sâu phải từ 0 đến 20,000 mét'),
    body('heritageLevel').optional().isIn(['world', 'national', 'provincial', 'none']).withMessage('heritageLevel không hợp lệ'),
    body('thumbnail').optional({ nullable: true }).custom(isMongoIdOrEmpty).withMessage('thumbnail không hợp lệ'),
    body('gallery').optional().isArray({ max: 50 }).withMessage('gallery phải là mảng, tối đa 50 ảnh'),
    body('gallery.*').optional().custom(isMongoIdOrEmpty).withMessage('gallery chứa media id không hợp lệ'),
];

const validateTourCreate = [
    body('name.vi').trim().notEmpty().withMessage('Tên tour (VI) là bắt buộc').isLength({ max: 150 }).withMessage('Tên tour (VI) tối đa 150 ký tự'),
    body('name.en').trim().notEmpty().withMessage('Tên tour (EN) là bắt buộc').isLength({ max: 150 }).withMessage('Tên tour (EN) tối đa 150 ký tự'),
    body('code').trim().notEmpty().withMessage('Mã tour là bắt buộc').matches(/^[A-Za-z0-9_-]{2,30}$/).withMessage('Mã tour chỉ gồm chữ/số/_/- và dài 2-30 ký tự'),
    body('slug').trim().notEmpty().withMessage('Slug là bắt buộc').matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug chỉ được chứa chữ thường, số và dấu gạch ngang'),
    body('priceVND').notEmpty().withMessage('Giá VND là bắt buộc').isFloat({ min: 0 }).withMessage('Giá VND phải >= 0'),
    body('priceUSD').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Giá USD phải >= 0'),
    body('durationDays').notEmpty().withMessage('Số ngày là bắt buộc').isInt({ min: 1, max: 365 }).withMessage('Số ngày phải từ 1 đến 365'),
    body('adventureLevel').notEmpty().withMessage('Độ khó là bắt buộc').isInt({ min: 1, max: 6 }).withMessage('Độ khó phải từ 1 đến 6'),
    body('groupSize').optional({ values: 'falsy' }).isInt({ min: 1, max: 500 }).withMessage('Số người/tour phải từ 1 đến 500'),
    body('ageMin').optional({ values: 'falsy' }).isInt({ min: 0, max: 120 }).withMessage('Tuổi tối thiểu phải từ 0 đến 120'),
    body('ageMax').optional({ values: 'falsy' }).isInt({ min: 0, max: 120 }).withMessage('Tuổi tối đa phải từ 0 đến 120'),
    body().custom((data) => {
        const ageMin = data?.ageMin;
        const ageMax = data?.ageMax;
        if (ageMin !== undefined && ageMin !== '' && ageMax !== undefined && ageMax !== '' && Number(ageMin) > Number(ageMax)) {
            throw new Error('Tuổi tối thiểu không được lớn hơn tuổi tối đa');
        }
        return true;
    }),
    body('tourType').optional().isIn(['multiday', 'overnight', 'daytour', 'family']).withMessage('Loại tour không hợp lệ'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Trạng thái tour không hợp lệ'),
    body('categoryId').optional({ nullable: true }).custom(isMongoIdOrEmpty).withMessage('categoryId không hợp lệ'),
    body('caveId').optional({ nullable: true }).custom(isMongoIdOrEmpty).withMessage('caveId không hợp lệ'),
    body('thumbnail').optional({ nullable: true }).custom(isMongoIdOrEmpty).withMessage('thumbnail không hợp lệ'),
    body('banner').optional({ nullable: true }).custom(isMongoIdOrEmpty).withMessage('banner không hợp lệ'),
    body('gallery').optional().isArray({ max: 80 }).withMessage('gallery tối đa 80 ảnh'),
    body('gallery.*').optional().custom(isMongoIdOrEmpty).withMessage('gallery chứa media id không hợp lệ'),
    body('itinerary').optional().isArray({ max: 60 }).withMessage('itinerary tối đa 60 ngày'),
    body('itinerary.*.dayNumber').optional().isInt({ min: 1, max: 365 }).withMessage('dayNumber không hợp lệ'),
    body('faqs').optional().isArray({ max: 100 }).withMessage('faqs tối đa 100 mục'),
];

const validateTourUpdate = [
    param('id').isMongoId().withMessage('Tour ID không hợp lệ'),
    body('name.vi').optional().trim().notEmpty().withMessage('Tên tour (VI) không được để trống').isLength({ max: 150 }).withMessage('Tên tour (VI) tối đa 150 ký tự'),
    body('name.en').optional().trim().notEmpty().withMessage('Tên tour (EN) không được để trống').isLength({ max: 150 }).withMessage('Tên tour (EN) tối đa 150 ký tự'),
    body('code').optional().trim().notEmpty().withMessage('Mã tour không được để trống').matches(/^[A-Za-z0-9_-]{2,30}$/).withMessage('Mã tour chỉ gồm chữ/số/_/- và dài 2-30 ký tự'),
    body('slug').optional().trim().notEmpty().withMessage('Slug không được để trống').matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).withMessage('Slug chỉ được chứa chữ thường, số và dấu gạch ngang'),
    body('priceVND').optional().isFloat({ min: 0 }).withMessage('Giá VND phải >= 0'),
    body('priceUSD').optional({ values: 'falsy' }).isFloat({ min: 0 }).withMessage('Giá USD phải >= 0'),
    body('durationDays').optional().isInt({ min: 1, max: 365 }).withMessage('Số ngày phải từ 1 đến 365'),
    body('adventureLevel').optional().isInt({ min: 1, max: 6 }).withMessage('Độ khó phải từ 1 đến 6'),
    body('groupSize').optional({ values: 'falsy' }).isInt({ min: 1, max: 500 }).withMessage('Số người/tour phải từ 1 đến 500'),
    body('ageMin').optional({ values: 'falsy' }).isInt({ min: 0, max: 120 }).withMessage('Tuổi tối thiểu phải từ 0 đến 120'),
    body('ageMax').optional({ values: 'falsy' }).isInt({ min: 0, max: 120 }).withMessage('Tuổi tối đa phải từ 0 đến 120'),
    body().custom((data) => {
        const ageMin = data?.ageMin;
        const ageMax = data?.ageMax;
        if (ageMin !== undefined && ageMin !== '' && ageMax !== undefined && ageMax !== '' && Number(ageMin) > Number(ageMax)) {
            throw new Error('Tuổi tối thiểu không được lớn hơn tuổi tối đa');
        }
        return true;
    }),
    body('tourType').optional().isIn(['multiday', 'overnight', 'daytour', 'family']).withMessage('Loại tour không hợp lệ'),
    body('status').optional().isIn(['draft', 'published', 'archived']).withMessage('Trạng thái tour không hợp lệ'),
    body('categoryId').optional({ nullable: true }).custom(isMongoIdOrEmpty).withMessage('categoryId không hợp lệ'),
    body('caveId').optional({ nullable: true }).custom(isMongoIdOrEmpty).withMessage('caveId không hợp lệ'),
    body('thumbnail').optional({ nullable: true }).custom(isMongoIdOrEmpty).withMessage('thumbnail không hợp lệ'),
    body('banner').optional({ nullable: true }).custom(isMongoIdOrEmpty).withMessage('banner không hợp lệ'),
    body('gallery').optional().isArray({ max: 80 }).withMessage('gallery tối đa 80 ảnh'),
    body('gallery.*').optional().custom(isMongoIdOrEmpty).withMessage('gallery chứa media id không hợp lệ'),
    body('itinerary').optional().isArray({ max: 60 }).withMessage('itinerary tối đa 60 ngày'),
    body('itinerary.*.dayNumber').optional().isInt({ min: 1, max: 365 }).withMessage('dayNumber không hợp lệ'),
    body('faqs').optional().isArray({ max: 100 }).withMessage('faqs tối đa 100 mục'),
];

const validateScheduleCreate = [
    body('tourId').notEmpty().withMessage('tourId là bắt buộc').isMongoId().withMessage('tourId không hợp lệ'),
    body('startDate').notEmpty().withMessage('startDate là bắt buộc').isISO8601().withMessage('startDate không đúng định dạng ngày'),
    body('endDate').notEmpty().withMessage('endDate là bắt buộc').isISO8601().withMessage('endDate không đúng định dạng ngày'),
    body('capacity').notEmpty().withMessage('capacity là bắt buộc').isInt({ min: 1, max: 1000 }).withMessage('capacity phải từ 1 đến 1000'),
    body('bookedSlots').optional().isInt({ min: 0 }).withMessage('bookedSlots phải >= 0'),
    body('status').optional().isIn(['Available', 'Full', 'Started', 'Cancelled', 'Completed']).withMessage('status lịch khởi hành không hợp lệ'),
    body('tourGuideId').optional({ nullable: true }).custom(isMongoIdOrEmpty).withMessage('tourGuideId không hợp lệ'),
    body().custom((data) => {
        if (new Date(data.endDate) < new Date(data.startDate)) {
            throw new Error('endDate phải sau hoặc bằng startDate');
        }
        if (data.bookedSlots !== undefined && Number(data.bookedSlots) > Number(data.capacity)) {
            throw new Error('bookedSlots không được lớn hơn capacity');
        }
        return true;
    }),
];

const validateScheduleUpdate = [
    param('id').isMongoId().withMessage('Schedule ID không hợp lệ'),
    body('tourId').optional().isMongoId().withMessage('tourId không hợp lệ'),
    body('startDate').not().exists().withMessage('Không cho phép sửa startDate. Hãy tạo lịch mới nếu cần đổi ngày'),
    body('endDate').not().exists().withMessage('Không cho phép sửa endDate. Hãy tạo lịch mới nếu cần đổi ngày'),
    body('capacity').optional().isInt({ min: 1, max: 1000 }).withMessage('capacity phải từ 1 đến 1000'),
    body('bookedSlots').optional().isInt({ min: 0 }).withMessage('bookedSlots phải >= 0'),
    body('status').optional().isIn(['Available', 'Full', 'Started', 'Cancelled', 'Completed']).withMessage('status lịch khởi hành không hợp lệ'),
    body('isHidden').optional().isBoolean().withMessage('isHidden phải là true hoặc false'),
    body('tourGuideId').optional({ nullable: true }).custom(isMongoIdOrEmpty).withMessage('tourGuideId không hợp lệ'),
    body().custom((data) => {
        if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
            throw new Error('endDate phải sau hoặc bằng startDate');
        }
        if (data.bookedSlots !== undefined && data.capacity !== undefined && Number(data.bookedSlots) > Number(data.capacity)) {
            throw new Error('bookedSlots không được lớn hơn capacity');
        }
        return true;
    }),
];

const validateScheduleBulkCreate = [
    body('tourId').notEmpty().withMessage('tourId là bắt buộc').isMongoId().withMessage('tourId không hợp lệ'),
    body('dates').isArray({ min: 1, max: 180 }).withMessage('dates phải là mảng từ 1 đến 180 ngày'),
    body('dates.*').isISO8601().withMessage('Mỗi phần tử dates phải là ngày hợp lệ (YYYY-MM-DD)'),
];

const validateScheduleListQuery = [
    query('hidden').optional().isIn(['all', 'visible', 'hidden']).withMessage('hidden phải là all, visible hoặc hidden'),
];

const validateMediaCreate = [
    body('name').trim().notEmpty().withMessage('Tên ảnh là bắt buộc').isLength({ min: 2, max: 120 }).withMessage('Tên ảnh phải từ 2 đến 120 ký tự'),
    body('type').optional().isIn(['tour', 'gallery', 'banner', 'other']).withMessage('type media không hợp lệ'),
    body('url').trim().notEmpty().withMessage('URL ảnh là bắt buộc').isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('URL ảnh không hợp lệ'),
    body('public_id').optional().isString().isLength({ max: 255 }).withMessage('public_id tối đa 255 ký tự'),
];

const validateMediaUpdate = [
    param('id').isMongoId().withMessage('Media ID không hợp lệ'),
    body('name').optional().trim().notEmpty().withMessage('Tên ảnh không được để trống').isLength({ min: 2, max: 120 }).withMessage('Tên ảnh phải từ 2 đến 120 ký tự'),
    body('type').optional().isIn(['tour', 'gallery', 'banner', 'other']).withMessage('type media không hợp lệ'),
    body('url').optional().trim().isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('URL ảnh không hợp lệ'),
    body('public_id').optional().isString().isLength({ max: 255 }).withMessage('public_id tối đa 255 ký tự'),
];

const validateBookingCancel = [
    param('id').isMongoId().withMessage('Booking ID không hợp lệ'),
    body('reason').optional().isString().isLength({ max: 500 }).withMessage('Lý do hủy tối đa 500 ký tự'),
];

const validateBookingListQuery = [
    query('status').optional().isIn(['all', 'HOLD', 'CONFIRMED', 'DEPARTED', 'CANCELLED', 'COMPLETED']).withMessage('Trạng thái booking filter không hợp lệ'),
    query('assignmentStatus').optional().isIn(['all', 'unassigned', 'pending', 'in_progress', 'completed', 'cancelled']).withMessage('Trạng thái tư vấn filter không hợp lệ'),
    query('participantReviewStatus').optional().isIn(['all', 'pending_review', 'approved', 'rejected', 'completed', 'service_suspended']).withMessage('Trạng thái hành khách filter không hợp lệ'),
    query('page').optional().isInt({ min: 1 }).withMessage('page phải >= 1'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit phải từ 1 đến 100'),
];

module.exports = {
    validateCaveCreate,
    validateCaveUpdate,
    validateTourCreate,
    validateTourUpdate,
    validateScheduleCreate,
    validateScheduleUpdate,
    validateScheduleBulkCreate,
    validateScheduleListQuery,
    validateMediaCreate,
    validateMediaUpdate,
    validateBookingCancel,
    validateBookingListQuery,
};
