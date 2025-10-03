import { Request, Response } from "express";
import prisma from "../prisma";
import { AuthRequest } from "../middlewares/auth.middleware";

export const createExercise = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { title, description, difficulty, muscleGroup } = req.body;
  const exercise = await prisma.exercise.create({
    data: { authorId: userId, title, description, difficulty, muscleGroup }
  });
  res.json({ exercise });
};

export const listExercises = async (req: Request, res: Response) => {
  const exercises = await prisma.exercise.findMany({ include: { author: { select: { id: true, name: true } } }});
  res.json({ exercises });
};

export const getExercise = async (req: Request, res: Response) => {
  const { id } = req.params;
  const exercise = await prisma.exercise.findUnique({ where: { id }});
  if (!exercise) return res.status(404).json({ message: "Not found" });
  res.json({ exercise });
};

export const updateExercise = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const ex = await prisma.exercise.findUnique({ where: { id }});
  if (!ex) return res.status(404).json({ message: "Not found" });
  if (ex.authorId !== userId) return res.status(403).json({ message: "Forbidden" });
  const updated = await prisma.exercise.update({ where: { id }, data: req.body });
  res.json({ exercise: updated });
};

export const deleteExercise = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.userId;
  const { id } = req.params;
  const ex = await prisma.exercise.findUnique({ where: { id }});
  if (!ex) return res.status(404).json({ message: "Not found" });
  if (ex.authorId !== userId) return res.status(403).json({ message: "Forbidden" });
  await prisma.exercise.delete({ where: { id }});
  res.json({ success: true });
};
