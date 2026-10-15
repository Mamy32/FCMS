const prisma = require("../lib/prisma");
const HttpError = require("../lib/httpError");
const { startOfLocalDay, DAY_MS } = require("../lib/dates");

exports.getAttendance = async (req, res) => {
  const records = await prisma.attendance.findMany({
    orderBy: { date: "desc" },
    include: { member: true, class: true },
  });
  res.json(records);
};

exports.createAttendance = async (req, res) => {
  const { memberId, classId, date, status } = req.body;

  const gymClass = await prisma.class.findUnique({ where: { id: classId } });
  if (!gymClass) throw new HttpError(404, "Class not found");

  const dayStart = startOfLocalDay(date);
  const sameDay = { classId, date: { gte: dayStart, lt: new Date(dayStart.getTime() + DAY_MS) } };

  const duplicate = await prisma.attendance.findFirst({ where: { ...sameDay, memberId } });
  if (duplicate) throw new HttpError(409, "Attendance for this member and class is already recorded for that day");

  if (status !== "Absent") {
    const booked = await prisma.attendance.count({ where: { ...sameDay, status: { not: "Absent" } } });
    if (booked >= gymClass.capacity) {
      throw new HttpError(409, `${gymClass.className} is full (${gymClass.capacity} spots) on that day`);
    }
  }

  const record = await prisma.attendance.create({
    data: { memberId, classId, date, status },
    include: { member: true, class: true },
  });
  res.status(201).json(record);
};

exports.deleteAttendance = async (req, res) => {
  await prisma.attendance.delete({ where: { id: req.params.id } });
  res.status(204).end();
};
