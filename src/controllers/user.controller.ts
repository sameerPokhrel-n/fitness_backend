import { Request, Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

export const getProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const profile = await prisma.profile.findUnique({ where: { userId } });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, name: true, avatar: true }});
  res.json({ user, profile });
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { bio, heightCm, weightKg, gender, goals, name, avatar } = req.body;

  await prisma.user.update({
    where: { id: userId },
    data: { name, avatar }
  });

  const existing = await prisma.profile.findUnique({ where: { userId }});
  if (existing) {
    const updated = await prisma.profile.update({
      where: { userId },
      data: { bio, heightCm, weightKg, gender, goals }
    });
    return res.json({ profile: updated });
  } else {
    const created = await prisma.profile.create({
      data: { userId, bio, heightCm, weightKg, gender, goals }
    });
    return res.json({ profile: created });
  }
};
