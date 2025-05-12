const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  addExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getUserExpensesInProject,
  getSplitSummary
} = require("../controllers/expenseController");

const router = express.Router();

// Add new expense to group
router.post("/:groupId", authMiddleware, addExpense);

// Get all expenses for a group
router.get("/:groupId", authMiddleware, getAllExpenses);

// Get a specific expense by ID
router.get("/detail/:expenseId", authMiddleware, getExpenseById);

// Update a specific expense by ID
router.put("/update/:expenseId", authMiddleware, updateExpense);

// Delete a specific expense by ID
router.delete("/delete/:expenseId", authMiddleware, deleteExpense);

// Get all expenses involving current user in a group
router.get("/:groupId/user", authMiddleware, getUserExpensesInProject);

// Get balance summary for a group
router.get("/:groupId/summary", authMiddleware, getSplitSummary);

module.exports = router;
