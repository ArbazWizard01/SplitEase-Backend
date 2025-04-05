const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let db;

const connectDB = async () => {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected...");
    db = client.db("SplitEase");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error("❌ Database not initialized. Call connectDB first.");
  }
  return db;
};

module.exports = { connectDB, getDB };
