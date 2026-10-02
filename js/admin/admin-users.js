/**
 * Apex Innovators — admin-users.js (admin/users.html)
 * Admin user management: searchable list, profile details modal,
 * role/status editing. PATCH /api/admin/users/{id} {role|status}.
 */

import { apiFetch, errorMessage } from "../api.js";
import { guardAdmin } from "../auth.js";
import {
  icon, esc, avatar, initials, humanize, roleBadge, statusBadge, injectAdminShell,
  openDialog, closeDialog, confirmDialog, toast, renderPagination, pageInfo,
} from "../components.js";

const SIZE = 20;
const state = { page: 0, q: "" };
const cache = new Map();
let currentUserId = null;

const tbody = document.getElementById("table-body");
const pagerEl = document.getElementById("table-pager");
const infoEl = document.getElementById("list-info");
const viewModal = document.getElementById("user-view-modal");
const viewBody = document.getElementById("user-view-body");
const editModal = document.getElementById("user-edit-modal");
const editForm = document.getElementById("user-edit-form");
const createModal = document.getElementById("user-create-modal");
const createForm = document.getElementById("user-create-form");
const createError = document.getElementById("user-create-error");

function rowSkeleton() {
  return `<tr><td colspan="5" style="padding:1rem;"><div class="sk-list">
    <div class="sk sk-row w100"></div><div class="sk sk-row w100"></div><div class="sk sk-row w100"></div>
  </div></td></tr>`;
}

function flatProfile(u) {
  // GET /users/{id} may nest profile fields under `profile` or flatten them.
  const p = (u && u.profile) || {};
  return {
    headline: u.headline || p.headline || "",
    bio: u.bio || p.bio || "",
    photoUrl: u.photoUrl || p.photoUrl || "",
    github: u.github || p.github || "",
    linkedin: u.linkedin || p.linkedin || "",
  };
}

function render(items) {
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-row">No users found${state.q ? " for “" + esc(state.q) + "”" : ""}.</td></tr>`;
    return;
  }
  items.forEach((u) => cache.set(String(u.id), u));
  tbody.innerHTML = items.map((u) => `
    <tr>
      <td><span class="avatar-cell">${avatar(u.name, "", "avatar-round")}
        <span class="who-cell"><span class="cell-main">${esc(u.name || "—")}</span><span class="cell-sub">${esc(u.email || "")}</span></span></span></td>
      <td>${roleBadge(u.role)}</td>
      <td>${statusBadge(u.status)}</td>
      <td class="num hide-md">#${u.id}</td>
      <td><div class="row-actions">
        <button class="btn btn-sm btn-outline" type="button" data-view data-id="${u.id}">${icon("eye")} View</button>
        <button class="btn btn-sm btn-outline" type="button" data-edit data-id="${u.id}">${icon("edit")} Edit</button>
        ${u.id !== currentUserId
          ? `<button class="btn btn-sm btn-warn-soft" type="button" data-del data-id="${u.id}" title="Permanently delete this member and all their content">${icon("trash")} Delete</button>`
          : ""}
      </div></td>
    </tr>`).join("");
}

