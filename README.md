# Student Food Ordering WebApp

End-to-end web application with:
- Student app: registration (ID upload), login, menu, cart, checkout, UPI link, digital receipt QR (one-time scan)
- Admin dashboard: login, live orders, totals, status updates, duplicate QR logs, QR scanner
- Tech: Next.js (TS, Tailwind), Node.js (Express, TS), Prisma (SQLite dev / Postgres prod), JWT, Multer, QRCode, html5-qrcode

## Quickstart (Local, no Docker)

Prereqs: Node.js 20+, npm.

1. Backend
   - cd backend
   - cp .env .env.local (optional). Ensure:
     - DATABASE_URL="file:./dev.db"
     - JWT_SECRET set
   - npm install
   - npx prisma migrate dev --name init
   - npm run dev
   - Health: http://localhost:4000/health
   - Default admin seeded: admin@example.com / admin123 (change via env)

2. Frontend
   - cd frontend
   - npm install
   - npm run dev
   - UI: http://localhost:3000
   - Student flows: /student/register, /student/login, /student/menu
   - Admin flows: /admin/login, /admin/dashboard (start scanner and scan student receipt QR)

## UPI / GPay Integration
- The checkout returns a UPI deeplink (`upi://pay?...`). Replace `PAYMENT_UPI_ID` in backend `.env` with your UPI ID.
- Mark payment success triggers one-time QR generation and marks order as PAID. Admin scanning validates one-time use and logs duplicates.

## Production Notes
- Use Postgres by setting `DATABASE_URL` to your connection string and running `prisma migrate deploy`.
- Set strong JWT_SECRET and store uploads on object storage (S3, GCS) behind a CDN.
- Use HTTPS and secure CORS origins.
- Build backend: `npm run build` then `node dist/server.js`.
- Docker images provided in `backend/Dockerfile` and `frontend/Dockerfile`. Adjust `docker-compose.yml` as needed.

## Security
- JWT auth for student and admin, role-based middleware.
- Input validation via Zod.
- Rate limiting and Helmet.
- Multer for safe file handling; validate and virus-scan in production.

## Database Models (Prisma)
- Students, MenuItem, Order, OrderItem, AdminUser, QrScanLog.
- Single-use QR: `Order.qrScanCount >= 1` => duplicate.

## License
MIT
