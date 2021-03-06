
const ErrorResponse = require("../utils/error_response")

 // ===== Close Server & Exit Process ===== //
const errorHandler = (err, request, response, next) => {
    let error = { ...err }

    error.message = err.message

    // ========== Mongoose Bad ObjectId ========== //
    if (err.name === 'CastError') {
        const message = `Resource not found in Mongo Database`

        error = new ErrorResponse(message, 404)
    }

    // ========== Mongoose Bad ObjectId ========== //
    if (err.code === 11000) {
        const message = "Duplicate field value entered"

        error = new ErrorResponse(message, 400)
    }

    // ========== Mongoose Validation Error ========== //
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message)

        error = new ErrorResponse(message, 400)
    }

    response.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    })
}

module.exports = errorHandler