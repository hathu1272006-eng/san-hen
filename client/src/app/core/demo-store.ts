import data from '../../../../shared/courts.json';
import { bookableDays, isUpcoming } from '../../../../shared/schedule.mjs';
import { fallbackRecommendations, matchesCourt } from '../../../../shared/search.mjs';
import { Booking, BookingRequest, Court, Filters, Slot } from './models';

const courts = data as Court[];
const bookingKey = 'san-hen.demo.bookings.v1';

function save(bookings: Booking[]): void {
  try {
    localStorage.setItem(bookingKey, JSON.stringify(bookings));
  } catch {
    throw new Error('Trình duyệt chưa cho phép lưu lịch đặt.');
  }
}

function bookings(): Booking[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(bookingKey) ?? '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function court(slug: string): Court {
  const found = courts.find(item => item.slug === slug);
  if (!found) throw new Error('Không tìm thấy sân này.');
  return found;
}

function slots(slug: string, date: string): Slot[] {
  if (!bookableDays().includes(date)) throw new Error('Vui lòng chọn ngày trong 14 ngày tới.');
  const taken = new Set(bookings().filter(item =>
    item.slug === slug && item.date === date && item.status === 'confirmed',
  ).map(item => item.hour));
  return court(slug).hours.map(hour => ({
    hour,
    status: !isUpcoming(date, hour) ? 'past' : taken.has(hour) ? 'booked' : 'available',
  }));
}

export const demoStore = {
  courts: (filters: Filters) => courts.filter(item => matchesCourt(item, filters)),
  court,
  slots,
  recommendations: (slug: string) => fallbackRecommendations(courts, court(slug)),
  bookings: () => bookings().sort((a, b) => (a.date + a.hour).localeCompare(b.date + b.hour)),
  book(request: BookingRequest): Booking {
    const selected = court(request.slug);
    if (!slots(request.slug, request.date).some(slot => slot.hour === request.hour && slot.status === 'available')) {
      throw new Error('Khung giờ này đã hết chỗ. Vui lòng chọn giờ khác.');
    }
    const code = 'SH-' + crypto.randomUUID().slice(0, 8).toUpperCase();
    const booking: Booking = { ...request, code, name: selected.name, location: selected.location, price: selected.price, status: 'confirmed' };
    save([...bookings(), booking]);
    return booking;
  },
  cancel(code: string): void {
    const all = bookings();
    const found = all.find(item => item.code === code);
    if (!found || found.status !== 'confirmed' || !isUpcoming(found.date, found.hour)) {
      throw new Error('Lượt đặt sân này không thể hủy.');
    }
    found.status = 'canceled';
    save(all);
  },
};
