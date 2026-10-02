import { demoActive } from "./demo-data.js";
import { autoInitGrid } from "./interactive-grid.js";

/**
 * Apex Innovators — components.js
 * Shared UI: injectable navbar/footer/admin shell, session-aware auth UI,
 * inline SVG icon set, toast, modal helpers, skeleton/empty/error state
 * mounters, and a pagination renderer.
 *
 * Auto-init: if the page carries <header id="nav-root" data-active="…">,
 * <footer id="footer-root"> or <div id="nav-actions">, this module fills
 * them on load. Admin pages skip those roots and call injectAdminShell().
 */

/* ================= Icons ================= */
const ICONS = {
  menu: '<line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>',
  close: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  "arrow-right": '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
  "arrow-left": '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
  "chevron-left": '<polyline points="15 18 9 12 15 6"/>',
  "chevron-right": '<polyline points="9 18 15 12 9 6"/>',
  external: '<polyline points="15 3 21 3 21 9"/><polyline points="10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/>',
  github: '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  award: '<circle cx="12" cy="8" r="6"/><polyline points="15.477 12.89 17 22 12 19 7 22 8.523 12.89"/>',
  code: '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>',
  sparkles: '<path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/>',
  message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
  send: '<path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 6 12 13 2 6"/>',
  pin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  layers: '<path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  trash: '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  terminal: '<polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  graduation: '<path d="M22 10v6"/><path d="M2 10 12 5l10 5-10 5z"/><path d="M6 12.5V17c3.5 3 8.5 3 12 0v-4.5"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  smartphone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><line x1="12" x2="12.01" y1="18" y2="18"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
};
/** Inline SVG string for `name`. */
export function icon(name, cls = "") {
  const inner = ICONS[name] || ICONS.flag;
  return `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

/* ================= Formatting helpers ================= */
export function isAppMode() {
  try {
    if (typeof window === "undefined") return false;
    const ua = (navigator.userAgent || navigator.vendor || window.opera || "").toLowerCase();
    const isAndroidApp =
      ua.includes("apexinnovatorsandroid") ||
      ua.includes("apexadminandroid") ||
      ua.includes("apexinnovators") ||
      ua.includes("apexadmin") ||
      window.ApexAndroid !== undefined ||
      window.isApexApp === true;

    const isStandalone =
      (window.matchMedia &&
        (window.matchMedia("(display-mode: standalone)").matches ||
          window.matchMedia("(display-mode: fullscreen)").matches ||
          window.matchMedia("(display-mode: minimal-ui)").matches)) ||
      navigator.standalone === true ||
      (document.referrer && document.referrer.includes("android-app://"));

    return Boolean(isAndroidApp || isStandalone);
  } catch (e) {
    return false;
  }
}

export function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function humanize(value) {
  if (!value) return "";
  return String(value)
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

export function applyAppModeDOM() {
  if (!isAppMode()) return;
  if (document.body) {
    document.body.classList.add("is-app-mode");
  }
  const banner = document.getElementById("demo-banner");
  if (banner) banner.remove();

  const selectors = [
    'a[href*="ApexInnovators.apk"]',
    'a[href*="/releases/download/"]',
    '[data-app-download]',
    '[data-app-download-card]',
    '.app-download-btn',
  ];
  document.querySelectorAll(selectors.join(",")).forEach((el) => {
    const li = el.closest("li");
    if (li && li.children.length === 1) {
      li.style.display = "none";
    }
    el.style.display = "none";
  });
}
export function initials(name) {
  const parts = String(name || "?").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formatDate(value) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

/** Split a date into { day, mon } for event date blocks. */
export function dateBlock(value) {
  const d = toDate(value);
  if (!d) return { day: "–", mon: "———", iso: "" };
  return {
    day: String(d.getDate()).padStart(2, "0"),
    mon: d.toLocaleDateString("en-US", { month: "short" }),
    iso: d.toISOString ? value : "",
  };
}

export function timeAgo(value) {
  const d = toDate(value);
  if (!d) return "";
  const sec = Math.round((Date.now() - d.getTime()) / 1000);
  if (sec < 45) return "just now";
  if (sec < 3600) return `${Math.round(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.round(sec / 3600)}h ago`;
  if (sec < 86400 * 30) return `${Math.round(sec / 86400)}d ago`;
  return formatDate(value);
}

export function truncate(text, max = 260) {
  const t = String(text || "");
  return t.length > max ? `${t.slice(0, max).trimEnd()}…` : t;
}

/* ================= Visual helpers ================= */
export function avatar(name, photoUrl, cls = "") {
  const photo = photoUrl
    ? `<img src="${esc(photoUrl)}" alt="" loading="lazy" onerror="this.remove()">`
    : "";
  return `<span class="avatar ${cls}">${esc(initials(name))}${photo}</span>`;
}

const TONES = {
  // Achievements
  AWARD: "tc-amber", CERTIFICATE: "tc-cyan", FINALIST: "tc-violet",
  MENTION: "tc-emerald", OTHER: "tc-slate",
  // Post types
  DISCUSSION: "tc-cyan", PROJECT: "tc-violet", ACHIEVEMENT: "tc-amber",
  HACKATHON: "tc-emerald", RESOURCE: "tc-fuchsia", QUESTION: "tc-orange",
  ANNOUNCEMENT: "tc-red",
  // Event modes
  ONLINE: "tc-emerald", OFFLINE: "tc-violet", HYBRID: "tc-amber",
};

export function toneClass(name) {
  return TONES[name] || "tc-slate";
}

export function typeChip(name) {
  const label = humanize(name);
  return `<span class="type-chip ${toneClass(name)}">${esc(label)}</span>`;
}

const STATUS_CLASS = {
  DRAFT: "b-draft", PENDING_REVIEW: "b-pending", APPROVED: "b-approved",
  PUBLISHED: "b-published", REJECTED: "b-rejected",
  ACTIVE: "b-active", SUSPENDED: "b-suspended",
  NEW: "b-new", READ: "b-read", REPLIED: "b-replied",
};

export function statusBadge(status) {
  const cls = STATUS_CLASS[status] || "b-draft";
  return `<span class="badge ${cls}">${esc(humanize(status))}</span>`;
}

const ROLE_CLASS = { ADMIN: "b-admin", CORE_MEMBER: "b-core", MEMBER: "b-member" };

export function roleBadge(role) {
  const cls = ROLE_CLASS[role] || "b-member";
  return `<span class="badge ${cls}">${esc(humanize(role))}</span>`;
}

/* ================= Navbar / Footer ================= */
const PUBLIC_LINKS = [
  { id: "home", href: "index.html", label: "Home" },
  { id: "projects", href: "projects.html", label: "Projects" },
  { id: "hackathons", href: "hackathons.html", label: "Hackathons" },
  { id: "team", href: "team.html", label: "Team" },
  { id: "achievements", href: "achievements.html", label: "Achievements" },
  { id: "community", href: "community.html", label: "Community" },
  { id: "events", href: "events.html", label: "Events" },
  { id: "resources", href: "resources.html", label: "Resources" },
  { id: "contact", href: "contact.html", label: "Contact" },
  { id: "admin", href: "admin/projects.html", label: "Admin Panel" },
];

function logoPath() {
  return "logo.png";
}

function brandMark() {
  return `<img src="${logoPath()}" class="brand-mark-img" alt="Apex Logo" style="width:28px;height:28px;border-radius:50%;object-fit:cover;margin-right:0.45rem;vertical-align:middle;display:inline-block;box-shadow:0 0 10px rgba(34,211,238,0.35);border:1px solid rgba(34,211,238,0.4);" onerror="this.style.display='none'">`;
}

function brandBlock() {
  return `<a class="brand" href="index.html" aria-label="Apex Innovators — home">
    ${brandMark()}
    <span class="brand-name">Apex <em>Innovators</em></span>
  </a>`;
}

function currentPageName() {
  const p = (window.location.pathname.split("/").pop() || "").split("?")[0];
  if (!p || p === "" || p === "admin") return "dashboard.html";
  if (!p.includes(".")) return p + ".html";
  return p;
}

/** Build the shared public navbar; `active` matches a link id. */
export function initAnimeMascotNav(navContainer) {
  if (!navContainer) return;
  const activeLink = navContainer.querySelector(".anime-nav-link.active") || navContainer.querySelector(".admin-nav-link.active") || navContainer.querySelector(".nav-link.active");

  let mascot = navContainer.querySelector(".anime-mascot");
  if (!mascot) {
    mascot = document.createElement("div");
    mascot.className = "anime-mascot";
    mascot.innerHTML = `
      <div class="anime-mascot-head">
        <div class="anime-mascot-eye left"></div>
        <div class="anime-mascot-eye right"></div>
        <div class="anime-mascot-blush left"></div>
        <div class="anime-mascot-blush right"></div>
        <div class="anime-mascot-mouth"></div>
        <span class="anime-mascot-sparkle s1">✨</span>
        <span class="anime-mascot-sparkle s2">✨</span>
        <div class="anime-mascot-ear"></div>
      </div>
    `;
    navContainer.appendChild(mascot);
  }

  function moveMascot(target) {
    if (!target || !mascot) return;
    const rect = target.getBoundingClientRect();
    const parentRect = navContainer.getBoundingClientRect();
    const leftPos = rect.left - parentRect.left + rect.width / 2;
    const topPos = rect.top - parentRect.top;
    mascot.style.left = `${leftPos}px`;
    mascot.style.top = navContainer.id === "admin-nav-pill-root" ? `${topPos - 36}px` : "-46px";
    mascot.style.transition = "left 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275), top 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
  }

  if (activeLink) moveMascot(activeLink);

  const links = navContainer.querySelectorAll(".anime-nav-link, .admin-nav-link, .nav-link");
  links.forEach((l) => {
    l.addEventListener("mouseenter", () => moveMascot(l));
    l.addEventListener("mouseleave", () => {
      if (activeLink) moveMascot(activeLink);
    });
  });

  window.addEventListener("resize", () => {
    if (activeLink) moveMascot(activeLink);
  });
}

/** Build the shared public navbar with Anime Navbar animations and mascot. */
export function injectNav(active) {
  const root = document.getElementById("nav-root");
  if (!root) return;
  const current = active || root.dataset.active || document.body.dataset.page || "";

  const links = PUBLIC_LINKS.map((l) => {
    const on = l.id === current;
    const activeClass = on ? " anime-nav-link active" : " anime-nav-link";
    const glow = on ? `<div class="anime-nav-active-glow"><div class="glow-blur-1"></div><div class="glow-blur-2"></div><div class="glow-shine"></div></div>` : "";
    return `<li><a class="${activeClass}" href="${l.href}"${on ? ' aria-current="page"' : ""}>${glow}<span>${esc(l.label)}</span></a></li>`;
  }).join("");

  root.outerHTML = `<header class="site-header">
    <a class="skip-link" href="#main-content">Skip to content</a>
    <div class="container nav-inner">
      ${brandBlock()}
      <nav class="nav-links" id="site-nav" aria-label="Primary navigation">
        <div class="anime-nav-pill-container" id="anime-nav-root">
          <ul class="nav-list" style="display:flex;gap:0.25rem;align-items:center;margin:0;padding:0;list-style:none;">${links}</ul>
        </div>
        <div class="nav-actions" id="nav-actions"></div>
      </nav>
      <button class="nav-burger" id="nav-burger" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Toggle menu">
        <span class="ico-menu">${icon("menu")}</span>
        <span class="ico-close">${icon("close")}</span>
      </button>
    </div>
  </header>`;

  const navPill = document.getElementById("anime-nav-root");
  if (navPill) initAnimeMascotNav(navPill);

  const burger = document.getElementById("nav-burger");
  const panel = document.getElementById("site-nav");
  if (burger && panel) {
    burger.addEventListener("click", () => {
      const open = panel.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    panel.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        panel.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  mountAuthUI();
}

export function initMagneticButtons() {
  if (typeof document === "undefined") return;

  document.querySelectorAll(".magnetic-btn").forEach((el) => {
    if (el.dataset.magneticInited) return;
    el.dataset.magneticInited = "true";

    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const h = rect.width / 2;
      const w = rect.height / 2;
      const x = (e.clientX - rect.left - h) * 0.35;
      const y = (e.clientY - rect.top - w) * 0.35;

      el.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
      el.style.transition = "transform 0.15s ease-out";
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0px, 0px) scale(1)";
      el.style.transition = "transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
    });
  });
}

/** Shared public footer with Cinematic Motion animations. */
export function injectFooter() {
  const root = document.getElementById("footer-root");
  if (!root) return;
  const year = new Date().getFullYear();

  const marqueeText = `
    <div style="display:inline-flex;align-items:center;gap:3rem;padding:0 1.5rem;">
      <span>Accountability Redefined</span> <span style="color:#22d3ee;margin:0 0.5rem;">✦</span>
      <span>Student Developer Squad</span> <span style="color:#a855f7;margin:0 0.5rem;">✦</span>
      <span>Hackathon Archive</span> <span style="color:#22d3ee;margin:0 0.5rem;">✦</span>
      <span>Parul Institute of Engineering & Technology</span> <span style="color:#a855f7;margin:0 0.5rem;">✦</span>
      <span>Absolute Privacy</span> <span style="color:#22d3ee;margin:0 0.5rem;">✦</span>
    </div>
  `;

  root.outerHTML = `<footer class="site-footer cinematic-footer-wrapper">
    <div class="footer-aurora animate-footer-breathe"></div>
    <div class="footer-bg-grid"></div>
    <div class="footer-giant-bg-text">APEX INNOVATORS</div>

    <!-- 1. Ticker Marquee Header -->
    <div style="position:relative;z-index:10;width:100%;overflow:hidden;border-bottom:1px solid rgba(255,255,255,0.1);background:rgba(6,11,20,0.6);backdrop-filter:blur(12px);padding:0.75rem 0;transform:rotate(-1deg) scale(1.02);margin-bottom:2rem;">
      <div class="animate-footer-scroll-marquee" style="font-size:0.8rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--text-2);">
        ${marqueeText}
        ${marqueeText}
      </div>
    </div>

    <!-- 2. Main Footer Grid & Content -->
    <div class="container" style="position:relative;z-index:10;">
      <div class="footer-grid">
        <div class="footer-brand">
          ${brandBlock()}
          <p class="footer-tag">A student developer team building software, competing in hackathons and growing a community of makers.</p>
          <span class="footer-institute">${icon("graduation")} Parul Institute of Engineering and Technology · Vadodara, India</span>
        </div>

        <nav class="footer-col" aria-label="Platform">
          <h4>Platform</h4>
          <ul>
            <li><a href="projects.html">${icon("code")} Projects</a></li>
            <li><a href="hackathons.html">${icon("trophy")} Hackathons</a></li>
            <li><a href="team.html">${icon("users")} Team</a></li>
            <li><a href="achievements.html">${icon("award")} Achievements</a></li>
            <li><a href="community.html">${icon("message")} Community</a></li>
            <li><a href="admin/projects.html">${icon("shield")} Admin Panel</a></li>
          <ul>
            <li><a href="events.html">${icon("calendar")} Events</a></li>
            <li><a href="resources.html">${icon("book")} Resources</a></li>
            <li><a href="about.html">${icon("info")} About</a></li>
            <li><a href="contact.html">${icon("mail")} Contact</a></li>
          </ul>
        </nav>

        <div class="footer-col">
          <h4>Get Involved & Downloads</h4>
          <div style="display:flex;flex-direction:column;gap:0.75rem;margin-top:0.5rem;">
            ${isAppMode() ? "" : `<a class="footer-glass-pill magnetic-btn" href="https://github.com/Sky-ydv2008/Team.Apex/releases/download/v1.0.0/ApexInnovators.apk" download="ApexInnovators.apk" type="application/vnd.android.package-archive" data-app-download="true">
              ${icon("smartphone")} <span>Download Android App</span>
            </a>`}
            ${isAppMode() ? "" : `<a class="footer-glass-pill magnetic-btn" href="https://github.com/Sky-ydv2008/Team.Apex/releases/download/v1.0.3/ApexInnovators-Windows.exe" download="ApexInnovators-Windows.exe" type="application/x-msdownload" data-app-download="true">
              ${icon("dashboard")} <span>Download Windows App</span>
            </a>`}
            <a class="footer-glass-pill magnetic-btn" href="register.html" style="background:linear-gradient(135deg,rgba(34,211,238,0.2),rgba(168,85,247,0.2));border-color:rgba(34,211,238,0.4);color:#fff;">
              ${icon("rocket")} <span>Join the Squad</span>
            </a>
          </div>
        </div>
      </div>

      <!-- 3. Bottom Bar & Heartbeat Badge -->
      <div style="position:relative;z-index:20;width:100%;padding:2rem 0 2.5rem;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1.5rem;border-top:1px solid rgba(255,255,255,0.08);margin-top:2rem;">
        <div style="color:var(--text-3);font-size:0.78rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;">
          © ${year} Apex Innovators. All rights reserved.
        </div>

        <div class="footer-glass-pill" style="cursor:default;border-color:rgba(255,255,255,0.15);">
          <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--text-3);">Crafted with</span>
          <span class="animate-footer-heartbeat" style="color:#ef4444;font-size:1.1rem;margin:0 0.2rem;">❤</span>
          <span style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--text-3);">by</span>
          <span style="color:#fff;font-weight:900;font-size:0.85rem;margin-left:0.2rem;">Apex Innovators</span>
        </div>

        <button type="button" class="footer-glass-pill magnetic-btn" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="Back to top" style="width:2.8rem;height:2.8rem;padding:0;justify-content:center;border-radius:50%;">
          <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
        </button>
      </div>
    </div>
  </footer>`;

  initMagneticButtons();
}

/** Render session-aware controls into #nav-actions (run after injectNav). */
export function mountAuthUI() {
  const host = document.getElementById("nav-actions");
  if (!host) return;

  let user = null;
  try {
    const raw = localStorage.getItem("ai_user");
    if (raw) user = JSON.parse(raw);
  } catch (err) { user = null; }

  const page = currentPageName();
  const here = (target) => page === target;

  const appBtn = isAppMode() ? "" : `<a class="btn btn-sm btn-outline" href="https://github.com/Sky-ydv2008/Team.Apex/releases/download/v1.0.0/ApexInnovators.apk" download="ApexInnovators.apk" type="application/vnd.android.package-archive" data-app-download="true" title="Download Android App" style="border-color:rgba(34,211,238,0.35);color:#22d3ee;display:inline-flex;align-items:center;gap:0.35rem;">${icon("smartphone")} <span>App</span></a>`;
  const targetAdminUrl = page.includes("/admin/") ? "projects.html" : "admin/projects.html";
  const adminBtn = `<a class="btn btn-sm btn-outline btn-admin-switch" id="nav-admin-switch" href="${targetAdminUrl}" title="Switch to Admin Panel" style="border-color:rgba(168,85,247,0.45);color:#c084fc;background:rgba(168,85,247,0.12);display:inline-flex;align-items:center;gap:0.35rem;">${icon("dashboard")} <span>Admin Panel</span></a>`;

  if (!user || !localStorage.getItem("ai_token")) {
    const loginBtn = here("login.html")
      ? ""
      : `<a class="btn btn-sm btn-ghost" href="login.html">Log in</a>`;
    const registerBtn = here("register.html")
      ? ""
      : `<a class="btn btn-sm btn-primary" href="register.html">Join us</a>`;
    host.innerHTML = appBtn + adminBtn + (loginBtn + registerBtn || `<a class="btn btn-sm btn-ghost" href="login.html">Log in</a>`);
  } else {
    const parts = [
      `<span class="nav-user" title="${esc(humanize(user.role))}">
        ${avatar(user.name, "", "avatar-sm avatar-round")}
        <span class="nav-user-name">${esc(user.name)}</span>
      </span>`,
    ];
    parts.push(`<a class="btn btn-sm btn-ghost" href="${here("profile.html") ? "#" : "profile.html"}">${icon("user")} Profile</a>`);
    parts.push(adminBtn);
    if (!here("register.html")) {
      parts.push(`<button class="btn btn-sm btn-ghost" id="nav-logout" type="button">${icon("logout")} Logout</button>`);
    }
    host.innerHTML = appBtn + parts.join("");
  }

  const logoutBtn = document.getElementById("nav-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("ai_token");
      localStorage.removeItem("ai_refresh");
      localStorage.removeItem("ai_user");
      window.location.assign(currentPageName());
    });
  }
}

