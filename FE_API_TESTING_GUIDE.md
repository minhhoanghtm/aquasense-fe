# HƯỚNG DẪN KIỂM THỬ 100% API BACKEND BẰNG GIAO DIỆN FRONTEND

**Dự án:**
- **Backend URL:** `http://localhost:3000` (Swagger UI: `http://localhost:3000/api/docs`)
- **Frontend URL:** `http://localhost:5173` (Vite Dev Server)
- **Tổng số endpoint quét từ Backend:** **49 Endpoints** (48 REST HTTP + 1 WebSocket Gateway)

---

## BẢNG HƯỚNG DẪN KIỂM THỬ CHI TIẾT 100% API

> [!NOTE]
> Bảng dưới đây bao quát toàn bộ 100% endpoint thực tế được quét từ mã nguồn NestJS Backend. Đối với các endpoint backend hỗ trợ nhưng giao diện người dùng hiện tại không có nút bấm trực tiếp, tình trạng được ghi rõ là **"Chưa có UI trực tiếp (Test qua Console/Postman)"** và cung cấp lệnh kiểm thử thay thế chính xác qua DevTools Console / Postman, tuyệt đối không đánh dấu đã test qua FE.

| STT | Module BE | Method | Endpoint | Trang FE | Cách test trên FE | Kết quả mong đợi | Trạng thái |
|:---:|:---|:---:|:---|:---|:---|:---|:---:|
| 1 | Auth | POST | `/auth/login` | Trang Đăng nhập (`/login`) | Nhập Số điện thoại và Mật khẩu, bấm nút "Đăng nhập" | Đăng nhập thành công, lưu cặp `accessToken`, `refreshToken` và chuyển hướng sang Dashboard | Đã kiểm thử qua FE |
| 2 | Auth | POST | `/auth/send-otp` | Trang Đăng nhập (`/login`) & Đổi MK (`/profile/security`) | Chọn chế độ "Đăng nhập bằng OTP" hoặc bấm "Gửi mã xác thực OTP" khi đổi mật khẩu | Hệ thống thông báo OTP đã được gửi đến số điện thoại, bắt đầu đếm ngược 60s | Đã kiểm thử qua FE |
| 3 | Auth | POST | `/auth/verify-otp` | Trang Đăng nhập (`/login`) & Quên MK (`/forgot-password`) | Nhập mã OTP 6 chữ số vào các ô nhập liệu và bấm "Xác nhận OTP" | Xác thực OTP thành công, trả về Access Token (đối với đăng nhập) hoặc chuyển bước kế tiếp | Đã kiểm thử qua FE |
| 4 | Auth | POST | `/auth/forgot-password` | Trang Quên mật khẩu (`/forgot-password`) | Nhập SĐT hoặc Email khôi phục tài khoản, bấm "Gửi mã xác nhận" | Backend tạo OTP khôi phục mật khẩu, FE chuyển sang Bước 2 (Nhập OTP) | Đã kiểm thử qua FE |
| 5 | Auth | POST | `/auth/reset-password` | Trang Quên mật khẩu (`/forgot-password`) | Sau khi verify OTP, nhập Mật khẩu mới và Xác nhận mật khẩu, bấm "Đặt lại mật khẩu" | Mật khẩu được cập nhật thành công, thông báo hoàn tất và điều hướng về trang đăng nhập | Đã kiểm thử qua FE |
| 6 | Auth | POST | `/auth/refresh` | Cơ chế nền FE (Tất cả các trang) | Đợi Access Token hết hạn (hoặc sửa đổi token trong localStorage) rồi gọi bất kỳ API nào | Interceptor tự động gọi `/auth/refresh` lấy token mới và tiếp tục request ban đầu mà không bị gián đoạn | Đã kiểm thử qua FE |
| 7 | Auth | GET | `/auth/me` | Header & Trang Cá nhân (`/profile`) | Đăng nhập vào hệ thống hoặc reload trang F5 | Tên người dùng, SĐT, vai trò hiển thị chính xác trên Header và trang thông tin cá nhân | Đã kiểm thử qua FE |
| 8 | Auth | POST | `/auth/change-password` | Trang Bảo mật (`/profile/security`) | Nhập mật khẩu hiện tại, mật khẩu mới, bấm gửi OTP và nhập mã OTP 6 số, bấm "Lưu thay đổi" | Đổi mật khẩu thành công, token được cấp mới và phiên làm việc duy trì an toàn | Đã kiểm thử qua FE |
| 9 | Auth | POST | `/auth/logout` | Header Bar (Nút Đăng xuất) | Bấm vào menu Avatar ở góc phải trên cùng và chọn "Đăng xuất" | Gửi refresh token lên BE để hủy, xóa sạch localStorage và chuyển hướng về trang `/login` | Đã kiểm thử qua FE |
| 10 | Auth | POST | `/auth/logout-all` | Trang Bảo mật (`/profile/security`) | Cuộn xuống mục "Đăng xuất tất cả thiết bị" và bấm nút xác nhận | Hủy toàn bộ token trên tất cả thiết bị, xóa phiên hiện tại và điều hướng về `/login` | Đã kiểm thử qua FE |
| 11 | Auth | POST | `/auth/register` | Trang Quản lý nhân viên (`/staff`) | Bấm "Thêm nhân viên", điền thông tin và bấm "Tạo tài khoản" | Quản trị viên tạo tài khoản mới thành công, thông báo mật khẩu được gửi qua email | Đã kiểm thử qua FE |
| 12 | Users | PATCH | `/users/profile` | Trang Thông tin cá nhân (`/profile/personal`) | Chỉnh sửa Họ tên, Email, Ngày sinh, Giới tính và bấm "Cập nhật thông tin" | Dữ liệu cá nhân được lưu vào DB, giao diện cập nhật ngay thông tin mới | Đã kiểm thử qua FE |
| 13 | Users | PATCH | `/users/fcm-token` | Nền trang Cá nhân / Cài đặt | Cập nhật thiết bị hoặc kích hoạt nhận thông báo | Gửi mã FCM token lên backend để lưu trữ nhận thông báo Mobile | Đã kiểm thử qua FE |
| 14 | Users | GET | `/users` | Trang Quản lý nhân viên (`/staff`) | Đăng nhập với quyền `ADMIN` hoặc `MANAGER`, truy cập trang Quản lý nhân viên | Hiển thị bảng/danh sách toàn bộ nhân sự, phân trang, lọc theo vai trò và ô tìm kiếm | Đã kiểm thử qua FE |
| 15 | Users | POST | `/users` | Chưa có UI trực tiếp (Test qua Console/Postman) | Gọi hàm `createUserByAdmin(data)` trong DevTools Console hoặc gửi request POST qua Postman | Tạo mới người dùng trực tiếp kèm mật khẩu tùy chọn mà không cần luồng đăng ký OTP | Chưa có UI trực tiếp |
| 16 | Users | GET | `/users/:id` | Trang Quản lý nhân viên (`/staff`) | Bấm biểu tượng "Mắt" (Xem chi tiết) trên một dòng nhân sự | Modal chi tiết nhân viên hiển thị đầy đủ thông tin định danh và hồ sơ từ BE | Đã kiểm thử qua FE |
| 17 | Users | PATCH | `/users/:id` | Trang Quản lý nhân viên (`/staff`) | Bật/tắt công tắc trạng thái Hoạt động / Không hoạt động của nhân viên | Trạng thái người dùng được cập nhật ngay lập tức trên DB và phản ánh màu sắc công tắc | Đã kiểm thử qua FE |
| 18 | Users | DELETE | `/users/:id` | Trang Quản lý nhân viên (`/staff`) | Bấm biểu tượng "Thùng rác" tại một nhân viên và xác nhận modal cảnh báo | Tài khoản bị xóa khỏi hệ thống, danh sách tự động làm mới và biến mất dòng vừa xóa | Đã kiểm thử qua FE |
| 19 | Users | PATCH | `/users/:id/unlock` | Trang Quản lý nhân viên (`/staff`) | Bấm vào biểu tượng Ổ khóa màu đỏ tại nhân sự bị khóa đăng nhập sai mật khẩu | Mở modal xác nhận, gọi API mở khóa tài khoản thành công, icon chuyển sang ổ khóa mở | Đã kiểm thử qua FE |
| 20 | Ponds | POST | `/ponds` | Trang Quản lý vuông nuôi (`/monitoring`) | Bấm "Thêm vuông nuôi", nhập Tên ao, Diện tích, Độ sâu, Mật độ thả, bấm "Lưu" | Ao nuôi mới được tạo trên BE, danh sách ao trên màn hình cập nhật ngay lập tức | Đã kiểm thử qua FE |
| 21 | Ponds | GET | `/ponds` | Trang Dashboard & Giám sát (`/dashboard`, `/monitoring`) | Mở trang Tổng quan hoặc Quản lý vuông nuôi | Hiển thị danh sách các ao nuôi thuộc quyền quản lý của tài khoản hiện tại | Đã kiểm thử qua FE |
| 22 | Ponds | GET | `/ponds/:id` | Header / Chi tiết ao (`/dashboard`, `/monitoring`) | Bấm chọn một ao nuôi cụ thể từ danh sách thẻ ao | Thông tin chi tiết diện tích, mật độ thả, độ sâu được tải và hiển thị trên tiêu đề trang | Đã kiểm thử qua FE |
| 23 | Ponds | PATCH | `/ponds/:id` | Trang Quản lý vuông nuôi (`/monitoring`) | Bấm "Chỉnh sửa" tại thông tin ao, thay đổi tên ao hoặc thông số, bấm "Lưu thay đổi" | Dữ liệu ao được cập nhật trên BE, thẻ ao và bảng thông tin phản ánh giá trị mới | Đã kiểm thử qua FE |
| 24 | Ponds | DELETE | `/ponds/:id` | Trang Quản lý vuông nuôi (`/monitoring`) | Bấm "Xóa vuông nuôi" tại mục chi tiết ao và xác nhận trên modal cảnh báo | Ao nuôi bị xóa khỏi DB, giao diện tự động chuyển sang hiển thị ao kế tiếp | Đã kiểm thử qua FE |
| 25 | Ponds | POST | `/ponds/:pondId/thresholds` | Modal Ngưỡng cảnh báo (`/monitoring`) | Bấm "Cấu hình ngưỡng", bấm "Thêm ngưỡng", nhập Tên thông số, Min, Max và bấm "Lưu" | Ngưỡng cảnh báo mới được thêm vào ao nuôi, xuất hiện trong danh sách ngưỡng | Đã kiểm thử qua FE |
| 26 | Ponds | GET | `/ponds/:pondId/thresholds` | Modal Ngưỡng & Tóm tắt chất lượng nước | Mở modal Cấu hình ngưỡng của một ao | Tải danh sách tất cả các ngưỡng (pH, DO, Nhiệt độ, Độ mặn...) hiện có của ao | Đã kiểm thử qua FE |
| 27 | Ponds | PATCH | `/ponds/thresholds/:configId` | Modal Ngưỡng cảnh báo (`/monitoring`) | Bấm "Chỉnh sửa" một ngưỡng thông số, cập nhật Min/Max, bấm "Lưu" | Giá trị ngưỡng an toàn được cập nhật trên BE | Đã kiểm thử qua FE |
| 28 | Ponds | DELETE | `/ponds/thresholds/:configId` | Modal Ngưỡng cảnh báo (`/monitoring`) | Bấm nút Xóa (biểu tượng Thùng rác) tại một dòng cấu hình ngưỡng | Cấu hình ngưỡng bị xóa khỏi ao nuôi, danh sách tự động cập nhật | Đã kiểm thử qua FE |
| 29 | Ponds | POST | `/ponds/:pondId/manual-logs` | Modal Đo đạc thủ công (`/monitoring`) | Bấm "Ghi nhận đo thủ công", nhập nồng độ khí độc NH3, NO2, Ghi chú, bấm "Lưu kết quả" | Bản ghi đo khí độc thủ công được lưu trữ vào CSDL thành công | Đã kiểm thử qua FE |
| 30 | Ponds | GET | `/ponds/:pondId/manual-logs` | Modal Đo đạc thủ công (`/monitoring`) | Mở tab Lịch sử đo đạc thủ công trong modal | Hiển thị bảng phân trang các lần đo đạc khí độc kèm thời gian và người đo | Đã kiểm thử qua FE |
| 31 | Ponds | GET | `/ponds/manual-logs/:logId` | Chưa có UI trực tiếp (Test qua Console/Postman) | Gọi hàm `getManualTestLogById(logId)` trong DevTools Console hoặc gửi GET qua Postman | Trả về thông tin chi tiết một bản ghi đo thủ công theo UUID | Chưa có UI trực tiếp |
| 32 | Ponds | PATCH | `/ponds/manual-logs/:logId` | Modal Đo đạc thủ công (`/monitoring`) | Bấm nút sửa tại một dòng lịch sử đo thủ công, chỉnh giá trị và bấm "Cập nhật" | Kết quả đo khí độc được cập nhật lại chính xác trên BE | Đã kiểm thử qua FE |
| 33 | Ponds | DELETE | `/ponds/manual-logs/:logId` | Modal Đo đạc thủ công (`/monitoring`) | Bấm nút xóa bản ghi đo thủ công và xác nhận | Bản ghi đo bị xóa, bảng lịch sử đo tự động làm mới | Đã kiểm thử qua FE |
| 34 | Devices | POST | `/devices` | Trang Cảm biến & Thiết bị (`/devices`) | Bấm "Thêm thiết bị", nhập Tên thiết bị, Địa chỉ MAC, chọn vuông nuôi, bấm "Lưu" | Thiết bị IoT mới được đăng ký vào hệ thống và liên kết với vuông nuôi đã chọn | Đã kiểm thử qua FE |
| 35 | Devices | GET | `/devices` | Trang Cảm biến & Thiết bị (`/devices`) | Truy cập trang Cảm biến & Thiết bị | Tải và hiển thị danh sách các thiết bị IoT, thống kê thiết bị Online/Offline | Đã kiểm thử qua FE |
| 36 | Devices | GET | `/devices/:id` | Header / Card thiết bị (`/devices`) | Xem chi tiết thiết bị được gán tại tiêu đề hoặc danh sách | Tải thông tin chi tiết trạng thái, địa chỉ MAC, phiên bản firmware của thiết bị | Đã kiểm thử qua FE |
| 37 | Devices | PATCH | `/devices/:id` | Trang Cảm biến & Thiết bị (`/devices`) | Bấm "Chỉnh sửa" trên thẻ thiết bị, đổi Tên thiết bị hoặc Firmware, bấm "Lưu" | Thông tin thiết bị được cập nhật thành công trên BE | Đã kiểm thử qua FE |
| 38 | Devices | DELETE | `/devices/:id` | Trang Cảm biến & Thiết bị (`/devices`) | Bấm "Xóa" trên thẻ thiết bị và xác nhận trên modal cảnh báo | Thiết bị IoT bị gỡ bỏ khỏi hệ thống | Đã kiểm thử qua FE |
| 39 | Devices | PATCH | `/devices/:id/pond` | Chưa có UI trực tiếp (Test qua Console/Postman) | Gọi hàm `assignDeviceToPond(deviceId, pondId)` trong DevTools Console hoặc Postman | Gán hoặc gỡ thiết bị sang ao nuôi khác độc lập mà không đổi thông tin phần cứng | Chưa có UI trực tiếp |
| 40 | Devices | PATCH | `/devices/:id/status` | Chưa có UI trực tiếp (Test qua Console/Postman) | Gọi hàm `updateDeviceStatus(deviceId, 'MAINTENANCE')` trong Console hoặc Postman | Trạng thái thiết bị chuyển sang BẢO TRÌ/OFFLINE ngay lập tức | Chưa có UI trực tiếp |
| 41 | Telemetry | GET | `/telemetry/device/:deviceId/latest` | Trang Cảm biến & Thiết bị (`/devices`) | Xem khối "Chỉ số đo đạc gần nhất" trên trang Cảm biến & Thiết bị | Hiển thị thông số cảm biến đo gần nhất của thiết bị (Nhiệt độ, pH, DO, Độ mặn...) | Đã kiểm thử qua FE |
| 42 | Telemetry | GET | `/telemetry/device/:deviceId/history` | Trang Dashboard (`/dashboard`) | Xem Biểu đồ chất lượng nước theo chuỗi thời gian | Hiển thị chuỗi dữ liệu lịch sử đo đạc cảm biến trên biểu đồ Recharts | Đã kiểm thử qua FE |
| 43 | Telemetry | WS | Namespace `/telemetry` | Toàn bộ ứng dụng (Realtime) | Mở trang Dashboard khi có gói tin MQTT/Redis telemetry mới đẩy về | Dữ liệu cảm biến và cảnh báo trên giao diện tự động cập nhật mà không cần F5 | Đã kiểm thử qua FE |
| 44 | Alerts | GET | `/alerts` | Trang Cảnh báo & Lịch sử (`/alerts`) | Truy cập trang Cảnh báo & Lịch sử | Tải danh sách cảnh báo vi phạm ngưỡng, phân loại mức độ Nguy hiểm/Cảnh báo | Đã kiểm thử qua FE |
| 45 | Alerts | PATCH | `/alerts/:id/resolve` | Trang Cảnh báo & Lịch sử (`/alerts`) | Bấm vào một cảnh báo chưa xử lý, nhập ghi chú khắc phục, bấm "Xác nhận đã xử lý" | Cảnh báo chuyển sang trạng thái "Đã xử lý", bộ đếm cảnh báo nguy hiểm tự động giảm | Đã kiểm thử qua FE |
| 46 | Predictions | GET | `/predictions/pond/:pondId/latest` | Trang Dashboard & Phân tích AI (`/ai-analysis`) | Xem khối "Dự báo rủi ro chất lượng nước" trên Dashboard hoặc trang Phân tích AI | Hiển thị kết quả dự báo Oxy hòa tan DO, pH sau 2h và đánh giá rủi ro từ mô hình AI | Đã kiểm thử qua FE |
| 47 | Predictions | GET | `/predictions/pond/:pondId/history` | Trang Phân tích AI (`/ai-analysis`) | Chọn một ao nuôi và cuộn xuống bảng "Lịch sử dự báo AI gần nhất" | Hiển thị danh sách các mốc dự báo AI lịch sử, điểm rủi ro, phân loại rủi ro | Đã kiểm thử qua FE |
| 48 | Predictions | POST | `/predictions/pond/:pondId/trigger` | Trang Phân tích AI (`/ai-analysis`) | Chọn ao nuôi và bấm nút "Dự báo ao này" (biểu tượng Sparkles) | Kích hoạt tính toán AI cho ao thành công, bảng lịch sử dự báo được cập nhật ngay | Đã kiểm thử qua FE |
| 49 | Predictions | POST | `/predictions/trigger-active` | Trang Phân tích AI (`/ai-analysis`) | Bấm nút "Chạy tất cả ao" (biểu tượng Play) trên thanh điều khiển AI | Đưa toàn bộ các ao active vào hàng đợi BullMQ để chạy dự báo hàng loạt | Đã kiểm thử qua FE |

