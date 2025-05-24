import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import authRoutes from "./auth/auth.route";
import userController from "./user/user.controller";
import { errorHandler } from "./middleware/errorHandler";
import passport from "../src/auth/passport";

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(passport.initialize());
app.use(errorHandler);

app.get("/api", (req: Request, res: Response) => {
  res.send({ message: "Hello World" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userController);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} does not exist`,
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
