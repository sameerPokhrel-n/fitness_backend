import { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import { refreshTokenCookieOptions,accessTokenCookieOptions, signAccessToken, signRefreshToken } from "../services/jwt.service";
import { addDays } from "../utils/dateUtils";
import { config } from "dotenv";
config();

const REFRESH_TOKEN_EXPIRES_DAYS = 7; // keep consistent w/ env


export const register = async (req: Request, res: Response,next:NextFunction) => {
  try {
  const { email, password, username } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email & password required" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      username,
      provider: "LOCAL"
    }
  });

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: addDays(REFRESH_TOKEN_EXPIRES_DAYS)
    }
  });
  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
  res.cookie('accessToken', accessToken, accessTokenCookieOptions);

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          user:{
            id: user.id,
            email: user.email,
            username: user.username,
          },
          // accessToken,
          // refreshToken
        },
      });

      } catch (error) {
    next(error);
  }

};

export const login = async (req: Request, res: Response,next: NextFunction) => {
  
  try {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email & password required" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) return res.status(401).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: addDays(REFRESH_TOKEN_EXPIRES_DAYS)
    }
  });

  res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
  res.cookie('accessToken', accessToken, accessTokenCookieOptions);

  res.json({
        success: true,
        message: 'Login successful',
        data: {
          user
          },
      });
  } catch (error) {
    next(error);
  }
 
};

export const refresh = async (req: Request, res: Response) => {
  // const { refreshToken } = req.body;
  const { refreshToken } = req.cookies?.refreshToken;
  if (!refreshToken) return res.status(400).json({ 
          success: false,
          message: 'Refresh token required',
        });
console.log("Refreshing token:", refreshToken);
  try {
    const decoded: any = (await import("../services/jwt.service")).verifyRefreshToken(refreshToken);
    const tokenRecord = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!tokenRecord || tokenRecord.revoked) return res.status(401).json({ message: "Invalid refresh token" });

    // issue new tokens
    const accessToken = signAccessToken({ userId: decoded.userId });
    const newRefreshToken = signRefreshToken({ userId: decoded.userId });

    // revoke old
    await prisma.refreshToken.update({
      where: { token: refreshToken },
      data: { revoked: true }
    });

    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.userId,
        expiresAt: addDays(REFRESH_TOKEN_EXPIRES_DAYS)
      }
    });
    res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);
  res.cookie('accessToken', accessToken, accessTokenCookieOptions);

    // res.json({ accessToken, refreshToken: newRefreshToken });
    res.json({ success: true });
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response) => {
  // const { refreshToken } = req.body;
  const { refreshToken } = req.cookies?.refreshToken;;
  if (!refreshToken) return res.status(400).json({ message: "Refresh token required" });

  await prisma.refreshToken.updateMany({
    where: { token: refreshToken },
    data: { revoked: true }
  });
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logout successful',
      });
}

