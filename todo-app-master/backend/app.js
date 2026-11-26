import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./connectDB.js";
import authRoutes from "./routes/authRoutes.js";
import todoRoutes from "./routes/todoRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

if (process.env.TRUST_PROXY) app.set("trust proxy", Number(process.env.TRUST_PROXY));

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/todo", todoRoutes);

// Global error handler (handles CastError and unhandled server errors)
app.use((err, req, res, next) => {
  if (err.name === "CastError") {
    return res.status(404).json({ message: "todo not found" });
  }
  console.error("Unhandled error:", err);
  return res.status(500).json({ message: "Internal server error" });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
