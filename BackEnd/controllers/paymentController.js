const prisma = require("../lib/prisma");

exports.getPayments = async (req, res) => {
  const payments = await prisma.payment.findMany({
    orderBy: { date: "desc" },
    include: { member: true },
  });
  res.json(payments);
};

exports.createPayment = async (req, res) => {
  const payment = await prisma.payment.create({ data: req.body, include: { member: true } });
  res.status(201).json(payment);
};

exports.updatePayment = async (req, res) => {
  const payment = await prisma.payment.update({
    where: { id: req.params.id },
    data: req.body,
    include: { member: true },
  });
  res.json(payment);
};

exports.deletePayment = async (req, res) => {
  await prisma.payment.delete({ where: { id: req.params.id } });
  res.status(204).end();
};
