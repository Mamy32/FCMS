const express = require("express");
const validate = require("../middleware/validate");
const { requireAdmin } = require("../middleware/auth");
const schemas = require("../lib/schemas");
const c = require("../controllers/planController");

const router = express.Router();

// Pricing is an owner/admin decision; staff can only view plans.
router.get("/", c.getPlans);
router.post("/", requireAdmin, validate(schemas.plan), c.createPlan);
router.put("/:id", requireAdmin, validate(schemas.plan), c.updatePlan);
router.delete("/:id", requireAdmin, c.deletePlan);

module.exports = router;
