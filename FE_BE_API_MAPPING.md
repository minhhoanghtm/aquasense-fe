# BẢNG MAPPING CHI TIẾT TÍCH HỢP FRONTEND ↔ BACKEND (SHRIMP CORE)

**Dự án:**
- **Backend (Read-Only):** `D:\Khóa Luận\Project\shrimp-core-backend` (NestJS, TypeORM, TimescaleDB, Redis, BullMQ, Socket.IO)
- **Frontend:** `D:\Khóa Luận\Project\Smart Shrimp Farm` (React 19, TypeScript, Vite, TailwindCSS)
- **Chuẩn phản hồi BE:** `TransformInterceptor` bọc thành công: `{ success: true, statusCode: 200, message: string, data: T }`
- **Chuẩn lỗi BE:** `AllExceptionsFilter` bọc lỗi: `{ success: false, statusCode: number, message: string, errorCode: string, errors?: string[], data?: any }`

---

## 1. TỔNG QUAN CÁC MODULE VÀ ENDPOINTS

Backend bao gồm **7 modules API HTTP REST (48 endpoints)** và **1 WebSocket Gateway (/telemetry)**. Không có module `Farms` độc lập trong BE; thay vào đó hệ thống phân quyền sở hữu ao theo quan hệ `pond.userId` (Farmer sở hữu các ao được gán trực tiếp).

| STT | Module BE | Số lượng Endpoint | Phạm vi quyền hạn | Ghi chú tích hợp FE |
|---|---|---|---|---|
| 1 | **Auth** | 11 | Public, JWT, Manager | Đăng nhập SĐT/mật khẩu, OTP SMS, Quên mật khẩu, Refresh token, Đổi MK, Profile, Đăng xuất |
| 2 | **Users** | 8 | JWT, Manager, Self | Quản lý người dùng, Hồ sơ cá nhân, FCM Token, Mở khóa tài khoản |
| 3 | **Ponds** | 14 | JWT, Admin, Manager, Farmer | CRUD Ao nuôi, Cấu hình ngưỡng cảnh báo, Nhật ký đo đạc thủ công (NH3, NO2) |
| 4 | **Devices** | 7 | JWT, Admin, Manager, Farmer | CRUD Thiết bị IoT, Gán/gỡ thiết bị vào ao, Cập nhật trạng thái thiết bị |
| 5 | **Telemetry** | 2 (+1 WS) | JWT / Public | Lấy số liệu mới nhất, Lịch sử chuỗi thời gian, WebSocket Gateway thời gian thực |
| 6 | **Alerts** | 2 | JWT (Tất cả vai trò) | Danh sách cảnh báo phân quyền theo ao, Giải quyết cảnh báo có ghi chú |
| 7 | **Predictions** | 4 | JWT, Admin, Manager | Dự báo AI mới nhất, Lịch sử dự báo, Kích hoạt dự báo ao đơn và toàn bộ ao |
| **Tổng cộng** | **7 Modules** | **49 Endpoints (48 REST + 1 WS)** | | **100% được ánh xạ vào hệ thống FE** |

---

## 2. BẢNG MAPPING CHI TIẾT TỪNG ENDPOINT

### 2.1. Module Auth (`/auth`)

