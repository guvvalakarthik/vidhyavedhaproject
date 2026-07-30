import { execFileSync } from "node:child_process";

const trackedFiles = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const forbiddenPath = (path) => {
  const normalized = path.replaceAll("\\", "/");
  const name = normalized.split("/").at(-1);
  const environmentFile = /^\.env(?:\.|$)/.test(name) && !name.endsWith(".example");

  return environmentFile
    || /(^|\/)node_modules\//.test(normalized)
    || /(^|\/)(?:dist|build|coverage|playwright-report|test-results|\.audit|\.vercel)\//.test(normalized)
    || /\.(?:lnk|tmp)$/i.test(name);
};

const violations = trackedFiles.filter(forbiddenPath);
if (violations.length > 0) {
  console.error("Repository hygiene policy rejected these tracked files:");
  violations.forEach((path) => console.error(`- ${path}`));
  process.exit(1);
}

console.log(`Repository hygiene passed for ${trackedFiles.length} tracked files.`);