#!/usr/bin/env node
/**
 * Push migrasi Supabase memakai kredensial dari .env
 * (tidak perlu `supabase login`, cukup SUPABASE_DB_PASSWORD).
 *
 *   node scripts/db-push.mjs
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = resolve(root, ".env");

function parseEnv(text) {
  const result = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

if (!existsSync(envPath)) {
  console.error("File .env tidak ditemukan. Copy .env.example dulu.");
  process.exit(1);
}

const env = parseEnv(readFileSync(envPath, "utf8"));

const password = env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error(
    "SUPABASE_DB_PASSWORD masih kosong di .env.\n" +
      "Isi dulu di Supabase Dashboard > Project Settings > Database.",
  );
  process.exit(1);
}

const supabaseUrl = env.VITE_SUPABASE_URL ?? env.SUPABASE_URL;
const ref = supabaseUrl?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
if (!ref) {
  console.error("Tidak bisa membaca project ref dari VITE_SUPABASE_URL di .env.");
  process.exit(1);
}

const host = env.SUPABASE_DB_HOST || `db.${ref}.supabase.co`;
const user = env.SUPABASE_DB_HOST ? `postgres.${ref}` : "postgres";
const dbUrl = `postgresql://${user}:${encodeURIComponent(password)}@${host}:5432/postgres`;

const masked = dbUrl.replace(encodeURIComponent(password), "********");
console.log(`Menjalankan migrasi ke: ${masked}\n`);

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(
  npx,
  ["--yes", "supabase@latest", "db", "push", "--db-url", dbUrl, "--include-all"],
  { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
);

process.exit(result.status ?? 1);
