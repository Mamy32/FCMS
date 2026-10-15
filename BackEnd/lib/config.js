require("dotenv").config({ quiet: true });

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && !process.env.JWT_SECRET) {
  console.error("JWT_SECRET must be set in production. Refusing to start.");
  process.exit(1);
}

module.exports = {
  isProduction,
  port: process.env.PORT || 8080,
  jwtSecret: process.env.JWT_SECRET || "dev-only-secret-change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // Comma-separated list, e.g. "https://fcms-b958.vercel.app,http://localhost:5173"
  corsOrigins: (process.env.CORS_ORIGINS || "*")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
  timezoneOffsetHours: 7, // Asia/Jakarta (WIB), no daylight saving
};
