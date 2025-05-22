const express = require("express");
require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require("./routes/groupRoutes");
const expeneRoutes = require("./routes/expenseRoutes");
const userRoutes = require("./routes/userRoutes");
const { configDotenv } = require("dotenv");

const app = express();
app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use("/group", groupRoutes);
app.use("/expense", expeneRoutes);
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  res.send("Hello arbaz");
});

const PORT = process.env.PORT || 8000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
});
