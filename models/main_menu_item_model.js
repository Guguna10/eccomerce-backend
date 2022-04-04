const mongoose = require("mongoose")

// ========== Main Menu Item Model in Mongoose ========== //
const MainMenuItemModel = new mongoose.Schema({
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    sub_category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sub_Category'
    },
    type: {
        type: String,
        enum: ["CATEGORY", "SUB_CATEGORY"], 
        required: true 
    }
})

module.exports = mongoose.model('Main_Menu_Item', MainMenuItemModel)