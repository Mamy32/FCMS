const express = require("express");
const cors = require("cors");

const memberRoutes = require("./routes/memberRoutes");
const planRoutes = require("./routes/planRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const trainerRoutes = require("./routes/trainerRoutes");
const classRoutes = require("./routes/classRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();

// ✅ CORS (allow all for now)
app.use(
  cors({
    origin: "*",
  })
);

// ✅ Middleware
app.use(express.json());

// ✅ Health check (VERY IMPORTANT for Cloud Run)
app.get("/", (req, res) => {
  res.status(200).send("API is running 🚀");
});

// ✅ Routes
app.use("/members", memberRoutes);
app.use("/plans", planRoutes);
app.use("/subscriptions", subscriptionRoutes);
app.use("/trainers", trainerRoutes);
app.use("/classes", classRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/payments", paymentRoutes);

// 🔥 CRITICAL FIX (Cloud Run requires 8080)
const PORT = process.env.PORT || 8080;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});