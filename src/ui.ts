import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { ReviewWindowData } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, "..");
const webDir = join(packageRoot, "web");
const assetsDir = join(packageRoot, ".assets");

function escapeForInlineScript(value: string): string {
  return value.replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

export function buildReviewHtml(data: ReviewWindowData): string {
  const templateHtml = readFileSync(join(webDir, "index.html"), "utf8");
  const appJs = readFileSync(join(webDir, "app.js"), "utf8");
  const payload = escapeForInlineScript(JSON.stringify(data));
  return templateHtml
    .replace("__INLINE_DATA__", payload)
    .replace("__INLINE_JS__", appJs);
}

export function writeReviewHtmlFile(data: ReviewWindowData): string {
  const tailwindPath = join(assetsDir, "tailwind.css");
  const monacoLoaderPath = join(assetsDir, "vs", "loader.js");
  if (!existsSync(tailwindPath) || !existsSync(monacoLoaderPath)) {
    throw new Error("Review assets are missing. Run `npm install` or `npm run prepare-assets` in extensions/pi-diff-review.");
  }

  const html = buildReviewHtml(data);
  const htmlPath = join(assetsDir, `review-${process.pid}.html`);
  writeFileSync(htmlPath, html, "utf8");
  return htmlPath;
}
