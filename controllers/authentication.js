const ErrorResponse = require("../utils/error_response")
const User = require("../models/user_model")

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
            res.status(200).json({
                success:true,
                new_user: new_user
            })
        })
        .catch((error) => {
            console.log(error, "this error")
            return next(
                new ErrorResponse("The error occured while creating new user in database", 400)
            )
        })
}