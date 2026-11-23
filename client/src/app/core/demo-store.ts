import data from '../../../../shared/courts.json';
import { bookableDays, isUpcoming } from '../../../../shared/schedule.mjs';
import { fallbackRecommendations, matchesCourt } from '../../../../shared/search.mjs';
import { Booking, BookingRequest, canPay, Court, Filters, Slot } from './models';

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

function getBooking(code: string, all = bookings()): Booking {
  const found = all.find(item => item.code === code);
  if (!found) throw new Error('Không tìm thấy lượt đặt.');
  return found;
}

function writeBookings<T>(write: () => T): Promise<T> {
  return navigator.locks ? navigator.locks.request(bookingKey, write) : Promise.resolve().then(write);
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
  booking: (code: string) => getBooking(code),
  book(request: BookingRequest): Promise<Booking> {
    return writeBookings(() => {
      const selected = court(request.slug);
      if (!slots(request.slug, request.date).some(slot => slot.hour === request.hour && slot.status === 'available')) {
        throw new Error('Khung giờ này đã hết chỗ. Vui lòng chọn giờ khác.');
      }
      const code = 'SH-' + crypto.randomUUID().slice(0, 8).toUpperCase();
      const booking: Booking = {
        ...request, code, name: selected.name, location: selected.location,
        price: selected.price, status: 'confirmed', payment: { status: 'unpaid' },
      };
      save([...bookings(), booking]);
      return booking;
    });
  },
  pay(code: string): Promise<Booking> {
    return writeBookings(() => {
      const all = bookings();
      const booking = getBooking(code, all);
      if (booking.payment?.status === 'paid') return booking;
      if (!canPay(booking)) throw new Error('Lượt đặt đã hủy hoặc đã đến giờ chơi.');

      booking.payment = {
        status: 'paid', method: 'demo', reference: 'PAY-' + code.slice(3),
        amount: booking.price, paidAt: new Date().toISOString(),
      };
      save(all);
      return booking;
    });
  },
  cancel(code: string): Promise<void> {
    return writeBookings(() => {
      const all = bookings();
      const booking = getBooking(code, all);
      if (booking.status !== 'confirmed' || !isUpcoming(booking.date, booking.hour)) {
        throw new Error('Lượt đặt sân này không thể hủy.');
      }
      booking.status = 'canceled';
      if (booking.payment?.status === 'paid') {
        booking.payment = { ...booking.payment, status: 'refunded', refundedAt: new Date().toISOString() };
      }
      save(all);
    });
  },
};
