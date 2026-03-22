const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Sub-schema cho trường song ngữ
const bilingualField = {
    vi: { type: String, default: '' },
    en: { type: String, default: '' }
};

// Sub-schema cho lịch trình từng ngày
const itineraryDaySchema = new Schema({
    dayNumber: { type: Number, required: true },
    title: bilingualField,
    content: bilingualField // Có thể chứa HTML
}, { _id: false });

const tourSchema = new Schema(
    {
        name: {
            vi: { type: String, required: true, trim: true },
            en: { type: String, required: true, trim: true }
        },
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: bilingualField,
        priceVND: {
            type: Number,
            required: true,
        },
        priceUSD: {
            type: Number,
        },
        durationDays: {
            type: Number,
            required: true,
        },
        adventureLevel: {
            type: Number,
            min: 1,
            max: 6,
            required: true,
            index: true,
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            index: true,
        },
        caveId: {
            type: Schema.Types.ObjectId,
            ref: 'Cave',
            index: true,
        },
        tourType: {
            type: String,
            enum: ['multiday', 'overnight', 'daytour', 'family'],
            default: 'multiday',
            index: true,
        },
        // Liên kết với Media Library
        thumbnail: {
            type: Schema.Types.ObjectId,
            ref: 'Media',
        },
        gallery: [{
            type: Schema.Types.ObjectId,
            ref: 'Media',
        }],
        groupSize: {
            type: Number
        },
        ageMin: {
            type: Number
        },
        ageMax: {
            type: Number
        },
        // Lịch trình chi tiết theo từng ngày
        itinerary: [itineraryDaySchema],
        // Danh sách đồ bảo hộ/trang bị cung cấp (song ngữ)
        providedEquipment: [bilingualField],
        // Các điều kiện & chính sách (song ngữ)
        bookingConditions: bilingualField,
        healthRequirements: bilingualField, // Tương đương Fitness requirements
        cancellationPolicy: bilingualField,

        // --- CÁC TRƯỜNG THÔNG TIN CHI TIẾT MỚI ---
        banner: {
            type: Schema.Types.ObjectId,
            ref: 'Media',
        },
        highlights: bilingualField,
        weatherAndClimate: bilingualField,
        adventureLevelDescription: bilingualField,
        safetyOnTour: bilingualField,
        communicationOnTour: bilingualField,
        whatToBring: bilingualField,
        swimmingAtCampsites: bilingualField,
        toiletAtCampsites: bilingualField,
        directionsToPhongNha: bilingualField,
        tourBookingProcess: bilingualField,
        priceIncludes: bilingualField,
        faqs: [
            {
                question: bilingualField,
                answer: bilingualField,
                _id: false
            }
        ],

        // Trạng thái & nổi bật
        status: {
            type: String,
            enum: ['draft', 'published', 'archived'],
            default: 'draft',
            index: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        // SEO
        seo: {
            metaTitle: bilingualField,
            metaDescription: bilingualField,
        }
    },
    {
        timestamps: true,
    }
);

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
