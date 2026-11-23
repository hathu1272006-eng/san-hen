export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function handleError(error, _request, response, _next) {
  if (error instanceof ApiError) {
    return response.status(error.status).json({ message: error.message });
  }
  if (error.type === 'entity.parse.failed') {
    return response.status(400).json({ message: 'Nội dung JSON không hợp lệ.' });
  }
  if (error.type === 'entity.too.large') {
    return response.status(413).json({ message: 'Nội dung gửi quá lớn.' });
  }
  console.error(error);
  return response.status(500).json({ message: 'Máy chủ gặp lỗi. Vui lòng thử lại.' });
}
