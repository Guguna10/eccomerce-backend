const express = require('express')
const router = express.Router()

const {
    getMainCarouselItems,
    createMainCarouselItem,
    updateMainCarouselItem,
    deleteMainCarouselItem
} = require('../controllers/carousel_controller')

const { protect, authorize } = require('../middlewares/authentication')

router
    .route('/main_carousel/items')
    .get(getMainCarouselItems)
    .post(protect, authorize("ADMIN", "OPERATOR"), createMainCarouselItem)

router
    .route('/main_carousel/items/:item_id')
    .put(protect, authorize("ADMIN", "OPERATOR"), updateMainCarouselItem)
    .delete(protect, authorize("ADMIN", "OPERATOR"), deleteMainCarouselItem)

module.exports = router