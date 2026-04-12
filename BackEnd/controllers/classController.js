const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET
exports.getClasses = async (req, res) => {
  const classes = await prisma.class.findMany();
  res.json(classes);
};

// CREATE
exports.createClass = async (req, res) => {
  const newClass = await prisma.class.create({
    data: req.body,
  });
  res.json(newClass);
};