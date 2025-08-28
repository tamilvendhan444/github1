import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config/env';
import authRouter from './routes/auth';
import menuRouter from './routes/menu';
import ordersRouter from './routes/orders';
import adminRouter from './routes/admin';
import qrRouter from './routes/qr';
import { ensureDefaultAdmin } from './utils/bootstrap';
const app = express();
app.use(helmet());
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 120 }));
// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), config.uploadDir)));
// API routes
app.use('/api/auth', authRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/qr', qrRouter);
app.get('/health', (_req, res) => {
    res.json({ ok: true });
});
const port = process.env.PORT || 4000;
ensureDefaultAdmin().finally(() => {
    app.listen(port, () => {
        console.log(`API listening on http://localhost:${port}`);
    });
});
//# sourceMappingURL=server.js.map