/* ================= Admin shell ================= */
const ADMIN_SECTIONS = [
  { id: "dashboard", label: "Dashboard", href: "dashboard.html", file: "dashboard.html", icon: "dashboard" },
  { id: "projects", label: "Projects", href: "projects.html", file: "projects.html", icon: "code" },
  { id: "hackathons", label: "Hackathons", href: "hackathons.html", file: "hackathons.html", icon: "trophy" },
  { id: "users", label: "Users", href: "users.html", file: "users.html", icon: "users" },
  { id: "posts", label: "Posts", href: "posts.html", file: "posts.html", icon: "message" },
  { id: "achievements", label: "Achievements", href: "achievements.html", file: "achievements.html", icon: "award" },
  { id: "events", label: "Events", href: "events.html", file: "events.html", icon: "calendar" },
  { id: "resources", label: "Resources", href: "resources.html", file: "resources.html", icon: "book" },
  { id: "messages", label: "Messages", href: "messages.html", file: "messages.html", icon: "mail" },
];
/** Sections a CORE_MEMBER may reach (content moderation only). */
const CORE_SECTIONS = new Set(["projects", "posts"]);
/**
 * Fill the admin layout skeleton: #admin-sidebar + #admin-topbar.
 * Expects page markup: .admin-layout > aside#admin-sidebar + .admin-main.
 */
