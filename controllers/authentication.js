const ErrorResponse = require("../utils/error_response")
const User = require("../models/user_model")
const sendTokenResponse = require("../middlewares/send_token_response")

// @desc    Register user
// @route   POST /api/v1/authentication/register
// @access  Public
exports.register = async(req, res, next) => {
    const { first_name, last_name, phone, email, password} = req.body

    const email_candidate = await User.findOne({ email: email })
    const phone_candidate = await User.findOne({ phone: phone })

    if(email_candidate ) {
        return next(
            new ErrorResponse("The user has already registered with this email", 400)
        )
    }

    if(phone_candidate ) {
        return next(
            new ErrorResponse("The user has already registered with this email", 400)
        )
    }

    await User
        .create(
            {
                first_name,
                last_name,
                phone,
                email,
                password
            }
        )
        .then((new_user) => {
           sendTokenResponse(new_user, 200, response)
        })
        .catch((error) => {
            console.log(error, "this error")
            return next(
                new ErrorResponse("The error occured while creating new user in database", 400)
            )
        })
}

// @desc    Login user
// @route   POST /api/v1/authentication/login
// @access  Public
exports.login = async(req, res, next) => {
    const { email, password} = req.body

    // ====== Validdate Email & Password ======  
    if(!email || !password) {
        return next(
            new ErrorResponse("Please enter both email and passwoerd", 400)
        )
    }

    // ====== Check user in Mongo with email ====== //
    const user = await User.findOne({ email: email}).select("+password")

    if(!user) {
        return next(
            new ErrorResponse("The user could not be found with the specified email", 404)
        )
    }

    // ====== Chec If password matches ====== //
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
        return next(
            new ErrorResponse("Please enter a valid password", 400)
        )
    }
    
    sendTokenResponse(user, 200, res)
}