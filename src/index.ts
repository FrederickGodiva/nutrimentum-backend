import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userController from "./user/user.controller";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get("/api", (req, res) => {
  res.send({ message: "Hello World" });
});

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
