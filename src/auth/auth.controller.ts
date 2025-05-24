import { Request, Response, NextFunction } from "express";
import { registerSchema, logoutSchema } from "./auth.schema";
import {
  generateAccessToken,
  generateRefreshToken,
  register,
} from "./auth.service";
import { prisma } from "../db";
import jwt from "jsonwebtoken";
import passport from "./passport";
import { User } from "../generated/prisma/client";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, username, password } = registerSchema.parse(req.body);
    const user = await register(email, username, password);

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      refreshToken,
      user: userWithoutPassword,
    });
  } catch (err: any) {
    next(err);
  }
};

export const loginUser = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  passport.authenticate(
    "local",
    { session: false },
    async (
      err: Error | null,
      user: User | null,
      info: { message?: string } | undefined,
    ) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res
          .status(401)
          .json({ error: info?.message || "Invalid credentials" });
      }

      try {
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);

        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken },
        });

        const { password, ...userWithoutPassword } = user;

        return res.json({
          message: "Login successful",
          accessToken,
          refreshToken,
          user: userWithoutPassword,
        });
      } catch (error) {
        next(error);
      }
    },
  )(req, res, next);
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = logoutSchema.parse(req.body);

    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as any;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.refreshToken !== refreshToken) {
      res.status(403).json({ error: "Invalid refresh token" });
      return;
    }

    const newAccessToken = generateAccessToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err: any) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      res.status(403).json({ error: "Invalid or expired refresh token" });
      return;
    }
    next(err);
  }
};

export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken } = logoutSchema.parse(req.body);

    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
    ) as any;

    await prisma.user.update({
      where: { id: payload.userId },
      data: { refreshToken: null },
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err: any) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      res.status(403).json({ error: "Invalid token" });
      return;
    }
    next(err);
  }
};

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  passport.authenticate(
    "jwt",
    { session: false },
    async (
      err: Error | null,
      user: User | null,
    ) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: "Unauthorized" });

      try {
        const { password, ...userWithoutPassword } = user;

        return res.json({ user: userWithoutPassword });
      } catch (error) {
        next(error);
      }
    },
  )(req, res, next);
};