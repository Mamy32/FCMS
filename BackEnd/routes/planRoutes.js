const express = require("express");
const router = express.Router();

const {
  getPlans,
  createPlan,
} = require("../controllers/planController");

router.get("/", getPlans);
router.post("/", createPlan);

module.exports = router;