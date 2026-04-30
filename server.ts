import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./backend/src/app";
import { prisma } from "./backend/src/config/db";
import Razorpay from "razorpay";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: "*" }
  });

  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Socket.IO Logic
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("join-room", (room) => {
      socket.join(room);
    });
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  // Mount modular backend logic
  app.use('/api', apiRouter);

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Modular Enterprise Server running on http://localhost:${PORT}`);
  });
}

startServer();
