const jwt = require("jsonwebtoken");
const prisma = require("../lib/prisma");
const HttpError = require("../lib/httpError");
const { jwtSecret } = require("../lib/config");

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) throw new HttpError(401, "Authentication required");

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw new HttpError(401, "Session expired, please sign in again");
  }

  // Re-check the account on every request so disabling a user takes effect immediately.
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || user.status !== "ACTIVE") {
    throw new HttpError(401, "Account is not active");
  }

  req.user = user;
  next();
}

const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new HttpError(403, "You do not have permission to do this");
    }
    next();
  };

const requireAdmin = requireRole("OWNER", "ADMIN");

module.exports = { requireAuth, requireRole, requireAdmin };
