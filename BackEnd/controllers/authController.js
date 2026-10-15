const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const HttpError = require("../lib/httpError");
const { jwtSecret, jwtExpiresIn } = require("../lib/config");

const publicUser = ({ passwordHash, ...user }) => user;

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });

// The very first account becomes the gym OWNER and is active immediately.
// Everyone after that registers as STAFF and waits for an owner/admin to approve them.
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "An account with this email already exists");

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.$transaction(async (tx) => {
    const isFirstUser = (await tx.user.count()) === 0;
    return tx.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: isFirstUser ? "OWNER" : "STAFF",
        status: isFirstUser ? "ACTIVE" : "PENDING",
      },
    });
  });

  if (user.status !== "ACTIVE") {
    return res.status(201).json({
      pending: true,
      message: "Account created. A gym admin must approve it before you can sign in.",
    });
  }

  res.status(201).json({ token: signToken(user), user: publicUser(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Same message for unknown email and wrong password so accounts can't be enumerated.
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) throw new HttpError(401, "Incorrect email or password");

  if (user.status === "PENDING") {
    throw new HttpError(403, "Your account is waiting for admin approval");
  }
  if (user.status !== "ACTIVE") throw new HttpError(403, "This account has been disabled");

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  res.json({ token: signToken(updated), user: publicUser(updated) });
};

exports.me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const valid = await bcrypt.compare(currentPassword, req.user.passwordHash);
  if (!valid) throw new HttpError(400, "Current password is incorrect");

  await prisma.user.update({
    where: { id: req.user.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 12) },
  });
  res.json({ message: "Password updated" });
};

exports.publicUser = publicUser;
