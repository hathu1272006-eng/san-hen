import { isUpcoming } from '../../../../shared/schedule.mjs';

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

export type Payment = { status: 'unpaid' } | {
  status: 'paid' | 'refunded';
  method: 'demo';
  reference: string;
  amount: number;
  paidAt: string;
  refundedAt?: string;
};

export interface Booking extends BookingRequest {
  code: string;
  name: string;
  location: string;
  price: number;
  status: 'confirmed' | 'canceled';
  payment?: Payment;
}

export function canPay(booking: Booking): boolean {
  return booking.status === 'confirmed' && (!booking.payment || booking.payment.status === 'unpaid')
    && isUpcoming(booking.date, booking.hour);
}

export function paymentLabel(payment?: Payment): string {
  switch (payment?.status) {
    case 'paid': return 'Đã thanh toán thử';
    case 'refunded': return 'Đã hoàn tiền thử';
    default: return 'Chưa thanh toán';
  }
}

export function sportLabel(sport: Sport): string {
  return sports.find(item => item.id === sport)?.label ?? sport;
}

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const calendar = new Intl.DateTimeFormat('vi-VN', {
  weekday: 'long', day: 'numeric', month: 'numeric', timeZone: 'UTC',
});
const timestamp = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short', timeStyle: 'short', timeZone: 'Asia/Ho_Chi_Minh',
});

export const money = (value: number) => currency.format(value);
export const calendarLabel = (date: string) => calendar.format(new Date(date + 'T00:00:00Z'));
export const timestampLabel = (value: string) => timestamp.format(new Date(value));
export const endHour = (hour: string) => String(Number(hour.slice(0, 2)) + 1).padStart(2, '0') + ':00';
