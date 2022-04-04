const ErrorResponse = require('../utils/error_response')
const Brand = require('../models/brand_model')
const cloudinary = require('../utils/cloudinary')

// @desc        Get Brands
// @route       GET /api/v1/brands
// @access      Public
exports.getBrands = async (request, response, next) => {
    const brands = await Brand.find()

    response.status(200).json({ success: true, brands: brands })
}

// @desc        Get Brand by ID
// @route       GET /api/v1/brands/:brand_id
// @access      Public
exports.getBrand = async (request, response, next) => {
    const brand = await Brand.findById(request.params.brand_id)

    if (!brand) {
        return next(
            new ErrorResponse(`Brand not found with id of ${request.params.brand_id}`, 404)
        )
    }

    response.status(200).json({ success: true, brand: brand })
}

// @desc        Create Brand
// @route       POST /api/v1/brands
// @access      Private
exports.createBrand = async (request, response, next) => {
    const new_brand = await Brand
        .create(request.body)
        .catch(() => {
            return next(
                new ErrorResponse('An error occurred while creating the brand', 400)
            )
        })

    let new_brand_image = null

    await cloudinary.uploader.upload(new_brand.image, {
        public_id: `${new_brand._id}`,
        upload_preset: 'ecommerce-backend-brands',
        width: 400,
        height: 400
    }, function (error, result) {
        if (error) {
            return next(
                new ErrorResponse('The brand image could not be uploaded to the cloud', 400)
            )
        }

        if (result) {
            new_brand_image = result.secure_url
        }
    })

    Brand
        .findByIdAndUpdate(new_brand._id, { image: new_brand_image }, {
            new: true,
            runValidators: true
        })
        .then((created_brand) => {
            response.status(200).json({ success: true, created_brand: created_brand })
        })
        .catch(() => {
            return next(
                new ErrorResponse('An error occurred while updating the brand', 400)
            )
        })
}

// @desc        Update Brand
// @route       PUT /api/v1/brands/:brand_id
// @access      Private
exports.updateBrand = async (request, response, next) => {
    const brand = await Brand.findById(request.params.brand_id)

    if (!brand) {
        return next(
            new ErrorResponse(`Brand not found with id of ${request.params.brand_id}`, 404)
        )
    }

    await cloudinary.uploader.destroy(`ecommerce-backend/brands/${brand._id}`), function (error, result) {
        if (error) {
            return next(
                new ErrorResponse(`The brand image could not be deleted with public id of: ${brand._id}`, 400)
            )
        }
    }

    let new_brand_image = null

    await cloudinary.uploader.upload(request.body.image, {
        public_id: `${brand._id}`,
        upload_preset: 'ecommerce-backend-brands',
        width: 400,
        height: 400
    }, function (error, result) {
        if (error) {
            return next(
                new ErrorResponse('The brand image could not be uploaded to the cloud', 400)
            )
        }

        if (result) {
            new_brand_image = result.secure_url
        }
    })

    Brand
        .findByIdAndUpdate(brand._id, { image: new_brand_image, name: request.body.name }, {
            new: true,
            runValidators: true
        })
        .then((updated_brand) => {
            response.status(200).json({ success: true, updated_brand: updated_brand })
        })
        .catch(() => {
            return next(
                new ErrorResponse('An error occurred while updating the brand', 400)
            )
        })
}

// @desc        Delete Brand
// @route       DELETE /api/v1/brands/:brand_id
// @access      Private
exports.deleteBrand = async (request, response, next) => {
    const brand = await Brand.findById(request.params.brand_id)

    if (!brand) {
        return next(
            new ErrorResponse(`Brand not found with id of ${request.params.brand_id}`, 404)
        )
    }

    await cloudinary.uploader.destroy(`ecommerce-backend/brands/${brand._id}`), function (error, result) {
        if (error) {
            return next(
                new ErrorResponse(`The brand image could not be deleted with public id of: ${brand._id}`, 400)
            )
        }
    }

    Brand
        .findByIdAndDelete(brand._id)
        .then(() => {
            response.status(200).json({ success: true })
        })
        .catch(() => {
            return next(
                new ErrorResponse(`The brand image could not be deleted with id of: ${brand._id}`, 400)
            )
        })
}