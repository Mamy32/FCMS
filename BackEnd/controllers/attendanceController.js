const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET
exports.getAttendance = async (req, res) => {
  const records = await prisma.attendance.findMany({
    include: {
      member: true,
      class: true,
    },
  });

  res.json(records);
};

// CREATE
exports.createAttendance = async (req, res) => {
  const record = await prisma.attendance.create({
    data: {
      memberId: req.body.memberId,
      classId: req.body.classId,
      date: new Date(req.body.date),
      status: req.body.status || "Present",
    },
  });

  res.json(record);
};