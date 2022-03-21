const mongoose = require('mongoose')

// ========== Thumbnail Schema in Mongoose ========== //
const ThumbnailModel = new mongoose.Schema({
    image_url: {
        type: String,
        required: true
    }
}, { _id : false })


// ========== Sub Feature Schema in Mongoose ========== //
const SubFeatureModel = new mongoose.Schema({
    feature: {
        type: String,
        required: true
    },
    value: {
        type: String,
        required: true 
    }
}, { _id : false })

// ========== Feature Schema in Mongoose ========== //
const FeatureModel = new mongoose.Schema({
    main_feature: {
        type: String,
        required: true,
    },
    sub_features: {
        type: [ SubFeatureModel ],
        default: []
    }
}, { _id : false })

// ========== Product Schema in Mongoose ========== //
const ProductModel = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        required: true
    },
    supplier_name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    price_with_price_tag: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    description: String,
    main_image: {
        type: String,
        required: true
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand'
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    additional_categories: String,
    sub_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Sub_Category'
    },
    additional_sub_categories: String,
    thumbnails: {
        type: [ ThumbnailModel ],
        default: []
    },
    features: {
        type: [ FeatureModel ],
        default: []
    },
    youtube_url: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product_Author'
    },
    disabled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Product', ProductModel)