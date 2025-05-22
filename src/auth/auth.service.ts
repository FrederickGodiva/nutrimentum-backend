import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db";

export const register = async (username: string, password: string) => {
  const existingUser = await prisma.user.findUnique({ where: { username } });
  if (existingUser) throw new Error("Username already registered");

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { username, password: hashed },
  });

  return user;
};

export const validateUser = async (username: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.password) return null;
  const match = await bcrypt.compare(password, user.password);
  return match ? user : null;
};

export const generateToken = (user: { id: string; username: string }) => {
  return jwt.sign(
    { sub: user.id, username: user.username },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
};
