const express = require("express")
const router = express.Router()

const { register, login, confirmEmail, getMe } = require('../controllers/authentication')
const { protect } = require("../middlewares/authentication")

router.get("/me", protect ,getMe)

router.post("/register", register)
router.post("/login", login )

router.put("/confirm_email/:email_token", confirmEmail)

module.exports = router