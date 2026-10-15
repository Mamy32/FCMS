const express = require("express");
const validate = require("../middleware/validate");
const { requireAdmin } = require("../middleware/auth");
const schemas = require("../lib/schemas");
const c = require("../controllers/subscriptionController");

const router = express.Router();

router.get("/", c.getSubscriptions);
router.post("/", validate(schemas.subscription), c.createSubscription);
router.patch("/:id", validate(schemas.updateSubscription), c.updateSubscription);
router.delete("/:id", requireAdmin, c.deleteSubscription);

module.exports = router;
