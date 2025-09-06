const express = require("express")
const authMiddleware = require("../middleware/authMiddleware")
const {createSettlement} = require("../controllers/settleController")

const router = express.Router()

router.post("/", authMiddleware, createSettlement)

module.exports = router