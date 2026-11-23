export const sports = [
  { id: 'badminton', label: 'Cầu lông' },
  { id: 'football', label: 'Bóng đá mini' },
  { id: 'basketball', label: 'Bóng rổ' },
] as const;

export const areas = ['Bình Thạnh', 'Gò Vấp', 'TP. Thủ Đức'];
export type Sport = typeof sports[number]['id'];
export type Filters = { sport?: string; area?: string; q?: string };

export interface Court {
  slug: string;
  name: string;
  sport: Sport;
  area: string;
  location: string;
  price: number;
  image: string;
  alt: string;
  summary: string;
  description: string;
  features: string[];
  hours: string[];
}

export interface Slot {
  hour: string;
  status: 'available' | 'booked' | 'past';
}

export interface BookingRequest {
  slug: string;
  date: string;
  hour: string;
}

export interface Booking extends BookingRequest {
  code: string;
  name: string;
  location: string;
  price: number;
  status: 'confirmed' | 'canceled';
}

export function sportLabel(sport: Sport): string {
  return sports.find(item => item.id === sport)?.label ?? sport;
}

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const calendar = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long', day: 'numeric', month: 'numeric', timeZone: 'UTC',
});

export const money = (value: number) => currency.format(value);
export const calendarLabel = (date: string) => calendar.format(new Date(date + 'T00:00:00Z'));
export const endHour = (hour: string) => String(Number(hour.slice(0, 2)) + 1).padStart(2, '0') + ':00';
