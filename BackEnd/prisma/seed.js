// Fills an EMPTY database with realistic demo data for presentations.
// Usage: npm run seed            (refuses to run if members already exist)
require("dotenv").config({ quiet: true });
const prisma = require("../lib/prisma");
const { addMonths } = require("../lib/dates");

const DAY = 24 * 60 * 60 * 1000;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n) => new Date(Date.now() - n * DAY);

const FIRST = ["Budi", "Siti", "Andi", "Dewi", "Rizky", "Putri", "Agus", "Ayu", "Fajar", "Nadia",
  "Hendra", "Maya", "Yoga", "Intan", "Dimas", "Rina", "Bayu", "Lestari", "Arief", "Citra"];
const LAST = ["Santoso", "Wijaya", "Pratama", "Saputra", "Lestari", "Kusuma", "Hidayat", "Siregar",
  "Nugroho", "Halim", "Gunawan", "Setiawan"];

async function main() {
  if ((await prisma.member.count()) > 0) {
    console.log("Database already has members — seed skipped so real data is never mixed with demo data.");
    return;
  }

  const plans = await Promise.all(
    [
      { planName: "Monthly", price: 350000, durationMonths: 1 },
      { planName: "Quarterly", price: 950000, durationMonths: 3 },
      { planName: "Semi-Annual", price: 1750000, durationMonths: 6 },
      { planName: "Annual", price: 3200000, durationMonths: 12 },
    ].map((data) => prisma.plan.create({ data }))
  );

  const trainers = await Promise.all(
    [
      { trainerName: "Coach Rudi Hartono", specialization: "Strength & Conditioning", phone: "+62 812-1111-2222" },
      { trainerName: "Coach Melati Sari", specialization: "Yoga & Pilates", phone: "+62 813-3333-4444" },
      { trainerName: "Coach Kevin Tan", specialization: "Boxing & HIIT", phone: "+62 811-5555-6666" },
    ].map((data) => prisma.trainer.create({ data }))
  );

  const classes = await Promise.all(
    [
      { className: "Morning Yoga", schedule: "Mon, Wed, Fri · 06:30", capacity: 20, trainerId: trainers[1].id },
      { className: "HIIT Blast", schedule: "Tue, Thu · 18:30", capacity: 25, trainerId: trainers[2].id },
      { className: "Power Lifting", schedule: "Mon, Thu · 19:00", capacity: 12, trainerId: trainers[0].id },
      { className: "Boxing Basics", schedule: "Sat · 10:00", capacity: 16, trainerId: trainers[2].id },
    ].map((data) => prisma.class.create({ data }))
  );

  for (let i = 0; i < 40; i++) {
    const firstName = FIRST[i % FIRST.length];
    const lastName = LAST[(i * 7) % LAST.length];
    const plan = pick(plans);
    // Mix of active, expiring-soon and expired memberships.
    let startDate;
    if (i % 8 === 0) startDate = new Date(addMonths(new Date(), -plan.durationMonths).getTime() + 3 * DAY);
    else if (i % 10 === 5) startDate = addMonths(daysAgo(10), -plan.durationMonths);
    else startDate = daysAgo(Math.floor(Math.random() * plan.durationMonths * 24));

    const member = await prisma.member.create({
      data: {
        firstName,
        lastName,
        email: `${firstName}.${lastName}${i}@example.com`.toLowerCase(),
        phone: `+62 8${Math.floor(1000000000 + Math.random() * 8999999999)}`,
        joinDate: new Date(startDate.getTime() - Math.floor(Math.random() * 3) * DAY),
        status: "Active",
      },
    });

    await prisma.subscription.create({
      data: { memberId: member.id, planId: plan.id, startDate, endDate: addMonths(startDate, plan.durationMonths), status: "Active" },
    });
    await prisma.payment.create({
      data: {
        memberId: member.id,
        amount: plan.price,
        method: pick(["QRIS", "Cash", "Bank Transfer", "Debit Card", "E-Wallet"]),
        status: "Completed",
        date: startDate,
        note: `${plan.planName} membership`,
      },
    });

    for (let d = 0; d < 14; d++) {
      if (Math.random() < 0.35) {
        await prisma.checkIn.create({
          // Always in the past: d days ago minus up to 12 hours.
          data: { memberId: member.id, checkedAt: new Date(daysAgo(d).getTime() - Math.random() * 12 * 60 * 60 * 1000) },
        });
      }
    }
    if (Math.random() < 0.6) {
      await prisma.attendance.create({
        data: { memberId: member.id, classId: pick(classes).id, date: daysAgo(Math.floor(Math.random() * 14)), status: Math.random() < 0.85 ? "Present" : "Absent" },
      });
    }
  }

  console.log("Demo data created: 4 plans, 3 trainers, 4 classes, 40 members.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
