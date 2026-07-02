import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const assetsDir = join(packageRoot, ".assets");
const monacoSource = join(packageRoot, "node_modules", "monaco-editor", "min", "vs");
const monacoTarget = join(assetsDir, "vs");
const glimpseChromiumBackend = join(packageRoot, "node_modules", "glimpseui", "src", "chromium-backend.mjs");

function patchGlimpseChromeNoise() {
  if (!existsSync(glimpseChromiumBackend)) return;

  const source = readFileSync(glimpseChromiumBackend, "utf8");
  const marker = "!s.includes('wrong_secret') && !s.includes('DEPRECATED_ENDPOINT')) {";
  const replacement = "!s.includes('wrong_secret') && !s.includes('DEPRECATED_ENDPOINT') &&\n          !s.includes('ssl_client_socket_impl') && !s.includes('handshake failed') &&\n          !s.includes('net_error -100')) {";
  if (!source.includes(marker) || source.includes("ssl_client_socket_impl")) return;

  writeFileSync(glimpseChromiumBackend, source.replace(marker, replacement), "utf8");
}

patchGlimpseChromeNoise();

mkdirSync(assetsDir, { recursive: true });
rmSync(monacoTarget, { recursive: true, force: true });
cpSync(monacoSource, monacoTarget, { recursive: true });

execFileSync(
  "npx",
  ["tailwindcss", "-i", "web/input.css", "-o", ".assets/tailwind.css", "--content", "web/**/*.{html,js}"],
  { cwd: packageRoot, stdio: "inherit" },
);
