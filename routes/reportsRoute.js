const express = require("express");
const router = express.Router();
const report = require("../controllers/reportsController");
const auth = require("../middlewares/authentication");

router.get("/daily", auth, report.getDaily);
router.get("/monthly", auth, report.getMonthly);

module.exports = router;
