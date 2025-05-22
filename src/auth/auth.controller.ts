import { Request, Response } from "express";
import { registerSchema, loginSchema } from "./auth.types";
import { register, generateToken } from "./auth.service";
import { ZodError } from "zod";
import passport from "passport";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { username, password } = registerSchema.parse(req.body);
    const user = await register(username, password);
    const token = generateToken({ id: user.id, username: user.username });
    res.status(200).json({ token, user });
  } catch (err: any) {
    console.error(err);
    if (err instanceof ZodError) res.status(400).json({ error: err.errors });
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = (
  req: Request,
  res: Response,
  next: Function
): void => {
  loginSchema.parse(req.body);

  passport.authenticate(
    "local",
    { session: false },
    (err: any, user: { id: any; username: any }, info: { message: any }) => {
      if (err) return next(err);
      if (!user)
        return res
          .status(401)
          .json({ error: info?.message || "Invalid credentials" });

      const token = generateToken({ id: user.id, username: user.username });
      return res.status(200).json({ token, user });
    }
  )(req, res, next);
};

export const logoutUser = async (req: Request, res: Response) => {
  res.json({ message: "Logged out successfully" });
};
