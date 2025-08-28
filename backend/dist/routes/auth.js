import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { signToken } from '../middleware/auth';
import { config } from '../config/env';
const router = Router();
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(process.cwd(), config.uploadDir);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
        cb(null, name);
    },
});
const upload = multer({ storage });
const registerSchema = z.object({
    name: z.string().min(2),
    rollNo: z.string().min(2),
    email: z.string().email().optional().nullable(),
    password: z.string().min(6),
});
router.post('/register', upload.single('idCard'), async (req, res) => {
    try {
        const parsed = registerSchema.parse(req.body);
        if (!req.file)
            return res.status(400).json({ error: 'ID card image required' });
        const passwordHash = await bcrypt.hash(parsed.password, 10);
        const student = await prisma.student.create({
            data: {
                name: parsed.name,
                rollNo: parsed.rollNo,
                email: parsed.email ?? null,
                passwordHash,
                idCardUrl: path.join(config.uploadDir, req.file.filename),
            },
        });
        const token = signToken({ id: student.id, email: student.email, role: 'student' });
        return res.json({ token, student });
    }
    catch (e) {
        return res.status(400).json({ error: e.message || 'Invalid input' });
    }
});
const loginSchema = z.object({
    rollNo: z.string(),
    password: z.string(),
});
router.post('/login', async (req, res) => {
    try {
        const parsed = loginSchema.parse(req.body);
        const student = await prisma.student.findUnique({ where: { rollNo: parsed.rollNo } });
        if (!student)
            return res.status(401).json({ error: 'Invalid credentials' });
        const ok = await bcrypt.compare(parsed.password, student.passwordHash);
        if (!ok)
            return res.status(401).json({ error: 'Invalid credentials' });
        const token = signToken({ id: student.id, email: student.email, role: 'student' });
        return res.json({ token, student });
    }
    catch (e) {
        return res.status(400).json({ error: e.message });
    }
});
export default router;
//# sourceMappingURL=auth.js.map