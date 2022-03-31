const ErrorResponse = require('../utils/error_response')
const Banner = require('../models/banner_model')
const cloudinary = require("../utils/cloudinary")

// @desc    Get Banners
// @route   GET /api/v1/banners
// @acces   Public
exports.getBanners = async(req, res) => {
    const banner = await Banner.find({}).sort({sort: -1})

    res.status(200).json({ success: true, banner: banner})
}

// @desc    Get Single Banner
// @route   GET /api/v1/banners/:banner_id
// @acces   Private/Operator/Admin
exports.getBanner = async(req, res, next) => {
    const banner = await Banner.findById(req.params.banner_id)

    if(!banner) {
        return next(
            new ErrorResponse(`Banner not found with id of ${req.params.banner_id}`)
        )
    }

    res.status(200).json({ success: true, banner: banner})
}

// @desc    Create Banner
// @route   POST /api/v1/banners
// @acces   Private/Operator/Admin
exports.createBanner = async(req, res, next) => {
    const banner = await Banner
    .create(req.body)
    .catch(() => {
        return next(
            new ErrorResponse("an error occured while creating banner")
        )
    })

    let new_baner_image = null

    await cloudinary.uploader.upload(banner.image, {
        public_id: `${banner._id}`,
        upload_preset: "ecommerce-backend-banners",
        width: 400,
        height: 400
    }, function(error, result){
        if(error) {
            return next(
                new ErrorResponse("the banner image could not be uploaded")
            )
        }

        if(result) {
            new_baner_image = result.secure_url
        }
    })

    Banner
        .findByIdAndUpdate(banner._id, {image: new_baner_image}, {
            new: true,
            runValidators: true
        })
        .then((created_banner) => {
            res.status(200).json({ success: true, created_banner: created_banner })
        })
        .catch((error) =>{
            console.log(error)
            return next(
                new ErrorResponse('an error occured while updating banner', 400)
            )
        })
}

// @desc    Update Banner
// @route   POST /api/v1/banners/:banner_id
// @acces   Private/Operator/Admin
exports.updateBanner = async(req, res, next) => {  
    const banner = await Banner.findById(req.params.banner_id)
    
    if(!banner) {
       return next(
           new ErrorResponse(`banner not found with id of ${req.params.banner_id}`, 404)
       )
   }

   await cloudinary.uploader.destroy(`ecommerce-backend/banners/${banner._id}`), function (error) {
       if (error) {
           return next(
               new ErrorResponse(`The banner photo image could not be deleted with id of: ${banner._id}`, 400)
           )
       }
   }

   let new_baner_image = null

   await cloudinary.uploader.upload(req.body.image, {
       public_id: `${banner._id}`,
       upload_preset: "ecommerce-backend-banners",
       width: 400,
       height: 400
   }, function(error, result){
       if(error) {
           console.log(error)
           return next(
               new ErrorResponse("the banner image could not be uploaded")
           )
       }

       if(result) {
        new_baner_image = result.secure_url
       }
   })

   Banner
       .findByIdAndUpdate(banner._id, { sort: req.body.sort, link: req.body.link, image: new_baner_image}, {
           new: true,
           runValidators: true
       })
       .then((created_banner) => {
           res.status(200).json({ success: true, created_banner: created_banner })
       })
       .catch((error) =>{
           console.log(error)
           return next(
               new ErrorResponse('an error occured while updating banner', 400)
           )
       })         
} 

// @desc    Delate Banner
// @route   POST /api/v1/banners/:banner_id
// @acces   Private/Operator/Admin
exports.deleteBanner = async (req, res, next) => {
    const banner = await Banner.findById(req.params.banner_id)
    if (!banner) {
        return next(
            new ErrorResponse(`cannot find banner with this ${req.params.banner_id} Id"`, 404)
        )
    }

    await cloudinary.uploader.destroy(`ecommerce-backend/banners/${banner._id}`), function (error) {
        if (error) {
            return next(
                new ErrorResponse(`The banner image could not be deleted with public id of: ${banner_id}`, 400)
            )
        }
    }

    Banner.findByIdAndDelete(banner._id)
        .then(() => {
            res.status(200).json({ success: true })
        })
        .catch(() => {
            return next(
                new ErrorResponse("An error occured while deleting banner", 400)
            )
        })
}