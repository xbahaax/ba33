import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { createServer } from "node:net";

const DEFAULT_PORT = 3001;
const MAX_PORT_ATTEMPTS = 20;

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer();

    server.once("error", () => {
      resolve(false);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(port);
  });
}

async function findAvailablePort() {
  for (let offset = 0; offset < MAX_PORT_ATTEMPTS; offset += 1) {
    const port = DEFAULT_PORT + offset;

    if (await isPortFree(port)) {
      return port;
    }
  }

  throw new Error(`No available port found between ${DEFAULT_PORT} and ${DEFAULT_PORT + MAX_PORT_ATTEMPTS - 1}.`);
}

const port = await findAvailablePort();
const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

if (port !== DEFAULT_PORT) {
  console.log(`Port ${DEFAULT_PORT} is busy. Starting web-buyer on port ${port} instead.`);
}

const child = spawn(process.execPath, [nextBin, "dev", "--port", String(port)], {
  stdio: "inherit",
  shell: false,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
