const prisma = require("../lib/prisma");
const HttpError = require("../lib/httpError");
const { parseLocalDay, DAY_MS } = require("../lib/dates");

// GET /checkins?date=YYYY-MM-DD (WIB). Defaults to today.
exports.getCheckIns = async (req, res) => {
  const start = parseLocalDay(req.query.date);
  const checkIns = await prisma.checkIn.findMany({
    where: { checkedAt: { gte: start, lt: new Date(start.getTime() + DAY_MS) } },
    orderBy: { checkedAt: "desc" },
    include: { member: true },
  });
  res.json(checkIns);
};

// Front-desk check-in: only members with a valid membership get in.
exports.createCheckIn = async (req, res) => {
  const now = new Date();
  const member = await prisma.member.findUnique({
    where: { id: req.body.memberId },
    include: {
      subscriptions: {
        where: { status: "Active", startDate: { lte: now }, endDate: { gte: now } },
        orderBy: { endDate: "desc" },
        take: 1,
        include: { plan: true },
      },
    },
  });
  if (!member) throw new HttpError(404, "Member not found");

  const name = `${member.firstName} ${member.lastName}`;
  if (member.status === "Frozen") throw new HttpError(409, `${name}'s membership is frozen`);
  if (member.status === "Inactive") throw new HttpError(409, `${name} is marked inactive`);

  const subscription = member.subscriptions[0];
  if (!subscription) {
    throw new HttpError(409, `${name} has no active membership. Renew their plan first.`);
  }

  // Ignore accidental double scans within 5 minutes.
  const recent = await prisma.checkIn.findFirst({
    where: { memberId: member.id, checkedAt: { gte: new Date(now.getTime() - 5 * 60 * 1000) } },
  });
  if (recent) throw new HttpError(409, `${name} already checked in a moment ago`);

  const checkIn = await prisma.checkIn.create({
    data: { memberId: member.id },
    include: { member: true },
  });
  res.status(201).json({ ...checkIn, subscription });
};

exports.deleteCheckIn = async (req, res) => {
  await prisma.checkIn.delete({ where: { id: req.params.id } });
  res.status(204).end();
};
