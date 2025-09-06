const { error } = require("console");
const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const createSettlement = async (req, res) => {
  try {
    const db = await getDB();
    const settlementsCollection = await db.collection("settlement");
    const { groupId, settledBy, settledWith, mode, note, amount } = req.body;

    if (!groupId || !settledBy || !settledWith || !amount || !isNaN(amount)) {
      return res.status(400).json({ message: "Missing or Invalid fileds" });
    }

    const settlement = {
      groupId: new ObjectId(groupId),
      settledBy: new ObjectId(settledBy),
      settledWith: new ObjectId(settledWith),
      amount: parseFloat(amount),
      mode: mode || "Manual",
      note: note || "",
      createdAt: new Date(),
    };

    await settlementsCollection.insertOne(settlement);
    res
      .status(201)
      .json({ message: "settlement recorded successfully.", settlement });
  } catch (error) {
    console.log("Error in createSettlement : ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {createSettlement}
