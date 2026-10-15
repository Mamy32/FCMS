const express = require("express");
const validate = require("../middleware/validate");
const { requireAdmin } = require("../middleware/auth");
const schemas = require("../lib/schemas");
const c = require("../controllers/classController");

const router = express.Router();

router.get("/", c.getClasses);
router.post("/", requireAdmin, validate(schemas.gymClass), c.createClass);
router.put("/:id", requireAdmin, validate(schemas.gymClass), c.updateClass);
router.delete("/:id", requireAdmin, c.deleteClass);

module.exports = router;
