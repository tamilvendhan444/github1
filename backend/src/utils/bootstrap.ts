import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export async function ensureDefaultAdmin() {
	const email = process.env.ADMIN_EMAIL || 'admin@example.com';
	const password = process.env.ADMIN_PASSWORD || 'admin123';
	const existing = await prisma.adminUser.findUnique({ where: { email } });
	if (!existing) {
		const passwordHash = await bcrypt.hash(password, 10);
		await prisma.adminUser.create({ data: { email, passwordHash } });
		console.log(`Created default admin ${email}`);
	}
}
