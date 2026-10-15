const prisma = require("../lib/prisma");
const HttpError = require("../lib/httpError");
const { addMonths } = require("../lib/dates");

// Status shown to users is derived from dates so it never goes stale.
const withEffectiveStatus = (sub) => ({
  ...sub,
  status:
    sub.status !== "Active"
      ? sub.status
      : sub.endDate < new Date()
        ? "Expired"
        : sub.startDate > new Date()
          ? "Upcoming"
          : "Active",
});

exports.getSubscriptions = async (req, res) => {
  const subs = await prisma.subscription.findMany({
    orderBy: { startDate: "desc" },
    include: { member: true, plan: true },
  });
  res.json(subs.map(withEffectiveStatus));
};

exports.createSubscription = async (req, res) => {
  const { memberId, planId, startDate, recordPayment, paymentMethod } = req.body;

  const plan = await prisma.plan.findUnique({ where: { id: planId } });
  if (!plan) throw new HttpError(404, "Plan not found");
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) throw new HttpError(404, "Member not found");

  const endDate = req.body.endDate || addMonths(startDate, plan.durationMonths);
  if (endDate <= startDate) throw new HttpError(400, "End date must be after the start date");

  // Subscription and its payment are saved together, or not at all.
  const sub = await prisma.$transaction(async (tx) => {
    const created = await tx.subscription.create({
      data: { memberId, planId, startDate, endDate, status: "Active" },
      include: { member: true, plan: true },
    });
    if (recordPayment && plan.price > 0) {
      await tx.payment.create({
        data: {
          memberId,
          amount: plan.price,
          method: paymentMethod,
          status: "Completed",
          date: new Date(),
          note: `${plan.planName} membership`,
        },
      });
    }
    if (member.status !== "Active") {
      await tx.member.update({ where: { id: memberId }, data: { status: "Active" } });
    }
    return created;
  });

  res.status(201).json(withEffectiveStatus(sub));
};

exports.updateSubscription = async (req, res) => {
  const sub = await prisma.subscription.update({
    where: { id: req.params.id },
    data: req.body,
    include: { member: true, plan: true },
  });
  if (sub.endDate <= sub.startDate) throw new HttpError(400, "End date must be after the start date");
  res.json(withEffectiveStatus(sub));
};

exports.deleteSubscription = async (req, res) => {
  await prisma.subscription.delete({ where: { id: req.params.id } });
  res.status(204).end();
};
