import { Router } from "express";
import * as authCtrl from "../controllers/auth.controller";
import passport from "../services/passport.service";
import { signAccessToken, signRefreshToken } from "../services/jwt.service";
import prisma from "../prisma";

const router = Router();

router.post("/register", authCtrl.register);
router.post("/verify-otp", authCtrl.verifyOtp);
router.post("/password-reset/request", authCtrl.requestPasswordResetOtp);
router.post("/password-reset/confirm", authCtrl.resetPasswordWithOtp);
router.post("/login", authCtrl.login);
router.post("/refresh", authCtrl.refresh);
router.post("/logout", authCtrl.logout);

// OAuth - Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/auth/failed" }),
  async (req, res) => {
    // user is attached to req.user by passport service
    const user = req.user as any;
    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });

    // persist refresh token
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) }
    });
     res.cookie('refreshToken', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: 7 * 24 * 60 * 60 * 1000,
        });

    // for SPA: redirect with tokens (in production better set httpOnly cookie)
    // const redirectUrl = `${process.env.BASE_URL}/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`;
    const redirectUrl = `${process.env.BASE_URL}/auth/success?token?token=${accessToken}`;
    res.redirect(redirectUrl);
  }
);

// OAuth - Facebook
router.get("/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { session: false, failureRedirect: "/auth/failed" }),
  async (req, res) => {
    const user = req.user as any;
    const accessToken = signAccessToken({ userId: user.id });
    const refreshToken = signRefreshToken({ userId: user.id });

    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) }
    });

    const redirectUrl = `${process.env.BASE_URL}/oauth-success?accessToken=${accessToken}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
  }
);

router.get("/failed", (req, res) => 
  // res.status(401).json({ message: "OAuth Failed" })
  res.redirect(`${process.env.FRONTEND_URL}/auth/error?message="Authentication Failed"`),
);

export default router;
