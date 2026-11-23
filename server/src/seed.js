import mongoose from 'mongoose';
import data from '../../shared/courts.json' with { type: 'json' };
import { config } from './config.js';
import { Court } from './models/court.js';

try {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 6000 });
  await Court.init();
  const courts = data.map((court, ordinal) => ({
    updateOne: {
      filter: { slug: court.slug },
      update: { $set: { ...court, ordinal } },
      upsert: true,
    },
  }));
  await Court.bulkWrite(courts);
  console.log(`Đã nạp ${courts.length} sân mẫu.`);
} finally {
  await mongoose.disconnect();
}
