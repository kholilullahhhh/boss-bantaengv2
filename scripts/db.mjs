import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const PORT = Number(process.env.LOCAL_PG_PORT ?? 5433);
const DB_NAME = process.env.LOCAL_PG_DATABASE ?? "boss";
const DB_USER = process.env.LOCAL_PG_USER ?? "postgres";
const DB_PASSWORD = process.env.LOCAL_PG_PASSWORD ?? "postgres";
const DATA_DIR = path.join(root, ".postgres", "data");
const LOG_FILE = path.join(root, ".postgres", "postgres.log");
const PW_FILE = path.join(root, ".postgres", "pwfile");

function platformPackage() {
  const p = process.platform;
  const a = process.arch;
  if (p === "win32") return "windows-x64";
  if (p === "darwin") return a === "arm64" ? "darwin-arm64" : "darwin-x64";
  if (p === "linux") {
    if (a === "arm64") return "linux-arm64";
    if (a === "arm") return "linux-arm";
    return "linux-x64";
  }
  throw new Error(`Platform tidak didukung: ${p}/${a}`);
}

function binDir() {
  const name = `@embedded-postgres/${platformPackage()}`;
  const direct = path.join(root, "node_modules", name, "native", "bin");
  if (existsSync(direct)) return direct;
  const resolved = require.resolve(`${name}/dist/index.js`);
  return path.join(path.dirname(resolved), "..", "native", "bin");
}

function tool(name) {
  const exe = process.platform === "win32" ? `${name}.exe` : name;
  return path.join(binDir(), exe);
}

function env() {
  return { ...process.env, PATH: `${binDir()}${path.delimiter}${process.env.PATH ?? ""}` };
}

function run(cmd, args) {
  return execFileSync(cmd, args, {
    cwd: binDir(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: env(),
  });
}

function runDetached(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: binDir(),
    stdio: "ignore",
    windowsHide: true,
    env: env(),
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const log = existsSync(LOG_FILE) ? readFileSync(LOG_FILE, "utf8") : "";
    throw new Error(`pg_ctl keluar dengan kode ${result.status}.\n${log.slice(-2000)}`);
  }
}

function isRunning() {
  return existsSync(path.join(DATA_DIR, "postmaster.pid"));
}

function initCluster() {
  if (existsSync(path.join(DATA_DIR, "PG_VERSION"))) return false;
  mkdirSync(DATA_DIR, { recursive: true });
  mkdirSync(path.dirname(LOG_FILE), { recursive: true });
  writeFileSync(PW_FILE, DB_PASSWORD, { encoding: "utf8" });
  console.log(`[db] Menginisialisasi cluster PostgreSQL di ${DATA_DIR} ...`);
  run(tool("initdb"), [
    "-D",
    DATA_DIR,
    "-U",
    DB_USER,
    "-A",
    "password",
    "--encoding=UTF8",
    "--locale=C",
    `--pwfile=${PW_FILE}`,
  ]);
  return true;
}

async function ensureDatabase() {
  const { Client } = await import("pg");
  const client = new Client({
    host: "127.0.0.1",
    port: PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: "postgres",
  });
  await client.connect();
  try {
    const existing = await client.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`[db] Database "${DB_NAME}" dibuat.`);
    }
  } finally {
    await client.end();
  }
}

async function start() {
  const initialized = initCluster();
  if (isRunning() && !initialized) {
    console.log(`[db] PostgreSQL sudah berjalan di port ${PORT}.`);
  } else {
    console.log(`[db] Menjalankan PostgreSQL di port ${PORT} ...`);
    runDetached(tool("pg_ctl"), [
      "-D",
      DATA_DIR,
      "-l",
      LOG_FILE,
      "-o",
      `-p ${PORT} -c listen_addresses=127.0.0.1 -c log_min_messages=warning`,
      "start",
      "-w",
      "-t",
      "60",
    ]);
    console.log("[db] PostgreSQL berjalan.");
  }
  await ensureDatabase();
  console.log(
    `[db] DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:${PORT}/${DB_NAME}?schema=public`
  );
}

function stop() {
  if (!isRunning()) {
    console.log("[db] PostgreSQL tidak berjalan.");
    return;
  }
  console.log("[db] Menghentikan PostgreSQL ...");
  runDetached(tool("pg_ctl"), ["-D", DATA_DIR, "-m", "fast", "stop", "-w", "-t", "60"]);
  console.log("[db] PostgreSQL dihentikan.");
}

function status() {
  if (isRunning()) {
    console.log(`[db] Berjalan di port ${PORT} (data: ${DATA_DIR})`);
  } else {
    console.log("[db] Tidak berjalan.");
  }
}

const command = process.argv[2] ?? "start";
try {
  if (command === "start") await start();
  else if (command === "stop") stop();
  else if (command === "status") status();
  else {
    console.error(`Perintah tidak dikenal: ${command} (start|stop|status)`);
    process.exit(1);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[db] Gagal: ${message}`);
  const stderr = error && typeof error === "object" && "stderr" in error ? error.stderr : null;
  if (stderr) console.error(String(stderr).trim());
  process.exit(1);
}
