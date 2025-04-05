const express = require("express");
require("dotenv");
const cors = require("cors");
const { connectDB } = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const groupRoutes = require('./routes/groupRoutes')

const app = express();

app.use(express.json());
app.use(cors());

app.use("/auth", authRoutes);
app.use('/group', groupRoutes);

app.get("/", (req, res) => {
  res.send("Hello arbaz");
});

const PORT = process.env.PORT || 8000;
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
});
