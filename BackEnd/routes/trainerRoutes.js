const express = require("express");
const validate = require("../middleware/validate");
const { requireAdmin } = require("../middleware/auth");
const schemas = require("../lib/schemas");
const c = require("../controllers/trainerController");

const router = express.Router();

router.get("/", c.getTrainers);
router.post("/", requireAdmin, validate(schemas.trainer), c.createTrainer);
router.put("/:id", requireAdmin, validate(schemas.trainer), c.updateTrainer);
router.delete("/:id", requireAdmin, c.deleteTrainer);

module.exports = router;