| STT | Method | Endpoint BE | DTO / Payload | Service & Hook FE | Component / Trang FE | Roles / Quyền | Trạng thái tích hợp |
|---|---|---|---|---|---|---|---|
| 1 | `POST` | `/auth/send-otp` | `SendOtpDto`: `{ phoneNumber, purpose }` | `sendOtp()` trong `authApi.ts` | `pages/Login`, `SecurityTab` | Public | Đã tích hợp API thật |
| 2 | `POST` | `/auth/forgot-password` | `ForgotPasswordDto`: `{ phoneNumber?, email? }` | `forgotPassword()` trong `authApi.ts` | `pages/ForgotPassword` (Bước 1) | Public | Đã tích hợp API thật |
| 3 | `POST` | `/auth/verify-otp` | `VerifyOtpDto`: `{ phoneNumber?, email?, otp, purpose }` | `verifyOtp()` trong `authApi.ts` | `pages/Login` (OTP mode), `pages/ForgotPassword` (Bước 2) | Public | Đã tích hợp API thật |
| 4 | `POST` | `/auth/register` | `RegisterDto`: `{ fullName, phoneNumber, email, role }` | `register()` trong `authApi.ts`, `createStaff()` trong `staffApi.ts` | `StaffFormModal` (`pages/Staff_Management`) | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 5 | `POST` | `/auth/login` | `LoginDto`: `{ phoneNumber, password }` | `login()` trong `authApi.ts` | `pages/Login` | Public | Đã tích hợp API thật |
| 6 | `POST` | `/auth/refresh` | `RefreshTokenDto`: `{ refreshToken }` | `processTokenRefresh()` trong `services/api.ts` | Tự động qua HTTP Interceptor khi gặp mã 401 | Public | Đã tích hợp API thật |
| 7 | `POST` | `/auth/reset-password` | `ResetPasswordDto`: `{ phoneNumber?, email?, newPassword }` | `resetPassword()` trong `authApi.ts` | `pages/ForgotPassword` (Bước 3) | Public | Đã tích hợp API thật |
| 8 | `GET` | `/auth/me` | N/A (Bearer Token) | `getProfile()` trong `authApi.ts` | `Header`, `ProfileLayout`, `PersonalInfoTab` | All Roles | Đã tích hợp API thật |
| 9 | `POST` | `/auth/change-password` | `ChangePasswordDto`: `{ currentPassword, newPassword, otp, refreshToken? }` | `changePassword()` trong `authApi.ts` | `SecurityTab` (`pages/Profile`) | All Roles | Đã tích hợp API thật |
| 10 | `POST` | `/auth/logout` | `LogoutDto`: `{ refreshToken }` | `logout()` trong `authApi.ts` | Nút đăng xuất tại `Header.tsx` | All Roles | Đã tích hợp API thật |
| 11 | `POST` | `/auth/logout-all` | N/A (Bearer Token) | `logoutAll()` trong `authApi.ts` | `SecurityTab` (`pages/Profile`) | All Roles | Đã tích hợp API thật |

---

### 2.2. Module Users (`/users`)

| STT | Method | Endpoint BE | DTO / Payload | Service & Hook FE | Component / Trang FE | Roles / Quyền | Trạng thái tích hợp |
|---|---|---|---|---|---|---|---|
| 12 | `PATCH` | `/users/profile` | `UpdateProfileDto`: `{ fullName?, phoneNumber?, email?, gender?, dateOfBirth? }` | `updateProfile()` trong `authApi.ts` | `PersonalInfoTab` (`pages/Profile`) | All Roles (Self) | Đã tích hợp API thật |
| 13 | `PATCH` | `/users/fcm-token` | `UpdateFcmTokenDto`: `{ fcmToken }` | `updateProfile()` trong `authApi.ts` | Tự động đồng bộ cùng `PersonalInfoTab` | All Roles (Self) | Đã tích hợp API thật |
| 14 | `GET` | `/users` | `FindUsersQueryDto`: `?page&limit&search&role&isActive` | `getStaffList()` trong `staffApi.ts`, `useStaff()` | `pages/Staff_Management` (`StaffTable`, `StaffCard`, `StaffToolbar`) | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 15 | `POST` | `/users` | `CreateUserDto`: `{ fullName, phoneNumber, password, email?, gender?, dateOfBirth?, role?, mustChangePassword? }` | `createUserByAdmin()` trong `staffApi.ts` | Quản lý người dùng nâng cao / `StaffFormModal` | `ADMIN`, `MANAGER` | Đã tích hợp Service FE |
| 16 | `GET` | `/users/:id` | Param UUID | `getStaffById()` trong `staffApi.ts` | `StaffDetailModal` (`pages/Staff_Management`) | `MANAGER` hoặc Chủ tài khoản | Đã tích hợp API thật |
| 17 | `PATCH` | `/users/:id` | `AdminUpdateUserDto`: `{ fullName?, phoneNumber?, email?, gender?, dateOfBirth?, role?, isActive?, mustChangePassword? }` | `updateStaff()`, `changeStaffStatus()` trong `staffApi.ts` | `StaffFormModal`, Toggle trạng thái tại `StaffTable` | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 18 | `DELETE` | `/users/:id` | Param UUID | `deleteStaff()` trong `staffApi.ts` | Nút Xóa nhân viên tại `StaffTable`, `StaffCard` | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 19 | `PATCH` | `/users/:id/unlock` | `UnlockUserDto`: `{ reason }` | `unlockStaffAccount()` trong `staffApi.ts` | Nút Khóa/Mở khóa tài khoản tại `StaffTable` | `ADMIN`, `MANAGER` | Đã tích hợp API thật |

