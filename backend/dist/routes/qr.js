import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
const router = Router();
const scanSchema = z.union([
    z.object({ token: z.string().min(8) }),
    z.object({ qrData: z.string().min(10) }),
]);
router.post('/scan', async (req, res) => {
    try {
        const parsed = scanSchema.parse(req.body);
        let token = null;
        if ('token' in parsed)
            token = parsed.token;
        if ('qrData' in parsed) {
            try {
                const data = JSON.parse(parsed.qrData);
                token = data.t || data.token || null;
            }
            catch { }
        }
        if (!token)
            return res.status(400).json({ error: 'Invalid QR data' });
        const order = await prisma.order.findFirst({ where: { qrCodeToken: token } });
        if (!order)
            return res.status(404).json({ error: 'Order not found' });
        if (order.status !== 'PAID') {
            await prisma.qrScanLog.create({ data: { orderId: order.id, token, isDuplicate: false } });
            return res.status(400).json({ error: 'Order not paid' });
        }
        if (order.qrScanCount >= 1) {
            await prisma.$transaction([
                prisma.order.update({ where: { id: order.id }, data: { qrScanCount: { increment: 1 } } }),
                prisma.qrScanLog.create({ data: { orderId: order.id, token, isDuplicate: true } }),
            ]);
            return res.status(409).json({ duplicate: true, message: 'Duplicate Receipt' });
        }
        const updated = await prisma.$transaction([
            prisma.order.update({ where: { id: order.id }, data: { qrScannedAt: new Date(), qrScanCount: { increment: 1 } } }),
            prisma.qrScanLog.create({ data: { orderId: order.id, token, isDuplicate: false } }),
        ]);
        return res.json({ ok: true, orderId: order.id, scannedAt: updated[0].qrScannedAt });
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
});
export default router;
//# sourceMappingURL=qr.js.map