# 💍 Wedding SaaS Platform - Microservices Architecture

Chào mừng bạn đến với **Wedding SaaS Platform**, một hệ thống tạo thiệp báo hỷ kỹ thuật số chuyên nghiệp, được xây dựng trên kiến trúc Microservices hiện đại, có tính mở rộng cao và trải nghiệm người dùng mượt mà.

![Wedding SaaS Preview](https://img.shields.io/badge/Status-Active-brightgreen) ![Spring Boot Version](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## 🌟 Tính Năng Nổi Bật (Key Features)

Dự án không chỉ là một trang web hiển thị, mà là một nền tảng SaaS đầy đủ tính năng:

### 1. Quản lý & Bảo mật (IAM)
- **🔐 Bảo mật đa lớp:** Sử dụng JWT (JSON Web Token) với cơ chế Stateless Authentication.
- **🛡️ Phân quyền:** Tách biệt quyền hạn giữa **Admin** (Quản trị hệ thống) và **Couple** (Cặp đôi).
- **🚀 Blacklist Token:** Tích hợp Redis để vô hiệu hóa Token ngay khi người dùng đăng xuất.

### 2. Tùy biến Thiệp Cưới (Wedding Customization)
- **🎨 Dynamic Theme:** Cặp đôi tự chọn màu sắc chủ đạo, câu chuyện tình yêu (Love Story).
- **📍 Map thông minh:** Hỗ trợ tọa độ (Lat/Long) riêng biệt cho Nhà Trai và Nhà Gái, tích hợp Google Maps API.
- **💰 Tách biệt Tài khoản & QR:** Tính năng độc đáo cho phép nhập riêng STK/Ngân hàng cho cả 2 bên gia đình. Tự động sinh mã **VietQR** chuyên nghiệp cho từng bên.

### 3. Trải nghiệm Khách mời (Public Invitation)
- **📱 Mobile First:** Giao diện tối ưu hoàn hảo cho điện thoại.
- **✨ Hiệu ứng cao cấp:** Sử dụng Framer Motion cho các hiệu ứng chuyển động mượt mà, Skeleton Loading cho trải nghiệm tải trang không bị khựng.
- **📩 Tương tác thời gian thực:** Nhận RSVP (Xác nhận tham dự) và Lời chúc trực tiếp.

### 4. Quản trị & Vận hành (Admin & Ops)
- **🚫 Double Lock System:** Cơ chế khóa tài khoản triệt để. Khi Admin khóa một cặp đôi, hệ thống sẽ:
    1. Ngăn không cho đăng nhập.
    2. Vô hiệu hóa ngay lập tức trang công khai của thiệp đó.
- **📧 Thông báo tự động:** Gửi Email chào mừng khi đăng ký và thông báo RSVP mới cho cặp đôi qua Spring Mail.
- **👮 Chống Spam:** Tích hợp Redis Rate Limiting ngăn chặn việc ném bom (spam) lời chúc hoặc RSVP.

---

## 🏛 Kiến Trúc Hệ Thống (Architecture)

Hệ thống bao gồm các dịch vụ độc lập giao tiếp qua nội bộ:

| Service | Mô tả | Port |
| --- | --- | --- |
| **Eureka Server** | Trung tâm quản lý và định danh các service. | `8761` |
| **API Gateway** | Cửa ngõ duy nhất xử lý Routing, CORS, và JWT Filter. | `8080` |
| **IAM Service** | Quản lý User, Auth, và gửi Email. | `8081` |
| **Wedding Core** | Lưu trữ dữ liệu thiệp, xử lý hình ảnh, tọa độ và QR Code. | `8082` |
| **Interaction** | Xử lý RSVP, lời chúc, đếm lượt xem và Rate Limiting. | `8083` |
| **Frontend** | Website Next.js 14 cho cả Admin, Couple và Public. | `3000` |

---

## ⚡ Phát triển & Cài đặt (Installation)

### 🐳 Cách 1: Chạy nhanh bằng Docker (Khuyên dùng)

**Bước 1:** Chuẩn bị file `.env` (Dựa trên `.env.example`).
**Bước 2:** Chạy lệnh:
```bash
docker-compose up -d --build
```
*Hệ thống sẽ tự động build và chạy tất cả 5 service, MySQL, và Redis.*

### 🚀 Cách 2: Chế độ phát triển nhanh (Hot-Reload)
Dành cho lập trình viên muốn sửa code frontend và thấy kết quả ngay lập tức:
```bash
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```
*Lưu ý: Chế độ này yêu cầu file `docker-compose.dev.yml` và `Dockerfile.dev` trong thư mục frontend.*

### 🛠 Cách 3: Chạy thủ công (Manual)
1. **Backend:** Vào từng thư mục service (`iam-service`, `wedding-core-service`, v.v.) chạy `./mvnw spring-boot:run`.
2. **Frontend:** Vào thư mục `wedding-frontend`, chạy `npm install` và `npm run dev`.

---

## 📁 Cấu trúc thư mục (Project Structure)

```text
wedding-microservices/
├── common-lib/           # Thư viện dùng chung (Exception, DTO, Security)
├── api-gateway/          # Spring Cloud Gateway
├── eureka-server/        # Service Registry
├── iam-service/          # Identity & Access Management
├── wedding-core-service/ # Dịch vụ cốt lõi quản lý thiệp
├── interaction-service/  # Dịch vụ tương tác khách mời
└── wedding-frontend/     # Next.js 14 Frontend
```

---

## 🛠 Tech Stack sử dụng

- **Backend:** Java 17, Spring Boot 3.2, Spring Cloud (Eureka, Gateway, OpenFeign).
- **Database:** MySQL 8.0, Redis (Caching & Rate Limiting).
- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **DevOps:** Docker, Docker Compose.
- **Integrations:** VietQR API, Google Maps, Spring Mail.

---

## 🤝 Liên hệ & Phát triển

Dự án được phát triển bởi **Bùi Minh Hiếu**. Nếu bạn có thắc mắc hoặc muốn đóng góp ý tưởng, vui lòng liên hệ qua email hoặc GitHub cá nhân.

---
*Chúc các cặp đôi có một ngày cưới thật hạnh phúc với sự hỗ trợ từ nền tảng của chúng tôi! 🥂*
