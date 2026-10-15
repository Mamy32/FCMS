const config = require("./lib/config");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const prisma = require("./lib/prisma");
const { requireAuth } = require("./middleware/auth");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Cloud Run sits behind a proxy; needed for correct client IPs in rate limiting.
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigins.includes("*") ? "*" : config.corsOrigins,
  })
);
app.use(express.json({ limit: "100kb" }));

// Health check for Cloud Run (also verifies the database is reachable).
app.get("/", (req, res) => res.status(200).send("API is running"));
app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "ok" });
  } catch {
    res.status(503).json({ status: "degraded", database: "unreachable" });
  }
});

// Public
app.use("/auth", require("./routes/authRoutes"));

// Everything below requires a signed-in, active staff account.
app.use(requireAuth);
app.use("/users", require("./routes/userRoutes"));
app.use("/dashboard", require("./routes/dashboardRoutes"));
app.use("/members", require("./routes/memberRoutes"));
app.use("/plans", require("./routes/planRoutes"));
app.use("/subscriptions", require("./routes/subscriptionRoutes"));
app.use("/trainers", require("./routes/trainerRoutes"));
app.use("/classes", require("./routes/classRoutes"));
app.use("/attendance", require("./routes/attendanceRoutes"));
app.use("/payments", require("./routes/paymentRoutes"));
app.use("/checkins", require("./routes/checkInRoutes"));

app.use((req, res) => res.status(404).json({ error: "Not found" }));
app.use(errorHandler);

const server = app.listen(config.port, "0.0.0.0", () => {
  console.log(`Server running on port ${config.port}`);
});

// Cloud Run sends SIGTERM before stopping an instance; finish in-flight requests cleanly.
process.on("SIGTERM", () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});
