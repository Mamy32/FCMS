const { z } = require("zod");
const { parseLocalDay } = require("./dates");

const text = (label, max = 120) =>
  z.string({ error: `${label} is required` }).trim().min(1, `${label} is required`).max(max);
const optionalText = (max = 120) =>
  z.string().trim().max(max).optional().nullable().transform((v) => v || null);
// Plain "YYYY-MM-DD" values mean the start of that day in Jakarta time (WIB), not UTC.
const date = (label) =>
  z.preprocess(
    (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v) ? parseLocalDay(v) : v),
    z.coerce.date({ error: `${label} must be a valid date` })
  );
const id = (label) => z.string({ error: `${label} is required` }).min(1, `${label} is required`);

const email = z.email("Enter a valid email address").trim().toLowerCase();
const password = z.string().min(8, "Password must be at least 8 characters").max(128);

const ROLES = ["OWNER", "ADMIN", "STAFF"];
const USER_STATUSES = ["ACTIVE", "PENDING", "DISABLED"];
const MEMBER_STATUSES = ["Active", "Inactive", "Frozen"];
const PAYMENT_METHODS = ["Cash", "QRIS", "Debit Card", "Credit Card", "Bank Transfer", "E-Wallet"];
const PAYMENT_STATUSES = ["Completed", "Pending", "Refunded"];
const ATTENDANCE_STATUSES = ["Present", "Absent", "Late"];

module.exports = {
  ROLES,
  PAYMENT_METHODS,

  register: z.object({ name: text("Name", 80), email, password }),
  login: z.object({ email, password: z.string().min(1, "Password is required") }),
  changePassword: z.object({ currentPassword: z.string().min(1), newPassword: password }),

  createUser: z.object({
    name: text("Name", 80),
    email,
    password,
    role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
  }),
  updateUser: z.object({
    role: z.enum(["ADMIN", "STAFF"]).optional(),
    status: z.enum(USER_STATUSES).optional(),
  }),

  member: z.object({
    firstName: text("First name", 60),
    lastName: text("Last name", 60),
    email,
    phone: optionalText(30),
    status: z.enum(MEMBER_STATUSES).default("Active"),
  }),

  plan: z.object({
    planName: text("Plan name", 60),
    price: z.coerce.number().int("Price must be a whole number").min(0, "Price cannot be negative"),
    durationMonths: z.coerce.number().int().min(1, "Duration must be at least 1 month").max(60),
  }),

  subscription: z.object({
    memberId: id("Member"),
    planId: id("Plan"),
    startDate: date("Start date"),
    endDate: date("End date").optional(),
    recordPayment: z.boolean().default(false),
    paymentMethod: z.enum(PAYMENT_METHODS).default("Cash"),
  }),
  updateSubscription: z.object({
    startDate: date("Start date").optional(),
    endDate: date("End date").optional(),
    status: z.enum(["Active", "Cancelled"]).optional(),
  }),

  trainer: z.object({
    trainerName: text("Name", 80),
    specialization: text("Specialization", 80),
    phone: optionalText(30),
  }),

  gymClass: z.object({
    className: text("Class name", 80),
    schedule: text("Schedule", 120),
    capacity: z.coerce.number().int().min(1, "Capacity must be at least 1").max(1000),
    trainerId: z.string().optional().nullable().transform((v) => v || null),
  }),

  attendance: z.object({
    memberId: id("Member"),
    classId: id("Class"),
    date: date("Date"),
    status: z.enum(ATTENDANCE_STATUSES).default("Present"),
  }),

  payment: z.object({
    memberId: id("Member"),
    amount: z.coerce.number().positive("Amount must be greater than 0"),
    method: z.enum(PAYMENT_METHODS, { error: "Choose a payment method" }),
    status: z.enum(PAYMENT_STATUSES).default("Completed"),
    date: date("Date"),
    note: optionalText(200),
  }),

  checkIn: z.object({ memberId: id("Member") }),
};
