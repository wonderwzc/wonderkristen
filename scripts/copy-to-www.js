/**
 * 将站点资源复制到 www，供 Capacitor 打包 APK 使用
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const www = path.join(root, "www");

const IGNORE = new Set([
  "node_modules", "android", "www", "olib", "olib-mobile-src", ".git", ".vercel",
  "build-apk.ps1", "build-apk.bat", "scripts",
  ".cursor", ".idea", ".vscode"
]);

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      if (IGNORE.has(name)) continue;
      copyRecursive(path.join(src, name), path.join(dest, name));
    }
  } else {
    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(www)) fs.rmSync(www, { recursive: true });
fs.mkdirSync(www, { recursive: true });

for (const name of fs.readdirSync(root)) {
  if (IGNORE.has(name) || name.startsWith(".")) continue;
  const src = path.join(root, name);
  copyRecursive(src, path.join(www, name));
}

console.log("已复制到 www/");
