const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const HttpError = require("../lib/httpError");
const { publicUser } = require("./authController");

exports.getUsers = async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  res.json(users.map(publicUser));
};

// Admins can add staff directly (already approved).
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (role === "ADMIN" && req.user.role !== "OWNER") {
    throw new HttpError(403, "Only the owner can create admins");
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "An account with this email already exists");

  const user = await prisma.user.create({
    data: { name, email, role, status: "ACTIVE", passwordHash: await bcrypt.hash(password, 12) },
  });
  res.status(201).json(publicUser(user));
};

async function loadEditableTarget(req) {
  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target) throw new HttpError(404, "User not found");
  if (target.id === req.user.id) throw new HttpError(400, "You cannot change your own account here");
  if (target.role === "OWNER") throw new HttpError(403, "The owner account cannot be changed");
  if (target.role === "ADMIN" && req.user.role !== "OWNER") {
    throw new HttpError(403, "Only the owner can manage admins");
  }
  return target;
}

exports.updateUser = async (req, res) => {
  const target = await loadEditableTarget(req);
  if (req.body.role === "ADMIN" && req.user.role !== "OWNER") {
    throw new HttpError(403, "Only the owner can promote to admin");
  }
  const user = await prisma.user.update({ where: { id: target.id }, data: req.body });
  res.json(publicUser(user));
};

exports.deleteUser = async (req, res) => {
  const target = await loadEditableTarget(req);
  await prisma.user.delete({ where: { id: target.id } });
  res.status(204).end();
};
