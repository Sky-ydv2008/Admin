/**
 * Apex Innovators — admin-posts.js (admin/posts.html)
 * Admin moderation of community posts: filterable list, review modal,
 * status PATCHes. PATCH /api/admin/posts/{id} {status}.
 */

import { apiFetch, errorMessage } from "../api.js";
import { guardModerator } from "../auth.js";
import {
  icon, esc, avatar, humanize, typeChip, statusBadge, timeAgo,
  injectAdminShell, openDialog, closeDialog, toast, renderPagination, pageInfo,
} from "../components.js";

const SIZE = 15;
const state = { page: 0, status: "" };
const cache = new Map();

const tbody = document.getElementById("table-body");
const pagerEl = document.getElementById("table-pager");
const infoEl = document.getElementById("list-info");
const reviewModal = document.getElementById("post-review-modal");
const reviewBody = document.getElementById("post-review-body");
const createModal = document.getElementById("post-create-modal");
const createForm = document.getElementById("post-create-form");
const createError = document.getElementById("post-create-error");

function rowSkeleton() {
  return `<tr><td colspan="7" style="padding:1rem;"><div class="sk-list">
    <div class="sk sk-row w100"></div><div class="sk sk-row w100"></div><div class="sk sk-row w100"></div>
  </div></td></tr>`;
}

function render(items) {
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-row">No posts found${state.status ? " with the selected status" : ""}.</td></tr>`;
    return;
  }
  items.forEach((p) => cache.set(String(p.id), p));
  tbody.innerHTML = items.map((p) => `
    <tr>
      <td><span class="cell-stack"><span class="cell-main" style="max-width:300px;">${esc(p.title || "Untitled")}</span>
        <span class="cell-sub">by ${esc(p.authorName || "unknown")}</span></span></td>
      <td>${typeChip(p.type)}</td>
      <td>${statusBadge(p.status)}</td>
      <td class="num">${Number(p.likeCount || 0)} ♥</td>
      <td class="num">${Number(p.commentCount || 0)}</td>
      <td class="hide-md">${p.createdAt ? timeAgo(p.createdAt) : "—"}</td>
      <td><button class="btn btn-sm btn-outline" type="button" data-review data-id="${p.id}">${icon("eye")} Review</button></td>
    </tr>`).join("");
}

