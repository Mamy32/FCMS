const TZ = "Asia/Jakarta";

const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const formatIDR = (amount: number | null | undefined) => idr.format(amount || 0);

// Compact form for charts and stat cards: Rp 12,5 jt
export const formatIDRShort = (amount: number) => {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 1 })} jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toLocaleString("id-ID", { maximumFractionDigits: 0 })} rb`;
  return formatIDR(amount);
};

export const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TZ,
  });
};

export const formatTime = (date: string | Date) =>
  new Date(date).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

export const formatDateTime = (date: string | Date) => `${formatDate(date)}, ${formatTime(date)}`;

// "YYYY-MM-DD" in Jakarta time, for <input type="date"> values.
export const toDateInput = (date: string | Date = new Date()) =>
  new Date(date).toLocaleDateString("en-CA", { timeZone: TZ });

export const fullName = (m?: { firstName: string; lastName: string } | null) =>
  m ? `${m.firstName} ${m.lastName}` : "-";

export const daysUntil = (date: string | Date) =>
  Math.ceil((new Date(date).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
