# Sân Hẹn

Website tiếng Việt để tìm và đặt sân cầu lông, bóng đá mini hoặc bóng rổ. Tên sân, địa chỉ khu vực, giá và tiện ích đều là dữ liệu minh họa.

## Mở bản chạy thử

Giải nén toàn bộ thư mục. Trên Windows, mở `Mo-ban-demo.cmd`. Hoặc chạy `node preview.mjs` từ thư mục dự án. Sau đó vào [http://127.0.0.1:4173](http://127.0.0.1:4173).

Bản này đã được build sẵn và chỉ cần Node.js. Bạn có thể tìm sân, đặt giờ, thanh toán thử, xem biên nhận và hủy lượt đã đặt. Dữ liệu lưu trong trình duyệt, nên mỗi trình duyệt có lịch riêng. Có thể đặt lại trước giờ chơi sau khi hủy.

## Chạy đầy đủ frontend và backend

Yêu cầu Node.js 22.12 trở lên, npm, và MongoDB đang chạy. Python 3.10 trở lên dành cho dịch vụ gợi ý tùy chọn.

Nếu máy đã có Docker, có thể khởi động MongoDB cục bộ bằng lệnh sau trong một cửa sổ terminal.

```bash
docker run --rm --name san-hen-mongo -p 127.0.0.1:27017:27017 -v san-hen-data:/data/db mongo:8
```

Chạy API từ thư mục dự án. Mặc định API dùng MongoDB cục bộ. Nếu dùng máy chủ khác, sao chép `server/.env.example` thành `server/.env` rồi sửa `MONGODB_URI`.

```bash
cd server
npm ci
npm run seed
npm start
```

Trong cửa sổ thứ hai, chạy Angular rồi mở [http://localhost:4200](http://localhost:4200). Cấu hình proxy chuyển các yêu cầu `/api/v1` đến Express.

```bash
cd client
npm ci
npm start
```

Để trình diễn trên một cổng, chạy `npm run build` trong `client/` rồi truy cập [http://127.0.0.1:3000](http://127.0.0.1:3000) khi API đang chạy.

### Dịch vụ gợi ý

Các lệnh dưới đây chạy từ thư mục dự án trên Windows. Trên macOS hoặc Linux, thay đường dẫn Python trong môi trường ảo bằng `.venv/bin/python`.

```powershell
cd ml
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn service:app --port 8000
```

FastAPI xếp hạng sân tương tự bằng TF-IDF và cosine similarity. Khi dịch vụ Python dừng, Express gợi ý theo môn và khu vực.

## Cấu trúc mã nguồn

- `client/src/app/` chứa các trang Angular, router, form lọc sân và lớp gọi API.
- `server/src/` chứa Express, mô hình Mongoose, routes theo chức năng và script nạp sân mẫu.
- `ml/` chứa dịch vụ Python FastAPI.
- `shared/` chứa danh mục sân, quy tắc thời gian và tìm kiếm dùng chung.

Khi xác nhận đặt sân, API kiểm tra lại ngày, giờ và bảng giá. MongoDB dùng chỉ mục duy nhất cho các lượt đang giữ chỗ theo sân, ngày và giờ. Khi hủy, lượt đặt vẫn có trong lịch sử và khung giờ được mở lại. Cookie HttpOnly nhận diện trình duyệt để truy xuất lịch theo chủ sở hữu.

Thanh toán thử lấy số tiền từ lượt đặt và tạo một mã biên nhận dùng lại nếu gửi lặp. Khi hủy trước giờ chơi, lượt đã thanh toán chuyển sang trạng thái hoàn tiền thử. Các giao dịch này là mô phỏng, không thu hoặc hoàn tiền thật.

## Ảnh minh họa

Ảnh tạo bằng ImageGen, lưu ở `client/public/images/`. Prompt mô tả ảnh chụp sân thể thao phong cách báo chí, bố cục ngang và không có chữ hay logo.

- `hero.webp` là sân cầu lông trong nhà, tông xanh đậm, nắng cuối chiều chiếu từ các cửa sổ bên phải.
- `badminton.webp` là sân cầu lông trống, có lưới, mái thép xanh, vợt và cầu ở rìa ảnh.
- `football.webp` là sân bóng đá mini cỏ nhân tạo, nhìn ngang mặt sân về phía khung thành lúc gần hoàng hôn.
- `basketball.webp` là sân bóng rổ ngoài trời, nền đỏ gạch, khu vực dưới rổ màu xanh và bóng cây buổi chiều.