---

### 2.3. Module Ponds (`/ponds`)

| STT | Method | Endpoint BE | DTO / Payload | Service & Hook FE | Component / Trang FE | Roles / Quyền | Trạng thái tích hợp |
|---|---|---|---|---|---|---|---|
| 20 | `POST` | `/ponds` | `CreatePondDto`: `{ pondName, areaM2, depthM, shrimpDensity, location?, capacity?, status?, userId? }` | `createPond()` trong `pondApi.ts` | `PondFormModal` (`pages/Monitoring`) | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 21 | `GET` | `/ponds` | `FindPondsQueryDto`: `?page&limit&search&status&userId` | `getPondsPage()`, `usePonds()` | `pages/Dashboard`, `pages/Monitoring`, `ManagedPondsTab` | All Roles (Farmer lọc ao của mình) | Đã tích hợp API thật |
| 22 | `GET` | `/ponds/:id` | Param UUID | `getPondById()`, `usePond()` | `PondInfo`, `Title` Header trên tất cả các trang | All Roles | Đã tích hợp API thật |
| 23 | `PATCH` | `/ponds/:id` | `UpdatePondDto`: `{ pondName?, areaM2?, depthM?, shrimpDensity?, location?, capacity?, status?, userId? }` | `updatePond()`, `assignPondToUser()` trong `pondApi.ts` | `PondFormModal`, `AssignPondModal` | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 24 | `DELETE` | `/ponds/:id` | Param UUID | `deletePond()` trong `pondApi.ts` | Nút Xóa vuông nuôi tại `Monitoring` (`PondInfo`) | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 25 | `POST` | `/ponds/:pondId/thresholds` | `CreateThresholdConfigDto`: `{ metricName, minValue, maxValue, isActive? }` | `createThresholdConfig()` trong `pondApi.ts` | `ThresholdConfigModal` (`pages/Monitoring`) | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 26 | `GET` | `/ponds/:pondId/thresholds` | Param UUID | `getThresholdConfigs()` trong `pondApi.ts` | `ThresholdConfigModal`, `WaterQualitySummary` | All Roles | Đã tích hợp API thật |
| 27 | `PATCH` | `/ponds/thresholds/:configId` | `UpdateThresholdConfigDto`: `{ metricName?, minValue?, maxValue?, isActive? }` | `updateThresholdConfig()` trong `pondApi.ts` | `ThresholdConfigModal` (`pages/Monitoring`) | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 28 | `DELETE` | `/ponds/thresholds/:configId` | Param UUID | `deleteThresholdConfig()` trong `pondApi.ts` | Nút xóa ngưỡng tại `ThresholdConfigModal` | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 29 | `POST` | `/ponds/:pondId/manual-logs` | `CreateManualTestLogDto`: `{ nh3Value, no2Value, note?, testedAt? }` | `createManualTestLog()` trong `pondApi.ts` | `ManualTestLogModal` (`pages/Monitoring`) | All Roles | Đã tích hợp API thật |
| 30 | `GET` | `/ponds/:pondId/manual-logs` | `FindManualTestLogsQueryDto`: `?page&limit&startDate&endDate` | `getManualTestLogsPage()` trong `pondApi.ts` | `ManualTestLogModal` (`pages/Monitoring`) | All Roles | Đã tích hợp API thật |
| 31 | `GET` | `/ponds/manual-logs/:logId` | Param UUID | `getManualTestLogById()` trong `pondApi.ts` | Chi tiết bản ghi đo thủ công | All Roles | Đã tích hợp Service FE |
| 32 | `PATCH` | `/ponds/manual-logs/:logId` | `UpdateManualTestLogDto`: `{ nh3Value?, no2Value?, note?, testedAt? }` | `updateManualTestLog()` trong `pondApi.ts` | `ManualTestLogModal` (Chỉnh sửa log) | All Roles | Đã tích hợp API thật |
| 33 | `DELETE` | `/ponds/manual-logs/:logId` | Param UUID | `deleteManualTestLog()` trong `pondApi.ts` | Nút xóa log tại `ManualTestLogModal` | All Roles | Đã tích hợp API thật |

