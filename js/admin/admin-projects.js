/**
 * Apex Innovators — admin-projects.js (admin/projects.html)
 * Admin CRUD for projects: list with q/status filters, status PATCHes
 * (approve/reject/publish), create/edit modal, delete.
 * Guarded by guardAdmin() before any data loads.
 */

import { apiFetch, errorMessage } from "../api.js";
import { guardModerator } from "../auth.js";
import {
  icon, esc, formatDate, statusBadge, injectAdminShell,
  openDialog, closeDialog, confirmDialog, toast, renderPagination, pageInfo,
} from "../components.js";

if (typeof window !== "undefined") window.apiFetch = apiFetch;

const SIZE = 15;
const state = { page: 0, q: "", status: "" };
const cache = new Map();
const tbody = document.getElementById("table-body");
function getTbody() { return document.getElementById("table-body"); }
function getPager() { return document.getElementById("table-pager"); }
function getInfo() { return document.getElementById("list-info"); }
function getModal() { return document.getElementById("project-modal"); }
function getForm() { return document.getElementById("project-form"); }

function rowSkeleton() {
  return `<tr><td colspan="8" style="padding:1rem;"><div class="sk-list">
    <div class="sk sk-row w100"></div><div class="sk sk-row w100"></div><div class="sk sk-row w100"></div>
  </div></td></tr>`;
}

function collectForm() {
  const val = (id) => document.getElementById(id)?.value.trim() ?? "";
  const opt = (v) => (v ? v : null);
  return {
    title: val("p-title"),
    tagline: opt(val("p-tagline")),
    year: val("p-year") ? Number(val("p-year")) : null,
    status: val("p-status"),
    featured: Boolean(document.getElementById("p-featured")?.checked),
    githubUrl: opt(val("p-github-url")),
    demoUrl: opt(val("p-demo-url")),
    docsUrl: opt(val("p-docs-url")),
    description: opt(val("p-description")),
    problem: opt(val("p-problem")),
    solution: opt(val("p-solution")),
  };
}

function actionsFor(p) {
  const pub = p.slug ? `<a class="btn btn-sm btn-outline btn-icon" href="../project-details.html?slug=${encodeURIComponent(p.slug)}" target="_blank" rel="noopener" title="View public page">${icon("external")}</a>` : "";
  const statusButtons = {
    PENDING_REVIEW: `<button class="btn btn-sm btn-success-soft" type="button" data-status="APPROVED" data-id="${p.id}">Approve</button>
      <button class="btn btn-sm btn-warn-soft" type="button" data-status="REJECTED" data-id="${p.id}">Reject</button>`,
    APPROVED: `<button class="btn btn-sm btn-success-soft" type="button" data-status="PUBLISHED" data-id="${p.id}">Publish</button>`,
    PUBLISHED: `<button class="btn btn-sm btn-outline" type="button" data-status="APPROVED" data-id="${p.id}">Unpublish</button>`,
    REJECTED: `<button class="btn btn-sm btn-success-soft" type="button" data-status="APPROVED" data-id="${p.id}">Approve</button>`,
    DRAFT: `<button class="btn btn-sm btn-outline" type="button" data-status="PENDING_REVIEW" data-id="${p.id}">Send to review</button>
      <button class="btn btn-sm btn-success-soft" type="button" data-status="PUBLISHED" data-id="${p.id}">Publish</button>`,
  }[p.status] || "";

  return `<div class="row-actions">
    ${statusButtons}
    ${pub}
    <button class="btn btn-sm btn-outline btn-icon" type="button" data-edit data-id="${p.id}" title="Edit project">${icon("edit")}</button>
    <button class="btn btn-sm btn-danger btn-icon" type="button" data-delete data-id="${p.id}" title="Delete project">${icon("trash")}</button>
  </div>`;
}

function render(items) {
  const tbody = getTbody();
  if (!tbody) return;
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-row">No projects found${state.q || state.status ? " for the current filters" : ""}.</td></tr>`;
    return;
  }
  items.forEach((p) => cache.set(String(p.id), p));
  tbody.innerHTML = items.map((p) => `
    <tr>
      <td><span class="cell-stack"><span class="cell-main">${esc(p.title || "Untitled")}</span><span class="cell-sub">${p.slug ? esc(p.slug) : ""}</span></span></td>
      <td>${p.year ? esc(p.year) : "—"}</td>
      <td>${Array.isArray(p.technologies) ? p.technologies.length : 0}</td>
      <td>${p.featured ? `<span class="badge b-featured">Featured</span>` : "—"}</td>
      <td>${statusBadge(p.status)}</td>
      <td class="hide-md">${p.createdAt ? esc(formatDate(p.createdAt)) : "—"}</td>
      <td>${actionsFor(p)}</td>
    </tr>`).join("");
}

