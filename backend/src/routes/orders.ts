import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { requireAuth } from '../middleware/auth';
import { createQrToken, generateQrPngDataUrl } from '../utils/qr';

const router = Router();
const idParamSchema = z.object({ id: z.string().uuid() });

const createOrderSchema = z.object({
  items: z.array(z.object({ id: z.string().uuid(), quantity: z.number().int().positive() })).min(1),
});

router.post('/', requireAuth('student'), async (req, res) => {
  try {
    const parsed = createOrderSchema.parse(req.body);
    const menuItems = await prisma.menuItem.findMany({ where: { id: { in: parsed.items.map(i => i.id) } } });
    if (menuItems.length !== parsed.items.length) return res.status(400).json({ error: 'Invalid items' });
    const totalCents = parsed.items.reduce((sum, i) => {
      const item = menuItems.find(m => m.id === i.id)!;
      return sum + item.priceCents * i.quantity;
    }, 0);
    const qrCodeToken = createQrToken();
    const order = await prisma.order.create({
      data: {
        studentId: (req as any).user.id,
        totalCents,
        status: 'PENDING',
        paymentRef: `upi_${Date.now()}`,
        qrCodeToken,
        items: {
          create: parsed.items.map(i => ({
            menuItemId: i.id,
            quantity: i.quantity,
            unitPriceCents: menuItems.find(m => m.id === i.id)!.priceCents,
          })),
        },
      },
      include: { items: { include: { menuItem: true } } },
    });
    const qrUrl = await generateQrPngDataUrl(JSON.stringify({ t: qrCodeToken, o: order.id }));
    return res.json({ order, qrUrl, upi: { deeplink: `upi://pay?pn=FoodCourt&pa=${process.env.PAYMENT_UPI_ID}&am=${(totalCents/100).toFixed(2)}&tn=Order%20${order.id}` } });
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

router.post('/:id/pay-success', requireAuth('student'), async (req, res) => {
  try {
    const { id } = idParamSchema.parse(req.params);
    const order = await prisma.order.update({ where: { id }, data: { status: 'PAID' } });
    return res.json(order);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }
});

router.get('/me', requireAuth('student'), async (req, res) => {
  const orders = await prisma.order.findMany({ where: { studentId: (req as any).user.id }, orderBy: { createdAt: 'desc' } });
  return res.json(orders);
});

export default router;