async function load() {
  if (!tbody) return;
  tbody.innerHTML = rowSkeleton();
  if (pagerEl) pagerEl.innerHTML = "";
  try {
    const data = await apiFetch("/admin/posts", {
      auth: true,
      params: { page: state.page, size: SIZE, status: state.status || undefined },
    });
    const items = (data && data.content) || [];
    if (infoEl) infoEl.textContent = pageInfo(data);
    render(items);
    if (pagerEl) renderPagination(pagerEl, data, (p) => { state.page = p; load(); });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="state state-error" style="border:none;">
      <span class="state-icon">${icon("alert")}</span>
      <h3 class="state-title">Could not load posts</h3>
      <p class="state-text">${esc(errorMessage(err, "An error occurred while loading posts."))}</p>
      <button class="btn btn-outline btn-sm" type="button" id="retry">${icon("arrow-right")} Retry</button>
    </div></td></tr>`;
    const retry = tbody.querySelector("#retry");
    if (retry) retry.addEventListener("click", load);
  }
}

/* ---------- Review ---------- */
function openReview(p) {
  if (!reviewModal) return;
  const current = p.status;
  const action = (status, label, cls, danger) => `
    <button class="btn btn-sm ${cls}" type="button" data-apply-status="${status}" data-id="${p.id}">
      ${danger ? icon("alert") : icon("check")} ${label}
    </button>`;

  reviewBody.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;gap:0.8rem;flex-wrap:wrap;">
      <div class="post-author">
        ${avatar(p.authorName, "", "avatar-round")}
        <span class="who"><b>${esc(p.authorName || "Unknown")}</b>
          <span class="muted faint" style="font-size:0.78rem;">${p.createdAt ? timeAgo(p.createdAt) : ""}</span></span>
      </div>
      <div style="display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap;">${typeChip(p.type)} ${statusBadge(current)}</div>
    </div>
    <div style="height:1px;background:var(--border);margin:1rem 0;"></div>
    <h3 style="font-size:1.2rem;margin-bottom:0.8rem;">${esc(p.title || "Untitled post")}</h3>
    <p style="color:var(--text-2);white-space:pre-line;font-size:0.96rem;">${esc(p.body || "No body content.")}</p>
    <div style="height:1px;background:var(--border);margin:1rem 0;"></div>
    <div class="detail-block">
      <h4>Moderation</h4>
      <p class="muted" style="font-size:0.85rem;margin-bottom:0.8rem;">
        APPROVED marks it reviewed and public; PUBLISHED also surfaces it publicly; REJECTED hides it. CORE_MEMBER and ADMIN can moderate posts.
      </p>
      <div class="row-actions">
        ${action("APPROVED", "Approve", "btn-outline", false)}
        ${action("PUBLISHED", "Publish", "btn-success-soft", false)}
        ${action("REJECTED", "Reject", "btn-warn-soft", true)}
      </div>
    </div>`;
  openDialog(reviewModal);
}

async function applyStatus(id, status) {
  try {
    await apiFetch(`/admin/posts/${id}/status`, { method: "PATCH", body: { status }, auth: true });
    toast(`Post marked ${humanize(status).toLowerCase()}`, "success");
    if (reviewModal && reviewModal.open) reviewModal.close();
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not update the post status."), "error");
  }
}

/* ---------- Create post (as admin) ---------- */
function openCreate() {
  if (!createForm) return;
  createForm.reset();
  if (createError) { createError.textContent = ""; createError.hidden = true; }
  openDialog(createModal);
}

async function submitCreate(e) {
  e.preventDefault();
  const payload = {
    type: document.getElementById("np-type").value,
    status: document.getElementById("np-status").value,
    title: document.getElementById("np-title").value.trim(),
    body: document.getElementById("np-body").value.trim() || null,
  };
  if (!payload.title) {
    if (createError) { createError.textContent = "Title is required."; createError.hidden = false; }
    return;
  }
  const saveBtn = createForm.querySelector("button[type=submit]");
  saveBtn.disabled = true;
  if (createError) { createError.textContent = ""; createError.hidden = true; }
  try {
    const created = await apiFetch("/admin/posts", { method: "POST", body: payload, auth: true });
    toast(`Post created (${humanize(created.status || "published").toLowerCase()})`, "success");
    closeDialog(createModal);
    state.page = 0;
    load();
  } catch (err) {
    const msg = errorMessage(err, "Could not create the post.");
    if (createError) { createError.textContent = msg; createError.hidden = false; }
    else toast(msg, "error");
  } finally {
    saveBtn.disabled = false;
  }
}

function wireEvents() {
  const statusSel = document.getElementById("filter-status");
  if (statusSel) {
    statusSel.addEventListener("change", () => { state.status = statusSel.value; state.page = 0; load(); });
  }

  const newBtn = document.getElementById("btn-new-post");
  if (newBtn && createForm) {
    newBtn.addEventListener("click", openCreate);
    createForm.addEventListener("submit", submitCreate);
  }

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-review]");
      if (btn) {
        const p = cache.get(String(btn.dataset.id));
        if (p) openReview(p);
      }
    });
  }

  if (reviewBody) {
    reviewBody.addEventListener("click", (e) => {
      const apply = e.target.closest("[data-apply-status]");
      if (apply) applyStatus(apply.dataset.id, apply.dataset.applyStatus);
    });
  }
}

async function boot() {
  const user = await guardModerator();
  if (!user) return;
  injectAdminShell("posts", user);
  wireEvents();
  load();
}

boot();
