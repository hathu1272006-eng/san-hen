import { Schema, model } from 'mongoose';

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
}, { timestamps: true });

booking.index({ slug: 1, date: 1, hour: 1 }, {
  unique: true,
  partialFilterExpression: { status: 'confirmed' },
});

export const Booking = model('Booking', booking);

export function publicBooking({ code, slug, name, location, price, date, hour, status }) {
  return { code, slug, name, location, price, date, hour, status };
}
