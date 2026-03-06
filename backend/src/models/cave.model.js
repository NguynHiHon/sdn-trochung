const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const caveSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        system: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Cave = mongoose.model('Cave', caveSchema);
module.exports = Cave;