export function injectAdminShell(active, user) {
  const aside = document.getElementById("admin-sidebar");
  const topbar = document.getElementById("admin-topbar");
  if (!aside && !topbar) return;

  if (topbar && topbar.parentElement && !document.getElementById("admin-interactive-grid")) {
    const mainCol = topbar.parentElement;
    const canvas = document.createElement("canvas");
    canvas.id = "admin-interactive-grid";
    canvas.className = "admin-grid-canvas";
    canvas.setAttribute("aria-hidden", "true");
    mainCol.prepend(canvas);
    if (typeof autoInitGrid === "function") autoInitGrid();
  }
  const section = ADMIN_SECTIONS.find((s) => s.id === active) || ADMIN_SECTIONS[0];

  const sections = (user && user.role === "CORE_MEMBER")
    ? ADMIN_SECTIONS.filter((s) => CORE_SECTIONS.has(s.id))
    : ADMIN_SECTIONS;
  const links = sections.map((s) => {
    const on = s.id === (active || section.id);
    return `<a class="admin-nav-link${on ? " active" : ""}" href="${s.href}"${on ? ' aria-current="page"' : ""}>
      ${icon(s.icon)}<span>${esc(s.label)}</span>
    </a>`;
  }).join("");

  if (aside) {
    aside.innerHTML = `
      <div class="admin-brand">${brandBlock()}<span class="badge b-admin">${user && user.role === "CORE_MEMBER" ? "Moderation" : "Admin"}</span></div>
      <p class="admin-nav-label">Manage</p>
      <nav class="admin-nav anime-nav-pill-container" id="admin-nav-pill-root" aria-label="Admin sections" style="position:relative;flex-direction:column;align-items:stretch;background:transparent;border:none;box-shadow:none;padding:0.25rem 0.65rem;">${links}</nav>`;

    const adminNavPill = document.getElementById("admin-nav-pill-root");
    if (adminNavPill) initAnimeMascotNav(adminNavPill);
  }

  if (topbar) {
    topbar.innerHTML = `
      <div class="admin-top-left">
        <button class="nav-burger" id="admin-burger" type="button" aria-expanded="false" aria-controls="admin-sidebar" aria-label="Toggle sidebar">
          <span class="ico-menu">${icon("menu")}</span>
          <span class="ico-close">${icon("close")}</span>
        </button>
        <h1 class="admin-page-title">${esc(section.label)}</h1>
      </div>
      <div class="admin-top-right">
        <span class="admin-top-user">
          ${avatar(who, "", "avatar-sm avatar-round")}
        <h1 class="admin-page-title">${esc(section.label)}</h1>
      </div>
      <div class="admin-top-right">
        
        <span class="admin-top-user">
          ${avatar(who, "", "avatar-sm avatar-round")}
          <span class="who">${who}<span>${user && user.role ? esc(humanize(user.role)) : "Administrator"}</span></span>
        </span>
        <button class="btn btn-sm btn-ghost" id="admin-logout" type="button">${icon("logout")} Sign out</button>
      </div>`;

    const logoutBtn = document.getElementById("admin-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("ai_token");
        localStorage.removeItem("ai_refresh");
        localStorage.removeItem("ai_user");
        window.location.assign("../index.html");
      });
    }
  }

  const burger = document.getElementById("admin-burger");
  if (burger && aside) {
    burger.addEventListener("click", () => {
      const open = aside.classList.toggle("open");
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close sidebar" : "Open sidebar");
    });
    // Close after navigation
    aside.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => aside.classList.remove("open"));
    });
  }

  // Inject Admin Cinematic Motion Footer
  const mainCol = document.querySelector(".admin-main");
  if (mainCol && !document.getElementById("admin-footer-root")) {
    const adminFooter = document.createElement("footer");
    adminFooter.id = "admin-footer-root";
    adminFooter.className = "cinematic-footer-wrapper";
    adminFooter.style.marginTop = "auto";
    adminFooter.style.borderTop = "1px solid rgba(255,255,255,0.08)";

    const adminMarquee = `
      <div style="display:inline-flex;align-items:center;gap:3rem;padding:0 1.5rem;">
        <span>ADMIN CONTROL</span> <span style="color:#a855f7;margin:0 0.5rem;">✦</span>
        <span>CONTENT MODERATION</span> <span style="color:#22d3ee;margin:0 0.5rem;">✦</span>
        <span>USER MANAGEMENT</span> <span style="color:#a855f7;margin:0 0.5rem;">✦</span>
        <span>AUDIT TRAIL</span> <span style="color:#22d3ee;margin:0 0.5rem;">✦</span>
        <span>APEX PLATFORM</span> <span style="color:#a855f7;margin:0 0.5rem;">✦</span>
      </div>
    `;

    adminFooter.innerHTML = `
      <div class="footer-aurora animate-footer-breathe" style="opacity:0.4;"></div>
      <div class="footer-bg-grid"></div>
      <div class="footer-giant-bg-text" style="font-size:16vw;">APEX ADMIN</div>

      <div style="position:relative;z-index:10;width:100%;overflow:hidden;border-bottom:1px solid rgba(255,255,255,0.08);background:rgba(6,11,20,0.6);backdrop-filter:blur(12px);padding:0.6rem 0;transform:rotate(-1deg) scale(1.02);margin-bottom:1.5rem;">
        <div class="animate-footer-scroll-marquee" style="font-size:0.75rem;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:var(--text-3);">
          ${adminMarquee}
          ${adminMarquee}
        </div>
      </div>

      <div class="container" style="position:relative;z-index:10;padding-bottom:1.5rem;">
        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:1rem;">
          <div style="display:flex;align-items:center;gap:0.75rem;">
            ${brandBlock()}
            <span class="badge b-admin">${user && user.role === "CORE_MEMBER" ? "Moderation" : "Admin Panel"}</span>
          </div>

          <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
            <a href="dashboard.html" class="footer-glass-pill magnetic-btn" style="padding:0.4rem 0.9rem;font-size:0.8rem;">${icon("dashboard")} Dashboard</a>
            <a href="projects.html" class="footer-glass-pill magnetic-btn" style="padding:0.4rem 0.9rem;font-size:0.8rem;">${icon("code")} Projects</a>
            <a href="posts.html" class="footer-glass-pill magnetic-btn" style="padding:0.4rem 0.9rem;font-size:0.8rem;">${icon("message")} Posts</a>
            <a href="users.html" class="footer-glass-pill magnetic-btn" style="padding:0.4rem 0.9rem;font-size:0.8rem;">${icon("users")} Users</a>
            <a href="../index.html" class="footer-glass-pill magnetic-btn" style="padding:0.4rem 0.9rem;font-size:0.8rem;border-color:rgba(34,211,238,0.3);color:#7dd3fc;">${icon("globe")} View Public Site</a>
          </div>
        </div>

        <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:1rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,0.06);">
          <div style="color:var(--text-3);font-size:0.75rem;">
            © ${new Date().getFullYear()} Apex Innovators Admin Environment. Secure Session.
          </div>

          <div class="footer-glass-pill" style="cursor:default;padding:0.35rem 0.85rem;border-color:rgba(255,255,255,0.1);">
            <span style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-3);">Crafted with</span>
            <span class="animate-footer-heartbeat" style="color:#ef4444;font-size:0.95rem;margin:0 0.15rem;">❤</span>
            <span style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--text-3);">by</span>
            <span style="color:#fff;font-weight:900;font-size:0.8rem;margin-left:0.15rem;">Apex Innovators</span>
          </div>

          <button type="button" class="footer-glass-pill magnetic-btn" onclick="window.scrollTo({top:0,behavior:'smooth'})" aria-label="Back to top" style="width:2.4rem;height:2.4rem;padding:0;justify-content:center;border-radius:50%;">
            <svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
          </button>
        </div>
      </div>
    `;

    mainCol.appendChild(adminFooter);
    initMagneticButtons();
  }
}
/* ================= Toast ================= */
const TOAST_ICONS = { success: "check", error: "alert", warning: "alert", info: "info" };

