const express = require("express")
const router = express.Router()
const { protect, authorize } = require('../middlewares/authentication')
const {
    getCateogries,
    getSingleCategory,
    createCategory,
    updateCateogry,
    deleteCategory,
    addSubCategoriesToCategories,
    deleteSubCategoriesFromCategories
} = require("../controllers/category_controller")

router
    .route("/")
    .get(getCateogries)
    .post(protect, authorize("ADMIN", "OPERATOR"), createCategory)
router
    .route("/:category_id")
    .get(protect, authorize("ADMIN", "OPERATOR"), getSingleCategory)
    .put(protect, authorize("ADMIN", "OPERATOR"), updateCateogry)
    .delete(protect, authorize("ADMIN", "OPERATOR"), deleteCategory)
router
    .route("/:category_id/:sub_category_id")
    .put(protect, authorize("ADMIN", "OPERATOR"), addSubCategoriesToCategories)
router.put("/rm/:category_id/:sub_category_id", protect, authorize("ADMIN", "OPERATOR"), deleteSubCategoriesFromCategories)

module.exports = router