import "dotenv/config";
import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_TASK, runLiveAgent, runScriptedReplay, type DemoEvent } from "./agent.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const port = Number(process.env.PORT || 4321);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

    if (req.method === "GET" && (url.pathname === "/" || url.pathname === "/presentation")) {
      const html = await fs.readFile(path.join(publicDir, "presentation.html"), "utf8");
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    if (req.method === "GET" && url.pathname === "/demo") {
      const html = await fs.readFile(path.join(publicDir, "index.html"), "utf8");
      res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      res.end(html);
      return;
    }

    if (req.method === "GET" && url.pathname === "/health") {
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === "POST" && url.pathname === "/api/run") {
      const body = await readJson(req);
      const mode = body.mode === "scripted" ? "scripted" : "live";
      const task = typeof body.task === "string" && body.task.trim() ? body.task : DEFAULT_TASK;
      const abortController = new AbortController();
      const abortRun = () => {
        if (!abortController.signal.aborted) {
          abortController.abort(new Error("客户端已终止演示"));
        }
      };

      req.on("aborted", abortRun);
      res.on("close", abortRun);

      res.writeHead(200, {
        "content-type": "application/x-ndjson; charset=utf-8",
        "cache-control": "no-cache, no-transform",
        connection: "keep-alive",
      });

      const emit = async (event: DemoEvent) => {
        if (abortController.signal.aborted || res.writableEnded || res.destroyed) return;
        res.write(`${JSON.stringify(event)}\n`);
      };

      try {
        if (mode === "scripted") {
          await runScriptedReplay(task, emit, abortController.signal);
        } else {
          await runLiveAgent(task, emit, abortController.signal);
        }
      } catch (error) {
        if (!isAbortError(error) && !abortController.signal.aborted) {
          await emit({
            type: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      } finally {
        req.off("aborted", abortRun);
        res.off("close", abortRun);

        if (!res.writableEnded && !res.destroyed) {
          res.end();
        }
      }
      return;
    }

    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  } catch (error) {
    json(res, 500, { error: error instanceof Error ? error.message : String(error) });
  }
});

server.listen(port, () => {
  console.log(`just-bash agent demo: http://localhost:${port}`);
});

function json(res: http.ServerResponse, status: number, value: unknown) {
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(value));
}

async function readJson(req: http.IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  if (chunks.length === 0) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}
