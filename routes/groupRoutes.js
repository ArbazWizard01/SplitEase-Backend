const express = require("express");
const {
  createGroup,
  addMember,
  removeMember,
  leaveGroup,
  getUserGroups,
  getGroupBalances,
  getGroupById,
} = require("../controllers/groupController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createGroup);
router.post("/addmember", authMiddleware, addMember);
router.post("/removemember", authMiddleware, removeMember);
router.post("/leave", authMiddleware, leaveGroup);
router.get("/", authMiddleware, getUserGroups);
router.get("/balances", authMiddleware, getGroupBalances);
router.get("/:groupId", authMiddleware, getGroupById);

module.exports = router;
