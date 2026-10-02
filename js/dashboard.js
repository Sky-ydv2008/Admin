/**
 * Apex Innovators — dashboard.js (admin/dashboard.html)
 * Admin overview: widgets from GET /admin/overview + recent activity.
 * Runs guardAdmin() before anything else; redirects handled there.
 */

import { apiFetch, errorMessage } from "./api.js";
import { guardAdmin } from "./auth.js";
import {
  icon, esc, initials, timeAgo, humanize,
  injectAdminShell, mountLoading, mountData, mountEmpty, mountError,
} from "./components.js";

const widgetGrid = document.getElementById("widget-grid");
const activityEl = document.getElementById("activity-list");

const WIDGETS = [
  { key: "totalProjects", label: "Projects", icon: "code", cls: "" },
  { key: "totalHackathons", label: "Hackathons", icon: "trophy", cls: "violet" },
  { key: "totalMembers", label: "Members", icon: "users", cls: "emerald" },
  { key: "publishedPosts", label: "Published posts", icon: "message", cls: "" },
  { key: "pendingProjects", label: "Projects in review", icon: "clock", cls: "pending" },
  { key: "pendingPosts", label: "Posts in review", icon: "clock", cls: "pending" },
  { key: "unreadMessages", label: "Unread messages", icon: "mail", cls: "pending" },
];

function renderWidgets(o) {
  const html = WIDGETS.map((w) => {
    const value = o && o[w.key] !== undefined && o[w.key] !== null ? Number(o[w.key]).toLocaleString("en-US") : "–";
    const isPending = w.key.startsWith("pending") || w.key === "unreadMessages";
    return `<div class="card widget${isPending ? " pending" : ""}">
      <span class="icon-tile ${w.cls}">${icon(w.icon)}</span>
      <span class="widget-meta">
        <span class="w-label">${esc(w.label)}</span>
        <strong class="w-value">${esc(value)}</strong>
      </span>
    </div>`;
  }).join("");
  mountData(widgetGrid, html);
}

function renderActivity(items) {
  if (!items.length) {
    mountEmpty(activityEl, {
      title: "No recent activity",
      message: "Admin actions, submissions and status changes will show up here.",
      iconName: "clock",
    });
    return;
  }
  mountData(activityEl, `<div class="activity-list">${items.map((a) => `
    <div class="activity-item">
      <span class="avatar avatar-round">${esc(initials(a.actor || "A"))}</span>
      <div class="activity-body">
        <div><b>${esc(a.actor || "Admin")}</b> ${esc(humanize(a.action))}${a.entity ? ` <span class="faint">· ${esc(humanize(a.entity))}</span>` : ""}</div>
        ${a.detail ? `<div>${esc(a.detail)}</div>` : ""}
        ${a.createdAt ? `<time datetime="${esc(a.createdAt)}">${timeAgo(a.createdAt)}</time>` : ""}
      </div>
    </div>`).join("")}</div>`);
}

async function load() {
  mountLoading(widgetGrid, "stat", 8);
  mountLoading(activityEl, "feed", 4);
  try {
    const overview = await apiFetch("/admin/overview", { auth: true });
    renderWidgets(overview || {});
    renderActivity((overview && overview.recentActivity) || []);
  } catch (err) {
    mountError(widgetGrid, errorMessage(err, "Could not load the dashboard overview."), load);
    if (activityEl) activityEl.innerHTML = "";
  }
}

async function boot() {
  const user = await guardAdmin();
  if (!user) return;
  injectAdminShell("dashboard", user);
  load();
}

boot();
