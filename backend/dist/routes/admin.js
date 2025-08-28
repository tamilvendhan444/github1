import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { requireAuth, signToken } from '../middleware/auth';
const router = Router();
const idParam = z.object({ id: z.string().uuid() });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
router.post('/login', async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);
        const admin = await prisma.adminUser.findUnique({ where: { email } });
        if (!admin)
            return res.status(401).json({ error: 'Invalid credentials' });
        const ok = await bcrypt.compare(password, admin.passwordHash);
        if (!ok)
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = signToken({ id: admin.id, email: admin.email, role: 'admin' });
        return res.json({ token });
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
});
router.get('/orders', requireAuth('admin'), async (req, res) => {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        include: { items: { include: { menuItem: true } }, student: true },
    });
    return res.json(orders);
});
const statusSchema = z.object({ status: z.enum(['PENDING', 'PAID', 'DELIVERED']) });
router.patch('/orders/:id/status', requireAuth('admin'), async (req, res) => {
    try {
        const { status } = statusSchema.parse(req.body);
        const { id } = idParam.parse(req.params);
        const order = await prisma.order.update({ where: { id }, data: { status } });
        return res.json(order);
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
});
router.get('/stats', requireAuth('admin'), async (_req, res) => {
    const paid = await prisma.order.findMany({ where: { status: 'PAID' }, select: { studentId: true, totalCents: true } });
    const overall = paid.reduce((s, o) => s + o.totalCents, 0);
    const perStudent = {};
    for (const o of paid)
        perStudent[o.studentId] = (perStudent[o.studentId] || 0) + o.totalCents;
    return res.json({ overallCents: overall, perStudentCents: perStudent });
});
router.get('/logs/qr', requireAuth('admin'), async (_req, res) => {
    const logs = await prisma.qrScanLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { order: true } });
    return res.json(logs);
});
export default router;
//# sourceMappingURL=admin.js.map