import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API routes Basic API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", game: "GeoGrow" });
  });

  // Proxy for GenLayer RPC to avoid CORS issues in some browser environments
  app.post("/api/genlayer-rpc", express.json(), async (req, res) => {
    try {
      const targetUrl = process.env.VITE_GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("GenLayer Proxy Error:", error);
      res.status(502).json({ 
        jsonrpc: "2.0", 
        id: req.body.id || null, 
        error: { code: -32000, message: `Proxy Error: ${error.message}` } 
      });
    }
  });

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
    console.log(`GeoGrow server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
