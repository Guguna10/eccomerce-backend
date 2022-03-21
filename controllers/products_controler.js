const Product = require('../models/product_model.js')
const User = require('../models/user_model')
const ErrorResponse = require('../utils/error_response')

// @desc    Create Product
// @route   POST /api/v1/products/create_product
// @acces   private/ADMIN/OPERATOR
exports.createProduct = async (req, res, next) => {

    // ============== get product datas ============== //
    const { product_name, product_category, product_description, product_price, product_quantity} = req.body

    try {
        const new_product = await Product
            .create({
                product_name,
                product_category,
                product_description,
                product_price,
                product_quantity
            })

        await new_product.save({ validateBeforeSave: false })   

        res.status(200).json({ success: true, new_product: new_product})
    } catch (error) {
        return next(
            new ErrorResponse(`an error occurred while product creation`, 400 )
        )
    }
}

// @desc    get Product
// @route   Get /api/v1/products/get_products
// @acces   private/ADMIN/OPERATOR
exports.getAllProducts = async (req, res) => {
    const products = await Product.find()

    res.status(200).json({ success: true, products: products})
}

// @desc    get one Product
// @route   get /api/v1/products/get_product/:product_id
// @acces   private/ADMIN/OPERATOR
exports.getProduct = async (req, res) => {
    const product = await Product.findById(req.params.product_id)

    res.status(200).json({ success: true, product: product})
}

// @desc    update Product
// @route   put /api/v1/products/update_product/:product_id
// @acces   private/ADMIN/OPERATOR
exports.updateProduct = async (req, res, next) => {
    const product = await Product.findById(req.params.product_id)

    if(!product) {
        return next(
            new ErrorResponse(`product not found with id of ${req.user.id}`, 404)
        )
    }

    Product
        .findByIdAndUpdate(
            product._id , 
            req.body, 
            { 
                new: true, 
                runValidators: true
            }
        )
        .then((updated_product) => {
            res.status(200).json({ success: true, updated_product: updated_product})
        })
        .catch((error) => {
            return next(
                new ErrorResponse('an error occurred while updating product details', 400)
            )
        })
}

// @desc    disable Product
// @route   put /api/v1/products/disable_product/:product_id
// @acces   private/ADMIN/OPERATOR
exports.disableProduct = async (req, res, next) => {
    const product = await Product.findByIdAndUpdate(req.params.product_id)

    if(!product) {
        return next(
            new ErrorResponse(`product not found with id of ${req.user.id}`, 404)
        )
    }

    if(product.disabled) {
        return next(
            new ErrorResponse("this product is already disabled", 400)
        )
    }

    try {
        if(product.disabled) {
            product.disabled = false
        } else if(!product.disabled) {
            product.disabled = true
        }

        product.save()

        res.status(200).json({ success: true, disabled: product})
    } catch (error) {
        return next(
            new ErrorResponse("an error occured while disabling product", 400)
        )
    }
}

// @desc    delete Product
// @route   POST /api/v1/products/delete/:product_id
// @acces   private/ADMIN/OPERATOR
exports.deleteProduct = async (req, res, next) => {
    const product = await Product.findByIdAndDelete(req.params.product_id)

    if(!product) {
        return next(
            new ErrorResponse(`product not found with id of ${req.user.id}`, 404)
        )
    }
    
    res.status(200).json({ success: true, deleted_product: product})
}