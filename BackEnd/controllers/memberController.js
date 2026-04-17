const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getMembers = async (req, res) => {
  try {
    const members = await prisma.member.findMany();
    res.json(members);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createMember = async (req, res) => {
  try {
    console.log("BODY:", req.body);

    if (!req.body.firstName || !req.body.lastName || !req.body.email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const member = await prisma.member.create({
      data: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone || null,
        status: "Active",
      },
    });

    res.json(member);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
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