const express = require("express")
const router = express.Router()
const { protect, authorize } = require('../middlewares/authentication')
const {
    getCarousel,
    createCarousel,
    getSingleCarousel,
    updateCarousel,
    deleteCarousel
} = require("../controllers/main_carousel_controller")

router
    .route("/")
    .get(getCarousel)
    .post(protect, authorize("ADMIN", "OPERATOR"), createCarousel)
router
    .route("/:carousel_id")
    .get(protect, authorize("ADMIN", "OPERATOR"), getSingleCarousel)
    .put(protect, authorize("ADMIN", "OPERATOR"), updateCarousel)
    .delete(protect, authorize("ADMIN", "OPERATOR"), deleteCarousel)

module.exports = router