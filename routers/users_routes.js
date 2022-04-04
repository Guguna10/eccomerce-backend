
const express = require("express")
const router = express.Router()

const {
    getUsers,
    deleteUser,
    updateUser,
    createUser,
    disableUser
} = require("../controllers/users_controler")
const { protect } = require("../middlewares/authentication")
const { authorize } = require("../middlewares/authentication")

router.post("/create_user", protect, authorize("ADMIN"), createUser)
router.get("/get_users", protect, authorize("ADMIN"), getUsers)
router.delete("/user_delate/:id", protect, authorize("ADMIN"), deleteUser)
router.put("/user_update/:id", protect, authorize("ADMIN"), updateUser)
router.put("/disable_user/:id", protect, authorize("ADMIN"), disableUser)

module.exports = router