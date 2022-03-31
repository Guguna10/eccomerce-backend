const mongoose = require("mongoose")

// ========== MainCarouselItem Model in Mongoose ========== //
const BanerModel = new mongoose.Schema({
    image: {
        type: String,
        required: true,
    },
    sort: {
        type: Number,
        required: true,
    },
    link: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Banner', BanerModel)