const express = require("express")
const router = express.Router()
const { protect, authorize } = require('../middlewares/authentication')
const {
    getBanners,
    getBanner,
    createBanner,
    updateBanner,
    deleteBanner
} = require("../controllers/banners_controller")

router
    .route("/")
    .get(getBanners)
    .post(protect, authorize("ADMIN", "OPERATOR"), createBanner)
router
    .route("/:banner_id")
    .get(protect, authorize("ADMIN", "OPERATOR"), getBanner)
    .put(protect, authorize("ADMIN", "OPERATOR"), updateBanner)
    .delete(protect, authorize("ADMIN", "OPERATOR"), deleteBanner)

module.exports = router