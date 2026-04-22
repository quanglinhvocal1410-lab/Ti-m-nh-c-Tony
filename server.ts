import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import path from "path";
import studentsRouter from "./server/routes/students";
import usersRouter from "./server/routes/users";
import lessonsRouter from "./server/routes/lessons";
import aiRouter from "./server/routes/ai";
import audioRouter from "./server/routes/audio";
import knowledgeRouter from "./server/routes/knowledge";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3005;

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      db: "connected",
    });
  });

  app.use("/api/students", studentsRouter);
  app.use("/api/users", usersRouter);
  app.use("/api/lessons", lessonsRouter);
  app.use("/api/ai", aiRouter);
  app.use("/api/audio", audioRouter);
  app.use("/api/knowledge", knowledgeRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
