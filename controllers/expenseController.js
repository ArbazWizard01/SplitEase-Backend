const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const addExpense = async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection("users");
    const groupCollection = db.collection("groups");
    const expenseCollection = db.collection("expenses");

    const { amount, description, splitBetween, groupId } = req.body;
    const paidBy = req.user.id;

    if (!amount || !groupId || !splitBetween || !Array.isArray(splitBetween)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let objectGroupId;
    try {
      objectGroupId = new ObjectId(groupId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid Group ID format" });
    }

    const group = await groupCollection.findOne({ _id: objectGroupId });
    if (!group) return res.status(404).json({ message: "Group not found" });

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

    // 💥 Now Update Balances
    const individualShare = amount / splitBetweenIds.length;

    const updatedBalances = { ...group.balances } || {};

    for (const memberId of splitBetweenIds) {
      if (memberId === paidBy) continue; // Skip payer himself

      // member owes money to payer
      if (!updatedBalances[memberId]) updatedBalances[memberId] = {};
      if (!updatedBalances[paidBy]) updatedBalances[paidBy] = {};

      updatedBalances[memberId][paidBy] =
        (updatedBalances[memberId][paidBy] || 0) + individualShare;

      updatedBalances[paidBy][memberId] =
        (updatedBalances[paidBy][memberId] || 0) - individualShare;
    }

    await groupCollection.updateOne(
      { _id: objectGroupId },
      { $set: { balances: updatedBalances } }
    );

    res.status(201).json({
      message: "Expense added and balances updated successfully",
      expenseId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = { addExpense, };
