const productionUrl = new URL(
  process.env.PRODUCTION_URL || "https://vidhyavedhaproject.vercel.app",
);
const attempts = Number.parseInt(process.env.SMOKE_ATTEMPTS || "8", 10);
const retryDelayMs = Number.parseInt(process.env.SMOKE_RETRY_DELAY_MS || "5000", 10);

const expectArray = (property, minimum) => (payload) => {
  if (!Array.isArray(payload?.[property]) || payload[property].length < minimum) {
    throw new Error(`expected ${property} to contain at least ${minimum} entries`);
  }
};

const checks = [
  {
    name: "liveness",
    path: "/api/health/live",
    status: 200,
    validate: (payload) => {
      if (payload?.status !== "ok") throw new Error("process is not live");
    },
  },
  {
    name: "database readiness",
    path: "/api/health/ready",
    status: 200,
    validate: (payload) => {
      if (payload?.status !== "ready" || payload?.checks?.database !== "connected") {
        throw new Error("database is not ready");
      }
    },
  },
  { name: "government catalogue", path: "/api/government/services", status: 200, validate: expectArray("services", 6) },
  { name: "education catalogue", path: "/api/education/pathways", status: 200, validate: expectArray("pathways", 6) },
  { name: "finance catalogue", path: "/api/finance/pathways", status: 200, validate: expectArray("pathways", 6) },
  { name: "farming catalogue", path: "/api/farming/pathways", status: 200, validate: expectArray("pathways", 4) },
  { name: "utilities catalogue", path: "/api/utilities/guides", status: 200, validate: expectArray("guides", 4) },
  { name: "commerce catalogue", path: "/api/ecommerce/guides", status: 200, validate: expectArray("guides", 4) },
  { name: "emergency catalogue", path: "/api/emergency/services", status: 200, validate: expectArray("services", 6) },
  { name: "healthcare providers", path: "/api/healthcare/providers", status: 200, validate: expectArray("providers", 4) },
  { name: "home-service providers", path: "/api/home-maintenance/providers", status: 200, validate: expectArray("providers", 4) },
  {
    name: "Google sign-in configuration",
    path: "/api/auth/google/config",
    status: 200,
    validate: (payload) => {
      if (payload?.enabled !== true) throw new Error("Google sign-in is disabled");
    },
  },
  {
    name: "session protection",
    path: "/api/auth/me",
    status: 401,
    validate: (payload) => {
      if (typeof payload?.error !== "string") throw new Error("missing authentication error");
    },
  },
];

const delay = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

const runCheck = async (check) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(new URL(check.path, productionUrl), {
        headers: {
          Accept: "application/json",
          Origin: productionUrl.origin,
        },
        redirect: "error",
        signal: AbortSignal.timeout(10_000),
      });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`expected JSON but received ${contentType || "no content type"}`);
      }
      const payload = await response.json();
      if (response.status !== check.status) {
        throw new Error(`expected HTTP ${check.status} but received ${response.status}`);
      }
      check.validate(payload);
      console.log(`PASS ${check.name} (${response.status})`);
      return;
    } catch (error) {
      lastError = error;
      if (attempt < attempts) await delay(retryDelayMs);
    }
  }

  throw new Error(`FAIL ${check.name}: ${lastError?.message || lastError}`);
};

console.log(`Production smoke target: ${productionUrl.origin}`);
for (const check of checks) await runCheck(check);
console.log(`Production smoke passed: ${checks.length} checks`);