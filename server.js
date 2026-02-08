import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import moodRoutes from "./routes/moods.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/moods", moodRoutes);

app.listen(process.env.PORT, () => {
  console.log("Server running on port", process.env.PORT);
});