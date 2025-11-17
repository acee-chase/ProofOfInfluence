import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // Try multiple possible paths for the static files
  // 1. Relative to compiled file (dist/public when server/vite.ts -> dist/vite.js)
  const distPath1 = path.resolve(import.meta.dirname, "public");
  // 2. Relative to current working directory (for Render and other deployments)
  const distPath2 = path.resolve(process.cwd(), "dist", "public");
  // 3. Absolute path from project root (fallback)
  const distPath3 = path.resolve(process.cwd(), "public");

  let distPath: string | null = null;
  
  if (fs.existsSync(distPath1)) {
    distPath = distPath1;
  } else if (fs.existsSync(distPath2)) {
    distPath = distPath2;
  } else if (fs.existsSync(distPath3)) {
    distPath = distPath3;
  }

  if (!distPath) {
    throw new Error(
      `Could not find the build directory. Tried:\n` +
      `  - ${distPath1}\n` +
      `  - ${distPath2}\n` +
      `  - ${distPath3}\n` +
      `Make sure to build the client first with 'npm run build'`
    );
  }

  log(`[Static] Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  // This enables client-side routing (React Router)
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      log(`[Static] Error: index.html not found at ${indexPath}`);
      res.status(500).send("Static files not found. Please rebuild the application.");
      return;
    }
    res.sendFile(indexPath);
  });
}
