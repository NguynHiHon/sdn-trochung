const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const bilingualField = {
    vi: { type: String, default: '' },
    en: { type: String, default: '' }
};

const caveSchema = new Schema(
    {
        name: {
            vi: { type: String, required: true, trim: true },
            en: { type: String, required: true, trim: true }
        },
        description: bilingualField,
        address: bilingualField,
        // Hệ thống hang (VD: Hệ thống hang Phong Nha - Kẻ Bàng)
        system: bilingualField,
        // Tọa độ GPS
        location: {
            lat: { type: Number },
            lng: { type: Number }
        },
        // Thông số kỹ thuật
        length: {
            type: Number, // Chiều dài hang (mét)
        },
        depth: {
            type: Number, // Độ sâu hang (mét)
        },
        // Cấp độ di sản
        heritageLevel: {
            type: String,
            enum: ['world', 'national', 'provincial', 'none'],
            default: 'none',
            index: true,
        },
        // Liên kết ảnh từ Media Library
        thumbnail: {
            type: Schema.Types.ObjectId,
            ref: 'Media',
        },
        gallery: [{
            type: Schema.Types.ObjectId,
            ref: 'Media',
        }],
    },
    {
        timestamps: true,
    }
);

const Cave = mongoose.model('Cave', caveSchema);
module.exports = Cave;
