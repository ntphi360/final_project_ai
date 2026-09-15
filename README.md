# HỆ THỐNG AI CẢNH BÁO HỒ SƠ TRỄ HẠN

Hệ thống hỗ trợ theo dõi, dự đoán thời gian xử lý và cảnh báo nguy cơ trễ hạn đối với hồ sơ hành chính.

Project sử dụng mô hình Machine Learning để dự đoán thời gian xử lý dự kiến của hồ sơ dựa trên dữ liệu lịch sử, sau đó kết hợp với thời hạn xử lý để hỗ trợ cán bộ theo dõi và đưa ra cảnh báo.

---

## 1. Công nghệ sử dụng

### Frontend

- React
- JavaScript
- Vite
- Tailwind CSS
- Redux Toolkit
- React Router DOM
- Axios
- Recharts
- Lucide React

### Backend

- FastAPI
- Python
- SQLAlchemy 2.x
- Pydantic v2
- Alembic
- Pandas
- NumPy
- scikit-learn
- CatBoost
- XGBoost

### Database

- Microsoft SQL Server
- SQL Server Express
- ODBC Driver 18

### Notification

- Email: FastAPI-Mail + Gmail SMTP
- SMS: TextBee

---

## 2. Chức năng chính

Hệ thống hiện hỗ trợ:

- Đăng nhập và phân quyền người dùng
- Quản lý người dùng
- Quản lý cán bộ xử lý
- Import dữ liệu hồ sơ từ Excel
- Theo dõi hồ sơ đang xử lý
- Theo dõi hồ sơ đã hoàn thành
- Giao việc cho cán bộ
- Tiếp nhận / từ chối công việc
- Dự đoán thời gian xử lý hồ sơ bằng AI
- Đánh giá nguy cơ trễ hạn
- Dashboard tổng quan
- Báo cáo thống kê
- Xác nhận hồ sơ
- Theo dõi thêm hồ sơ
- Gửi Email cảnh báo
- Gửi SMS cảnh báo
- Xử lý xác nhận nhiều hồ sơ cùng lúc

---

# 3. AI Prediction

Model hiện tại:

```text
V3 Hybrid Mixture-of-Experts