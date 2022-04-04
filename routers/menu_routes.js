const express = require('express')
const router = express.Router()

const {
    getCategories,
    getSubCategories,
    createCategory,
    createSubCategory,
    updateCategory,
    updateSubCategory,
    deleteCategory,
    deleteSubCategory
} = require('../controllers/menu_controller')

const { protect, authorize } = require('../middlewares/authentication')

router
    .route('/categories')
    .get(getCategories)
    .post(protect, authorize("ADMIN", "OPERATOR"), createCategory)

router
    .route('/categories/:category_id')
    .put(protect, authorize("ADMIN", "OPERATOR"), updateCategory)
    .delete(protect, authorize("ADMIN", "OPERATOR"), deleteCategory)

router
    .route('/sub_categories')
    .get(getSubCategories)
    .post(protect, authorize("ADMIN", "OPERATOR"), createSubCategory)

router
    .route('/sub_categories/:sub_category_id')
    .put(protect, authorize("ADMIN", "OPERATOR"), updateSubCategory)
    .delete(protect, authorize("ADMIN", "OPERATOR"), deleteSubCategory)

module.exports = router