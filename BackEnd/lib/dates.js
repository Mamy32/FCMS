const { timezoneOffsetHours } = require("./config");

const OFFSET_MS = timezoneOffsetHours * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Start of the gym's local (WIB) day containing `date`, as a UTC Date.
function startOfLocalDay(date = new Date()) {
  const local = new Date(date.getTime() + OFFSET_MS);
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate()) - OFFSET_MS
  );
}

// Parses "YYYY-MM-DD" as a local (WIB) calendar day.
function parseLocalDay(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return startOfLocalDay();
  return new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]) - OFFSET_MS);
}

function startOfLocalMonth(date = new Date(), monthsBack = 0) {
  const local = new Date(date.getTime() + OFFSET_MS);
  return new Date(
    Date.UTC(local.getUTCFullYear(), local.getUTCMonth() - monthsBack, 1) - OFFSET_MS
  );
}

function addMonths(date, months) {
  const d = new Date(date);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d;
}

function localDayKey(date) {
  return new Date(date.getTime() + OFFSET_MS).toISOString().slice(0, 10);
}

module.exports = { DAY_MS, startOfLocalDay, parseLocalDay, startOfLocalMonth, addMonths, localDayKey };
