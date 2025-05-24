import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error(err);

  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Validation Error",
      details: err.errors,
    });
    return;
  }

  if (err.message === "Username already registered") {
    res.status(409).json({ error: err.message });
    return;
  }

  if (err.message === "Email already registered") {
    res.status(409).json({ error: err.message });
    return;
  }

  res.status(500).json({ error: "Internal server error" });
};
