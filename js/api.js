/**
 * Apex Innovators — api.js
 * Fetch wrapper around the REST surface (prefix `/api`).
 * - Bearer token (ai_token) attached when opts.auth is true.
 * - JSON errors normalized to the contract error shape:
 *   { status, message, timestamp, path } (ApiError carries them).
 * - Protected calls (auth: true) that receive 401 clear the session and
 *   redirect to login.html.
 */

import { demoActive, demoFetch } from "./demo-data.js";

const RENDER_FALLBACK = "https://apex-innovators.onrender.com/api";
export const API_BASE = (typeof window !== "undefined" && window.API_BASE_URL)
  ? window.API_BASE_URL
  : "/api";

/** localStorage keys — shared with auth.js (do not rename). */
export const TOKEN_KEY = "ai_token";
export const REFRESH_KEY = "ai_refresh";
export const USER_KEY = "ai_user";

export class ApiError extends Error {
  /**
   * @param {number} status
   * @param {{status:number,message:string,timestamp?:string,path?:string, [k:string]: unknown}} payload
   * @param {string} url
   */
  constructor(status, payload = {}, url = "") {
    const message = (payload && payload.message) || `Request failed (${status || "network"})`;
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.messageText = message;
    this.path = (payload && payload.path) || url;
    this.timestamp = (payload && payload.timestamp) || new Date().toISOString();
    this.payload = payload;
  }
}

const STATUS_TEXT = {
  400: "Bad request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not found",
  405: "Method not allowed",
  409: "Conflict",
  413: "Payload too large",
  422: "Validation failed",
  429: "Too many requests",
  500: "Internal server error",
  502: "Bad gateway",
  503: "Service unavailable",
};

export function loginPath() {
  return window.location.pathname.includes("/admin/") ? "../login.html" : "login.html";
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  } catch (err) {
    /* storage unavailable — nothing to clear */
  }
}

export function redirectToLogin(nextPath) {
  clearSession();
  const q = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
  window.location.assign(loginPath() + q);
}

/**
 * Fetch a JSON endpoint under the API.
 * @param {string} path        e.g. "/projects", must start with "/"
 * @param {object} [opts]
 * @param {string} [opts.method="GET"]
 * @param {object} [opts.body]  JSON-serializable body
 * @param {object} [opts.params] query params (empty/falsy values omitted)
 * @param {boolean} [opts.auth=false] attach Bearer; 401 → clear + redirect
 */
export async function apiFetch(path, opts = {}) {
  const { method = "GET", body, params, auth = false } = opts;

  const basePrefix = API_BASE.startsWith("http://") || API_BASE.startsWith("https://")
    ? API_BASE
    : window.location.origin + API_BASE;
  const url = new URL(basePrefix + path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  if (demoActive()) {
    const demoResult = demoFetch(method, path, params, body);
    if (demoResult && demoResult.__demoError) {
      const de = demoResult.__demoError;
      if (de.status === 401 && auth) {
        const rel = window.location.pathname.replace(/^\//, "") || "index.html";
        redirectToLogin(rel);
      }
      throw new ApiError(de.status, {
        status: de.status,
        message: de.message,
        timestamp: new Date().toISOString(),
        path: url.pathname,
      }, url.pathname);
    }
    return demoResult;
  }

  const headers = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    try {
      const renderUrl = new URL(RENDER_FALLBACK + path);
      if (params) {
        for (const [key, value] of Object.entries(params)) {
          if (value !== undefined && value !== null && value !== "") {
            renderUrl.searchParams.set(key, String(value));
          }
        }
      }
      const rRes = await fetch(renderUrl, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
      if (rRes.ok) {
        const rText = await rRes.text();
        if (rText) return JSON.parse(rText);
      }
    } catch (rErr) { /* ignore fallback error */ }
    const fallback = demoFetch(method, path, params, body);
    if (fallback && !fallback.__demoError) return fallback;

    throw new ApiError(0, {
      status: 0,
      message: "Network error — the server could not be reached. Check that the backend is running.",
      timestamp: new Date().toISOString(),
      path: url.pathname,
    }, url.pathname);
  }

  // 204 No Content
  if (response.status === 204) return null;

  let payload = null;
  const text = await response.text();
  if (text) {
    try { payload = JSON.parse(text); } catch (err) { payload = null; }
  }

  if (!response.ok) {
    if (response.status === 404 || response.status === 502 || response.status === 503 || response.status === 500 || response.status === 401) {
      try {
        const renderUrl = new URL(RENDER_FALLBACK + path);
        if (params) {
          for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null && value !== "") {
              renderUrl.searchParams.set(key, String(value));
            }
          }
        }
        const rRes = await fetch(renderUrl, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
        if (rRes.ok) {
          const rText = await rRes.text();
          if (rText) return JSON.parse(rText);
        }
      } catch (rErr) { /* ignore fallback error */ }
      const fallback = demoFetch(method, path, params, body);
      if (fallback && !fallback.__demoError) return fallback;
    }

    const normalized = {
      status: response.status,
      message: (payload && typeof payload.message === "string" && payload.message)
        || STATUS_TEXT[response.status]
        || `Request failed (${response.status})`,
      timestamp: (payload && payload.timestamp) || new Date().toISOString(),
      path: (payload && payload.path) || url.pathname,
    };
    if (payload && typeof payload === "object") {
      for (const [k, v] of Object.entries(payload)) {
        if (!(k in normalized)) normalized[k] = v;
      }
    }
    if ((response.status === 401 || response.status === 403) && auth) {
      const rel = window.location.pathname.replace(/^\//, "") || "index.html";
      redirectToLogin(rel);
    }
    throw new ApiError(response.status, normalized, url.pathname);
  }

  return payload;
}

/** Human-readable message from any thrown value. */
export function errorMessage(err, fallback = "Something went wrong. Please try again.") {
  return (err && (err.messageText || err.message)) || fallback;
}

if (typeof window !== "undefined") {
  window.apiFetch = apiFetch;
}
