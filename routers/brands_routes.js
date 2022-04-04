const express = require("express")
const router = express.Router()
const { protect, authorize } = require('../middlewares/authentication')

const {
    getBrands,
    getBrand,
    createBrand,
    updateBrand,
    deleteBrand
} = require("../controllers/brands_controller")

router
    .route("/")
    .get(getBrands)
    .post(protect, authorize("ADMIN", "OPERATOR"), createBrand)
router
    .route("/:brand_id")
    .get(protect, authorize("ADMIN", "OPERATOR"), getBrand)
    .put(protect, authorize("ADMIN", "OPERATOR"), updateBrand)  
    .delete(protect, authorize("ADMIN", "OPERATOR"), deleteBrand)

module.exports = router