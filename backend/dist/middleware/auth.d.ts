import type { Request, Response, NextFunction } from 'express';
export interface AuthPayload {
    id: string;
    email?: string | null;
    role: 'student' | 'admin';
}
export declare function requireAuth(role?: 'student' | 'admin'): (req: Request & {
    user?: AuthPayload;
}, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
export declare function signToken(payload: AuthPayload): string;
//# sourceMappingURL=auth.d.ts.map