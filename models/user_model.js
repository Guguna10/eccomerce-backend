const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")
const JWT = require("jsonwebtoken")

// ====== User Schema in Mongoose ======//
const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: [true, "Please enter first name"]
    },
    last_name: {
        type: String,
        required: [true, "Please enter last name"]
    },
    phone: {
        type: Number,
        required: [true, "Please enter Mobile phone"],
        unique: true,
    },
    confirmPhoneToken: String,
    confirmPhoneTokenExpire: Date,
    isPhoneConfirmed: {
        type: Boolean,
        default: false
    },
    email: {
        type: String,
        required: [true, "Please enter email"],
        unique: true,
        match: [
            /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
            "Please enter a valid email"
        ]
    },
    confirmEmailToken: String,
    confirmEmailTokenExpire: Date,
    isEmailConfirmed: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ["USER", "OPERATOR", "ADMIN"],
        default: "USER"
    },
    authorized: {
        type: String,
        enum: ["GOOGLE", "FACEBOOK", "MANUALLY"],
        default: "MANUALLY"
    },
    photo: String,
    googleId: String,
    facebookId: String,
    password: {
        type: String,
        required: [true, "Please enter password"],
        minLength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
    disabled: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// ====== Encrypt Password Using Bcrypt ====== //
UserSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        next()
    }
    const salt = await bcrypt.genSalt(10)

    this.password = await bcrypt.hash(this.password, salt)
})

// ====== Sign JWT and return ====== //
UserSchema.methods.getSignedJWTToken = function() {
    return JWT.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

// ====== Match User Entered Password to Hashed Password in Database ======//
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// ====== Generate and Hash Password Token ======//
UserSchema.methods.getResetPasswordToken = function () {
    const reset_token = crypto
        .randomBytes(20)
        .toString("hex")
        .substring(1, 7)
        .toUpperCase()

    console.log(reset_token, "THIS RESET TOKEN")

    this.resetPasswordToken = reset_token
    this.resetPasswordTokenExpire = Date.now() + 3600000

    console.log(Date.now() + 3600000, "RESET PASS EXPIRE DATE")
    return reset_token
}

// ====== Generate Confirm Email Token ======//
UserSchema.methods.generateConfirmEmailToken = function() {
    const confirmation_token = crypto
        .randomBytes(20)
        .toString("hex")
        .substring(1, 5)
        .toUpperCase()
        
    this.confirmEmailToken = confirmation_token
    this.confirmEmailTokenExpire = Date.now() + 3600000

    return confirmation_token
}

// ====== Generate Confirm Email Token ======//
UserSchema.methods.generateConfirmPhoneToken = function() {
    const confirmation_token = crypto
        .randomBytes(20)
        .toString("hex")
        .substring(1, 5)
        .toUpperCase()
        
    this.confirmPhoneToken= confirmation_token
    this.confirmPhoneTokenExpire = Date.now() + 3600000

    return confirmation_token
}
module.exports = mongoose.model("User", UserSchema)