const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET
exports.getTrainers = async (req, res) => {
  const trainers = await prisma.trainer.findMany();
  res.json(trainers);
};

// CREATE
exports.createTrainer = async (req, res) => {
  const trainer = await prisma.trainer.create({
    data: req.body,
  });
  res.json(trainer);
};