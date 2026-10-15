const prisma = require("../lib/prisma");
const HttpError = require("../lib/httpError");

exports.getPlans = async (req, res) => {
  const plans = await prisma.plan.findMany({
    orderBy: { price: "asc" },
    include: { _count: { select: { subscriptions: true } } },
  });
  res.json(plans);
};

exports.createPlan = async (req, res) => {
  const plan = await prisma.plan.create({ data: req.body });
  res.status(201).json(plan);
};

exports.updatePlan = async (req, res) => {
  const plan = await prisma.plan.update({ where: { id: req.params.id }, data: req.body });
  res.json(plan);
};

exports.deletePlan = async (req, res) => {
  const inUse = await prisma.subscription.count({ where: { planId: req.params.id } });
  if (inUse) {
    throw new HttpError(409, `This plan is used by ${inUse} subscription(s) and cannot be deleted`);
  }
  await prisma.plan.delete({ where: { id: req.params.id } });
  res.status(204).end();
};
