const express = require("express");
const router = express.Router();

const {
  getTrainers,
  createTrainer,
} = require("../controllers/trainerController");

router.get("/", getTrainers);
router.post("/", createTrainer);

module.exports = router;