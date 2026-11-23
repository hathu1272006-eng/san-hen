import { Schema, model } from 'mongoose';

const payment = new Schema({
  status: { type: String, enum: ['paid', 'refunded'], required: true },
  method: { type: String, enum: ['demo', 'bank-qr', 'wallet'], required: true },
  reference: { type: String, required: true },
  amount: { type: Number, min: 0, required: true },
  paidAt: { type: Date, required: true },
  refundedAt: Date,
}, { _id: false });

const booking = new Schema({
  code: { type: String, required: true, unique: true },
  owner: { type: String, required: true, index: true },
  slug: { type: String, required: true },
  name: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  date: { type: String, required: true },
  hour: { type: String, required: true },
  status: { type: String, enum: ['confirmed', 'canceled'], default: 'confirmed' },
  payment,
}, { timestamps: true });

booking.index({ slug: 1, date: 1, hour: 1 }, {
  unique: true,
  partialFilterExpression: { status: 'confirmed' },
});

export const Booking = model('Booking', booking);

export function publicBooking({ code, slug, name, location, price, date, hour, status, payment }) {
  const receipt = payment ? {
    status: payment.status,
    method: payment.method,
    reference: payment.reference,
    amount: payment.amount,
    paidAt: payment.paidAt,
    refundedAt: payment.refundedAt,
  } : { status: 'unpaid' };
  return { code, slug, name, location, price, date, hour, status, payment: receipt };
}
