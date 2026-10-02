/**
 * Apex Innovators — admin-messages.js (admin/messages.html)
 * Admin inbox: filterable list, full message view, status updates
 * (NEW / READ / REPLIED), mailto reply shortcut.
 */

import { apiFetch, errorMessage } from "../api.js";
import { guardAdmin } from "../auth.js";
import {
  icon, esc, humanize, statusBadge, formatDateTime,
  injectAdminShell, openDialog, toast, renderPagination, pageInfo,
} from "../components.js";

const SIZE = 15;
const state = { page: 0, status: "" };
const cache = new Map();

const tbody = document.getElementById("table-body");
const pagerEl = document.getElementById("table-pager");
const infoEl = document.getElementById("list-info");
const viewModal = document.getElementById("message-view-modal");
const viewBody = document.getElementById("message-view-body");

function rowSkeleton() {
  return `<tr><td colspan="6" style="padding:1rem;"><div class="sk-list">
    <div class="sk sk-row w100"></div><div class="sk sk-row w100"></div><div class="sk sk-row w100"></div>
  </div></td></tr>`;
}

function render(items) {
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No messages${state.status ? " with the selected status" : ""}. New contact-form submissions land here.</td></tr>`;
    return;
  }
  items.forEach((m) => cache.set(String(m.id), m));
  tbody.innerHTML = items.map((m) => `
    <tr>
      <td><span class="cell-stack"><span class="cell-main">${esc(m.name || "—")}</span><span class="cell-sub">${esc(m.email || "")}</span></span></td>
      <td>${m.subject ? esc(m.subject) : "—"}</td>
      <td><span class="message-clip" title="${esc(m.message || "")}">${esc(m.message || "")}</span></td>
      <td>${statusBadge(m.status)}</td>
      <td class="hide-md">${m.createdAt ? formatDateTime(m.createdAt) : "—"}</td>
      <td><button class="btn btn-sm btn-outline" type="button" data-view data-id="${m.id}">${icon("eye")} View</button></td>
    </tr>`).join("");
}

async function load() {
  if (!tbody) return;
  tbody.innerHTML = rowSkeleton();
  if (pagerEl) pagerEl.innerHTML = "";
  try {
    const data = await apiFetch("/admin/messages", {
      auth: true,
      params: { page: state.page, size: SIZE, status: state.status || undefined },
    });
    const items = (data && data.content) || [];
    if (infoEl) infoEl.textContent = pageInfo(data);
    render(items);
    if (pagerEl) renderPagination(pagerEl, data, (p) => { state.page = p; load(); });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="state state-error" style="border:none;">
      <span class="state-icon">${icon("alert")}</span>
      <h3 class="state-title">Could not load messages</h3>
      <p class="state-text">${esc(errorMessage(err, "An error occurred while loading messages."))}</p>
      <button class="btn btn-outline btn-sm" type="button" id="retry">${icon("arrow-right")} Retry</button>
    </div></td></tr>`;
    const retry = tbody.querySelector("#retry");
    if (retry) retry.addEventListener("click", load);
  }
}

