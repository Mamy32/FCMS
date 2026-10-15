export type Role = "OWNER" | "ADMIN" | "STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "ACTIVE" | "PENDING" | "DISABLED";
  createdAt: string;
  lastLoginAt: string | null;
}

export interface Plan {
  id: string;
  planName: string;
  price: number;
  durationMonths: number;
  _count?: { subscriptions: number };
}

export interface Subscription {
  id: string;
  memberId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: "Active" | "Expired" | "Upcoming" | "Cancelled";
  member: Member;
  plan: Plan;
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  joinDate: string;
  status: "Active" | "Inactive" | "Frozen";
  activeSubscription?: (Omit<Subscription, "member"> & { plan: Plan }) | null;
}

export interface Trainer {
  id: string;
  trainerName: string;
  specialization: string;
  phone: string | null;
  classCount: number;
  classes: { id: string; className: string; schedule: string }[];
}

export interface GymClass {
  id: string;
  className: string;
  schedule: string;
  capacity: number;
  trainerId: string | null;
  trainer: Trainer | null;
  _count?: { attendances: number };
}

export interface Attendance {
  id: string;
  memberId: string;
  classId: string;
  date: string;
  status: "Present" | "Absent" | "Late";
  member: Member;
  class: GymClass;
}

export interface Payment {
  id: string;
  memberId: string;
  amount: number;
  method: string;
  status: "Completed" | "Pending" | "Refunded";
  date: string;
  note: string | null;
  member: Member;
}

export interface CheckIn {
  id: string;
  memberId: string;
  checkedAt: string;
  member: Member;
}

export const PAYMENT_METHODS = ["Cash", "QRIS", "Debit Card", "Credit Card", "Bank Transfer", "E-Wallet"];
