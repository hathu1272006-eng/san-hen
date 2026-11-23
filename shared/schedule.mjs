const localTime = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Asia/Ho_Chi_Minh',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function currentTime(now = new Date()) {
  const parts = Object.fromEntries(localTime.formatToParts(now).map(({ type, value }) => [type, value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: `${parts.hour}:${parts.minute}` };
}

export function bookableDays(now = new Date()) {
  const start = Date.parse(`${currentTime(now).date}T00:00:00Z`);
  return Array.from({ length: 14 }, (_, offset) =>
    new Date(start + offset * 86_400_000).toISOString().slice(0, 10),
  );
}

export function isUpcoming(date, hour, now = new Date()) {
  const current = currentTime(now);
  return date > current.date || (date === current.date && hour > current.hour);
}
