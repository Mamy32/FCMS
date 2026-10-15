const { Prisma } = require("@prisma/client");
const HttpError = require("../lib/httpError");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") return res.status(404).json({ error: "Record not found" });
    if (err.code === "P2002") return res.status(409).json({ error: "This record already exists" });
    if (err.code === "P2003") {
      return res.status(409).json({ error: "This record is still in use by other data" });
    }
  }

  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  console.error(`[${req.method} ${req.originalUrl}]`, err);
  res.status(500).json({ error: "Something went wrong. Please try again." });
}

module.exports = errorHandler;
