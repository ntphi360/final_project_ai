# Dashboard cảnh báo hồ sơ trễ hạn bằng AI

Frontend được xây dựng bằng React, Vite, Tailwind CSS, Redux Toolkit, React Router DOM, Axios, Recharts và Lucide React.

## Chạy dự án

```bash
npm install
npm run dev
```

Mở `http://localhost:5173/dashboard`.

## Kết nối FastAPI

Sao chép `.env.example` thành `.env`, đặt `VITE_USE_MOCK_DATA=false` và cập nhật `VITE_API_URL`. Dashboard sẽ gọi `GET /dashboard/overview` qua service Axios trong `src/services/dashboardService.js`.
