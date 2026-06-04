# BÁO CÁO CÔNG NGHỆ: THIẾT KẾ VÀ TRIỂN KHAI HẠ TẦNG HỆ THỐNG
## DỰ ÁN: TRAVELLO – NỀN TẢNG DU LỊCH VÀ ĐẶT VÉ TRỰC TUYẾN
---
**Học phần:** Đồ án Tốt nghiệp / Đồ án Chuyên ngành  
**Môi trường triển khai:** Microsoft Azure Cloud Service  
**Hệ điều hành máy chủ:** Ubuntu Server 22.04 LTS  
**Cấu hình phần cứng:** Standard B2ats v2 (2 vCPUs, 1 GiB Physical RAM, 28 GiB Premium SSD)

---

## MỤC LỤC
1. [CHƯƠNG I: MỞ ĐẦU](#1-chuong-i-mo-dau)
   - 1.1. Tổng quan hệ thống Travello
   - 1.2. Mục tiêu thiết kế hạ tầng triển khai
2. [CHƯƠNG II: KIẾN TRÚC HẠ TẦNG HỆ THỐNG (SYSTEM ARCHITECTURE)](#2-chuong-ii-kien-truc-ha-tang-he-thong-system-architecture)
   - 2.1. Mô hình triển khai vật lý (Physical Deployment Model)
   - 2.2. Cơ chế định tuyến Reverse Proxy của Nginx Host
   - 2.3. Giải pháp Container hóa (Docker Containerization)
   - 2.4. Sơ đồ luồng dữ liệu mạng (Network Data Flow Diagram)
3. [CHƯƠNG III: CẤU HÌNH CHI TIẾT VÀ TỐI ƯU HÓA HẠ TẦNG](#3-chuong-iii-cau-hinh-chi-tiet-va-toi-uu-hoa-ha-tang)
   - 3.1. Kỹ thuật Multi-stage Build trong Dockerfile
   - 3.2. Cấu hình Nginx Host bảo mật và tối ưu hiệu năng
   - 3.3. Điều phối container bằng Docker Compose
4. [CHƯƠNG IV: PHÂN TÍCH VÀ KHẮC PHỤC SỰ CỐ HIỆU NĂNG TRÊN PHẦN CỨNG GIỚI HẠN](#4-chuong-iv-phan-tich-va-khac-phuc-su-co-hieu-nang-tren-phan-cung-gioi-han)
   - 4.1. Kỹ thuật bộ nhớ ảo Swap Space giải quyết bài toán sập hệ thống (OOM)
   - 4.2. Cấu hình Heap Memory trong công cụ V8 Node.js ứng phó giới hạn container
5. [CHƯƠNG V: QUY TRÌNH VẬN HÀNH VÀ BẢO TRÌ HỆ THỐNG (OPERATIONS & MAINTENANCE)](#5-chuong-v-quy-trinh-van-hanh-va-bao-tri-he-thong-operations--maintenance)
   - 5.1. Các kịch bản quản trị hệ thống bằng Shell Script
   - 5.2. Công cụ giám sát thời gian thực và quản lý tài nguyên

---

## 1. CHƯƠNG I: MỞ ĐẦU

### 1.1. Tổng quan hệ thống Travello
Travello là một ứng dụng web phức hợp (Single Page Application - SPA) được phát triển trên nền tảng React 19, Vite, TypeScript, TailwindCSS v4 và shadcn/ui. Ứng dụng tích hợp các tính năng thời gian thực thông qua kết nối WebSocket (STOMP/SockJS), kết hợp gọi các API nghiệp vụ từ cổng dịch vụ Spring Boot và sử dụng kho lưu trữ MySQL độc lập trên nền tảng điện toán đám mây.

### 1.2. Mục tiêu thiết kế hạ tầng triển khai
Mục tiêu chính khi thiết kế hạ tầng phục vụ triển khai cho dự án Travello bao gồm:
* **Tối đa hiệu năng phần cứng:** Sử dụng máy ảo dòng tiết kiệm chi phí trên Azure nhưng vẫn duy trì độ phản hồi ứng dụng nhanh chóng.
* **Đảm bảo tính bảo mật (Security):** Thiết lập cấu hình bảo vệ tầng biên thông qua tường lửa, cấu hình tiêu đề HTTP nghiêm ngặt, ẩn giấu cấu trúc mạng nội bộ của Docker.
* **Khả năng bảo trì cao (Maintainability):** Tự động hóa các thao tác build, cập nhật phiên bản mới, rollback thông qua các script tự động và docker-compose.
* **Tối ưu hóa tài nguyên phân phối:** Nén tài nguyên tĩnh và tận dụng cơ chế bộ nhớ đệm (caching) ở cấp độ trình duyệt của người dùng.

---

## 2. CHƯƠNG II: KIẾN TRÚC HẠ TẦNG HỆ THỐNG (SYSTEM ARCHITECTURE)

### 2.1. Mô hình triển khai vật lý (Physical Deployment Model)
Để đạt được hiệu năng cao nhất trên dòng máy chủ Standard B2ats v2 (chỉ có 1 GiB RAM), toàn bộ mã nguồn React được biên dịch tĩnh (Static Build) và đóng gói vào một container siêu nhẹ phục vụ bởi máy chủ web Nginx tối giản (Alpine). Hạ tầng được tổ chức thành hai vùng rõ rệt:

```
[Mạng Internet Công Cộng]
        │  HTTP (Cổng 80) / HTTPS (Cổng 443)
        ▼
┌────────────────────────────────────────────────────────┐
│ MÁY CHỦ VẬT LÝ / VM (Host OS - Ubuntu 22.04 LTS)        │
│                                                        │
│ ┌────────────────────────┐                             │
│ │   Nginx (Host Level)   │                             │
│ └──────────┬─────────────┘                             │
│            │ proxy_pass http://127.0.0.1:3000          │
│            ▼                                           │
│ ┌────────────────────────────────────────────────────┐ │
│ │ DOCKER NETWORK (Cầu nối Bridge nội bộ)              │ │
│ │                                                    │ │
│ │  ┌──────────────────────────────────────────────┐  │ │
│ │  │ Container: travello_frontend                  │  │ │
│ │  │ - Cổng dịch vụ (Nội bộ): 80                  │  │ │
│ │  │ - Cổng ánh xạ (Host): 3000                  │  │ │
│ │  │ - Server Web: Nginx (Alpine OS)              │  │ │
│ │  │ - Chức năng: Phục vụ Static Files (.js, .css)│  │ │
│ │  └──────────────────────────────────────────────┘  │ │
│ └────────────────────────────────────────────────────┘ │
└──────────────────────────┬─────────────────────────────┘
                           │
                           │ Gọi API HTTP / WebSocket
                           ▼
┌────────────────────────────────────────────────────────┐
│ CÁC DỊCH VỤ LIÊN KẾT NGOÀI (EXTERNAL SERVICES)         │
│                                                        │
│ - API Gateway / Backend: Spring Boot (Cổng 8080)       │
│ - Cơ sở dữ liệu: Managed MySQL (Aiven Cloud)           │
│ - Quản lý File: Amazon S3 Bucket                       │
│ - Dịch vụ Trí tuệ Nhân tạo: Gemini API v1.5-flash      │
└────────────────────────────────────────────────────────┘
```

### 2.2. Cơ chế định tuyến Reverse Proxy của Nginx Host
Cơ chế Reverse Proxy cấp độ máy chủ đóng vai trò cực kỳ quan trọng:
* **Ẩn giấu cổng dịch vụ nội bộ:** Người dùng chỉ tương tác trực tiếp qua cổng chuẩn HTTP/HTTPS. Cổng thực của Docker container (Port 3000) được đóng hoàn toàn đối với bên ngoài thông qua cấu hình Firewall.
* **Quản lý SSL tập trung:** Khi cấu hình HTTPS bằng Let's Encrypt (Certbot), chứng chỉ SSL được cài đặt và quản trị tập trung tại Nginx Host. Nginx Host thực hiện giải mã SSL (SSL Termination) rồi truyền dữ liệu sạch qua mạng loopback HTTP nội bộ vào container, giảm tải xử lý mã hóa cho Docker container.

### 2.3. Giải pháp Container hóa (Docker Containerization)
Tất cả các thành phần chạy mã nguồn đều được cô lập bên trong Docker Container. Việc sử dụng Docker giúp:
* Đồng nhất môi trường chạy giữa máy tính lập trình (Local Dev) và máy chủ đám mây (Azure Production).
* Tránh tình trạng xung đột thư viện Node.js hay lỗi phiên bản runtime trên OS máy chủ.
* Dễ dàng nâng cấp hoặc gỡ bỏ ứng dụng mà không để lại rác phần mềm trong hệ điều hành máy chủ.

### 2.4. Sơ đồ luồng dữ liệu mạng (Network Data Flow Diagram)
1. **Truy cập tài nguyên giao diện:** Trình duyệt người dùng gửi yêu cầu HTTP đến IP `70.153.25.116` cổng 80 -> Nginx Host tiếp nhận -> Nối tiếp dữ liệu vào container `travello_frontend` cổng 3000 -> Nginx container phản hồi các file HTML/JS/CSS đã nén Gzip.
2. **Giao tiếp nghiệp vụ (API):** Client tải thành công mã giao diện về máy cá nhân -> Trực tiếp tạo các luồng XMLHttp/Fetch API gửi đến `http://52.193.141.173:8080` (Backend API).
3. **Kết nối thời gian thực (Websocket):** Trình duyệt nâng cấp kết nối từ HTTP lên WebSocket để duy trì phòng chat thời gian thực qua giao thức STOMP kết nối thẳng đến Backend Server.

---

## 3. CHƯƠNG III: CẤU HÌNH CHI TIẾT VÀ TỐI ƯU HÓA HẠ TẦNG

### 3.1. Kỹ thuật Multi-stage Build trong Dockerfile
Để tối ưu hóa dung lượng đĩa cứng trên máy chủ và rút ngắn thời gian deploy, dự án áp dụng kỹ thuật **Multi-stage Build** chia Dockerfile thành hai giai đoạn rõ rệt:

* **Giai đoạn 1: Build Image (Sử dụng Node.js 20 Alpine)**
  - Tải toàn bộ mã nguồn, thực hiện phân tích cú pháp TypeScript và biên dịch toàn bộ mã sang JavaScript thuần nén bằng công cụ đóng gói Vite.
  - Dung lượng trong giai đoạn này nặng khoảng **~550MB** do chứa hàng ngàn thư viện trong thư mục `node_modules` và trình biên dịch.
* **Giai đoạn 2: Production Image (Sử dụng Nginx Stable Alpine)**
  - Chỉ copy duy nhất thư mục đích `/dist` (kết quả của giai đoạn 1, dung lượng chỉ khoảng **~30MB**) và loại bỏ hoàn toàn mã nguồn gốc, các thư viện NodeJS và trình biên dịch.
  - Kết quả là Docker Image cuối cùng chạy trên Azure cực kỳ nhẹ, tối ưu bộ nhớ đệm RAM và ổ đĩa của máy chủ.

#### *Chi tiết File cấu hình `Frontend/Dockerfile`:*
```dockerfile
# ── Giai đoạn 1: Build React + Vite app ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

ARG VITE_API_DEPLOY_URL
ARG VITE_MAPBOX_TOKEN
ENV VITE_API_DEPLOY_URL=${VITE_API_DEPLOY_URL}
ENV VITE_MAPBOX_TOKEN=${VITE_MAPBOX_TOKEN}

# Tăng giới hạn bộ nhớ V8 tránh lỗi OOM trong quá trình build React
ENV NODE_OPTIONS="--max-old-space-size=1536"
RUN npm run build

# ── Giai đoạn 2: Khởi chạy môi trường Production siêu nhẹ ──
FROM nginx:stable-alpine AS production
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.prod.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### 3.2. Cấu hình Nginx Host bảo mật và tối ưu hiệu năng
File cấu hình Nginx trên host VM được thiết lập để tối ưu hóa bảo mật và tốc độ truyền tải tài nguyên tĩnh thông qua các cấu hình nâng cao sau:

* **Gzip Compression:** Nén toàn bộ mã JS, CSS, JSON bằng thuật toán Gzip trước khi gửi qua môi trường mạng, giúp giảm tới 70% băng thông và tăng tốc độ tải trang trên thiết bị di động.
* **Security Headers:**
  - `X-Frame-Options "SAMEORIGIN"`: Phòng chống tấn công giả mạo giao diện (Clickjacking).
  - `X-Content-Type-Options "nosniff"`: Chặn trình duyệt tự ý đoán định dạng file không an toàn.
  - `Referrer-Policy`: Giới hạn thông tin đường dẫn nguồn được gửi đi khi chuyển tiếp trang.

#### *Chi tiết File cấu hình `deploy/nginx.conf`:*
```nginx
server {
    listen 80;
    server_name 70.153.25.116;

    # Cấu hình Header bảo mật
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Định tuyến cổng dịch vụ nội bộ vào Docker Container
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;

        # Hỗ trợ Websocket định tuyến động
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Forward IP thực tế của client vào trong Docker
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Bật tính năng nén Gzip tối ưu đường truyền mạng
    gzip on;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    client_max_body_size 20M;
}
```

---

### 3.3. Điều phối container bằng Docker Compose
Việc quản lý container thông qua `docker-compose.yml` giúp đơn giản hóa việc triển khai và hỗ trợ cơ chế tự phục hồi lỗi (Healthcheck) cùng cơ chế khởi động lại thông minh.

#### *Chi tiết File cấu hình `docker-compose.yml`:*
```yaml
services:
  frontend:
    build:
      context: ./Frontend
      dockerfile: Dockerfile
      args:
        VITE_API_DEPLOY_URL: ${VITE_API_DEPLOY_URL}
        VITE_MAPBOX_TOKEN: ${VITE_MAPBOX_TOKEN}
    container_name: travello_frontend
    restart: unless-stopped
    ports:
      - "3000:80"
    networks:
      - travello_net
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s

networks:
  travello_net:
    driver: bridge
```

---

## 4. CHƯƠNG IV: PHÂN TÍCH VÀ KHẮC PHỤC SỰ CỐ HIỆU NĂNG TRÊN PHẦN CỨNG GIỚI HẠN

### 4.1. Kỹ thuật bộ nhớ ảo Swap Space giải quyết bài toán sập hệ thống (OOM)
Trong lần chạy thử nghiệm đầu tiên, tiến trình build gặp lỗi đứng máy hoàn toàn (Freeze). Phân tích logs cho thấy lỗi sập hệ thống do tràn RAM vật lý (Out of Memory - OOM). Hệ điều hành Linux buộc phải kích hoạt cơ chế OOM Killer để tắt tiến trình Docker Daemon để bảo vệ phần cứng.

**Giải pháp:** Áp dụng cơ chế Swap Space. Chúng tôi tạo một tệp tin ảo dung lượng 2 GiB trên ổ đĩa SSD của máy ảo để mở rộng bộ nhớ khi RAM thật cạn kiệt.

```bash
# Tạo file swap trống dung lượng 2GB
sudo fallocate -l 2G /swapfile

# Giới hạn quyền chỉ cho phép hệ điều hành đọc ghi tệp tin swap
sudo chmod 600 /swapfile

# Định dạng tệp tin thành định dạng swap phân trang của Linux
sudo mkswap /swapfile

# Kích hoạt swap hoạt động tức thời
sudo swapon /swapfile

# Ghi cấu hình vào fstab để duy trì swap ngay cả khi khởi động lại VM
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

**Kết quả đánh giá:** Hệ thống sau khi được cấu hình Swap đã vượt qua được tất cả các bước cài đặt thư viện NodeJS nặng mà không hề bị đứng máy, độ ổn định của máy ảo đạt 100%.

---

### 4.2. Cấu hình Heap Memory trong công cụ V8 Node.js ứng phó giới hạn container
Ngay cả khi kích hoạt Swap, trình build vẫn có thể bị sập với mã lỗi `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory`. 

**Nguyên nhân:** Engine V8 của Node.js khi chạy bên trong Docker Container tự động phát hiện RAM vật lý khả dụng thực tế của VM rất thấp (chỉ 1 GiB), từ đó tự cấu hình một ngưỡng trần an toàn (Heap Limit) tương đối thấp (khoảng ~450MB) để tránh làm sập RAM của máy chủ. Khi chạy biên dịch Vite tích hợp nhiều module nghiệp vụ phức tạp, lượng tài nguyên RAM vượt qua mức giới hạn mặc định này làm trình biên dịch crash ngay lập tức.

**Giải pháp:** Nâng ngưỡng trần giới hạn này bằng cách truyền biến môi trường trực tiếp vào môi trường build của Dockerfile:
```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=1536"
```
Cấu hình này cho phép V8 Engine của Node.js mở rộng sử dụng heap lên tới 1.5 GiB. Lúc này hệ thống sẽ tận dụng 846MB RAM vật lý và tự động tràn dữ liệu thừa sang 2GB Swap ảo đã cấu hình trên ổ cứng mà không còn bị chặn bởi cơ chế an toàn mặc định của V8. Tiến trình build React hoàn thành thành công trong vòng **70 giây**.

---

## 5. CHƯƠNG V: QUY TRÌNH VẬN HÀNH VÀ BẢO TRÌ HỆ THỐNG (OPERATIONS & MAINTENANCE)

Hệ thống được thiết kế tích hợp các script tự động hóa viết bằng ngôn ngữ Shell Script để chuẩn hóa quá trình vận hành, giúp giảm thiểu rủi ro thao tác sai của con người trong quá trình bảo trì.

### 5.1. Các kịch bản quản trị hệ thống bằng Shell Script

#### 1. Script Cập nhật mã nguồn và Deploy tự động (`deploy/update.sh`):
Mỗi khi có phiên bản code mới được đẩy lên nhánh `main`, người vận trị chỉ cần chạy duy nhất 1 lệnh trên máy chủ để tự động hóa toàn bộ quy trình tích hợp liên tục (CI/CD):
```bash
#!/bin/bash
set -euo pipefail
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

# Kéo mã nguồn mới nhất từ GitHub
git pull origin main

# Xây dựng lại Docker Image bỏ qua cache để đảm bảo code mới nhất được cập nhật
docker compose build --no-cache

# Khởi động lại container ở chế độ background
docker compose up -d
```

#### 2. Script Quản lý Log lỗi thời gian thực (`deploy/logs.sh`):
Giúp lọc và theo dõi hành vi chạy của container:
```bash
#!/bin/bash
LINES=${1:-100}
docker logs travello_frontend --tail "$LINES" --follow
```

---

### 5.2. Công cụ giám sát thời gian thực và quản lý tài nguyên
Để kiểm tra tính toàn vẹn và mức độ tiêu thụ tài nguyên của ứng dụng trên production, quản trị viên sử dụng các công cụ sau:

1. **Giám sát Docker Container:**
   ```bash
   docker stats travello_frontend
   ```
   Lệnh này hiển thị chi tiết thời gian thực phần trăm CPU, lượng RAM sử dụng của container frontend để đánh giá tải.

2. **Kiểm tra trạng thái bộ nhớ RAM và bộ nhớ đệm ảo:**
   ```bash
   free -h
   ```

3. **Giám sát kết nối cổng mạng Nginx:**
   ```bash
   sudo netstat -tulpn | grep nginx
   ```
   Đảm bảo cổng 80 đang hoạt động chính xác và lắng nghe các request từ mạng Internet bên ngoài.

---
**KẾT LUẬN**  
Kiến trúc triển khai sử dụng Nginx Reverse Proxy kết hợp với giải pháp ảo hóa Docker Container và cấu hình tối ưu bộ nhớ ảo (Swap + Heap Size) đã giúp ứng dụng Travello vận hành ổn định trên tài nguyên phần cứng cực kỳ tiết kiệm của Azure Cloud VM. Đây là mô hình triển khai thực tế tối ưu, an toàn, dễ bảo trì và có giá trị áp dụng thực tiễn cao cho các dự án phần mềm quy mô vừa và nhỏ.
