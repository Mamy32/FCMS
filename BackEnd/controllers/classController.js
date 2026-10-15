const prisma = require("../lib/prisma");

exports.getClasses = async (req, res) => {
  const classes = await prisma.class.findMany({
    orderBy: { className: "asc" },
    include: { trainer: true, _count: { select: { attendances: true } } },
  });
  res.json(classes);
};

exports.createClass = async (req, res) => {
  const created = await prisma.class.create({ data: req.body, include: { trainer: true } });
  res.status(201).json(created);
};

exports.updateClass = async (req, res) => {
  const updated = await prisma.class.update({
    where: { id: req.params.id },
    data: req.body,
    include: { trainer: true },
  });
  res.json(updated);
};

exports.deleteClass = async (req, res) => {
  await prisma.class.delete({ where: { id: req.params.id } });
  res.status(204).end();
};