function openView(m) {
  if (!viewModal) return;
  viewBody.innerHTML = `
    <div class="post-author" style="margin-bottom:1rem;">
      <span class="avatar avatar-round">${esc((m.name || "?").charAt(0).toUpperCase())}</span>
      <span class="who"><b>${esc(m.name || "—")}</b>
        <span class="muted faint" style="font-size:0.78rem;">${m.createdAt ? formatDateTime(m.createdAt) : ""}</span></span>
    </div>
    <div class="detail-blocks">
      <div class="detail-block"><h4>Contact</h4>
        <div class="kv">
          <dt>Email</dt><dd>${m.email ? `<a href="mailto:${esc(m.email)}">${esc(m.email)}</a>` : "—"}</dd>
          <dt>Status</dt><dd>${statusBadge(m.status)}</dd>
        </div>
      </div>
      <div class="detail-block"><h4>Subject</h4><p><strong>${esc(m.subject || "(no subject)")}</strong></p></div>
      <div class="detail-block"><h4>Message</h4><p>${esc(m.message || "")}</p></div>
    </div>
    <div style="height:1px;background:var(--border);margin:1.1rem 0;"></div>
    <div class="detail-block">
      <h4>Actions</h4>
      <div class="row-actions" style="margin-top:0.6rem;" data-msg-actions>
        ${m.reply ? `<div style="margin-top:0.8rem;padding:0.75rem;background:rgba(34,211,238,0.08);border:1px solid rgba(34,211,238,0.25);border-radius:8px;">
          <h5 style="color:#22d3ee;font-size:0.82rem;margin-bottom:0.3rem;">Sent Reply</h5>
          <p style="font-size:0.85rem;color:var(--text);white-space:pre-wrap;">${esc(m.reply)}</p>
          <span style="font-size:0.75rem;color:var(--muted);display:block;margin-top:0.3rem;">${m.repliedAt ? formatDateTime(m.repliedAt) : "Just now"}</span>
        </div>` : ""}
        <div class="row-actions" style="margin-top:0.6rem;" data-msg-actions>
          ${m.email ? `<button class="btn btn-sm btn-primary" type="button" data-open-reply data-id="${m.id}">${icon("send")} Reply In-App</button>` : ""}
          ${m.email ? `<a class="btn btn-sm btn-outline" href="mailto:${esc(m.email)}?subject=${encodeURIComponent(`Re: ${m.subject || "Your message to Apex Innovators"}`)}">${icon("external")} Email App</a>` : ""}
        ${m.status !== "READ" ? `<button class="btn btn-sm btn-outline" type="button" data-msg-status="READ" data-id="${m.id}">Mark as read</button>` : ""}
        ${m.status !== "REPLIED" ? `<button class="btn btn-sm btn-success-soft" type="button" data-msg-status="REPLIED" data-id="${m.id}">${icon("check")} Mark replied</button>` : ""}
        ${m.status !== "NEW" ? `<button class="btn btn-sm btn-outline" type="button" data-msg-status="NEW" data-id="${m.id}">Reopen</button>` : ""}
      </div>
    </div>`;
  openDialog(viewModal);
}

async function applyStatus(id, status) {
  try {
    await apiFetch(`/admin/messages/${id}`, { method: "PATCH", body: { status }, auth: true });
    toast(`Message marked ${humanize(status).toLowerCase()}`, "success");
    if (viewModal && viewModal.open) viewModal.close();
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not update the message."), "error");
  }
}


const replyModal = document.getElementById("message-reply-modal");
const replyForm = document.getElementById("message-reply-form");

function openReplyModal(m) {
  if (!replyModal || !replyForm) return;
  document.getElementById("r-msg-id").value = m.id;
  document.getElementById("r-to-email").value = m.email || "";
  document.getElementById("r-subject").value = m.subject ? `Re: ${m.subject}` : "Re: Your message to Apex Innovators";
  document.getElementById("r-reply-body").value = "";
  if (viewModal && viewModal.open) closeDialog(viewModal);
  openDialog(replyModal);
}

async function submitReply(e) {
  e.preventDefault();
  const id = document.getElementById("r-msg-id").value;
  const email = document.getElementById("r-to-email").value;
  const replyBody = document.getElementById("r-reply-body").value.trim();
  if (!replyBody) {
    toast("Reply message cannot be empty", "warning");
    return;
  }
  const btn = replyForm.querySelector("button[type=submit]");
  btn.disabled = true;
  try {
    const res = await apiFetch(`/admin/messages/${id}`, {
      method: "PATCH",
      body: { status: "REPLIED", reply: replyBody, repliedAt: new Date().toISOString() },
      auth: true,
    });
    toast(`Reply sent to ${email}`, "success");
    closeDialog(replyModal);
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not send the reply."), "error");
  } finally {
    btn.disabled = false;
  }
}

function wireEvents() {
  const statusSel = document.getElementById("filter-status");
  if (statusSel) {
    statusSel.addEventListener("change", () => { state.status = statusSel.value; state.page = 0; load(); });
  }

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-view]");
      if (btn) {
        const m = cache.get(String(btn.dataset.id));
        if (m) openView(m);
      }
    });
  }

  if (viewBody) {
    viewBody.addEventListener("click", (e) => {
      const replyBtn = e.target.closest("[data-open-reply]");
      if (replyBtn) {
        const m = cache.get(String(replyBtn.dataset.id));
        if (m) openReplyModal(m);
        return;
      }
      const btn = e.target.closest("[data-msg-status]");
      if (btn) applyStatus(btn.dataset.id, btn.dataset.msgStatus);
    });
  }
  if (replyForm) {
    replyForm.addEventListener("submit", submitReply);
  }
}

async function boot() {
  const user = await guardAdmin();
  if (!user) return;
  injectAdminShell("messages", user);
  wireEvents();
  load();
}

boot();
