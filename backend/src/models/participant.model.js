const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const participantSchema = new Schema(
    {
        bookingId: {
            type: Schema.Types.ObjectId,
            ref: 'Booking',
            required: true,
            index: true,
        },
        tourId: {
            type: Schema.Types.ObjectId,
            ref: 'Tour',
            index: true,
        },
        // Thông tin cơ bản
        fullName: { type: String, required: true, trim: true },
        dob: { type: Date, required: true }, // Ngày sinh để check độ tuổi
        gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
        passportOrId: { type: String, required: true },
        nationality: { type: String, required: true },
        email: { type: String },
        phone: { type: String },
        contactMethod: { 
            type: String, 
            enum: ['Zalo', 'Viber', 'Email', 'WhatsApp', 'Phone', 'None'], 
            default: 'None' 
        },

        // Khảo sát Sức khỏe (Health Survey)
        healthSurvey: {
            medicalConditions: { type: String, default: '' }, // Bệnh lý nền (Nêu chi tiết nếu có)
            exerciseFrequency: { 
                type: String, 
                enum: ['None', '1-2 times/week', '3-4 times/week', '5+ times/week'],
                default: 'None'
            },
            trekkingExperience: { 
                type: String, 
                enum: ['Never', 'Beginner', 'Intermediate', 'Advanced'],
                default: 'Never'
            },
            fitnessLevel: { 
                type: String, 
                enum: ['Average', 'Good', 'Excellent'], 
                default: 'Average' 
            },
            swimmingAbility: { 
                type: String, 
                enum: ['Cannot swim', 'Basic', 'Good'], 
                default: 'Cannot swim' 
            }
        },

        // Trạng thái phục vụ
        status: {
            type: String,
            enum: ['active', 'completed', 'cancelled'],
            default: 'active',
        },
        cancelReason: { type: String, default: '' },

        // Yêu cầu & Tùy chọn (Options & Preferences)
        preferences: {
            allergies: { type: String, default: '' }, // Dị ứng thực phẩm/côn trùng/thời tiết
            dietaryPreference: { 
                type: String, 
                enum: ['None', 'Vegetarian', 'Vegan', 'No Beef', 'No Pork', 'Gluten Free', 'Other'], 
                default: 'None' 
            },
            accommodationOption: { 
                type: String, 
                enum: ['Hotel', 'Camping', 'Homestay', 'None'], 
                default: 'None' 
            },
            tentPreference: { 
                type: String, 
                enum: ['Single', 'Shared', 'None'], 
                default: 'None' 
            }
        }
    },
    {
        timestamps: true,
    }
);

const Participant = mongoose.model('Participant', participantSchema);
module.exports = Participant;
