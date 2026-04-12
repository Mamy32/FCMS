const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getPlans = async (req, res) => {
  const plans = await prisma.plan.findMany();
  res.json(plans);
};

exports.createPlan = async (req, res) => {
  const plan = await prisma.plan.create({
    data: req.body,
  });
  res.json(plan);
};