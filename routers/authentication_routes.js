const express = require("express")
const router = express.Router()

const { 
    register,
    login,
    confirmEmail,
    getMe,
    updateDetails,
    updateUserProfileImage,
    updatePassword,
    sendConfirmEmailToken,
    forgotPassword,
    resetPassword,
    sendPhoneConfirmToken
} = require('../controllers/authentication')
const { protect } = require("../middlewares/authentication")

router.get("/me", protect ,getMe)

router.post("/register", register)
router.post("/login", login )

router.put("/change_profile_image", protect ,updateUserProfileImage )
router.put("/update_details", protect, updateDetails)
router.put("/confirm_email/:email_token", confirmEmail)
router.put("/confirm_email_token", sendConfirmEmailToken)
router.put("/update_password", protect, updatePassword)
router.put("/forgotPassword", forgotPassword)
router.put("/resetPassowrd/:reset_password_code", resetPassword)
router.put("/sendPhoneConfirmToken", protect, sendPhoneConfirmToken)

module.exports = router