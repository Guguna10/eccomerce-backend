const Brand = require('../models/brand_model')
const ErrorResponse = require('../utils/error_response')
const cloudinary = require("../utils/cloudinary")

// @desc    Get Brands
// @route   GET /api/v1/brands/get_brands
// @acces   Public
exports.getBrands = async(req, res) => {
    const brands = await Brand.find({})

    res.status(200).json({ success: true, brands: brands })
}

// @desc    Create Brands
// @route   POST /api/v1/brands/create_brand
// @acces   Private/Operator/Admin
exports.createBrand = async(req, res, next) => {
    const brand = await Brand
        .create(req.body)
        .catch(() => {
            
            return next(
                new ErrorResponse("an error accured while creating brand")
            )
        })
    
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
            brand_image = result.secure_url
        }
    })

    Brand
        .findByIdAndUpdate(brand._id, {image: brand_image}, {
            new: true,
            runValidators: true
        })
        .then((updated_brand) => {
            res.status(200).json({ success: true, updated_brand: updated_brand })
        })
        .catch(() => {
            return next(
                new ErrorResponse('an error accured while updating image', 400)
            )
        })
}

// @desc    Update Brands
// @route   PUT /api/v1/brands/update_brand
// @acces   Private/Operator/Admin
exports.updateBrand = async(req, res, next) => {
    const brand = await Brand.findById(req.body.id)
    
    console.log(brand)
    trycat
    
    if(!brand) {
        return next(
            new ErrorResponse(`Brand not found with id of: ${req.body.id}`, 404)
        )
    }

    let brand_image = null

    if (req.body.image) {
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
                brand_image = result.secure_url
            }
        })
    }

    Brand
        .findByIdAndUpdate(brand._id, {name:req.body.name}, {
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