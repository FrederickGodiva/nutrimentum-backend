import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  name: z.string().min(1),
});

export const loginSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});
