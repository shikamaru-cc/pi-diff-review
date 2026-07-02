import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const assetsDir = join(packageRoot, ".assets");
const monacoSource = join(packageRoot, "node_modules", "monaco-editor", "min", "vs");
const monacoTarget = join(assetsDir, "vs");

mkdirSync(assetsDir, { recursive: true });
rmSync(monacoTarget, { recursive: true, force: true });
cpSync(monacoSource, monacoTarget, { recursive: true });

execFileSync(
  "npx",
  ["tailwindcss", "-i", "web/input.css", "-o", ".assets/tailwind.css", "--content", "web/**/*.{html,js}"],
  { cwd: packageRoot, stdio: "inherit" },
);