---

### 2.4. Module Devices (`/devices`)

| STT | Method | Endpoint BE | DTO / Payload | Service & Hook FE | Component / Trang FE | Roles / Quyền | Trạng thái tích hợp |
|---|---|---|---|---|---|---|---|
| 34 | `POST` | `/devices` | `CreateDeviceDto`: `{ deviceName, macAddress, pondId?, firmwareVersion?, status? }` | `createDevice()` trong `deviceApi.ts` | `DeviceFormModal` (`pages/Sensors_Devices`) | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 35 | `GET` | `/devices` | `FindDevicesQueryDto`: `?page&limit&search&pondId&status` | `getDevices()`, `useDevices()` | `DeviceList`, `DeviceStats` (`pages/Sensors_Devices`), `PondDevices` | All Roles | Đã tích hợp API thật |
| 36 | `GET` | `/devices/:id` | Param UUID | `getDeviceById()` trong `deviceApi.ts` | Xem chi tiết thiết bị, Title Bar | All Roles | Đã tích hợp API thật |
| 37 | `PATCH` | `/devices/:id` | `UpdateDeviceDto`: `{ deviceName?, macAddress?, pondId?, firmwareVersion?, status?, lastActiveAt? }` | `updateDevice()` trong `deviceApi.ts` | `DeviceFormModal` (`pages/Sensors_Devices`) | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 38 | `DELETE` | `/devices/:id` | Param UUID | `deleteDevice()` trong `deviceApi.ts` | Nút xóa thiết bị tại `DeviceCard` (`pages/Sensors_Devices`) | `ADMIN`, `MANAGER` | Đã tích hợp API thật |
| 39 | `PATCH` | `/devices/:id/pond` | `AssignPondDto`: `{ pondId }` | `assignDeviceToPond()` trong `deviceApi.ts` | Gán / gỡ thiết bị khỏi vuông nuôi (`DeviceFormModal`) | `ADMIN`, `MANAGER` | Đã tích hợp Service FE |
| 40 | `PATCH` | `/devices/:id/status` | `UpdateDeviceStatusDto`: `{ status }` | `updateDeviceStatus()` trong `deviceApi.ts` | Cập nhật nhanh trạng thái (ONLINE/OFFLINE/MAINTENANCE) | `ADMIN`, `MANAGER` | Đã tích hợp Service FE |

---

### 2.5. Module Telemetry (`/telemetry` & WebSocket)

| STT | Method | Endpoint BE | DTO / Payload | Service & Hook FE | Component / Trang FE | Roles / Quyền | Trạng thái tích hợp |
|---|---|---|---|---|---|---|---|
| 41 | `GET` | `/telemetry/device/:deviceId/latest` | Param UUID | `getLatestTelemetry()` trong `deviceApi.ts` | `LatestReading` (`pages/Sensors_Devices`) | All Roles | Đã tích hợp API thật |
| 42 | `GET` | `/telemetry/device/:deviceId/history` | `QueryTelemetryDto`: `?page&limit&startDate&endDate` | `getTelemetryHistory()`, `useWaterQuality()` | `WaterQualityChart`, `WaterQualityGrid` (`Dashboard`) | All Roles | Đã tích hợp API thật |
| 43 | `WS` | Namespace `/telemetry` | Token qua `auth.token`, events `subscribe_pond`, `unsubscribe_pond` | `telemetrySocket.ts`, `useTelemetryRealtime.ts` | Tự động kích hoạt trên toàn bộ Dashboard & Monitoring | All Roles | Đã tích hợp WebSocket thật |

---

### 2.6. Module Alerts (`/alerts`)

