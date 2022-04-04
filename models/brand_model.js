const mongoose = require("mongoose")

// ========== Brand Schema in Mongoose ========== //
const BrandModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Brand', BrandModel)