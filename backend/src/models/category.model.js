const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema(
    {
        name: {
            vi: { type: String, required: true, trim: true },
            en: { type: String, required: true, trim: true }
        },
        description: {
            vi: { type: String, default: '' },
            en: { type: String, default: '' }
        },
    },
    {
        timestamps: true,
    }
);

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