| STT | Method | Endpoint BE | DTO / Payload | Service & Hook FE | Component / Trang FE | Roles / Quyền | Trạng thái tích hợp |
|---|---|---|---|---|---|---|---|
| 44 | `GET` | `/alerts` | `QueryAlertDto`: `?page&limit&deviceId&isResolved` | `getAlerts()`, `useAlertsHistory()`, `usePondAlerts()` | `WarningSummary`, `AlertList` (`Alerts_History`), `AlertsPond` (`Dashboard`) | All Roles (Farmer xem ao của mình) | Đã tích hợp API thật |
| 45 | `PATCH` | `/alerts/:id/resolve` | `ResolveAlertDto`: `{ resolutionNote? }` | `resolveAlert()` trong `alertsApi.ts` | Modal giải quyết cảnh báo trực tiếp từ `AlertList` (`Alerts_History`) | All Roles | Đã tích hợp UI & API thật |

---

### 2.7. Module Predictions (`/predictions`)

| STT | Method | Endpoint BE | DTO / Payload | Service & Hook FE | Component / Trang FE | Roles / Quyền | Trạng thái tích hợp |
|---|---|---|---|---|---|---|---|
| 46 | `GET` | `/predictions/pond/:pondId/latest` | Param UUID | `getAIPredictions()`, `useAIAnalysis()` | `AIPrediction` (`Dashboard`), `WaterQualityRiskForecast` (`AI_Analysis`) | All Roles | Đã tích hợp API thật |
| 47 | `GET` | `/predictions/pond/:pondId/history` | `?limit=20` | `getPredictionHistory()` trong `aiApi.ts` | Bảng Lịch sử dự báo AI tại `pages/AI_Analysis` | All Roles | Đã tích hợp UI & API thật |
| 48 | `POST` | `/predictions/pond/:pondId/trigger` | Param UUID | `triggerPondPrediction()` trong `aiApi.ts` | Nút "Dự báo ao này" tại `pages/AI_Analysis` | `ADMIN`, `MANAGER` | Đã tích hợp UI & API thật |
| 49 | `POST` | `/predictions/trigger-active` | N/A | `triggerActivePondsNow()` trong `aiApi.ts` | Nút "Chạy tất cả ao" tại `pages/AI_Analysis` | `ADMIN`, `MANAGER` | Đã tích hợp UI & API thật |

---

## 3. CƠ CHẾ TOKEN & PHÂN QUYỀN RBAC TRÊN FRONTEND

1. **Lưu trữ phiên (Token Management):**
   - Access Token được lưu tại `localStorage.getItem("accessToken")`.
   - Refresh Token được lưu tại `localStorage.getItem("refreshToken")`.
   - User Profile được lưu tại `localStorage.getItem("aquasense_user")`.
   - Cơ chế tự động giải mã và phục hồi phiên sau khi F5.

2. **Cơ chế Tự động Refresh Token (Auto-Refresh on 401):**
   - Triển khai trong `services/api.ts` với `processTokenRefresh()`.
   - Áp dụng Singleton Promise (`refreshPromise`) chống gọi trùng lặp (Race Conditions) khi nhiều API cùng nhận mã 401 cùng lúc.
   - Khi token hết hạn và refresh thành công, các request đang chờ tự động gắn Access Token mới và gửi lại (Retry).
   - Nếu refresh thất bại (Refresh token hết hạn hoặc bị thu hồi), hệ thống xóa storage và chuyển hướng an toàn về `/login?expired=1`.

3. **Phân quyền truy cập Routes & UI (RBAC Guard):**
   - `ADMIN` & `MANAGER`: Toàn quyền quản lý người dùng (`/staff`), quản lý vuông nuôi (`/monitoring`), quản lý thiết bị (`/devices`), cấu hình ngưỡng cảnh báo, kích hoạt tính toán AI, mở khóa tài khoản.
   - `FARMER`: Truy cập giám sát các vuông nuôi được gán quyền (`/dashboard`, `/monitoring`, `/alerts`, `/ai-analysis`), ghi nhận đo đạc thủ công (NH3, NO2), cập nhật hồ sơ cá nhân (`/profile`). Không có quyền vào trang Quản lý nhân viên (`/staff`).
