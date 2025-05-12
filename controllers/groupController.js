const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const createGroup = async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection("users");
    const groupCollection = db.collection("groups");
    const { name, memberEmails } = req.body;
    const createdBy = req.user.id;

    if (!name)
      return res.status(400).json({ Message: "Group name is required" });

    const emailList = Array.isArray(memberEmails) ? memberEmails : [];

    const users = await usersCollection
      .find({ email: { $in: emailList } })
      .toArray();

    let memberIds = users.map((user) => user._id.toString());

    if (!memberIds.includes(createdBy)) {
      memberIds.push(createdBy);
    }

    const group = {
      name,
      createdBy,
      members: memberIds,
      createdAt: new Date(),
    };
    const result = await groupCollection.insertOne(group);

    res.status(201).json({
      message: "Group created successfully",
      groupId: result.insertedId,
      members: memberIds,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const addMember = async (req, res) => {
  try {
    const db = getDB();
    const usersCollection = db.collection("users");
    const groupCollection = db.collection("groups");

    const { groupId } = req.query;
    const { email } = req.body;
    const requesterId = req.user.id;

    let objectGroupId;
    try {
      objectGroupId = new ObjectId(groupId);
    } catch {
      return res.status(400).json({ message: "Invalid Group ID format" });
    }

    const userToAdd = await usersCollection.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: "User not found" });

    const group = await groupCollection.findOne({ _id: objectGroupId });
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(requesterId))
      return res
        .status(403)
        .json({ message: "Only group members can add others" });

    if (group.members.includes(userToAdd._id.toString()))
      return res.status(400).json({ message: "User is already in the group" });

    await groupCollection.updateOne(
      { _id: objectGroupId },
      { $push: { members: userToAdd._id.toString() } }
    );

    res.status(200).json({ message: "User added to group successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const removeMember = async (req, res) => {
  try {
    const db = getDB();
    const groupCollection = db.collection("groups");
    const usersCollection = db.collection("users");

    const { groupId } = req.query;
    const { email } = req.body;
    const requesterId = req.user.id;

    if (!ObjectId.isValid(groupId))
      return res.status(400).json({ message: "Invalid Group Id format" });
    const groupObjectId = new ObjectId(groupId);

    const userToRemove = await usersCollection.findOne({ email });
    if (!userToRemove)
      return res.status(404).json({ message: "User not found" });

    const group = await groupCollection.findOne({ _id: groupObjectId });
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.createdBy !== requesterId) {
      return res
        .status(400)
        .json({ message: "Only Group Creator can remove member" });
    }
    await groupCollection.updateOne(
      { _id: groupObjectId },
      { $pull: { members: userToRemove._id.toString() } }
    );
    res.status(200).json({ message: "User removed to group successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const db = getDB();
    const groupsCollection = db.collection("groups");

    const { groupId } = req.query;
    const userId = req.user.id;

    let objectGroupId;
    try {
      objectGroupId = new ObjectId(groupId);
    } catch (error) {
      return res.status(400).json({ message: "Invalid Group ID format" });
    }

    const group = await groupsCollection.findOne({ _id: objectGroupId });
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "You are not a member of this group" });
    }

    await groupsCollection.updateOne(
      { _id: objectGroupId },
      { $pull: { members: userId } }
    );

    res.status(200).json({ message: "You have left the group successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getUserGroups = async (req, res) => {
  try {
    const db = getDB();
    const groupCollection = db.collection("groups");
    const userId = req.user.id;

    const groups = await groupCollection.find({ members: userId }).toArray();

    res.status(200).json(groups);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getGroupBalances = async (req, res) => {
  try {
    const db = getDB();
    const groupCollection = db.collection("groups");

    const { groupId } = req.query;
    const userId = req.user.id;

    let objectGroupId;
    try {
      objectGroupId = new ObjectId(groupId);
    } catch {
      return res.status(400).json({ message: "Invalid Group ID format" });
    }

    const group = await groupCollection.findOne({ _id: objectGroupId });

    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(userId)) {
      return res
        .status(403)
        .json({ message: "You are not a member of this group" });
    }

    const balances = group.balances || {};
    res.status(200).json({ balances });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    if (!groupId) {
      return res.status(400).json({ message: "Group Id is missing" });
    }

    const db = getDB();
    const groupCollection = db.collection("groups");
    const usersCollection = db.collection("users");

    const group = await groupCollection.findOne({
      _id: new ObjectId(groupId),
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Fetch member details
    const members = await usersCollection
      .find({ _id: { $in: group.members.map(id => new ObjectId(id)) } })
      .project({ name: 1 })
      .toArray();

    const memberMap = {};
    members.forEach(member => {
      memberMap[member._id.toString()] = member.name;
    });

    return res.status(200).json({
      ...group,
      memberDetails: memberMap, 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  createGroup,
  addMember,
  removeMember,
  leaveGroup,
  getUserGroups,
  getGroupBalances,
  getGroupById,
};
