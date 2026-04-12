const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET
exports.getPayments = async (req, res) => {
  const payments = await prisma.payment.findMany({
    include: {
      member: true,
    },
  });

  res.json(payments);
};

// CREATE
exports.createPayment = async (req, res) => {
  const payment = await prisma.payment.create({
    data: {
      memberId: req.body.memberId,
      amount: parseFloat(req.body.amount),
      method: req.body.method,
      status: req.body.status || "Completed",
      date: new Date(req.body.date),
    },
  });

  res.json(payment);
};