const ErrorResponse = require('../utils/error_response')
const mongoose = require("mongoose")
const Category = require('../models/category_model')
const SubCategory = require('../models/sub_category_model')

// ========== GET Methods ========== //

// @desc      Get Categories
// @route     GET /api/v1/rest_menu/categories
// @access    Public
exports.getCategories = async (request, response) => {
    const categories = await Category.find()

    response.status(200).json({ success: true, categories: categories })
}

// @desc      Get Sub Categories
// @route     GET /api/v1/rest_menu/sub_categories
// @access    Public
exports.getSubCategories = async (request, response) => {
    const sub_categories = await SubCategory.find()

    response.status(200).json({ success: true, sub_categories: sub_categories })
}

// ========== POST Methods ========== //

// @desc      Create Category
// @route     POST /api/v1/rest_menu/categories
// @access    Private
exports.createCategory = async (request, response, next) => {
    const category = await Category.create(request.body)

    response.status(200).json({ success: true, new_category: category })
}

// @desc      Create Sub Category
// @route     POST /api/v1/rest_menu/sub_categories
// @access    Private
exports.createSubCategory = async (request, response, next) => {
    const sub_category = await SubCategory.create(request.body)

    const parent_category = await Category.findById(sub_category.parent_category_id)

    if (!parent_category) {
        return next(
            new ErrorResponse(`Category not found with id of ${sub_category.parent_category_id}`, 404)
        )
    }

    await parent_category.sub_categories.push(
        new mongoose.mongo.ObjectId(sub_category._id)
    )

    await parent_category.save()

    response.status(200).json({ success: true, new_sub_category: sub_category })
}

/* ========== UPDATE Methods ========== */

// @desc      Update Category
// @route     UPDATE /api/v1/rest_menu/categories/:category_id
// @access    Private
exports.updateCategory = async (request, response, next) => {
    const category = await Category.findById(request.params.category_id)

    if (!category) {
        return next(
            new ErrorResponse(`Category not found with id of ${request.params.category_id}`, 404)
        )
    }

    Category
        .findByIdAndUpdate(request.params.category_id, request.body, {
            new: true,
            runValidators: true
        })
        .then((updated_category) => {
            response.status(200).json({ success: true, updated_category: updated_category })
        })
        .catch(() => {
            return next(
                new ErrorResponse(`An error occurred while updating the category`, 400)
            )
        })
}

// @desc      Update Sub Category
// @route     UPDATE /api/v1/rest_menu/sub_categories/:sub_category_id
// @access    Private
exports.updateSubCategory = async (request, response, next) => {
    const sub_category = await SubCategory.findById(request.params.sub_category_id)

    if (!sub_category) {
        return next(
            new ErrorResponse(`Sub Category not found with id of ${request.params.sub_category_id}`, 404)
        )
    }

    if (request.body.parent_category_id && request.body.parent_category_id !== sub_category.parent_category_id) {
        const old_parent_category = await Category.findById(sub_category.parent_category_id)

        if (!old_parent_category) {
            return next(
                new ErrorResponse(`Old Parent Category not found with id of ${sub_category.parent_category_id}`, 404)
            )
        }

        old_parent_category.sub_categories = old_parent_category.sub_categories.length 
            ? old_parent_category.sub_categories.filter((sub_category_id) => String(sub_category_id) !== String(sub_category._id))
            : []

        await old_parent_category.save()

        const new_parent_category = await Category.findById(request.body.parent_category_id)

        if (!new_parent_category) {
            return next(
                new ErrorResponse(`New Parent Category not found with id of ${request.body.parent_category_id}`, 404)
            )
        }

        new_parent_category.sub_categories.push(
            new mongoose.mongo.ObjectId(sub_category._id)
        )

        await new_parent_category.save()
    }

    SubCategory
        .findByIdAndUpdate(request.params.sub_category_id, request.body, {
            new: true,
            runValidators: true
        })
        .then((updated_sub_category) => {
            response.status(200).json({ success: true, updated_sub_category: updated_sub_category })
        })
        .catch(() => {
            return next(
                new ErrorResponse(`An error occurred while updating the sub category`, 400)
            )
        })
}

// ========== DELETE Methods ========== //

// @desc      Delete Category
// @route     DELETE /api/v1/rest_menu/categories/:category_id
// @access    Private
exports.deleteCategory = async (request, response, next) => {
    const category = await Category.findById(request.params.category_id)

    if (!category) {
        return next(
            new ErrorResponse(`Category not found with id of ${request.params.category_id}`, 404)
        )
    }

    await Category
        .findByIdAndDelete(category._id)
        .catch(() => {
            return next(
                new ErrorResponse(`Category not deleted in id of category: ${category._id}`, 400)
            )
        })

    await SubCategory
        .deleteMany({ parent_category_id: category._id })
        .catch(() => {
            return next(
                new ErrorResponse(`Some Sub Category not deleted in id of category: ${category._id}`, 400)
            )
        })

    response.status(200).json({ 
        success: true, 
        message: "The category has been successfully deleted along with parent and child attributes"
    })
}

// @desc      Delete Sub Category
// @route     DELETE /api/v1/rest_menu/sub_categories/:sub_category_id
// @access    Private
exports.deleteSubCategory = async (request, response, next) => {
    const sub_category = await SubCategory.findById(request.params.sub_category_id)

    if (!sub_category) {
        return next(
            new ErrorResponse(`Sub Category not found with id of ${request.params.sub_category_id}`, 404)
        )
    }

    await SubCategory
        .findByIdAndDelete(sub_category._id)
        .catch(() => {
            return next(
                new ErrorResponse(`Sub Category not deleted in id of category: ${sub_category._id}`, 400)
            )
        })

    const parent_category = await Category.findById(sub_category.parent_category_id)

    if (!parent_category) {
        return next(
            new ErrorResponse(`Parent Category not found with id of ${sub_category.parent_category_id}`, 400)
        )
    }

    parent_category.sub_categories = parent_category.sub_categories.length 
        ? parent_category.sub_categories.filter((sub_category_id) => String(sub_category_id) !== String(sub_category._id))
        : []

    await parent_category.save()

    response.status(200).json({ 
        success: true, 
        message: "The sub category has been successfully deleted along with parent attributes"
    })
}