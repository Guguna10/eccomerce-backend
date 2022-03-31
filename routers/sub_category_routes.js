const express = require("express")
const router = express.Router()
const { protect, authorize } = require('../middlewares/authentication')
const {
    getSubCategories,
    getSingleSubCategory,
    createSubCategory,
    updateSubCateogry,
    deleteSubCategory
} = require("../controllers/sub_category_controller")

router
    .route("/")
    .get(getSubCategories)
    .post(protect, authorize("ADMIN", "OPERATOR"), createSubCategory)
router
    .route("/:sub_category_id")
    .get(protect, authorize("ADMIN", "OPERATOR"), getSingleSubCategory)
    .put(protect, authorize("ADMIN", "OPERATOR"), updateSubCateogry)
    .delete(protect, authorize("ADMIN", "OPERATOR"), deleteSubCategory)

module.exports = router