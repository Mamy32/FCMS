const prisma = require("../lib/prisma");

exports.getTrainers = async (req, res) => {
  const trainers = await prisma.trainer.findMany({
    orderBy: { trainerName: "asc" },
    include: { classes: { select: { id: true, className: true, schedule: true } } },
  });
  // Class count is derived from real assignments instead of a manually maintained number.
  res.json(trainers.map((t) => ({ ...t, classCount: t.classes.length })));
};

exports.createTrainer = async (req, res) => {
  const trainer = await prisma.trainer.create({ data: req.body });
  res.status(201).json({ ...trainer, classes: [], classCount: 0 });
};

exports.updateTrainer = async (req, res) => {
  const trainer = await prisma.trainer.update({ where: { id: req.params.id }, data: req.body });
  res.json(trainer);
};

exports.deleteTrainer = async (req, res) => {
  await prisma.trainer.delete({ where: { id: req.params.id } });
  res.status(204).end();
};
