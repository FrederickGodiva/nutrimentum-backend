import bcrypt from "bcryptjs";
import { prisma } from "../db";
import jwt from "jsonwebtoken";
import { User } from "../generated/prisma/client";

export const register = async (
  email: string,
  username: string,
  password: string,
): Promise<User> => {
  const existingUser = await validateUser(username, password);
  if (existingUser) throw new Error("Username already registered");

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 12);

  return prisma.user.create({
    data: {
      email,
      username,
      password: hashedPassword,
    },
  });
};

export const validateUser = async (
  username: string,
  password: string,
): Promise<User | null> => {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.password) return null;

  const match = await bcrypt.compare(password, user.password);
  return match ? user : null;
};

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "15m" });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};
