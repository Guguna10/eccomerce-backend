const ErrorResponse = require("../utils/error_response")
const User = require("../models/user_model")
const sendTokenResponse = require("../middlewares/send_token_response")
const { sendEmail } = require('../utils/send_emails')

// @desc    Register user
// @route   POST /api/v1/authentication/register
// @access  Public
exports.register = async(req, res, next) => {
    const { first_name, last_name, phone, email, password} = req.body

    const email_candidate = await User.findOne({ email: email })
    const phone_candidate = await User.findOne({ phone: phone })


    if(email_candidate) {
        return next(
            new ErrorResponse("user already registered with this email", 400)
        )
    }

    if(phone_candidate) {
        return next(
            new ErrorResponse("user already registered with this phone", 400)
        )
    }

    try {
        const new_user = await User
        .create(
            {
                first_name,
                last_name,
                phone,
                email,
                password
            }
        )

        const confrim_email_token = await new_user.generateConfirmEmailToken()

        const message = `
            მოგესალმებით ${new_user.first_name}, ${new_user.last_name}, თქვენი კომფორტისთვის და 
            რეგისტრაციის დასასრულებლად გიგზავნით ელ-ფოსტის ვერიფიკაციის 4 
            ნიშნა კოდს რომლის ვადაა 1 საათი  ${confrim_email_token},
            ეს მესიჯი არის დემეტრე ღუღუნიშვილისგან <3
        `

        await sendEmail(
            {
                email: new_user.email,
                subject: "რეგისტრაცია ელ-ფოსტის ვერიფიკაცია",
                message: message
            }
        )

        await new_user.save({ validateBeforeSave: false })

        sendTokenResponse(new_user, 200, res)
    } catch(err) {
        console.log(err, 'This is err')
        return next(
            new ErrorResponse("the error occurred while creating the user", 400)
        )
    }

    console.log('user registered succesfully')
}

// @desc    Login user
// @route   POST /api/v1/authentication/login
// @access  Public
exports.login = async(req, res, next) => {
    const { email, password} = req.body

    // ====== Validdate Email & Password ======  
    if(!email || !password) {
        return next(
            new ErrorResponse("Please enter both email and password", 400)
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
    console.log("ok", isMatch)

    if (!isMatch) {
        return next(
            new ErrorResponse("Please enter a valid password", 400)
        )
    }
    
    sendTokenResponse(user, 200, res)
}

// @desc    Confirm Email
// @route   PUT /api/v1/authentication/confirm_email/:email_token
// @access  Public
exports.confirmEmail = async(req, res, next) => {
    const user =await User.findOne(
        {
            confirmEmailToken: req.params.email_token,
            isEmailConfirmed: false,
            confirmEmailTokenExpire: { $gt: Date.now() }
        }
    )

    if(!user) {
        return next(
            new ErrorResponse("Invalid email token", 400)
        )
    }

    try {
        user.confirmEmailToken = undefined
        user.confirmEmailTokenExpire = undefined
        user.isEmailConfirmed = true

        await user.save({ validateBeforeSave: false})

        const message = `გილოცავთ ${user.first_name}, თქვენ წარმატებით გაიარეთ რეგისტრაცია და ახლა უკვე შეგიძლიათ იშოპიგნოთ ჩვენს ონლაინ მაღაზიაში`

        await sendEmail(
            {
                email: user.email,
                subject: "წარმატებული რეგისტრაცია",
                message: message
            }
        )

        sendTokenResponse(user, 200, res)
    } catch (error) {
        return next(
            new ErrorResponse("An error occured wihle verifying the user email", 400)
        )
    }
}

// @desc    Get Current logged User information
// @route   GET /api/v1/authentication/me
// @access  Private
exports.getMe = async(req, res, next) => {
    const user = await User.findById(req.user.id)

    if(!user) {
        return next(
            new ErrorResponse(`User not found with id of ${req.user.id}`, 404)
        )
    }

    res.status(200).json({ success: true, user: user })
}