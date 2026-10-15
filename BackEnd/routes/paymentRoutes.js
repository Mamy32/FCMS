const express = require("express");
const validate = require("../middleware/validate");
const { requireAdmin } = require("../middleware/auth");
const schemas = require("../lib/schemas");
const c = require("../controllers/paymentController");

const router = express.Router();

// Staff can record payments; only admins can alter or remove financial records.
router.get("/", c.getPayments);
router.post("/", validate(schemas.payment), c.createPayment);
router.put("/:id", requireAdmin, validate(schemas.payment), c.updatePayment);
router.delete("/:id", requireAdmin, c.deletePayment);

module.exports = router;
