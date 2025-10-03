import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

export const accessTokenCookieOptions = {
  httpOnly: true,
  // secure: process.env.NODE_ENV === 'production',
  secure: true,
  sameSite: 'lax' as const,
  maxAge: 1 * 60 * 1000, // 15 minutes
  path: '/'
};

export const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/'
};

export function signAccessToken(payload: object) {
  return jwt?.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXP });
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXP });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, ACCESS_SECRET);
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, REFRESH_SECRET);
}