export function toast(message, kind = "info", timeout = 4200) {
  let root = document.getElementById("toast-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "toast-root";
    root.setAttribute("role", "status");
    root.setAttribute("aria-live", "polite");
    document.body.appendChild(root);
  }

  const el = document.createElement("div");
  el.className = `toast ${kind}`;
  el.innerHTML = `${icon(TOAST_ICONS[kind] || "info")}<span>${esc(message)}</span>`;
  root.appendChild(el);

  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 320);
  }, timeout);
}

/* ================= Modal helpers ================= */
function wireDialog(dialog) {
  if (dialog.dataset.wired) return;
  dialog.dataset.wired = "1";
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) closeDialog(dialog);
  });
  dialog.querySelectorAll("[data-dialog-close]").forEach((btn) => {
    btn.addEventListener("click", () => closeDialog(dialog));
  });
}

export function openDialog(dialog) {
  if (!dialog) return;
  wireDialog(dialog);
  if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
}

export function closeDialog(dialog) {
  if (!dialog) return;
  if (dialog.open && typeof dialog.close === "function") dialog.close();
}

/**
 * Promise-based confirmation dialog (native <dialog>, appended on demand).
 * @returns {Promise<boolean>}
 */
export function confirmDialog(opts = {}) {
  const {
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    tone = "danger",
  } = opts;

  return new Promise((resolve) => {
    const dialog = document.createElement("dialog");
    dialog.className = "modal";
    const confirmBtnClass = tone === "danger" ? "btn-danger" : tone === "warn" ? "btn-warn-soft" : "btn-primary";
    dialog.innerHTML = `
      <div class="modal-box" style="max-width: 440px;">
        <div class="modal-head">
          <h3>${esc(title)}</h3>
          <button class="modal-close" type="button" data-dialog-close aria-label="Close">${icon("close")}</button>
        </div>
        <div class="modal-body">
          <p class="muted" style="font-size:0.94rem;">${esc(message)}</p>
        </div>
        <div class="modal-foot">
          <button class="btn btn-ghost" type="button" data-cancel>${esc(cancelLabel)}</button>
          <button class="btn ${confirmBtnClass}" type="button" data-confirm>${esc(confirmLabel)}</button>
        </div>
      </div>`;
    document.body.appendChild(dialog);

    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      closeDialog(dialog);
      setTimeout(() => dialog.remove(), 200);
      resolve(value);
    };

    dialog.addEventListener("close", () => finish(false));
    dialog.querySelector("[data-confirm]").addEventListener("click", () => finish(true));
    dialog.querySelector("[data-cancel]").addEventListener("click", () => finish(false));

    wireDialog(dialog);
    if (typeof dialog.showModal === "function") dialog.showModal();
  });
}

