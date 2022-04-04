const mongoose = require("mongoose")

// ========== Sub Category Model in Mongoose ========== //
const SubCategoryModel = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    parent_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    }
})

module.exports = mongoose.model('Sub_Category', SubCategoryModel)