async function load() {
  const tbody = getTbody();
  const pagerEl = getPager();
  const infoEl = getInfo();
  if (!tbody) return;
  tbody.innerHTML = rowSkeleton();
  if (pagerEl) pagerEl.innerHTML = "";
  try {
    const data = await apiFetch("/admin/projects", {
      auth: true,
      params: { page: state.page, size: SIZE, q: state.q || undefined, status: state.status || undefined },
    });
    const items = (data && data.content) || [];
    if (infoEl) infoEl.textContent = pageInfo(data);
    render(items);
    if (pagerEl) renderPagination(pagerEl, data, (p) => { state.page = p; load(); });
  } catch (err) {
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="state state-error" style="border:none;">
        <span class="state-icon">${icon("alert")}</span>
        <h3 class="state-title">Could not load projects</h3>
        <p class="state-text">${esc(errorMessage(err, "An error occurred while loading projects."))}</p>
        <button class="btn btn-outline btn-sm" type="button" id="retry-projects">${icon("arrow-right")} Retry</button>
      </div></td></tr>`;
      const retry = tbody.querySelector("#retry-projects");
      if (retry) retry.addEventListener("click", load);
    }
  }
}

/* ---------- Status / delete ---------- */
async function setStatus(id, status) {
  const label = String(status).toLowerCase().replace(/_/g, " ");
  try {
    await apiFetch(`/admin/projects/${id}/status`, { method: "PATCH", body: { status }, auth: true });
    toast(`Project marked ${label}`, "success");
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not update project status."), "error");
  }
}

async function removeProject(id, title) {
  const ok = await confirmDialog({
    title: "Delete project?",
    message: `"${title}" and its member/technology links will be permanently removed. This cannot be undone.`,
    confirmLabel: "Delete project",
  });
  if (!ok) return;
  try {
    await apiFetch(`/admin/projects/${id}`, { method: "DELETE", auth: true });
    toast("Project deleted", "success");
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not delete the project."), "error");
  }
}

function openCreate() {
  const form = getForm();
  if (form) form.reset();
  const pId = document.getElementById("p-id");
  if (pId) pId.value = "";
  const statusSel = document.getElementById("p-status");
  if (statusSel) statusSel.value = "DRAFT";
  const modalTitle = document.getElementById("project-modal-title");
  if (modalTitle) modalTitle.textContent = "New project";
  openDialog(getModal());
}
function openEdit(p) {
  const form = getForm();
  if (form) form.reset();
  const pId = document.getElementById("p-id"); if (pId) pId.value = p.id;
  const pTitle = document.getElementById("p-title"); if (pTitle) pTitle.value = p.title || "";
  const pTagline = document.getElementById("p-tagline"); if (pTagline) pTagline.value = p.tagline || "";
  const pYear = document.getElementById("p-year"); if (pYear) pYear.value = p.year || "";
  const pStatus = document.getElementById("p-status"); if (pStatus) pStatus.value = p.status || "DRAFT";
  const pFeatured = document.getElementById("p-featured"); if (pFeatured) pFeatured.checked = Boolean(p.featured);
  const pGithub = document.getElementById("p-github-url"); if (pGithub) pGithub.value = p.githubUrl || "";
  const pDemo = document.getElementById("p-demo-url"); if (pDemo) pDemo.value = p.demoUrl || "";
  const pDocs = document.getElementById("p-docs-url"); if (pDocs) pDocs.value = p.docsUrl || "";
  const pDesc = document.getElementById("p-description"); if (pDesc) pDesc.value = p.description || "";
  const pProb = document.getElementById("p-problem"); if (pProb) pProb.value = p.problem || "";
  const pSol = document.getElementById("p-solution"); if (pSol) pSol.value = p.solution || "";
  const modalTitle = document.getElementById("project-modal-title");
  if (modalTitle) modalTitle.textContent = `Edit — ${p.title || "project"}`;
  openDialog(getModal());
}

async function submit(e) {
  e.preventDefault();
  const payload = collectForm();
  if (!payload.title) {
    toast("Title is required", "warning");
    return;
  }
  const idEl = document.getElementById("p-id");
  const id = idEl ? idEl.value : "";
  const form = getForm();
  const saveBtn = form ? form.querySelector("button[type=submit]") : null;
  if (saveBtn) saveBtn.disabled = true;
  try {
    if (id) {
      const res = await apiFetch(`/admin/projects/${id}`, { method: "PUT", body: payload, auth: true });
      window.__LAST_CREATED_PROJECT = res;
      toast("Project updated", "success");
    } else {
      const res = await apiFetch("/admin/projects", { method: "POST", body: payload, auth: true });
      window.__LAST_CREATED_PROJECT = res;
      toast("Project created", "success");
    }
    closeDialog(getModal());
    state.page = 0;
    load();
  } catch (err) {
    window.__LAST_SUBMIT_ERR = err;
    toast(errorMessage(err, "Could not save the project."), "error");
  } finally {
    if (saveBtn) saveBtn.disabled = false;
  }
}
/* ---------- Events ---------- */
function wireEvents() {
  if (typeof window !== "undefined") window.__WIRE_EVENTS_RAN = true;

  let debounce = null;
  document.addEventListener("input", (e) => {
    if (e.target && e.target.id === "filter-q") {
      clearTimeout(debounce);
      debounce = setTimeout(() => { state.q = e.target.value.trim(); state.page = 0; load(); }, 300);
    }
  });

  document.addEventListener("change", (e) => {
    if (e.target && e.target.id === "filter-status") {
      state.status = e.target.value; state.page = 0; load();
    }
  });

  document.addEventListener("submit", (e) => {
    if (e.target && e.target.id === "project-form") {
      e.preventDefault();
      submit(e);
    }
  });

  document.addEventListener("click", async (e) => {
    const newBtn = e.target.closest("#btn-new");
    if (newBtn) { openCreate(); return; }

    const statusBtn = e.target.closest("[data-status]");
    if (statusBtn) { setStatus(statusBtn.dataset.id, statusBtn.dataset.status); return; }

    const editBtn = e.target.closest("[data-edit]");
    if (editBtn) {
      const p = cache.get(String(editBtn.dataset.id));
      if (p) openEdit(p);
      return;
    }

    const delBtn = e.target.closest("[data-delete]");
    if (delBtn) {
      const row = delBtn.closest("tr");
      const title = row ? row.querySelector(".cell-main")?.textContent || "this project" : "this project";
      removeProject(delBtn.dataset.id, title);
    }
  });
}
async function boot() {
  if (typeof window !== "undefined") window.__BOOT_RAN = true;
  const user = await guardModerator();
  if (!user) return;
  injectAdminShell("projects", user);
  wireEvents();
  load();
}

boot();