/* ================= States: loading / empty / error / data ================= */
function skeletonMarkup(kind, count) {
  const n = Math.max(1, count || 1);
  let unit = "";
  if (kind === "stat") {
    unit = `<div class="sk-stat"><div class="sk-line w40"></div><div class="sk-line w70" style="height:1.6rem;"></div></div>`;
  } else if (kind === "table") {
    unit = `<div class="sk-table"><div class="sk-row sk w70"></div><div class="sk-row sk w90"></div><div class="sk-row sk w80"></div><div class="sk-row sk w85"></div></div>`;
  } else if (kind === "feed") {
    unit = `<div class="sk-card"><div class="sk-line w30"></div><div class="sk-line w90"></div><div class="sk-line w100"></div><div class="sk-line w70"></div></div>`;
  } else if (kind === "detail") {
    unit = `<div class="sk-card"><div class="sk-thumb w100"></div><div class="sk-line w40"></div><div class="sk-line w90"></div><div class="sk-line w100"></div><div class="sk-line w80"></div></div>`;
  } else {
    unit = `<div class="sk-card"><div class="sk-thumb sk w100"></div><div class="sk-line sk w70"></div><div class="sk-line sk w100"></div><div class="sk-line sk w60"></div></div>`;
  }
  return unit.repeat(n);
}

