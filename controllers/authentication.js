const ErrorResponse = require("../utils/error_response")
const User = require("../models/user_model")
const sendTokenResponse = require("../middlewares/send_token_response")
const { sendEmail } = require('../utils/send_emails')
const cloudinary = require("../utils/cloudinary")

// @desc    Register user
// @route   POST /api/v1/authentication/register
// @access  Public
exports.register = async(req, res, next) => {
    const { first_name, last_name, phone, email, password} = req.body

    const email_candidate = await User.findOne({ email: email.toLowerCase() })
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
                email: email.toLowerCase(),
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
        return next(
            new ErrorResponse("the error occurred while creating the user", 400)
        )
    }

    console.log('user registered succesfully')
}

// @desc    Confirm Email Tokain again
// @route   PUT /api/v1/authentication/confirm_email_token
// @access  public
exports.sendConfirmEmailToken = async(req, res, next) => {
    const user = await User.findOne({email: req.body.email, isEmailConfirmed: false})

    if(!user) {
        return next(
            new ErrorResponse(`User not found with email of ${req.body.email.toLowerCase()}`, 404)
        )
    }

    try{
        const confirm_email_token = await user.generateConfirmEmailToken()

        const message = `მოგესალმებით ${user.first_name}, კიდევ ერთხელ გიგზავნით უსაფრთხო კოდს ელ-ფოსტიტ ვერიფიკაციისთვის: ${confirm_email_token}`

        await sendEmail(
            {
                email: user.email,
                subject: "ელ-ფოსტის ვერიფიკაცია",
                message: message
            }
        )

        await user.save ({
            validateBeforeSave: false
        })

        res.status(200).json({ success: true })
    }catch{
        return next(
            new ErrorResponse("An error accured while sending new confirmation token again", 400)
        )
    }
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

// @desc    Update User Details
// @route   PUT /api/v1/authentication/update_details
// @access  Private
exports.updateDetails = async(req, res, next) => {
    const user = await User.findById(req.user.id)

    if(!user) {
        return next(
            new ErrorResponse(`User not found with id of: ${req.user.id}`, 404)
        )
    }

    User
        .findByIdAndUpdate(user._id, req.body, {
            new: true,
            runValidators: true
        })
        .then((updated_user) => {
            res.status(200).json({success: true, updated_user: updated_user})
        })
        .catch(() => {
            return next(
                new ErrorResponse("An error occured while updating the user details", 400)
            )
        })
}

// @desc    Update User Profile Image
// @route   PUT /api/v1/authentication/change_profile_image
// @access  Private
exports.updateUserProfileImage = async (request, response, next) => {
    const user = await User.findById(request.user.id)

    if (!user) {
        return next(
            new ErrorResponse(`User not found with id of: ${request.user.id}`, 404)
        )
    }

    if (user.photo) {
        await cloudinary.uploader.destroy(`ecommerce-backend/profile-images/${user._id}`), function (error, result) {
            if (error) {
                return next(
                    new ErrorResponse(`The user profile image could not be deleted with public id of: ${user._id}`, 400)
                )
            }
        }
    }

    let new_user_profile_image = null

    await cloudinary.uploader.upload(request.body.image_to_base_64, {
        public_id: `${user._id}`,
        upload_preset: "ecommerce-backend-users-profile-images",
        width: 400,
        height: 400
    }, function (error, result) {
        if (error) {
            return next(
                new ErrorResponse(`The user profile image could not be uploaded to the cloud`, 400)
            )
        }

        if (result) {
            new_user_profile_image = result.secure_url
        }
    })

    User
        .findByIdAndUpdate(user._id, { photo: new_user_profile_image }, {
            new: true,
            runValidators: true
        })
        .then((updated_user) => {
            response.status(200).json({ success: true, updated_user: updated_user })
        })
        .catch(() => {
            return next(
                new ErrorResponse('An error occurred while updating the user photo', 400)
            )
        })
}

// @desc    Update Password
// @route   PUT /api/v1/authentication/update_password
// @access  Private
exports.updatePassword = async(req, res, next) => {
    const user = await User.findById(req.user.id).select("+password")

    if(!user) {
        return next(
            new ErrorResponse(`User not found with id of: ${req.user.id}`, 404)
        )
    }

    // ====== Check Current Password  ======//
    if(!(await user.matchPassword(req.body.current_password))) {
        return next(
            new ErrorResponse(
                "Current Password is incorect", 400
            )
        )
    }

    try {
        user.password = req.body.new_password

        user.save()

        const message = `მოგესალმებით ${user.first_name}, თქვენი პაროლი წარმატებით შეიცვალა, სასიამოვნო დღეს გისურვებთ`
        await sendEmail(
            {
                email: user.email,
                subject: "ECOMMERCE_BACKEND: პაროლის ცვლილვება",
                message: message
            }
        )

        res.status(200).json({ success: true })
    } catch (error) {
        return next(
            new ErrorResponse("An error accured while updating the user password", 400)
        )
    }
}

// @desc    Forgot Password
// @route   PUT /api/v1/authentication/forgot_password
// @access  Public
exports.forgotPassword = async(req, res, next) => {
    const user = await User.findOne({email: req.body.email.toLowerCase()})

    if(!user) {
        return next(
            new ErrorResponse(`User not found with email of: ${req.body.email}`, 404)
        )
    }

    if (user.authorized === 'FACEBOOK') {
        return next(
            new ErrorResponse("You are logged in with facebook, so you can not cahnge your password", 400)
        )
    }

    if (user.authorized === "GOOGLE") {
        return next(
            new ErrorResponse("You are logged in with google, so you can not cahnge your password", 400)
        )
    }

    try{
        const reset_code = await user.getResetPasswordToken()

        await user.save(
            {
                validateBeforeSave: false
            }
        )

        const message = `მოგესალმებით ${user.first_name}, გიგზავნით პაროლის აღდგენის უსაფრთხო კოდს, რომლის მოქმედების ვადა არის 1 საათი ${reset_code}`
            
        await sendEmail(
            {
                email: user.email,
                subject: "პაროლის აღდგენა",
                message: message
            }
        )

        response.status(200).json(
            {
                success: true,
                message: "A six-digit password reqcovery code is sent to your email adress "
            }
        )

    }catch(error) {
        user.resetPasswordToken = undefined
        user.resetPasswordTokenExpire = undefined

        await user.save(
            {
                validateBeforeSave: false
            }
        )

        return next(
            new ErrorResponse("Sorry for the thechnical glitch, the service is temporarily down, we are working on this issue", 500)
        )
    }
}