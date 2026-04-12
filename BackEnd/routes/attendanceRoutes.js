const express = require("express");
const router = express.Router();

const {
  getAttendance,
  createAttendance,
} = require("../controllers/attendanceController");

router.get("/", getAttendance);
router.post("/", createAttendance);

module.exports = router;