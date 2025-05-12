const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const recalculateBalances = async (groupId) => {
  const db = getDB();
  const expenseCollection = db.collection("expenses");
  const groupCollection = db.collection("groups");

  const expenses = await expenseCollection.find({ groupId }).toArray();

  const balances = {};

  expenses.forEach((expense) => {
    const { amount, paidBy, splitBetween } = expense;
    const individualShare = amount / splitBetween.length;

    splitBetween.forEach((memberId) => {
      if (memberId === paidBy) return;

      if (!balances[memberId]) balances[memberId] = {};
      if (!balances[paidBy]) balances[paidBy] = {};

      balances[memberId][paidBy] =
        (balances[memberId][paidBy] || 0) + individualShare;
      balances[paidBy][memberId] =
        (balances[paidBy][memberId] || 0) - individualShare;
    });
  });

  await groupCollection.updateOne(
    { _id: new ObjectId(groupId) },
    { $set: { balances } }
  );
};

const addExpense = async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection("users");
    const expenseCollection = db.collection("expenses");
    const { groupId } = req.params;
    const { amount, description, splitBetween } = req.body;
    const paidBy = req.user.id;

    if (!amount || !groupId || !splitBetween || !Array.isArray(splitBetween)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const groupObjectId = new ObjectId(groupId);

    const users = await usersCollection
      .find({ _id: { $in: splitBetween.map((id) => new ObjectId(id)) } })
      .toArray();

    const splitBetweenIds = users.map((user) => user._id.toString());
    if (!splitBetweenIds.includes(paidBy)) {
      splitBetweenIds.push(paidBy);
    }

    const expense = {
      amount,
      description,
      groupId,
      paidBy,
      splitBetween: splitBetweenIds,
      createdAt: new Date(),
    };

    const result = await expenseCollection.insertOne(expense);

    await recalculateBalances(groupId);

    res.status(201).json({
      message: "Expense added and balances updated successfully",
      expenseId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const db = getDB();
    const expenseCollection = db.collection("expenses");
    const { groupId } = req.params;

    const expenses = await expenseCollection
      .find({ groupId })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses", error: error.message });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const db = getDB();
    const { expenseId } = req.params;

    const expense = await db.collection("expenses").findOne({ _id: new ObjectId(expenseId) });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    res.status(200).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Error fetching expense", error: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const db = getDB();
    const { expenseId } = req.params;
    const updateData = req.body;

    await db.collection("expenses").updateOne(
      { _id: new ObjectId(expenseId) },
      { $set: updateData }
    );

    const updatedExpense = await db.collection("expenses").findOne({ _id: new ObjectId(expenseId) });
    await recalculateBalances(updatedExpense.groupId);

    res.status(200).json({ message: "Expense updated and balances recalculated" });
  } catch (error) {
    res.status(500).json({ message: "Error updating expense", error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const db = getDB();
    const { expenseId } = req.params;

    const expense = await db.collection("expenses").findOne({ _id: new ObjectId(expenseId) });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    await db.collection("expenses").deleteOne({ _id: new ObjectId(expenseId) });

    await recalculateBalances(expense.groupId);

    res.status(200).json({ message: "Expense deleted and balances recalculated" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting expense", error: error.message });
  }
};

const getUserExpensesInProject = async (req, res) => {
  try {
    const db = getDB();
    const { groupId } = req.params;
    const userId = req.user.id;

    const expenses = await db.collection("expenses").find({
      groupId,
      splitBetween: userId
    }).toArray();

    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user expenses", error: error.message });
  }
};

const getSplitSummary = async (req, res) => {
  try {
    const db = getDB();
    const { groupId } = req.params;
    const group = await db.collection("groups").findOne({ _id: new ObjectId(groupId) });

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.status(200).json(group.balances || {});
  } catch (error) {
    res.status(500).json({ message: "Error fetching split summary", error: error.message });
  }
};

module.exports = {
  addExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getUserExpensesInProject,
  getSplitSummary
};
