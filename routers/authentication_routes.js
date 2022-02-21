const express = require("express")
const router = express.Router()

const { register, login, confirmEmail } = require('../controllers/authentication')

router.post("/register", register)

router.post("/login", login )

router.put("/confirm_email/:email_token", confirmEmail)

module.exports = router