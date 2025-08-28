import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface AuthPayload {
	id: string;
	email?: string | null;
	role: 'student' | 'admin';
}

export function requireAuth(role?: 'student' | 'admin') {
	return (req: Request & { user?: AuthPayload }, res: Response, next: NextFunction) => {
		const header = req.headers.authorization;
		if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
		const token = header.substring(7);
		try {
			const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
			if (role && payload.role !== role) return res.status(403).json({ error: 'Forbidden' });
			req.user = payload;
			return next();
		} catch {
			return res.status(401).json({ error: 'Invalid token' });
		}
	};
}

export function signToken(payload: AuthPayload) {
	return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}
