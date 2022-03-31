const ErrorResponse = require('../utils/error_response')
const Carousel = require('../models/main_corousel_item_model')
const cloudinary = require("../utils/cloudinary")

// @desc    Get Carousel Item
// @route   GET /api/v1/carousel
// @acces   Public
exports.getCarousel = async(req, res) => {
    const carousel = await Carousel.find({}).sort({sort: -1})

    res.status(200).json({ success: true, carousel: carousel })
}

// @desc    Get Single carousel Item
// @route   GET /api/v1/carousel/:carousel_id
// @acces   Private
exports.getSingleCarousel = async(req, res, next) => {
    const carousel = await Carousel.findById(req.params.carousel_id)

    if(!carousel) {
        return next(
            new ErrorResponse(`Carousel not found with id of ${req.params.carousel_id}`, 404)
        )
    }

    res.status(200).json({ success: true, carousel: carousel })
}

// @desc    Create carousle
// @route   POST /api/v1/carousel
// @acces   Private/Operator/Admin
exports.createCarousel = async(req, res, next) => {
    const carousel = await Carousel
    .create(req.body)
    .catch(() => {
        return next(
            new ErrorResponse("an error occured while creating carousel")
        )
    })

    let new_carousel_image = null

    await cloudinary.uploader.upload(carousel.image, {
        public_id: `${carousel._id}`,
        upload_preset: "ecommerce-backend-mainCaruselItems",
        width: 400,
        height: 400
    }, function(error, result){
        if(error) {
            return next(
                new ErrorResponse("the carousel image could not be uploaded")
            )
        }

        if(result) {
            new_carousel_image = result.secure_url
        }
    })

    Carousel
        .findByIdAndUpdate(carousel._id, {image: new_carousel_image}, {
            new: true,
            runValidators: true
        })
        .then((created_carousel) => {
            res.status(200).json({ success: true, created_carousel: created_carousel })
        })
        .catch((error) =>{
            console.log(error)
            return next(
                new ErrorResponse('an error occured while updating carousel', 400)
            )
        })
}

// @desc    Update carousle
// @route   POST /api/v1/carousel/:carousel_id
// @acces   Private/Operator/Admin
exports.updateCarousel = async(req, res, next) => {
    const carousel = await Carousel.findById(req.params.carousel_id)
    
     if(!carousel) {
        return next(
            new ErrorResponse(`carousel not found with id of ${req.params.carousel_id}`, 404)
        )
    }

    await cloudinary.uploader.destroy(`ecommerce-backend/MainCarouselItems/${carousel._id}`), function (error) {
        if (error) {
            return next(
                new ErrorResponse(`The carousel photo image could not be deleted with id of: ${carousel._id}`, 400)
            )
        }
    }

    let new_carousel_image = null

    await cloudinary.uploader.upload(req.body.image, {
        public_id: `${carousel._id}`,
        upload_preset: "ecommerce-backend-mainCaruselItems",
        width: 400,
        height: 400
    }, function(error, result){
        if(error) {
            console.log(error)
            return next(
                new ErrorResponse("the carousel image could not be uploaded")
            )
        }

        if(result) {
            new_carousel_image = result.secure_url
        }
    })

    Carousel
        .findByIdAndUpdate(carousel._id, { sort: req.body.sort, link: req.body.link, image: new_carousel_image }, {
            new: true,
            runValidators: true
        })
        .then((created_carousel) => {
            res.status(200).json({ success: true, created_carousel: created_carousel })
        })
        .catch((error) =>{
            console.log(error)
            return next(
                new ErrorResponse('an error occured while updating carousel', 400)
            )
        })      
} 

// @desc    Update carousle
// @route   POST /api/v1/carousel/:carousel_id
// @acces   Private/Operator/Admin
exports.deleteCarousel = async (req, res, next) => {
    const carousel = await Carousel.findById(req.params.carousel_id)
    if (!carousel) {
        return next(
            new ErrorResponse(`cannot find carousel with this ${req.params.carousel_id} Id"`, 404)
        )
    }

    await cloudinary.uploader.destroy(`ecommerce-backend/MainCarouselItems/${carousel._id}`), function (error) {
        if (error) {
            return next(
                new ErrorResponse(`The carousel image could not be deleted with public id of: ${carousel._id}`, 400)
            )
        }
    }

    Carousel.findByIdAndDelete(carousel._id)
        .then(() => {
            res.status(200).json({ success: true })
        })
        .catch(() => {
            return next(
                new ErrorResponse("An error occured while deleting carousel", 400)
            )
        })
}