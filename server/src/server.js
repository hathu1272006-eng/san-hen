import mongoose from 'mongoose';
import { createApp } from './app.js';
import { config } from './config.js';
import { Court } from './models/court.js';
import { Booking } from './models/booking.js';

try {
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 6000 });
  await Promise.all([Court.init(), Booking.init()]);
  createApp().listen(config.port, config.host, () => {
    console.log(`Sân Hẹn: http://${config.host}:${config.port}`);
  });
} catch (error) {
  console.error('Không thể khởi động API. Kiểm tra kết nối MongoDB.', error.message);
  await mongoose.disconnect();
  process.exitCode = 1;
}
