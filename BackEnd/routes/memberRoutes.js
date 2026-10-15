const express = require("express");
const validate = require("../middleware/validate");
const { requireAdmin } = require("../middleware/auth");
const schemas = require("../lib/schemas");
const c = require("../controllers/memberController");

const router = express.Router();

router.get("/", c.getMembers);
router.get("/:id", c.getMember);
router.post("/", validate(schemas.member), c.createMember);
router.put("/:id", validate(schemas.member), c.updateMember);
router.delete("/:id", requireAdmin, c.deleteMember);

module.exports = router;