/** Put skeleton placeholders into `el`. */
export function mountLoading(el, kind = "card", count = 6) {
  if (!el) return;
  const wrap = kind === "table" ? "" : ' class="grid g2" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr));"';
  el.innerHTML = `<div${wrap} aria-hidden="true">${skeletonMarkup(kind, count)}</div>`;
}

export function mountData(el, html) {
  if (el) el.innerHTML = html;
}

export function mountEmpty(el, opts = {}) {
  const { title = "Nothing here yet", message = "", actionLabel = "", actionHref = "", iconName = "flag" } = opts;
  if (!el) return;
  el.innerHTML = `<div class="state">
    <span class="state-icon">${icon(iconName)}</span>
    <h3 class="state-title">${esc(title)}</h3>
    ${message ? `<p class="state-text">${esc(message)}</p>` : ""}
    ${actionLabel && actionHref ? `<a class="btn btn-outline btn-sm" href="${esc(actionHref)}">${esc(actionLabel)}</a>` : ""}
  </div>`;
}

export function mountError(el, message, retry) {
  if (!el) return;
  el.innerHTML = `<div class="state state-error">
    <span class="state-icon">${icon("alert")}</span>
    <h3 class="state-title">Could not load data</h3>
    <p class="state-text">${esc(message || "An unexpected error occurred. Please try again.")}</p>
    ${typeof retry === "function" ? `<button class="btn btn-outline btn-sm" type="button" id="state-retry">${icon("arrow-right")} Retry</button>` : ""}
  </div>`;
  if (typeof retry === "function") {
    const btn = el.querySelector("#state-retry");
    if (btn) btn.addEventListener("click", retry);
  }
}

