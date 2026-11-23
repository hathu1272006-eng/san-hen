import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { currentTime, isUpcoming } from '../../../../shared/schedule.mjs';
import { Booking, publicBooking } from '../../models/booking.js';
import { ownerFor, requireJson } from '../../middleware/browser-owner.js';
import { ApiError } from '../../middleware/errors.js';
import { checkDate, getCourt } from '../courts/court-service.js';

export const bookingRoutes = Router();

bookingRoutes.use((_request, response, next) => {
  response.set('Cache-Control', 'no-store');
  next();
});

bookingRoutes.get('/', async (request, response) => {
  const owner = ownerFor(request, response, true);
  const bookings = await Booking.find({ owner }).sort({ date: 1, hour: 1, createdAt: -1 }).lean();
  response.json(bookings.map(publicBooking));
});

bookingRoutes.post('/', requireJson, async (request, response) => {
  const { slug, date, hour } = request.body ?? {};
  if (typeof slug !== 'string' || slug.length > 100 || typeof hour !== 'string' || typeof date !== 'string') {
    throw new ApiError(400, 'Vui lòng chọn sân, ngày và khung giờ.');
  }
  checkDate(date);
  const court = await getCourt(slug);
  if (!court.hours.includes(hour) || !isUpcoming(date, hour)) {
    throw new ApiError(400, 'Khung giờ này không còn nhận đặt.');
  }

  const owner = ownerFor(request, response, true);
  try {
    const booked = await Booking.create({
      code: 'SH-' + randomBytes(8).toString('hex').toUpperCase(),
      owner, slug, date, hour, name: court.name, location: court.location, price: court.price,
    });
    response.status(201).json(publicBooking(booked));
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.slug) {
      throw new ApiError(409, 'Khung giờ này vừa được đặt. Vui lòng chọn giờ khác.');
    }
    throw error;
  }
});

bookingRoutes.post('/:code/cancel', requireJson, async (request, response) => {
  const owner = ownerFor(request, response);
  if (!owner) throw new ApiError(404, 'Không tìm thấy lượt đặt.');
  const { date, hour } = currentTime();
  const booking = await Booking.findOneAndUpdate({
    owner, code: request.params.code, status: 'confirmed',
    $or: [{ date: { $gt: date } }, { date, hour: { $gt: hour } }],
  }, { $set: { status: 'canceled' } });
  if (!booking) {
    const owned = await Booking.exists({ owner, code: request.params.code });
    if (!owned) throw new ApiError(404, 'Không tìm thấy lượt đặt.');
    throw new ApiError(409, 'Lượt đặt đã hủy hoặc đã đến giờ chơi.');
  }
  response.status(204).end();
});
