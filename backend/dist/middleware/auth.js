import jwt from 'jsonwebtoken';
import { config } from '../config/env';
export function requireAuth(role) {
    return (req, res, next) => {
        const header = req.headers.authorization;
        if (!header?.startsWith('Bearer '))
            return res.status(401).json({ error: 'Unauthorized' });
        const token = header.substring(7);
        try {
            const payload = jwt.verify(token, config.jwtSecret);
            if (role && payload.role !== role)
                return res.status(403).json({ error: 'Forbidden' });
            req.user = payload;
            return next();
        }
        catch {
            return res.status(401).json({ error: 'Invalid token' });
        }
    };
}
export function signToken(payload) {
    return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}
//# sourceMappingURL=auth.js.map