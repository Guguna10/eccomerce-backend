const ErrorResponse = require('../utils/error_response')
const User = require("../models/user_model")
const JWT = require("jsonwebtoken")

// ===== Protect Route Middleware =====//
exports.protect = async (req, res, next) => {
    let token

    if (
        req.headers.authorization 
        &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        // ========== Set Token From Berare Token from Header ========== //

        token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
        return next(
            new ErrorResponse('Not authorized to access this route', 401)
        )
    }

    try {
        // ========== Verify Token ========== //
        const decoded = JWT.verify(token, process.env.JWT_SECRET)

        req.user = await User.findById(decoded.id)

        next()
    } catch (error) {
        return next(
            new ErrorResponse('Not authorized to access this route', 401)
        )
    }
}

// ===== Grant Access to Specific Roles =====//
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            return next(
                new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 401)
            )
        }

        next()
    }
}