/* ================= Pagination ================= */
function pageWindow(current, total) {
  const pages = [];
  const push = (p) => { if (p >= 0 && p < total && pages[pages.length - 1] !== p) pages.push(p); };
  push(0);
  for (let p = current - 2; p <= current + 2; p++) push(p);
  push(total - 1);
  const out = [];
  let prev = -2;
  for (const p of pages) {
    if (p - prev > 1) out.push("…");
    out.push(p);
    prev = p;
  }
  return out;
}

/**
 * Render prev/next + numbered buttons into `el`.
 * @param {HTMLElement} el
 * @param {{page:number,size:number,totalPages:number,totalElements:number}} pageObj
 * @param {(page:number)=>void} go
 */
export function renderPagination(el, pageObj, go) {
  if (!el) return;
  const page = Number(pageObj?.page ?? 0);
  const total = Number(pageObj?.totalPages ?? 1);

  if (total <= 1) {
    el.innerHTML = "";
    return;
  }

  const prevDisabled = page <= 0;
  const nextDisabled = page >= total - 1;

  let html = `<nav class="pagination" aria-label="Pagination">
    <button class="page-btn" type="button" data-p="${page - 1}" ${prevDisabled ? "disabled" : ""} aria-label="Previous page">${icon("chevron-left")}</button>`;

  for (const item of pageWindow(page, total)) {
    if (item === "…") {
      html += `<span class="page-ellipsis" aria-hidden="true">…</span>`;
    } else {
      html += `<button class="page-btn${item === page ? " active" : ""}" type="button" data-p="${item}" ${item === page ? 'aria-current="page"' : ""}>${item + 1}</button>`;
    }
  }

  html += `<button class="page-btn" type="button" data-p="${page + 1}" ${nextDisabled ? "disabled" : ""} aria-label="Next page">${icon("chevron-right")}</button></nav>`;
  el.innerHTML = html;

  el.querySelectorAll("button[data-p]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!btn.disabled) go(Number(btn.dataset.p));
    });
  });
}

