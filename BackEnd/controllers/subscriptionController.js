const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET ALL
exports.getSubscriptions = async (req, res) => {
  const subs = await prisma.subscription.findMany({
    include: {
      member: true,
      plan: true,
    },
  });

  res.json(subs);
};

// CREATE
exports.createSubscription = async (req, res) => {
  const sub = await prisma.subscription.create({
    data: {
      memberId: req.body.memberId,
      planId: req.body.planId,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      status: "Active",
    },
  });

  res.json(sub);
};