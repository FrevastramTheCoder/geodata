import { readdirSync, statSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function filesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return filesIn(fullPath);
    return entry.name.endsWith(".js") ? [fullPath] : [];
  });
}

const files = filesIn(path.resolve("src"));
for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status || 1);
}
console.log(`Checked ${files.length} server JavaScript files.`);
