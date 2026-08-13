import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Route: Proxy LINE Notify request to line-api
  app.post("/api/line-notify", async (req, res) => {
    try {
      const { token, message } = req.body;
      if (!token || !message) {
        res.status(400).json({ success: false, error: "Missing token or message" });
        return;
      }

      const params = new URLSearchParams();
      params.append("message", message);

      const response = await fetch("https://notify-api.line.me/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-encoding",
          Authorization: `Bearer ${token}`,
        },
        body: params,
      });

      const responseData = await response.json();
      if (response.ok) {
        res.json({ success: true, data: responseData });
      } else {
        res.status(response.status).json({ success: false, error: responseData });
      }
    } catch (err: any) {
      console.error("LINE Notify Proxy Error:", err);
      res.status(500).json({ success: false, error: err.message || "Failed to trigger LINE Notify" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "TB-Care Phon Na Kaeo", province: "Sakon Nakhon" });
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
    console.log(`TB-Care Phon Na Kaeo Server running on http://localhost:${PORT}`);
  });
}

startServer();