---

## 2. HƯỚNG DẪN KIỂM THỬ THAY THẾ CHO CÁC API CHƯA CÓ UI TRỰC TIẾP

Đối với 4 API chưa có nút bấm UI riêng biệt trên giao diện, người kiểm thử có thể thực hiện kiểm thử chức năng trực tiếp từ **Trình duyệt (F12 Console)** hoặc **Postman / cURL** bằng các bước chuẩn sau:

### 1. `POST /users` (Khởi tạo tài khoản trực tiếp có mật khẩu do Quản trị viên chỉ định)
- **Tình trạng:** Trên giao diện FE, việc tạo nhân sự hiện đang sử dụng luồng `POST /auth/register` (hệ thống tự tạo mật khẩu ngẫu nhiên gửi về email). Endpoint `POST /users` hỗ trợ chỉ định mật khẩu trực tiếp.
- **Cách test thay thế bằng Console trình duyệt:**
  1. Đăng nhập vào FE bằng tài khoản Admin/Manager.
  2. Mở `F12` -> `Console` và nhập:
  ```javascript
  const token = localStorage.getItem("accessToken");
  fetch("http://localhost:3000/users", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({
      fullName: "Kỹ sư Test Trực Tiếp",
      phoneNumber: "0912345999",
      password: "Password123@",
      email: "engineer.test@shrimp.local",
      role: "FARMER"
    })
  }).then(r => r.json()).then(console.log);
  ```
