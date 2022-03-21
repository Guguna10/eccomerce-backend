const ErrorResponse = require('../utils/error_response')
const Brand = require('../models/brand_model')
const cloudinary = require("../utils/cloudinary")

// @desc    Get Brands
// @route   GET /api/v1/brands
// @acces   Public
exports.getBrands = async(req, res) => {
    const brands = await Brand.find({})

    res.status(200).json({ success: true, brands: brands })
}

// @desc    Get Brand by ID
// @route   GET /api/v1/brands/:brand_id
// @acces   Public
exports.getBrand = async(req, res) => {
    const brand = await Brand.findById(req.params.brand_id)

    if(!brand) {
        return next(
            new ErrorResponse(`brand not found with if of ${req.params.brand_id}`, 404)
        )
    }

    res.status(200).json({ success: true, brand: brand })
}

// @desc    Create Brands
// @route   POST /api/v1/brands
// @acces   Private/Operator/Admin
exports.createBrand = async(req, res, next) => {
    const brand = await Brand
        .create(req.body)
        .catch(() => {
            return next(
                new ErrorResponse("an error occured while creating brand")
            )
        })

    let new_brand_image = null
    
    await cloudinary.uploader.upload(brand.image, {
        public_id: `${brand._id}`,
        upload_preset: "ecommerce-backend-brands",
        width: 400,
        height: 400
    }, function(error, result){
        if(error) {
            return next(
                new ErrorResponse("the brand image could not be uploaded")
            )
        }

        if(result) {
            new_brand_image = result.secure_url
        }
    })

    Brand
        .findByIdAndUpdate(brand._id, {image: new_brand_image}, {
            new: true,
            runValidators: true
        })
        .then((created_brand) => {
            res.status(200).json({ success: true, created_brand: created_brand })
        })
        .catch((error) => {
            return next(
                new ErrorResponse('an error occured while updating the brand', 400)
            )
        })
}

// @desc    Update Brands
// @route   PUT /api/v1/brands
// @acces   Private/Operator/Admin
exports.updateBrand = async(req, res, next) => {
    const brand = await Brand.findById(req.params.brand_id)
    if(!brand) {
        return next(
            new ErrorResponse(`brand not found with if of ${req.params.brand_id}`, 404)
        )
    }

    let brand_image = null

    await cloudinary.uploader.destroy(`ecommerce-backend/brands/${brand._id}`), function (error, result) {
        if (error) {
            return next(
                new ErrorResponse(`The brand photo image could not be deleted with id of: ${brand._id}`, 400)
            )
        }
    }
    await cloudinary.uploader.upload(req.body.image, {
        public_id: `${brand._id}`,
        upload_preset: "ecommerce-backend-brands",
        width: 400,
        height: 400
    }, function(error, result){
        if(error) {
            console.log(error)
            return next(
                new ErrorResponse("the brand image could not be uploaded")
            )
        }

        if(result) {
            new_brand_image = result.secure_url
        }
    })

    Brand
        .findByIdAndUpdate(brand._id, {image: new_brand_image, name: req.body.name}, {
            new: true,
            runValidators: true
        })
        .then((updated_brand) => {
            res.status(200).json({success: true, updated_brand: updated_brand})
        })
        .catch(() => {
            return next(
                new ErrorResponse("An error occured while updating the brand details", 400)
            )
        })
        
} 

// @desc    Delate Brand
// @route   DELATE /api/v1/brands/:brand_id
// @acces   Private/Admin/operator
exports.deleteBrand = async (req, res, next) => {
    const brand = await Brand.findById(req.params.brand_id)
    if (!brand) {
        return next(
            new ErrorResponse(`cannot find brand with this ${req.params.brand_id} Id"`, 404)
        )
    }

    await cloudinary.uploader.destroy(`ecommerce-backend/brands/${brand._id}`), function (error, result) {
        if (error) {
            return next(
                new ErrorResponse(`The user profile image could not be deleted with public id of: ${brand._id}`, 400)
            )
        }
    }

    Brand.findByIdAndDelete(brand._id)
        .then(() => {
            res.status(200).json({ success: true })
        })
        .catch(() => {
            return next(
                new ErrorResponse("An error occured while deleting brand", 400)
            )
        })
}