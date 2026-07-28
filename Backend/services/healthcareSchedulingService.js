export const HEALTHCARE_TIME_ZONE = "Asia/Kolkata";
export const INDIA_OFFSET = "+05:30";
export const CANCELLATION_WINDOW_MS = 2 * 60 * 60 * 1000;

const pad = (value) => String(value).padStart(2, "0");

export const addDays = (dateText, amount) => {
  const [year, month, day] = dateText.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
};

export const dayOfWeek = (dateText) => {
  const [year, month, day] = dateText.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
};

export const dateInIndia = (instant = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: HEALTHCARE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

const instantFor = (dateText, minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return new Date(`${dateText}T${pad(hours)}:${pad(mins)}:00${INDIA_OFFSET}`);
};

export const buildAvailableSlots = ({ provider, fromDate, days = 7, bookedStarts = new Set(), now = new Date() }) => {
  const slots = [];
  const duration = provider.consultationMinutes;
  const earliestStart = now.getTime() + 15 * 60 * 1000;

  for (let offset = 0; offset < days; offset += 1) {
    const date = addDays(fromDate, offset);
    const scheduleEntries = provider.weeklySchedule.filter((entry) => entry.dayOfWeek === dayOfWeek(date));
    for (const entry of scheduleEntries) {
      for (let minute = entry.startMinutes; minute + duration <= entry.endMinutes; minute += duration) {
        const start = instantFor(date, minute);
        const end = instantFor(date, minute + duration);
        if (start.getTime() <= earliestStart || bookedStarts.has(start.getTime())) continue;
        slots.push({ date, start: start.toISOString(), end: end.toISOString(), status: "free" });
      }
    }
  }

  return slots;
};

export const findBookableSlot = ({ provider, startTime, now = new Date() }) => {
  const requested = new Date(startTime);
  if (Number.isNaN(requested.getTime())) return null;
  const date = dateInIndia(requested);
  return buildAvailableSlots({ provider, fromDate: date, days: 1, now })
    .find((slot) => new Date(slot.start).getTime() === requested.getTime()) || null;
};

export const canModifyAppointment = (appointment, now = new Date()) =>
  appointment.status === "booked" && new Date(appointment.startTime).getTime() - now.getTime() >= CANCELLATION_WINDOW_MS;