- **Kết quả mong đợi:** HTTP 201 Created, trả về đối tượng `{ success: true, data: { user: ... } }`.

---

### 2. `GET /ponds/manual-logs/:logId` (Lấy chi tiết một bản ghi đo thủ công theo UUID)
- **Tình trạng:** Trên FE hiện hiển thị danh sách đo thủ công dạng bảng qua `GET /ponds/:pondId/manual-logs`.
- **Cách test thay thế bằng Console trình duyệt:**
  ```javascript
  const token = localStorage.getItem("accessToken");
  const logId = "<UUID_BẢN_GHI_ĐO_THỦ_CÔNG>";
  fetch(`http://localhost:3000/ponds/manual-logs/${logId}`, {
    headers: { "Authorization": `Bearer ${token}` }
  }).then(r => r.json()).then(console.log);
  ```
- **Kết quả mong đợi:** HTTP 200 OK, trả về chi tiết bản ghi đo gồm `nh3Value`, `no2Value`, `testedAt`.

---

### 3. `PATCH /devices/:id/pond` (Gán/gỡ thiết bị khỏi vuông nuôi độc lập)
- **Tình trạng:** Trên FE việc đổi ao của thiết bị được gộp chung trong modal sửa thiết bị (`PATCH /devices/:id`). Endpoint này hỗ trợ gán/gỡ ao nhanh chuyên biệt.
- **Cách test thay thế bằng Console trình duyệt:**
  ```javascript
  const token = localStorage.getItem("accessToken");
  const deviceId = "<UUID_THIẾT_BỊ>";
  const pondId = "<UUID_AO_MỚI>"; // hoặc null để gỡ thiết bị khỏi ao
  fetch(`http://localhost:3000/devices/${deviceId}/pond`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ pondId: pondId })
  }).then(r => r.json()).then(console.log);
  ```
- **Kết quả mong đợi:** HTTP 200 OK, thiết bị được liên kết với ao mới hoặc gỡ khỏi ao thành công.

---

### 4. `PATCH /devices/:id/status` (Cập nhật nhanh trạng thái hoạt động của thiết bị)
- **Tình trạng:** Cập nhật trạng thái nhanh (ONLINE / OFFLINE / MAINTENANCE) tách biệt khỏi form cấu hình.
- **Cách test thay thế bằng Console trình duyệt:**
  ```javascript
  const token = localStorage.getItem("accessToken");
  const deviceId = "<UUID_THIẾT_BỊ>";
  fetch(`http://localhost:3000/devices/${deviceId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
    body: JSON.stringify({ status: "MAINTENANCE" })
  }).then(r => r.json()).then(console.log);
  ```
- **Kết quả mong đợi:** HTTP 200 OK, thiết bị chuyển trạng thái sang `MAINTENANCE`.
