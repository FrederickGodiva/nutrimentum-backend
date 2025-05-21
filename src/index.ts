import express from "express";
import { config } from "dotenv";
import passport from "passport";
import cors from "cors";
import userController from "./user/user.controller";
import authRoutes from "./auth/auth.route";

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(passport.initialize());

app.get("/api", (req, res) => {
  res.send({ message: "Hello World" });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userController);

app.use((req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} does not exist`,
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
