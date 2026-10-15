const express = require("express");
const validate = require("../middleware/validate");
const schemas = require("../lib/schemas");
const c = require("../controllers/checkInController");

const router = express.Router();

router.get("/", c.getCheckIns);
router.post("/", validate(schemas.checkIn), c.createCheckIn);
router.delete("/:id", c.deleteCheckIn);

module.exports = router;