async function load() {
  if (!tbody) return;
  tbody.innerHTML = rowSkeleton();
  if (pagerEl) pagerEl.innerHTML = "";
  try {
    const data = await apiFetch("/admin/users", {
      auth: true,
      params: { page: state.page, size: SIZE, q: state.q || undefined },
    });
    const items = (data && data.content) || [];
    if (infoEl) infoEl.textContent = pageInfo(data);
    render(items);
    if (pagerEl) renderPagination(pagerEl, data, (p) => { state.page = p; load(); });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="state state-error" style="border:none;">
      <span class="state-icon">${icon("alert")}</span>
      <h3 class="state-title">Could not load users</h3>
      <p class="state-text">${esc(errorMessage(err, "An error occurred while loading users."))}</p>
      <button class="btn btn-outline btn-sm" type="button" id="retry">${icon("arrow-right")} Retry</button>
    </div></td></tr>`;
    const retry = tbody.querySelector("#retry");
    if (retry) retry.addEventListener("click", load);
  }
}

/* ---------- View profile ---------- */
async function openView(u) {
  if (!viewModal) return;
  let detail = u;
  try {
    detail = await apiFetch(`/admin/users/${u.id}`, { auth: true });
  } catch (err) {
    toast(errorMessage(err, "Could not load the full profile."), "error");
    detail = u;
  }
  const prof = flatProfile(detail);
  const links = [
    prof.github ? `<a class="btn btn-sm btn-outline" href="${esc(prof.github)}" target="_blank" rel="noopener noreferrer">${icon("github")} GitHub</a>` : "",
    prof.linkedin ? `<a class="btn btn-sm btn-outline" href="${esc(prof.linkedin)}" target="_blank" rel="noopener noreferrer">${icon("link")} LinkedIn</a>` : "",
    detail.email ? `<a class="btn btn-sm btn-outline" href="mailto:${esc(detail.email)}">${icon("mail")} ${esc(detail.email)}</a>` : "",
  ].filter(Boolean).join(" ");

  viewBody.innerHTML = `
    <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;margin-bottom:1rem;">
      ${avatar(detail.name, prof.photoUrl, "avatar-round avatar-frame")}
      <div>
        <h3 style="margin-bottom:0.2rem;">${esc(detail.name || "—")}</h3>
        <div style="display:flex;gap:0.4rem;flex-wrap:wrap;">${roleBadge(detail.role)} ${statusBadge(detail.status)}</div>
      </div>
    </div>
    <div class="detail-blocks">
      ${prof.headline ? `<div class="detail-block"><h4>Headline</h4><p>${esc(prof.headline)}</p></div>` : ""}
      <div class="detail-block"><h4>Profile</h4><p>${prof.bio ? esc(prof.bio) : "No bio written yet."}</p></div>
      ${links ? `<div class="detail-block"><h4>Links</h4><div class="link-row">${links}</div></div>` : ""}
      <div class="detail-block"><h4>Account</h4>
        <dl class="kv">
          <dt>Email</dt><dd>${esc(detail.email || "—")}</dd>
          <dt>User ID</dt><dd>#${detail.id}</dd>
        </dl>
      </div>
    </div>`;
  openDialog(viewModal);
  loadAuditHistory(detail.id, viewBody);
}

/* ---------- Change history (audit) ---------- */
function auditRowHtml(a) {
  const when = a.createdAt ? new Date(a.createdAt).toLocaleString(undefined, {
    dateStyle: "short", timeStyle: "short",
  }) : "—";
  return `<div class="activity-item">
    <span class="avatar avatar-round">${esc(initials(a.actor || "?"))}</span>
    <div class="activity-body">
      <div><b>${esc(a.actor || "System")}</b> ${esc(humanize(a.action || ""))} <span class="faint">· ${esc(a.entity || "")}</span></div>
      <div>${esc(a.detail || "")}</div>
      <div class="faint" style="font-size:0.78rem;">${when}</div>
    </div>
  </div>`;
}

async function loadAuditHistory(userId, host) {
  if (!host) return;
  const wrap = document.createElement("div");
  wrap.className = "detail-block";
  wrap.id = "audit-history-block";
  wrap.innerHTML = `<h4>Change history</h4><div class="sk-list" aria-busy="true"><div class="sk sk-row w100"></div><div class="sk sk-row w100"></div></div>`;
  host.appendChild(wrap);
  try {
    const data = await apiFetch(`/admin/users/${userId}/audit`, { auth: true, params: { page: 0, size: 20 } });
    const items = (data && data.content) || [];
    wrap.innerHTML = items.length
      ? `<h4>Change history <span class="faint" style="font-weight:400;">(last ${items.length} of ${data.totalElements || items.length})</span></h4>
         <div class="activity-list">${items.map(auditRowHtml).join("")}</div>`
      : `<h4>Change history</h4><p class="muted">No changes logged for this user yet.</p>`;
  } catch (err) {
    wrap.innerHTML = `<h4>Change history</h4><p class="muted">Could not load the change history.</p>`;
  }
}

/* ---------- Add member ---------- */
function openCreate() {
  if (!createForm) return;
  createForm.reset();
  if (createError) { createError.textContent = ""; createError.hidden = true; }
  openDialog(createModal);
}

async function submitCreate(e) {
  e.preventDefault();
  const val = (id) => document.getElementById(id)?.value.trim() || "";
  const payload = {
    name: val("nu-name"),
    email: val("nu-email"),
    password: document.getElementById("nu-password")?.value || "",
    role: val("nu-role"),
    headline: val("nu-headline") || null,
    bio: val("nu-bio") || null,
    github: val("nu-github") || null,
    linkedin: val("nu-linkedin") || null,
  };
  const saveBtn = createForm.querySelector("button[type=submit]");
  saveBtn.disabled = true;
  if (createError) { createError.textContent = ""; createError.hidden = true; }
  try {
    await apiFetch("/admin/users", { method: "POST", body: payload, auth: true });
    toast("Member added", "success");
    closeDialog(createModal);
    state.page = 0;
    load();
  } catch (err) {
    const msg = errorMessage(err, "Could not add the member.");
    if (createError) { createError.textContent = msg; createError.hidden = false; }
    else toast(msg, "error");
  } finally {
    saveBtn.disabled = false;
  }
}

/* ---------- Edit user ---------- */
const editError = document.getElementById("user-edit-error");
function openEdit(u) {
  if (!editModal) return;
  editForm.reset();
  document.getElementById("u-id").value = u.id;
  document.getElementById("u-name").value = u.name || "";
  document.getElementById("u-email").value = u.email || "";
  document.getElementById("u-password").value = "";
  document.getElementById("u-role").value = u.role || "MEMBER";
  document.getElementById("u-status").value = u.status || "ACTIVE";
  if (editError) { editError.textContent = ""; editError.hidden = true; }
  openDialog(editModal);
}

async function submitEdit(e) {
  e.preventDefault();
  const id = document.getElementById("u-id").value;
  const name = document.getElementById("u-name").value.trim();
  const email = document.getElementById("u-email").value.trim();
  const password = document.getElementById("u-password").value;
  const role = document.getElementById("u-role").value;
  const status = document.getElementById("u-status").value;
  // Send only the fields that actually changed; the backend audits every change.
  const cached = cache.get(String(id)) || {};
  const body = {};
  if (name && name !== (cached.name || "")) body.name = name;
  if (email && email !== (cached.email || "")) body.email = email;
  if (password) body.password = password;
  if (role !== (cached.role || "")) body.role = role;
  if (status !== (cached.status || "")) body.status = status;
  if (Object.keys(body).length === 0) { closeDialog(editModal); return; }
  const saveBtn = editForm.querySelector("button[type=submit]");
  saveBtn.disabled = true;
  if (editError) { editError.textContent = ""; editError.hidden = true; }
  try {
    const updated = await apiFetch(`/admin/users/${id}`, { method: "PATCH", body, auth: true });
    cache.set(String(id), { ...cached, ...updated });
    toast("User updated — change logged", "success");
    closeDialog(editModal);
    load();
  } catch (err) {
    const msg = errorMessage(err, "Could not update the user.");
    if (editError) { editError.textContent = msg; editError.hidden = false; }
    else toast(msg, "error");
  } finally {
    saveBtn.disabled = false;
  }
}

function wireEvents() {
  const qInput = document.getElementById("filter-q");
  let debounce = null;
  if (qInput) {
    qInput.addEventListener("input", () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => { state.q = qInput.value.trim(); state.page = 0; load(); }, 300);
    });
  }
  if (editForm) editForm.addEventListener("submit", submitEdit);
  const newBtn = document.getElementById("btn-new-user");
  if (newBtn && createForm) {
    newBtn.addEventListener("click", openCreate);
    createForm.addEventListener("submit", submitCreate);
  }

  if (tbody) {
    tbody.addEventListener("click", async (e) => {
      const viewBtn = e.target.closest("[data-view]");
      if (viewBtn) {
        const u = cache.get(String(viewBtn.dataset.id));
        if (u) openView(u);
        return;
      }
      const editBtn = e.target.closest("[data-edit]");
      if (editBtn) {
        const u = cache.get(String(editBtn.dataset.id));
        if (u) openEdit(u);
        return;
      }
      const delBtn = e.target.closest("[data-del]");
      if (delBtn) {
        const u = cache.get(String(delBtn.dataset.id));
        if (u) deleteUser(u);
      }
    });
  }
}

/* ---------- Delete member ---------- */
async function deleteUser(u) {
  const confirmed = await confirmDialog({
    title: `Delete ${u.name || "this member"}?`,
    message: `This permanently deletes the account${u.email ? ` (${u.email})` : ""} and ALL of their content — posts, comments, likes, project/hackathon memberships, achievements and profile. This cannot be undone. Suspending is the non-destructive alternative.`,
    confirmLabel: "Delete permanently",
    tone: "danger",
  });
  if (!confirmed) return;
  try {
    await apiFetch(`/admin/users/${u.id}`, { method: "DELETE", auth: true });
    cache.delete(String(u.id));
    toast(`Deleted ${u.name || "member"} — change logged`, "success");
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not delete the user."), "error");
  }
}

async function boot() {
  const user = await guardAdmin();
  if (!user) return;
  currentUserId = user.id;
  injectAdminShell("users", user);
  wireEvents();
  load();
}

boot();
