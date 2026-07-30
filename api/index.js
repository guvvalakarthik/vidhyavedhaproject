import mongoose from "mongoose";
import app from "../Backend/app.js";
import connectDB from "../Backend/config.js";
import { ensureDefaultHealthcareProviders } from "../Backend/services/ensureHealthcareProviders.js";

let databasePromise;

const PUBLIC_CATALOGUE_ROUTES = [
  /^\/api\/government\/services(?:\/[^/]+)?$/,
  /^\/api\/education\/pathways(?:\/[^/]+)?$/,
  /^\/api\/finance\/pathways(?:\/[^/]+)?$/,
  /^\/api\/farming\/pathways(?:\/[^/]+)?$/,
  /^\/api\/utilities\/guides(?:\/[^/]+)?$/,
  /^\/api\/ecommerce\/guides(?:\/[^/]+)?$/,
  /^\/api\/emergency\/services$/,
  /^\/api\/healthcare\/providers(?:\/[^/]+\/availability)?$/,
  /^\/api\/home-maintenance\/providers(?:\/[^/]+\/availability)?$/,
  /^\/api\/auth\/google\/config$/,
];

const appendQueryValue = (params, key, value) => {
  if (Array.isArray(value)) {
    value.forEach((item) => params.append(key, String(item)));
    return;
  }
  if (value !== undefined && value !== null) params.append(key, String(value));
};

export const restoreApiRequestUrl = (req) => {
  const query = req.query || {};
  const path = Array.isArray(query.path) ? query.path.join("/") : String(query.path || "");
  if (!path) return new URL(req.url, "http://vercel.local").pathname;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (key !== "path") appendQueryValue(params, key, value);
  });
  const pathname = `/api/${path.replace(/^\/+/, "")}`;
  req.url = `${pathname}${params.size ? `?${params}` : ""}`;
  return pathname;
};

export const isPublicCatalogueRequest = (method, pathname) =>
  method === "GET" && PUBLIC_CATALOGUE_ROUTES.some((pattern) => pattern.test(pathname));

export const isLivenessRequest = (method, pathname) =>
  method === "GET" && pathname === "/api/health/live";

const ensureDatabase = async () => {
  if (mongoose.connection.readyState === 1) return true;
  if (!process.env.MONGO_URI) return false;
  if (!databasePromise) {
    databasePromise = connectDB()
      .then(ensureDefaultHealthcareProviders)
      .then(() => true)
      .catch((error) => {
        databasePromise = undefined;
        throw error;
      });
  }
  return databasePromise;
};

export default async function handler(req, res) {
  const pathname = restoreApiRequestUrl(req);
  if (isLivenessRequest(req.method, pathname)) return app(req, res);
  const publicCatalogueRequest = isPublicCatalogueRequest(req.method, pathname);
  let databaseReady = mongoose.connection.readyState === 1;

  if (!databaseReady && process.env.MONGO_URI) {
    try {
      databaseReady = await ensureDatabase();
    } catch (error) {
      console.error("Vercel database connection failed:", error?.message || error);
    }
  }

  if (!databaseReady && !publicCatalogueRequest) {
    return res.status(503).json({
      error: "The production data service is not configured yet. Public service information remains available.",
      code: "DATABASE_UNAVAILABLE",
    });
  }

  if (!databaseReady && req.headers.cookie) delete req.headers.cookie;
  return app(req, res);
}
