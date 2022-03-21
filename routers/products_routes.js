const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middlewares/authentication')

const { 
    createProduct,
    getAllProducts,
    getProduct,
    updateProduct,
    disableProduct,
    deleteProduct,
} = require('../controllers/products_controler')

router.delete('/delete/:product_id', protect, authorize("ADMIN", "OPERATOR"), deleteProduct)
router.get('/get_product/:product_id', protect, getProduct)
router.get('/get_products', protect, authorize("ADMIN", "OPERATOR"), getAllProducts)
router.put('/disable_product/:product_id', protect, authorize("ADMIN", "OPERATOR"), disableProduct)
router.put('/update_product/:product_id', protect, authorize("ADMIN", "OPERATOR"), updateProduct)
router.post('/create_product', protect, authorize("ADMIN", "OPERATOR"), createProduct)


module.exports = router