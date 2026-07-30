import { spawnSync } from "node:child_process";
import path from "node:path";

const packageRoot = path.resolve(process.argv[2] || ".");
const allowedAdvisories = new Set([
  // Browser-only SPA: no React Router RSC handlers or server actions.
  // See docs/known-security-exceptions.md.
  "GHSA-QWWW-VCR4-C8H2",
]);

const audit = spawnSync("npm", ["audit", "--omit=dev", "--json"], {
  cwd: packageRoot,
  encoding: "utf8",
  shell: process.platform === "win32",
});

let report;
try {
  report = JSON.parse(audit.stdout || "{}");
} catch {
  console.error(audit.stderr || "npm audit did not return valid JSON.");
  process.exit(1);
}

const findings = [];
for (const [dependency, vulnerability] of Object.entries(report.vulnerabilities || {})) {
  for (const cause of vulnerability.via || []) {
    if (typeof cause !== "object") continue;
    const advisory = cause.url?.match(/GHSA-[\w-]+/i)?.[0]?.toUpperCase();
    if (!advisory || !allowedAdvisories.has(advisory)) {
      findings.push({ dependency, advisory: advisory || cause.title, severity: cause.severity });
    }
  }
}

if (findings.length) {
  console.error("Unapproved production dependency advisories:");
  for (const finding of findings) {
    console.error(`- ${finding.dependency}: ${finding.advisory} (${finding.severity})`);
  }
  process.exit(1);
}

console.log(`Dependency audit passed for ${packageRoot}.`);
