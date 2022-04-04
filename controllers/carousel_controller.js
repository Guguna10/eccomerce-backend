const MainCarouselItem = require('../models/main_carousel_item_model')
const cloudinary = require('../utils/cloudinary')
const ErrorResponse = require('../utils/error_response')

// @desc      Get Main Carousel Items
// @route     GET /api/v1/carousels/main_carousel/items
// @access    Public
exports.getMainCarouselItems = async (request, response) => {
    const main_carousel_items = await MainCarouselItem
        .find()
        .sort(
            { sort: 1 }
        )

    response.status(200).json({ success: true, main_carousel_items: main_carousel_items })
}

// @desc      Create Main Carousel Item
// @route     POST /api/v1/carousels/main_carousel/items
// @access    Private
exports.createMainCarouselItem = async (request, response, next) => {
    const main_carousel_item = await MainCarouselItem
        .create(request.body)
        .catch(() => {
            return next(
                new ErrorResponse(`An error occurred while creating the main carousel item`, 400)
            )
        })

    let main_carousel_item_image = null

    await cloudinary.uploader.upload(main_carousel_item.image, { 
        public_id: `${main_carousel_item._id}`,
        upload_preset: "ecommerce-backend-main-carousel-items"
    }, function(error, result) {
        if (error) {
            return next(
                new ErrorResponse(`The main carousel item image could not be uploaded to the cloud`, 400)
            )
        }

        if (result) {
            main_carousel_item_image = result.secure_url
        }
    })

    MainCarouselItem
        .findByIdAndUpdate(main_carousel_item._id, { image: main_carousel_item_image }, {
            new: true,
            runValidators: true
        })
        .then((updated_main_carousel_item) => {
            response.status(200).json({ success: true, new_main_carousel_item: updated_main_carousel_item })
        })
        .catch(() => {
            return next(
                new ErrorResponse(`An error occurred while updating the main carousel item's image`, 400)
            )
        })
}

// @desc      Update Main Carousel Item
// @route     UPDATE /api/v1/carousels/main_carousel/items/:item_id
// @access    Private
exports.updateMainCarouselItem = async (request, response, next) => {
    const main_carousel_item = await MainCarouselItem.findById(request.params.item_id)

    if (!main_carousel_item) {
        return next(
            new ErrorResponse(`The main carousel item could not be find with id of ${request.params.item_id}`, 404)
        )
    }

    await cloudinary.uploader.destroy(`ecommerce-backend/main_carousel_items/${main_carousel_item._id}`, function(error, result) {
        if (error) {
            return next(
                new ErrorResponse(
                    `The main carousel item image could not be deleted with public id of ${main_carousel_item._id}`, 400
                )
            )
        }
    })

    let main_carousel_item_image = null

    await cloudinary.uploader.upload(request.body.image, { 
        public_id: `${main_carousel_item._id}`,
        upload_preset: "ecommerce-backend-main-carousel-items"
    }, function(error, result) {
        if (error) {
            return next(
                new ErrorResponse(`The main carousel item image could not be uploaded to the cloud`, 400)
            )
        }

        if (result) {
            main_carousel_item_image = result.secure_url
        }
    })

    MainCarouselItem
        .findByIdAndUpdate(main_carousel_item._id, { ...request.body, image: main_carousel_item_image }, {
            new: true,
            runValidators: true
        })
        .then((updated_main_carousel_item) => {
            response.status(200).json({ 
                success: true, 
                updated_main_carousel_item: updated_main_carousel_item 
            })
        })
        .catch(() => {
            return next(
                new ErrorResponse(`An error occurred while updating the main carousel item`, 400)
            )
        })
}

// @desc      Delete Main Carousel Item
// @route     DELETE /api/v1/carousels/main_carousel/items/:item_id
// @access    Private
exports.deleteMainCarouselItem = async (request, response, next) => {
    const main_carousel_item = await MainCarouselItem.findById(request.params.item_id)

    if (!main_carousel_item) {
        return next(
            new ErrorResponse(`The main carousel item could not be find with id of ${request.params.item_id}`, 404)
        )
    }

    await cloudinary.uploader.destroy(`ecommerce-backend/main_carousel_items/${main_carousel_item._id}`, function(error, result) {
        if (error) {
            return next(
                new ErrorResponse(
                    `The main carousel item image could not be deleted with public id of ${main_carousel_item._id}`, 400
                )
            )
        }
    })

    MainCarouselItem
        .findByIdAndDelete(request.params.item_id)
        .then(() => {
            response.status(200).json({ success: true })
        })
        .catch(() => {
            return next(
                new ErrorResponse(`The main carousel item could not be find with id of ${request.params.item_id}`, 400)
            )
        })
}