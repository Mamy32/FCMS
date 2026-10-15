const express = require("express");
const rateLimit = require("express-rate-limit");
const validate = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const schemas = require("../lib/schemas");
const { register, login, me, changePassword } = require("../controllers/authController");

const router = express.Router();

// Slow down password guessing: 20 attempts per 15 minutes per IP.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please wait a few minutes and try again." },
});

router.post("/register", authLimiter, validate(schemas.register), register);
router.post("/login", authLimiter, validate(schemas.login), login);
router.get("/me", requireAuth, me);
router.patch("/password", requireAuth, validate(schemas.changePassword), changePassword);

module.exports = router;