/** "Showing 1–6 of 18 · Page 2 of 3" summary line. */
export function pageInfo(pageObj) {
  if (!pageObj || pageObj.totalElements === undefined) return "";
  const page = Number(pageObj.page ?? 0);
  const size = Number(pageObj.size ?? 1) || 1;
  const total = Number(pageObj.totalElements ?? 0);
  if (total === 0) return "";
  const from = page * size + 1;
  const to = Math.min((page + 1) * size, total);
  const parts = [`Showing ${from}–${to} of ${total}`];
  const tp = Number(pageObj.totalPages ?? 1);
  if (tp > 1) parts.push(`Page ${page + 1} of ${tp}`);
  return parts.join(" · ");
}

/* ================= Auto-init ================= */
function mountDemoBanner() {
  if (isAppMode()) return;
  if (!demoActive()) return;
  if (!document.body || document.getElementById("demo-banner")) return;
  const b = document.createElement("div");
  b.id = "demo-banner";
  b.setAttribute("role", "status");
  b.style.cssText = "position:sticky;top:0;z-index:120;background:#082f49;color:#7dd3fc;font-size:.8rem;text-align:center;padding:.5rem 1rem;border-bottom:1px solid #155e75;";
  b.innerHTML = "Demo preview — built-in sample data. Accounts, posting and the admin panel run on the live backend (see the <a href=\"https://github.com/Sky-ydv2008/Team.Apex#readme\" style=\"color:#22d3ee\" target=\"_blank\" rel=\"noopener\">repo README</a>).";
  document.body.prepend(b);
}

function autoInit() {
  if (isAppMode()) {
    applyAppModeDOM();
  } else if (demoActive()) {
    mountDemoBanner();
  }
  if (document.getElementById("nav-root")) injectNav();
  if (document.getElementById("footer-root")) injectFooter();
  if (document.getElementById("nav-actions")) mountAuthUI();
  applyAppModeDOM();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", autoInit);
} else {
  autoInit();
}
