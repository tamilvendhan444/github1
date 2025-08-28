import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
const router = Router();
const idParamSchema = { params: (z.object({ id: z.string().uuid() })) };
router.get('/', async (_req, res) => {
    const items = await prisma.menuItem.findMany({ where: { isAvailable: true }, orderBy: { name: 'asc' } });
    return res.json(items);
});
const upsertSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional().nullable(),
    priceCents: z.number().int().positive(),
    imageUrl: z.string().url().optional().nullable(),
    isAvailable: z.boolean().optional(),
});
router.post('/', requireAuth('admin'), async (req, res) => {
    try {
        const data = upsertSchema.parse(req.body);
        const item = await prisma.menuItem.create({
            data: {
                name: data.name,
                description: data.description ?? null,
                priceCents: data.priceCents,
                imageUrl: data.imageUrl ?? null,
                isAvailable: data.isAvailable ?? true,
            },
        });
        return res.json(item);
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
});
router.put('/:id', requireAuth('admin'), async (req, res) => {
    try {
        const { id } = idParamSchema.params.parse(req.params);
        const input = upsertSchema.partial().parse(req.body);
        const data = {};
        if (input.name !== undefined)
            data.name = input.name;
        if (input.description !== undefined)
            data.description = input.description ?? null;
        if (input.priceCents !== undefined)
            data.priceCents = input.priceCents;
        if (input.imageUrl !== undefined)
            data.imageUrl = input.imageUrl ?? null;
        if (input.isAvailable !== undefined)
            data.isAvailable = input.isAvailable;
        const item = await prisma.menuItem.update({ where: { id }, data });
        return res.json(item);
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
});
router.delete('/:id', requireAuth('admin'), async (req, res) => {
    try {
        const { id } = idParamSchema.params.parse(req.params);
        await prisma.menuItem.delete({ where: { id } });
        return res.json({ ok: true });
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
});
export default router;
//# sourceMappingURL=menu.js.map