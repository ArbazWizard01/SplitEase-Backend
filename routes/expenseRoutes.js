const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { addExpense } = require("../controllers/expenseController");

const router = express.Router();

router.post("/add", authMiddleware, addExpense);

module.exports = router;
