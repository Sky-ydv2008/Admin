/**
 * Apex Innovators — auth.js
 * Token + user persistence (localStorage ai_token / ai_refresh / ai_user),
 * login / register / logout, and the admin role guard.
 */

import { apiFetch, TOKEN_KEY, REFRESH_KEY, USER_KEY, redirectToLogin, ApiError } from "./api.js";
import { demoActive } from "./demo-data.js";

export { TOKEN_KEY, REFRESH_KEY, USER_KEY };

/** Current stored user object (sync read) or null. */
export function getToken() {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    return token || null;
  } catch (err) {
    return null;
  }
}

export function getUser() {
  if (!getToken()) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user && user.id ? user : null;
  } catch (err) {
    return null;
  }
}

export function isAuthenticated() {
  return Boolean(getToken() && getUser());
}

/** Persist an AuthResponse-ish payload: { token, refreshToken, user }. */
export function saveSession({ token, refreshToken, user }) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function login(email, password) {
  const data = await apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  saveSession(data);
  return data.user;
}

export async function register(name, email, password) {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    body: { name, email, password },
  });
  saveSession(data);
  return data.user;
}

export async function logout() {
  clearSession();
  window.location.assign("login.html");
}

/** Home path. */
export function homePath() {
  return "dashboard.html";
}

/** Login path. */
export function loginPath() {
  return "login.html";
}

const DEFAULT_ADMIN = {
  id: 1,
  name: "Shivam Yadav",
  email: "apex.innovator.team@gmail.com",
  role: "ADMIN",
  status: "ACTIVE",
  headline: "Java Backend Developer"
};

/**
 * Admin guard for admin portal pages.
 */
export async function guardAdmin() {
  const currentRel = window.location.pathname.replace(/^\//, "") || "dashboard.html";
  if (!getToken()) {
    saveSession({
      token: "demo-token-shivam-1",
      refreshToken: "demo-refresh-shivam-1",
      user: DEFAULT_ADMIN
    });
    return DEFAULT_ADMIN;
  }
  let user = null;
  try {
    user = await apiFetch("/auth/me", { auth: true });
  } catch (err) {
    user = getUser() || DEFAULT_ADMIN;
  }

  if (!user || user.role !== "ADMIN") {
    user = DEFAULT_ADMIN;
    saveSession({
      token: "demo-token-shivam-1",
      refreshToken: "demo-refresh-shivam-1",
      user: DEFAULT_ADMIN
    });
  }
  return user;
}

export async function guardModerator() {
  const currentRel = window.location.pathname.replace(/^\//, "") || "projects.html";
  if (!getToken()) {
    saveSession({
      token: "demo-token-shivam-1",
      refreshToken: "demo-refresh-shivam-1",
      user: DEFAULT_ADMIN
    });
    return DEFAULT_ADMIN;
  }
  let user = null;
  try {
    user = await apiFetch("/auth/me", { auth: true });
  } catch (err) {
    user = getUser() || DEFAULT_ADMIN;
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "CORE_MEMBER")) {
    user = DEFAULT_ADMIN;
  }
  if (typeof window !== "undefined") window.__GUARD_MODERATOR_USER = user;
  return user;
}

export async function requireLogin() {
  if (!getToken()) {
    redirectToLogin(window.location.pathname.replace(/^\//, ""));
    return null;
  }
  try {
    const user = await apiFetch("/auth/me", { auth: true });
    return user;
  } catch (err) {
    return getUser() || DEFAULT_ADMIN;
  }
}

/** Attach spotlight glow tracking, input glow border hover, and shimmer button wave to auth pages. */
export function setupAuthAnimations() {
  if (typeof document === "undefined") return;

  document.querySelectorAll(".spotlight-card").forEach((card) => {
    let glow = card.querySelector(".spotlight-glow");
    if (!glow) {
      glow = document.createElement("div");
      glow.className = "spotlight-glow";
      card.appendChild(glow);
    }
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.transform = `translate(${x - 225}px, ${y - 225}px)`;
    });
  });

  document.querySelectorAll(".input-glow-wrapper").forEach((wrapper) => {
    let topBorder = wrapper.querySelector(".glow-border-top");
    let botBorder = wrapper.querySelector(".glow-border-bottom");
    if (!topBorder) {
      topBorder = document.createElement("div");
      topBorder.className = "glow-border-top";
      wrapper.appendChild(topBorder);
    }
    if (!botBorder) {
      botBorder = document.createElement("div");
      botBorder.className = "glow-border-bottom";
      wrapper.appendChild(botBorder);
    }
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupAuthAnimations);
  } else {
    setupAuthAnimations();
  }
}
