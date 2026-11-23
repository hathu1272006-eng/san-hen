import { randomBytes } from 'node:crypto';
import { Router } from 'express';
import { currentTime, isUpcoming } from '../../../../shared/schedule.mjs';
import { Booking, publicBooking } from '../../models/booking.js';
import { ownerFor, requireJson } from '../../middleware/browser-owner.js';
import { ApiError } from '../../middleware/errors.js';
import { checkDate, getCourt } from '../courts/court-service.js';

export const bookingRoutes = Router();

function bookingLookup(request, response) {
  const owner = ownerFor(request, response);
  if (!owner) throw new ApiError(404, 'Không tìm thấy lượt đặt.');
  return { owner, code: request.params.code };
}

function futureBooking(lookup) {
  const { date, hour } = currentTime();
  return {
    ...lookup,
    status: 'confirmed',
    $or: [{ date: { $gt: date } }, { date, hour: { $gt: hour } }],
  };
}

async function getBooking(lookup) {
  const booking = await Booking.findOne(lookup).lean();
  if (!booking) throw new ApiError(404, 'Không tìm thấy lượt đặt.');
  return booking;
}

bookingRoutes.use((_request, response, next) => {
  response.set('Cache-Control', 'no-store');
  next();
});

bookingRoutes.get('/', async (request, response) => {
  const owner = ownerFor(request, response, true);
  const bookings = await Booking.find({ owner }).sort({ date: 1, hour: 1, createdAt: -1 }).lean();
  response.json(bookings.map(publicBooking));
});

bookingRoutes.get('/:code', async (request, response) => {
  response.json(publicBooking(await getBooking(bookingLookup(request, response))));
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

bookingRoutes.post('/:code/payment', requireJson, async (request, response) => {
  const lookup = bookingLookup(request, response);
  if (request.body?.method !== 'demo') {
    throw new ApiError(400, 'Vui lòng chọn thanh toán thử.');
  }

  // The atomic update uses the stored price and accepts a payment only once.
  const booking = await Booking.findOneAndUpdate({
    ...futureBooking(lookup),
    'payment.status': { $exists: false },
  }, [{ $set: { payment: {
    status: 'paid',
    method: 'demo',
    reference: 'PAY-' + lookup.code.slice(3),
    amount: '$price',
    paidAt: '$$NOW',
  } } }], { updatePipeline: true, returnDocument: 'after' }).lean();

  const result = booking ?? await getBooking(lookup);
  if (result.payment?.status !== 'paid') {
    throw new ApiError(409, 'Lượt đặt đã hủy hoặc đã đến giờ chơi.');
  }
  response.json(publicBooking(result));
});

bookingRoutes.post('/:code/cancel', requireJson, async (request, response) => {
  const lookup = bookingLookup(request, response);
  const booking = await Booking.findOneAndUpdate(futureBooking(lookup), [{
    $set: {
      status: 'canceled',
      payment: {
        $cond: [
          { $eq: ['$payment.status', 'paid'] },
          { $mergeObjects: ['$payment', { status: 'refunded', refundedAt: '$$NOW' }] },
          { $ifNull: ['$payment', '$$REMOVE'] },
        ],
      },
    },
  }], { updatePipeline: true }).lean();

  if (!booking) {
    await getBooking(lookup);
    throw new ApiError(409, 'Lượt đặt đã hủy hoặc đã đến giờ chơi.');
  }
  response.status(204).end();
});
