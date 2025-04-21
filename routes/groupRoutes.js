const express = require("express");
const {
  createGroup,
  addMember,
  removeMember,
  leaveGroup,
  getUserGroups,
  getGroupBalances,
} = require("../controllers/groupController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/create", authMiddleware, createGroup);
router.post("/addMember", authMiddleware, addMember);
router.post("/removeMember", authMiddleware, removeMember);
router.post("/leaveGroup", authMiddleware, leaveGroup);
router.post("/myGroups", authMiddleware, getUserGroups);
router.get("/balances", authMiddleware, getGroupBalances);

module.exports = router;
