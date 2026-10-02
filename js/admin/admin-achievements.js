/**
 * Apex Innovators — admin-achievements.js (admin/achievements.html)
 * Admin CRUD for achievements. The member select is fed from
 * /api/admin/users (paginated until exhausted, capped).
 */

import { apiFetch, errorMessage } from "../api.js";
import { guardAdmin } from "../auth.js";
import {
  icon, esc, formatDate, typeChip, injectAdminShell,
  openDialog, closeDialog, confirmDialog, toast, renderPagination, pageInfo,
} from "../components.js";

const SIZE = 15;
const state = { page: 0 };
const cache = new Map();
const users = new Map(); // id -> user

const ACH_TYPES = ["AWARD", "FINALIST", "CERTIFICATE", "MENTION", "OTHER"];

const tbody = document.getElementById("table-body");
const pagerEl = document.getElementById("table-pager");
const infoEl = document.getElementById("list-info");
const modal = document.getElementById("achievement-modal");
const form = document.getElementById("achievement-form");
const memberSelect = document.getElementById("a-user-id");

function rowSkeleton() {
  return `<tr><td colspan="6" style="padding:1rem;"><div class="sk-list">
    <div class="sk sk-row w100"></div><div class="sk sk-row w100"></div><div class="sk sk-row w100"></div>
  </div></td></tr>`;
}

async function loadUsers() {
  if (users.size || !memberSelect) return;
  try {
    let page = 0;
    const cap = 3000;
    let fetched = 0;
    do {
      const data = await apiFetch("/admin/users", { auth: true, params: { page, size: 100 } });
      const items = (data && data.content) || [];
      items.forEach((u) => users.set(String(u.id), u));
      fetched = items.length;
      page += 1;
      if (page > 40 || fetched < 100) break;
    } while (fetched >= 100 && users.size < cap);
  } catch (err) {
    toast("Could not load the member list — user selection will be limited.", "warning");
  }
  memberSelect.innerHTML = `<option value="">Select member…</option>` + [...users.values()]
    .map((u) => `<option value="${u.id}">${esc(u.name)} (${esc(u.email)})</option>`)
    .join("");
}

function collect() {
  const val = (id) => document.getElementById(id)?.value.trim() ?? "";
  const opt = (v) => (v ? v : null);
  return {
    userId: val("a-user-id") ? Number(val("a-user-id")) : null,
    title: val("a-title"),
    type: val("a-type"),
    issuer: opt(val("a-issuer")),
    awardDate: opt(val("a-date")),
    description: opt(val("a-description")),
    verifyUrl: opt(val("a-verify-url")),
  };
}

function render(items) {
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No achievements recorded yet. Add the team’s first one.</td></tr>`;
    return;
  }
  items.forEach((a) => cache.set(String(a.id), a));
  tbody.innerHTML = items.map((a) => `
    <tr>
      <td><span class="cell-stack"><span class="cell-main">${esc(a.title || "Untitled")}</span>
        ${a.issuer ? `<span class="cell-sub">${esc(a.issuer)}</span>` : ""}</span></td>
      <td>${esc(a.userName || `#${a.userId}`)}</td>
      <td>${typeChip(a.type)}</td>
      <td>${a.awardDate ? esc(formatDate(a.awardDate)) : "—"}</td>
      <td class="hide-md">${a.verifyUrl ? `<a href="${esc(a.verifyUrl)}" target="_blank" rel="noopener noreferrer" title="Verify link">${icon("external")}</a>` : "—"}</td>
      <td><div class="row-actions">
        <button class="btn btn-sm btn-outline btn-icon" type="button" data-edit data-id="${a.id}" title="Edit">${icon("edit")}</button>
        <button class="btn btn-sm btn-danger btn-icon" type="button" data-delete data-id="${a.id}" title="Delete">${icon("trash")}</button>
      </div></td>
    </tr>`).join("");
}

async function load() {
  if (!tbody) return;
  tbody.innerHTML = rowSkeleton();
  if (pagerEl) pagerEl.innerHTML = "";
  try {
    const data = await apiFetch("/admin/achievements", { auth: true, params: { page: state.page, size: SIZE } });
    const items = (data && data.content) || [];
    if (infoEl) infoEl.textContent = pageInfo(data);
    render(items);
    if (pagerEl) renderPagination(pagerEl, data, (p) => { state.page = p; load(); });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="state state-error" style="border:none;">
      <span class="state-icon">${icon("alert")}</span>
      <h3 class="state-title">Could not load achievements</h3>
      <p class="state-text">${esc(errorMessage(err, "An error occurred while loading achievements."))}</p>
      <button class="btn btn-outline btn-sm" type="button" id="retry">${icon("arrow-right")} Retry</button>
    </div></td></tr>`;
    const retry = tbody.querySelector("#retry");
    if (retry) retry.addEventListener("click", load);
  }
}

