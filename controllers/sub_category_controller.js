const ErrorResponse = require('../utils/error_response')
const SubCategory = require('../models/sub_category_model')

// @desc    Get sub categories
// @route   GET /api/v1/sub_categories
// @acces   Public
exports.getSubCategories = async(req, res) => {
    const category = await SubCategory.find({})

    res.status(200).json({ success: true, sub_category: category })
}

// @desc    Get Single sub Category
// @route   GET /api/v1/sub_categories/:sub_category_id
// @acces   Private/Operator/Admin
exports.getSingleSubCategory = async(req, res, next) => {
    const category = await SubCategory.findById(req.params.sub_category_id)

    if(!category) {
        return next(
            new ErrorResponse(`Sub Category not found with id of ${req.params.sub_category_id}`, 404)
        )
    }

    res.status(200).json({ success: true, sub_category: category })
}

// @desc    Create Sub Category
// @route   POST /api/v1/sub_categories
// @acces   Private/Operator/Admin
exports.createSubCategory = async(req, res, next) => {
    const category = await SubCategory
    .create(req.body)
    .catch(() => {
        return next(
            new ErrorResponse("This sub cateogry name already exist", 400)
        )
    })

    SubCategory
        .findByIdAndUpdate(category._id, {name: req.body.name}, {
            new: true,
            runValidators: true
        })
        .then((created_sub_category) => {
            res.status(200).json({ success: true, created_sub_category: created_sub_category })
        })
        .catch((error) =>{
            console.log(error)
            return next(
                new ErrorResponse('an error occured while updating sub category', 400)
            )
        })
}

// @desc    Update Sub Category
// @route   POST /api/v1/sub_categories/:sub_category_id
// @acces   Private/Operator/Admin
exports.updateSubCateogry = async(req, res, next) => {
    const category = await SubCategory.findById(req.params.sub_category_id)
    
    if(!category) {
       return next(
           new ErrorResponse(`category not found with id of ${req.params.sub_category_id}`, 404)
       )
   }

   SubCategory
       .findByIdAndUpdate(category._id, {name: req.body.name}, {
           new: true,
           runValidators: true
       })
       .then((created_sub_category) => {
           res.status(200).json({ success: true, created_sub_category: created_sub_category })
       })
       .catch((error) =>{
           console.log(error)
           return next(
               new ErrorResponse('an error occured while updating category', 400)
           )
       })      
} 

// @desc    Delete Sub Category
// @route   POST /api/v1/sub_categories/:sub_category_id
// @acces   Private/Operator/Admin
exports.deleteSubCategory = async (req, res, next) => {
    const category = await SubCategory.findById(req.params.sub_category_id)
    if (!category) {
        return next(
            new ErrorResponse(`cannot find sub category with this ${req.params.sub_category_id}"`, 404)
        )
    }

    SubCategory
        .findByIdAndDelete(category._id)
        .then(() => {
            res.status(200).json({ success: true })
        })
        .catch(() => {
            return next(
                new ErrorResponse("An error occured while deleting sub cateogry", 400)
            )
        })
}