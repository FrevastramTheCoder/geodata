import { execFile } from "node:child_process";

const args = process.argv.slice(2);

const urls =
  args.length === 1 && args[0].endsWith(".json")
    ? JSON.parse((await import("node:fs")).readFileSync(args[0], "utf8").replace(/^\uFEFF/, "")).urls
    : args;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36";

function probe(url) {
  return new Promise((resolve) => {
    execFile(
      "curl.exe",
      [
        "-s", "-o", "NUL", "-L",
        "-A", UA,
        "--max-time", "20",
        "-w", "%{http_code}",
        "-k", url,
      ],
      { encoding: "utf8" },
      (err, stdout) => {
        const code = err ? "ERR" : String(stdout || "").trim();
        const ok = /^[23][0-9][0-9]$/.test(code);
        resolve({ url, code, ok });
      },
    );
  });
}

const concurrency = 8;
let index = 0;
const results = [];
const workers = Array.from({ length: concurrency }, async () => {
  while (index < urls.length) {
    const url = urls[index++];
    results.push(await probe(url));
  }
});

await Promise.all(workers);
results.sort((a, b) => Number(b.ok) - Number(a.ok) || a.url.localeCompare(b.url));
for (const r of results) {
  console.log(`${r.ok ? "REACHABLE" : "dead     "} ${r.code.padEnd(3)} ${r.url}`);
}