function openCreate() {
  form.reset();
  document.getElementById("a-id").value = "";
  document.getElementById("a-type").value = "CERTIFICATE";
  document.getElementById("achievement-modal-title").textContent = "New achievement";
  openDialog(modal);
}

function openEdit(a) {
  form.reset();
  document.getElementById("a-id").value = a.id;
  if (memberSelect) memberSelect.value = a.userId ? String(a.userId) : "";
  document.getElementById("a-title").value = a.title || "";
  document.getElementById("a-type").value = a.type || "CERTIFICATE";
  document.getElementById("a-issuer").value = a.issuer || "";
  document.getElementById("a-date").value = a.awardDate ? String(a.awardDate).slice(0, 10) : "";
  document.getElementById("a-description").value = a.description || "";
  document.getElementById("a-verify-url").value = a.verifyUrl || "";
  document.getElementById("achievement-modal-title").textContent = `Edit — ${a.title || "achievement"}`;
  openDialog(modal);
}

async function submit(e) {
  e.preventDefault();
  const payload = collect();
  if (!payload.title || !payload.userId) {
    toast("Title and member are required", "warning");
    return;
  }
  const id = document.getElementById("a-id").value;
  const saveBtn = form.querySelector("button[type=submit]");
  saveBtn.disabled = true;
  try {
    if (id) {
      await apiFetch(`/admin/achievements/${id}`, { method: "PUT", body: payload, auth: true });
      toast("Achievement updated", "success");
    } else {
      await apiFetch("/admin/achievements", { method: "POST", body: payload, auth: true });
      toast("Achievement added", "success");
    }
    closeDialog(modal);
    state.page = 0;
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not save the achievement."), "error");
  } finally {
    saveBtn.disabled = false;
  }
}

async function removeAchievement(id, title) {
  const ok = await confirmDialog({
    title: "Delete achievement?",
    message: `"${title}" will be permanently removed.`,
    confirmLabel: "Delete",
  });
  if (!ok) return;
  try {
    await apiFetch(`/admin/achievements/${id}`, { method: "DELETE", auth: true });
    toast("Achievement deleted", "success");
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not delete the achievement."), "error");
  }
}

function wireEvents() {
  const newBtn = document.getElementById("btn-new");
  if (newBtn) newBtn.addEventListener("click", openCreate);
  if (form) form.addEventListener("submit", submit);

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const editBtn = e.target.closest("[data-edit]");
      if (editBtn) {
        const a = cache.get(String(editBtn.dataset.id));
        if (a) openEdit(a);
        return;
      }
      const delBtn = e.target.closest("[data-delete]");
      if (delBtn) {
        const a = cache.get(String(delBtn.dataset.id));
        removeAchievement(delBtn.dataset.id, (a && a.title) || "this entry");
      }
    });
  }
}

async function boot() {
  const user = await guardAdmin();
  if (!user) return;
  injectAdminShell("achievements", user);
  wireEvents();
  loadUsers().then(() => load());
}

boot();
