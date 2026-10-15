const prisma = require("../lib/prisma");
const HttpError = require("../lib/httpError");

const now = () => new Date();

// Attach each member's current membership (latest active, unexpired subscription).
const withMembership = () => ({
  subscriptions: {
    where: { status: "Active", startDate: { lte: now() }, endDate: { gte: now() } },
    orderBy: { endDate: "desc" },
    take: 1,
    include: { plan: true },
  },
});

const shape = ({ subscriptions, ...member }) => ({
  ...member,
  activeSubscription: subscriptions?.[0] || null,
});

async function assertEmailFree(email, exceptId) {
  const clash = await prisma.member.findFirst({
    where: { email, ...(exceptId && { NOT: { id: exceptId } }) },
  });
  if (clash) throw new HttpError(409, "Another member already uses this email");
}

exports.getMembers = async (req, res) => {
  const members = await prisma.member.findMany({
    orderBy: { joinDate: "desc" },
    include: withMembership(),
  });
  res.json(members.map(shape));
};

exports.getMember = async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { id: req.params.id },
    include: {
      subscriptions: { orderBy: { startDate: "desc" }, include: { plan: true } },
      payments: { orderBy: { date: "desc" }, take: 20 },
      checkIns: { orderBy: { checkedAt: "desc" }, take: 20 },
    },
  });
  if (!member) throw new HttpError(404, "Member not found");
  const current = member.subscriptions.find((s) => s.status === "Active" && s.startDate <= now() && s.endDate >= now());
  res.json({ ...member, activeSubscription: current || null });
};

exports.createMember = async (req, res) => {
  await assertEmailFree(req.body.email);
  const member = await prisma.member.create({ data: req.body, include: withMembership() });
  res.status(201).json(shape(member));
};

exports.updateMember = async (req, res) => {
  await assertEmailFree(req.body.email, req.params.id);
  const member = await prisma.member.update({
    where: { id: req.params.id },
    data: req.body,
    include: withMembership(),
  });
  res.json(shape(member));
};

exports.deleteMember = async (req, res) => {
  await prisma.member.delete({ where: { id: req.params.id } });
  res.status(204).end();
};
