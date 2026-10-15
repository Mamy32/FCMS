const express = require("express");
const validate = require("../middleware/validate");
const schemas = require("../lib/schemas");
const c = require("../controllers/attendanceController");

const router = express.Router();

router.get("/", c.getAttendance);
router.post("/", validate(schemas.attendance), c.createAttendance);
router.delete("/:id", c.deleteAttendance);

module.exports = router;
