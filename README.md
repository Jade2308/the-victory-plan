# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
# Chiến Thắng

## Đăng nhập Google

Ứng dụng dùng Supabase Auth. Ngoài `VITE_SUPABASE_URL` và
`VITE_SUPABASE_ANON_KEY`, hãy hoàn tất cấu hình một lần trong dashboard:

1. Trong **Authentication → Providers → Google**, bật Google và nhập OAuth
   Client ID/Client secret từ Google Cloud.
2. Trong Google Cloud, thêm Authorized redirect URI chính xác là
   `https://<project-ref>.supabase.co/auth/v1/callback`.
3. Trong **Authentication → URL Configuration**, thêm URL chạy thực tế của ứng
   dụng vào Redirect URLs (ví dụ `https://your-app-domain.example/`). Với môi
   trường local, thêm `http://127.0.0.1:5173/`.
4. Khi URL trả về khác URL đang mở, đặt `VITE_AUTH_REDIRECT_URL` trong
   `.env.local` bằng URL đó rồi khởi động lại Vite.
