import { Schema, model } from 'mongoose';

const court = new Schema({
  ordinal: { type: Number, required: true },
  slug: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  sport: { type: String, enum: ['badminton', 'football', 'basketball'], required: true },
  area: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, min: 0, required: true },
  image: { type: String, required: true },
  alt: { type: String, required: true },
  summary: { type: String, required: true },
  description: { type: String, required: true },
  features: [String],
  hours: [String],
});

export const Court = model('Court', court);
export const publicCourt = { _id: 0, __v: 0, ordinal: 0 };
