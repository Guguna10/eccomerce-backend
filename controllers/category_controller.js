const ErrorResponse = require('../utils/error_response')
const Category = require('../models/category_model')
const SubCategory = require('../models/sub_category_model')

// @desc    Get categories
// @route   GET /api/v1/categories
// @acces   Public
exports.getCateogries = async(req, res) => {
    const category = await Category.find({})

    res.status(200).json({ success: true, category: category })
}

// @desc    Get Single Category
// @route   GET /api/v1/categories/:category_id
// @acces   Private/Operator/Admin
exports.getSingleCategory = async(req, res, next) => {
    const category = await Category.findById(req.params.category_id)

    if(!category) {
        return next(
            new ErrorResponse(`Category not found with id of ${req.params.category_id}`, 404)
        )
    }

    res.status(200).json({ success: true, category: category })
}

// @desc    Create Category
// @route   POST /api/v1/cateogries
// @acces   Private/Operator/Admin
exports.createCategory = async(req, res, next) => {
    const category = await Category
    .create(req.body)
    .catch(() => {
        return next(
            new ErrorResponse("This cateogry name already exist", 400)
        )
    })

    res.status(200).json({ success: true, category: category })
}

// @desc    Update Category
// @route   PUT /api/v1/cateogries/:category_id
// @acces   Private/Operator/Admin
exports.updateCateogry = async(req, res, next) => {
    const category = await Category.findById(req.params.category_id)
    
     if(!category) {
        return next(
            new ErrorResponse(`category not found with id of ${req.params.category_id}`, 404)
        )
    }

    Category
        .findByIdAndUpdate(category._id, {name: req.body.name}, {
            new: true,
            runValidators: true
        })
        .then((created_category) => {
            res.status(200).json({ success: true, created_category: created_category })
        })
        .catch((error) =>{
            console.log(error)
            return next(
                new ErrorResponse('an error occured while updating category', 400)
            )
        })      
} 

// @desc    Delete Category
// @route   DELETE /api/v1/cateogries/:category_id
// @acces   Private/Operator/Admin
exports.deleteCategory = async (req, res, next) => {
    const category = await Category.findById(req.params.category_id)
    if (!category) {
        return next(
            new ErrorResponse(`cannot find category with this ${req.params.category_id} Id"`, 404)
        )
    }

    Category.findByIdAndDelete(category._id)
        .then(() => {
            res.status(200).json({ success: true })
        })
        .catch(() => {
            return next(
                new ErrorResponse("An error occured while deleting cateogry", 400)
            )
        })
}

// @desc    Add SubCategory to Cateogry
// @route   PUT /api/v1/cateogries/:category_id/:sub_category_id
// @acces   Private/Operator/Admin
exports.addSubCategoriesToCategories = async(req, res, next) => {
    const category = await Category.findById(req.params.category_id)

    if(!category) {
        return next(
            new ErrorResponse(`Category not found with id of ${req.params.category_id}`, 404)
        )
    }


    const subCategory = await SubCategory.findById(req.params.sub_category_id)
     
    if(!subCategory) {
        return next(
            new ErrorResponse(`SubCategory not found with id of ${req.params.sub_category_id}`, 404)
        )
    }

    if(category.sub_categories.includes(subCategory._id) || subCategory.parent_category_id) {
        return next(
            new ErrorResponse(`This category is already subCategory of ${category.name}`, 404)
        )
    }

    try {
        category.sub_categories.push(subCategory._id)

        category.save()
        .then(
            SubCategory
                .findByIdAndUpdate(subCategory._id, { parent_category_id: category._id }, {
                    new: true,
                    runValidators: true
                })
                .then((updated_sub_category) => {
                    res.status(200).json({ success: true, updated_sub_category: updated_sub_category, category: category})
                }) 
                .catch(() => {
                    return next(
                        new ErrorResponse("An error occured while updating Sub Category", 400)
                    )
                })                     
        )
    } catch (error) {
        return next(
            new ErrorResponse("An error occured while updating cateogry", 400)
        )
    }
}

// @desc    Add SubCategory to Cateogry
// @route   PUT /api/v1/cateogries/:category_id/:sub_category_id
// @acces   Private/Operator/Admin
exports.deleteSubCategoriesFromCategories = async(req, res, next) => {
    const category = await Category.findById(req.params.category_id)

    if(!category) {
        return next(
            new ErrorResponse(`Category not found with id of ${req.params.category_id}`, 404)
        )
    }


    const subCategory = await SubCategory.findById(req.params.sub_category_id)
     
    if(!subCategory) {
        return next(
            new ErrorResponse(`SubCategory not found with id of ${req.params.sub_category_id}`, 404)
        )
    }

    try {
        await category.sub_categories.pull(subCategory._id)

        subCategory.parent_category_id = undefined

        await category.save()

        subCategory.save()  

        res.status(200).json({ success: true, category: category, subCategory:subCategory })
    } catch (error) {
        return next(
            new ErrorResponse("An error occured while updating cateogry", 400)
        )
    }
}