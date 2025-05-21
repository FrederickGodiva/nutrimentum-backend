import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.types";
import { register, generateToken } from "./auth.service";
import { ZodError } from "zod";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password, name } = registerSchema.parse(req.body);
    const user = await register(username, password, name);
    const token = generateToken({ id: user.id, username: user.username });
    res.status(200).json({ token, user });
  } catch (err: any) {
    console.error(err);
    if (err instanceof ZodError) res.status(400).json({ error: err.errors });
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    loginSchema.parse(req.body);

    const user = req.user as any;
    if (!user) res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken({ id: user.id, username: user.username });
    res.status(200).json({ token, user });
  } catch (err: any) {
    console.error(err);
    if (err instanceof ZodError) {
      res.status(400).json({ error: err.errors });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
};
