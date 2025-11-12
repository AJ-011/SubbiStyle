import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { type ListenOptions, createServer as createNetServer } from "net";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import cookieParser from "cookie-parser";
import { authenticateRequest } from "./middleware/auth";

const app = express();
console.log(
  `[startup] server/index.ts loaded (NODE_ENV=${process.env.NODE_ENV ?? "undefined"}, PORT=${process.env.PORT ?? "unset"})`,
);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(authenticateRequest);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "...";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);
  console.log("[startup] Routes registered");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Serve static assets (images, etc.) before Vite middleware
  app.use('/attached_assets', express.static('attached_assets'));

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    console.log("[startup] Initializing Vite dev middleware");
    await setupVite(app, server);
  } else {
    console.log("[startup] Serving pre-built client assets");
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled on Replit, so prefer the requested port but retry locally if needed.
  const desiredPort = parseInt(process.env.PORT || "5000", 10);
  const isReplit = Boolean(process.env.REPL_ID);
  const maxRetries = isReplit ? 0 : 5;
  console.log(`[startup] Desired port ${desiredPort} (maxRetries=${maxRetries})`);

  const isPortAvailable = (port: number) =>
    new Promise<boolean>((resolve, reject) => {
      const tester = createNetServer();

      tester.once("error", (error: NodeJS.ErrnoException) => {
        tester.close();
        if (error.code === "EADDRINUSE" || error.code === "EACCES") {
          resolve(false);
          return;
        }
        reject(error);
      });

      tester.once("listening", () => {
        tester.close(() => resolve(true));
      });

      tester.listen(port, "0.0.0.0");
    });

  let currentPort = desiredPort;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const available = await isPortAvailable(currentPort);
    if (available) {
      if (currentPort !== desiredPort) {
        console.log(`[startup] Found open fallback port ${currentPort}`);
      }
      break;
    }

    if (attempt === maxRetries) {
      throw new Error(`Port ${currentPort} is in use and no fallback ports available`);
    }

    log(`port ${currentPort} in use, trying ${currentPort + 1}`);
    currentPort += 1;
  }

  const listenOptions: ListenOptions & { reusePort?: boolean } = {
    port: currentPort,
    host: "0.0.0.0",
  };

  if (process.platform !== "win32") {
    listenOptions.reusePort = true;
  }

  server.listen(listenOptions, () => {
    log(`serving on port ${currentPort}`);
  });
})();
