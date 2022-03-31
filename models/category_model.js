const mongoose = require("mongoose")

// ========== Category Model in Mongoose ========== //
const CategoryModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    sub_categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sub_Category',
    }]
})

module.exports = mongoose.model('Category', CategoryModel)