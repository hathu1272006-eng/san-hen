import { isUpcoming, bookableDays } from '../../../../shared/schedule.mjs';
import { Booking } from '../../models/booking.js';
import { Court, publicCourt } from '../../models/court.js';
import { ApiError } from '../../middleware/errors.js';

export async function getCourt(slug) {
  const court = await Court.findOne({ slug }, publicCourt).lean();
  if (!court) throw new ApiError(404, 'Không tìm thấy sân này.');
  return court;
}

export function checkDate(date) {
  if (!bookableDays().includes(date)) {
    throw new ApiError(400, 'Vui lòng chọn ngày trong 14 ngày tới.');
  }
}

export async function getSlots(court, date) {
  checkDate(date);
  const booked = await Booking.find({ slug: court.slug, date, status: 'confirmed' }).distinct('hour');
  const now = new Date();
  return court.hours.map(hour => ({
    hour,
    status: !isUpcoming(date, hour, now) ? 'past' : booked.includes(hour) ? 'booked' : 'available',
  }));
}
