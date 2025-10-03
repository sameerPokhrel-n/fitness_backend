import { Response } from 'express';


const COOKIE_NAME = 'refreshToken';


export function setRefreshCookie(res: Response, token: string, days = 7) {
const secure = process.env.COOKIE_SECURE === 'true';
res.cookie(COOKIE_NAME, token, {
httpOnly: true,
sameSite: 'lax',
secure,
maxAge: days * 24 * 60 * 60 * 1000
});
}


export function clearRefreshCookie(res: Response) {
res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true' });
}


export function readRefreshCookie(req: any) {
return req.cookies?.[COOKIE_NAME];
}