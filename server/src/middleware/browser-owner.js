import { createHash, randomBytes } from 'node:crypto';
import { ApiError } from './errors.js';

const cookieName = 'san_hen_owner';

export function ownerFor(request, response, create = false) {
  const cookies = (request.get('cookie') ?? '').split(';').map(item => item.trim());
  const existing = cookies.find(item => item.startsWith(cookieName + '='))?.slice(cookieName.length + 1);
  let token = /^[a-f0-9]{64}$/.test(existing ?? '') ? existing : null;
  if (!token && create) {
    token = randomBytes(32).toString('hex');
    response.cookie(cookieName, token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: request.secure || process.env.COOKIE_SECURE === 'true',
      maxAge: 90 * 24 * 60 * 60 * 1000,
      path: '/api/v1/bookings',
    });
  }
  return token ? createHash('sha256').update(token).digest('hex') : null;
}

export function requireJson(request, _response, next) {
  if (request.get('sec-fetch-site') === 'cross-site') {
    return next(new ApiError(403, 'Yêu cầu đến từ trang khác.'));
  }
  if (!request.is('application/json')) {
    return next(new ApiError(415, 'Máy chủ yêu cầu nội dung JSON.'));
  }
  return next();
}
