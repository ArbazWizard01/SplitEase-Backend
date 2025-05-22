const express = require("express");
const router = express.Router();
const authMiddleWare = require("../middleware/authMiddleware");
const {
  getUsersByIds,
  getUsersEmailByIds,
  getAllUser,
} = require("../controllers/userController");

router.get("/users", authMiddleWare, getAllUser);
router.post("/users/name", getUsersByIds);
router.post("/users/email", getUsersEmailByIds);

module.exports = router;
