import { fileURLToPath } from 'node:url';
import express from 'express';
import { ApiError, handleError } from './middleware/errors.js';
import { bookingRoutes } from './modules/bookings/booking-routes.js';
import { courtRoutes } from './modules/courts/court-routes.js';

const frontend = fileURLToPath(new URL('../../build/', import.meta.url));

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use((_request, response, next) => {
    response.set('X-Content-Type-Options', 'nosniff');
    response.set('Referrer-Policy', 'same-origin');
    next();
  });
  app.use('/api/v1', express.json({ limit: '8kb' }));
  app.get('/api/v1/health', (_request, response) => response.json({ status: 'ok' }));
  app.use('/api/v1/courts', courtRoutes);
  app.use('/api/v1/bookings', bookingRoutes);
  app.use('/api', (_request, _response, next) => next(new ApiError(404, 'Không tìm thấy API.')));
  app.use(express.static(frontend));
  app.get('/', (_request, response) => {
    response.type('text').send('API Sân Hẹn đang chạy. Dùng npm start trong client/ hoặc tạo bản build Angular.');
  });
  app.use(handleError);
  return app;
}
