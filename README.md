# 💍 Wedding SaaS Platform - Microservices Architecture

Welcome to the **Wedding SaaS Platform**, a modern, highly scalable microservices-based application designed to help couples create, manage, and share their digital wedding invitations effortlessly.

![Wedding SaaS Preview](https://img.shields.io/badge/Status-Active-brightgreen) ![Spring Boot Version](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![MySQL](https://img.shields.io/badge/MySQL-8.0-blue) ![Redis](https://img.shields.io/badge/Redis-7-red)

## 🌟 Có Gì Nổi Bật (Key Features)

Dự án này là một nền tảng SaaS đích thực kết hợp giữa trải nghiệm người dùng hiện đại và một backend mạnh mẽ:

- **🔐 Bảo mật & Quản lý người dùng (IAM):** Đăng nhập/Đăng ký với JWT Token. Stateless authentication phân quyền Admin/Couple chặt chẽ. Hệ thống Blacklist Token khi đăng xuất bằng Redis.
- **🎨 Trải nghiệm giao diện cao cấp (Next.js & Tailwind CSS):** Giao diện quản lý thân thiện. Trang khách mời báo hỷ (`[slug]`) có hiệu ứng cuộn mượt mà (Framer Motion), giao diện phân bố hiện đại, tạo xương chờ tải (Loading Skeleton).
- **🌍 Đa Ngôn Ngữ (i18n):** Tích hợp thông minh các biến hiển thị song ngữ (Anh / Việt) cho thiệp báo hỷ.
- **📍 Trải nghiệm Cặp Đôi (Tùy biến):** Cặp đôi có thể chủ động sửa thông tin cô dâu, chú rể, chọn màu sắc thiệp (Dynamic Theme Colors). Có thể điền địa chỉ riêng biệt Nhà Trai, Nhà Gái hoặc điểm chung, mọi thứ tự map với *Google Maps Platform*. Hình ảnh Gallery trực quan dạng Slider.
- **📲 Tích hợp QR Code:** Hệ thống quét và tự động sinh mã QR tĩnh bằng *Google ZXing*, cho phép chia sẻ thiệp nhanh chóng qua Zalo / Facebook hay in cứng.
- **📩 Thông báo Tự động (Spring Mail):** Hệ thống tự động đẩy Email lời chào khi có người dùng đăng ký mới, tự động báo về email Chủ nhân khi khách mời Xác nhận tham dự (RSVP).
- **📊 Chống Spam & Thống kê Tương tác (Interaction):** Đếm lượt truy cập, nhận Lời chúc. Cơ chế chống quá tải `Rate Limiting` qua Redis tự động chặn IP ném bom RSVP (Max 5/giờ). Đồng thời cấu trúc Phân trang Pagination toàn bộ dữ liệu.
- **🩺 Monitor (Spring Actuator):** Health check System.
- **🐳 Hỗ trợ Docker Compose:** Toàn bộ Infrastructure và Code base chạy trong 1 lệnh deploy duy nhất.

---

## 🏛 Kiến Trúc Hệ Thống (Architecture)

Ứng dụng được thiết kế theo biểu mẫu **Microservices** chạy hệ sinh thái Spring Cloud. Toàn bộ Request đi qua **API Gateway**.

| Component / Service | Vai Trò (Description) | Cổng (Port) | Công Nghệ Chính |
| --- | --- | --- | --- |
| **Eureka Server** | Registry trung tâm quản lý tên miền nội bộ của các Microservice. | `8761` | Spring Cloud Netflix Eureka |
| **API Gateway** | Cửa ngõ Routing chặn CORS, cấp quyền JWT Filter. Gọi Request qua các dịch vụ. Dịch file ảnh. | `8080` | Spring Cloud Gateway, WebFlux |
| **IAM Service** | Authentication (JWT), Quản lý Role (Admin/User), Gửi Email Chào mừng. | `8081` | Spring Data JPA, Spring Security, Mail |
| **Wedding Core Service** | Lưu trữ hồ sơ cưới (Wedding Data), Upload File ảnh (Gallery), Sinh QR Code. | `8082` | Spring Data JPA, Redis Cache, ZXing |
| **Interaction Service** | Nhận tương tác (Thăm viếng, RSVP, Gửi Lời chúc). Thống kê dữ liệu, Gửi Email báo RSVP. | `8083` | Spring Data JPA, Redis Rate Limiting, OpenFeign |
| **Frontend (Next.js)** | Giao diện Web phân tải Admin Dashboard, Couple Dashboard & Trang Thiệp Mời Public. | `3000` | React, Next.js, Framer Motion, Tailwind |

---

## 🚀 Đường Dẫn Ra Sao (Routes & API Path)

Dữ liệu di chuyển qua API Gateway (`localhost:8080`). Dưới đây là các Context Path chính yếu:

- **IAM API**: `http://localhost:8080/api/iam/**`
  - `/auth/login`, `/auth/register`, `/auth/logout`
  - `/admin/users`, `/admin/stats`
- **Wedding Core API**: `http://localhost:8080/api/weddings/**`
  - `/mine` (CRUD Thiệp của mình)
  - `/mine/qr` (Tạo mã QR thiệp)
  - `/public/{slug}` (Lấy thông tin thiệp public)
  - `/uploads/**` (Lấy file ảnh Gallery)
- **Interaction API**: `http://localhost:8080/api/interactions/**`
  - `/public/{weddingId}/visit`
  - `/public/{weddingId}/rsvp`, `/public/{weddingId}/wishes`
  - `/mine/wishes`, `/mine/rsvp` (Dữ liệu Admin/Couple có phân trang)

*Tất cả giao tiếp nội bộ giữa các dịch vụ (như Interaction báo Gửi Mail gọi sang IAM Service) đi bằng Spring Cloud OpenFeign qua kết nối Eureka nội bộ để tăng cường độ an toàn.*

---

## 🔧 Cài đặt ra sao (Installation & Run)

Ứng dụng hoàn toàn tương thích và đóng gói cùng **Docker**.

### Yêu Cầu Cấu Hình
- Java 17, Node.js v18 (Nếu chạy trực tiếp)
- Docker & Docker Compose (Khuyên dùng)
- 3 Database MySQL chạy cổng 3306.
- 1 Redis.

### Hướng dẫn Start nhanh với Docker (Khuyên Dùng)

**Bước 1:** Clone repository
```bash
git clone https://github.com/HieuMap01/wedding-microservices.git
cd wedding-microservices
```

**Bước 2:** Cài đặt Biến Môi trường (Environment Variables)
Sao chép `.env.example` thành `.env` để đặt các tham số mật nhạy cảm:

```bash
cp .env.example .env

# Sửa thông tin tài khoản Email gửi thông báo trong .env
MAIL_USERNAME=buiminhhieu...
MAIL_PASSWORD=your_app_password
APP_MAIL_ADMIN=buiminhhieu...
```

**Bước 3:** Chạy hệ thống bằng Docker Compose
Đảm bảo **Docker Desktop / Docker Engine đang chạy**. Gõ lệnh:

```bash
docker-compose up --build
```
*Ghi chú: Khởi động lần đầu sẽ mất khoảng 2 - 5 phút tùy cấu hình mạng vì Docker cần kéo file ảnh (JDK, Node) và Build toàn bộ Source Code của 5 Microservices + Frontend bằng Multi-stage.*

**Bước 4:** Tận hưởng thành quả
- Mở **Front-end**: `http://localhost:3000`
- API Gateway: `http://localhost:8080`
- Bảng điều khiển Backend Eureka: `http://localhost:8761`
