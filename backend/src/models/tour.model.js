const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tourSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
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
        description: {
            type: String,
        },
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
        },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
        },
        caveId: {
            type: Schema.Types.ObjectId,
            ref: 'Cave',
        },
        thumbnailUrl: {
            type: String,
        },
        groupSize: {
            type: Number
        },
        ageMin: {
            type: Number
        },
        ageMax: {
            type: Number
        }
    },
    {
        timestamps: true,
    }
);

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
