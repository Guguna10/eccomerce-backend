const express = require("express")
const router = express.Router()
const { protect, authorize } = require('../middlewares/authentication')

const {
    getBrands,
    createBrand,
    updateBrand
} = require("../controllers/brands_controller")

router.get("/get_brands", getBrands)
router.post("/create_brand", protect, authorize("OPERATOR", "ADMIN"), createBrand)
router.put("/update_brand", protect, authorize("OPERATOR", "ADMIN"), updateBrand)

module.exports = router