const prisma = require("../lib/prisma");
const { DAY_MS, startOfLocalDay, startOfLocalMonth, localDayKey } = require("../lib/dates");

const sum = (rows) => rows.reduce((total, r) => total + r.amount, 0);

exports.getDashboard = async (req, res) => {
  const now = new Date();
  const today = startOfLocalDay(now);
  const thisMonth = startOfLocalMonth(now);
  const lastMonth = startOfLocalMonth(now, 1);
  const sixMonthsAgo = startOfLocalMonth(now, 5);
  const twoWeeksAgo = new Date(today.getTime() - 13 * DAY_MS);
  const inSevenDays = new Date(now.getTime() + 7 * DAY_MS);
  const completed = { status: "Completed" };

  const [
    totalMembers,
    activeMembers,
    totalTrainers,
    totalClasses,
    payments,
    checkIns,
    expiringSoon,
    recentMembers,
    recentPayments,
    attendance,
  ] = await Promise.all([
    prisma.member.count(),
    prisma.member.count({
      where: { subscriptions: { some: { status: "Active", startDate: { lte: now }, endDate: { gte: now } } } },
    }),
    prisma.trainer.count(),
    prisma.class.count(),
    prisma.payment.findMany({
      where: { ...completed, date: { gte: sixMonthsAgo } },
      select: { amount: true, date: true },
    }),
    prisma.checkIn.findMany({ where: { checkedAt: { gte: twoWeeksAgo } }, select: { checkedAt: true } }),
    prisma.subscription.findMany({
      where: { status: "Active", endDate: { gte: now, lte: inSevenDays } },
      orderBy: { endDate: "asc" },
      include: { member: true, plan: true },
    }),
    prisma.member.findMany({ orderBy: { joinDate: "desc" }, take: 5 }),
    prisma.payment.findMany({ orderBy: { date: "desc" }, take: 5, include: { member: true } }),
    prisma.attendance.groupBy({ by: ["status"], _count: true }),
  ]);

  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const start = startOfLocalMonth(now, 5 - i);
    const end = startOfLocalMonth(now, 4 - i);
    return {
      month: localDayKey(start).slice(0, 7),
      revenue: sum(payments.filter((p) => p.date >= start && p.date < end)),
    };
  });

  const checkInsByDay = Array.from({ length: 14 }, (_, i) => {
    const day = localDayKey(new Date(twoWeeksAgo.getTime() + i * DAY_MS));
    return { day, count: checkIns.filter((c) => localDayKey(c.checkedAt) === day).length };
  });

  const totalAttendance = attendance.reduce((t, a) => t + a._count, 0);
  const present = attendance.filter((a) => a.status !== "Absent").reduce((t, a) => t + a._count, 0);

  res.json({
    totals: {
      members: totalMembers,
      activeMembers,
      trainers: totalTrainers,
      classes: totalClasses,
      checkInsToday: checkIns.filter((c) => c.checkedAt >= today).length,
      revenueThisMonth: sum(payments.filter((p) => p.date >= thisMonth)),
      revenueLastMonth: sum(payments.filter((p) => p.date >= lastMonth && p.date < thisMonth)),
      attendanceRate: totalAttendance ? Math.round((present / totalAttendance) * 100) : 0,
    },
    revenueByMonth,
    checkInsByDay,
    expiringSoon,
    recentMembers,
    recentPayments,
  });
};
