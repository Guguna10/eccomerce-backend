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
    sendConfirmEmailToken
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

module.exports = router