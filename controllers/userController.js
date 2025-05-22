const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const getAllUser = async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = await db.collection("users");
    const requesterId = req.user.id;

    const users = await usersCollection
      .find({ _id: { $ne: new ObjectId(requesterId) } })
      .project({ _id: 1, name: 1, email: 1 })
      .toArray();

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", err.message);
    return res
      .status(500)
      .json({ message: "Server Error:  ", error: error.message });
  }
};

const getUsersByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or empty IDs array" });
    }

    const db = getDB();
    const usersCollection = db.collection("users");

    const objectIds = ids.map((id) => new ObjectId(id));
    const users = await usersCollection
      .find({ _id: { $in: objectIds } })
      .project({ name: 1 }) // Only return name field
      .toArray();

    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user.name;
    });

    res.status(200).json(userMap);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUsersEmailByIds = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid or empty IDs array" });
    }

    const db = getDB();
    const usersCollection = db.collection("users");

    const objectIds = ids.map((id) => new ObjectId(id));
    const users = await usersCollection
      .find({ _id: { $in: objectIds } })
      .project({ email: 1 }) // Only return email field
      .toArray();

    const userMap = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user.email;
    });

    res.status(200).json(userMap);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getUsersByIds, getUsersEmailByIds, getAllUser };
