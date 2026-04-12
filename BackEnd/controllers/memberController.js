const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET MEMBERS
exports.getMembers = async (req, res) => {
  const members = await prisma.member.findMany();
  res.json(members);
};

// CREATE MEMBER
exports.createMember = async (req, res) => {
  const member = await prisma.member.create({
    data: req.body,
  });
  res.json(member);
};
// UPDATE
exports.updateMember = async (req, res) => {
  const { id } = req.params;

  const updated = await prisma.member.update({
    where: { id },
    data: req.body,
  });

  res.json(updated);
};

// DELETE
exports.deleteMember = async (req, res) => {
  const { id } = req.params;

  await prisma.member.delete({
    where: { id },
  });

  res.json({ message: "Deleted" });
};