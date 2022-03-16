const ErrorResponse = require("../utils/error_response")
const User = require("../models/user_model")

// @desc    Create User
// @route   POST /api/v1/users/create_user
// @access  private/ADMIN
exports.createUser = async(req, res) => {
    const { first_name, last_name, phone, email, password, role} = req.body

    const emailExists = await User.findOne({ email: email.toLowerCase() })
    const phoneExists = await User.findOne({ phone: phone })

    if(emailExists) {
        return next(
            new ErrorResponse("user already registered with this email", 400)
        )
    }

    if(phoneExists) {
        return next(
            new ErrorResponse("user already registered with this phone", 400)
        )
    }

    // ======= create user and send email confirm token ======= //
    try {
        const new_user = await User
            .create({
                first_name,
                last_name,
                phone,
                email: email.toLowerCase(),
                password,
                role
            })

        await new_user.save({ validateBeforeSave: false })

        res.status(200).json({ success: true, new_user: new_user})
    } catch(error) {
        console.log(error)
        return next(
            new ErrorResponse("the error occurred while creating the user", 400)
        )
    }
}

// @desc    get all users
// @route   POST /api/v1/users/get_users
// @access  private/ADMIN
exports.getUsers = async(req, res) => {
    const user = await User.find({})
    res.json(user)
}

// @desc    delate User
// @route   POST /api/v1/users/user_delate/:id
// @access  private/ADMIN
exports.deleteUser = async (req, res, next) => {
    const user = await User.findById(req.params.id)

    if(user.role === "ADMIN") {
        return next(
            new ErrorResponse("this user is also admin like you, so you dont have permission to delate them", 400)
        )
    }

    if (user) {
      await user.remove()
      res.json({ message: 'User removed' })
    } else {
      res.status(404)
        return next(
            new ErrorResponse(`User not found with this id`, 400)
        )
    }
}

// @desc    Update User
// @route   POST /api/v1/users/user_update/:id
// @access  private/ADMIN
exports.updateUser = async(req, res, next) => {
    const user = await User.findById(req.user.id)

    if(!user) {
        return next(
            new ErrorResponse(`User not found with id of: ${req.user.id}`, 404)
        )
    }

}

// @desc    Disable User
// @route   POST /api/v1/users/disable_user/:id
// @access  private/ADMIN
exports.disableUser = async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id)

    if(!user) {
        return next(
            new ErrorResponse(`user not found with id of ${req.user.id}`, 400)
        )
    }

    if(user.role === "ADMIN") {
        return next(
            new ErrorResponse("this user is also admin like you, so you cant ban this user", 400)
        )
    }

    if(user.disabled) {
        return next(
            new ErrorResponse("this user is already disabled", 400)
        )
    }

    try {
        user.disabled = true

        user.save()

        res.status(200).json({ success: true, disabled: user})
    } catch (error) {
        return next(
            new ErrorResponse("an error occured while banning user", 400)
        )
    }


    res.status(200).json({ success: true, disabled_user: user})
}

