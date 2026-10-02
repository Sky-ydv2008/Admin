/**
 * Apex Innovators — admin-hackathons.js (admin/hackathons.html)
 * Admin CRUD for hackathons (list / create / edit / delete).
 */

import { apiFetch, errorMessage } from "../api.js";
import { guardAdmin } from "../auth.js";
import {
  icon, esc, formatDate, injectAdminShell,
  openDialog, closeDialog, confirmDialog, toast, renderPagination, pageInfo,
} from "../components.js";

const SIZE = 15;
const state = { page: 0 };
const cache = new Map();

const tbody = document.getElementById("table-body");
const pagerEl = document.getElementById("table-pager");
const infoEl = document.getElementById("list-info");
const modal = document.getElementById("hackathon-modal");
const form = document.getElementById("hackathon-form");

function rowSkeleton() {
  return `<tr><td colspan="6" style="padding:1rem;"><div class="sk-list">
    <div class="sk sk-row w100"></div><div class="sk sk-row w100"></div><div class="sk sk-row w100"></div>
  </div></td></tr>`;
}

function collect() {
  const val = (id) => document.getElementById(id)?.value.trim() ?? "";
  const opt = (v) => (v ? v : null);
  return {
    name: val("h-name"),
    organizer: opt(val("h-organizer")),
    date: opt(val("h-date")),
    description: opt(val("h-description")),
    challenge: opt(val("h-challenge")),
    result: opt(val("h-result")),
    certificateUrl: opt(val("h-cert-url")),
    presentationUrl: opt(val("h-pres-url")),
  };
}

function render(items) {
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No hackathons archived yet. Create the first entry.</td></tr>`;
    return;
  }
  items.forEach((h) => cache.set(String(h.id), h));
  tbody.innerHTML = items.map((h) => `
    <tr>
      <td><span class="cell-stack"><span class="cell-main">${esc(h.name || "Untitled")}</span><span class="cell-sub">${h.slug ? esc(h.slug) : ""}</span></span></td>
      <td>${h.organizer ? esc(h.organizer) : "—"}</td>
      <td>${h.date ? esc(formatDate(h.date)) : "—"}</td>
      <td class="hide-md">${h.result ? esc(h.result) : "—"}</td>
      <td>${Array.isArray(h.projects) ? h.projects.length : 0} projects</td>
      <td><div class="row-actions">
        ${h.slug ? `<a class="btn btn-sm btn-outline btn-icon" href="../hackathon-details.html?slug=${encodeURIComponent(h.slug)}" target="_blank" rel="noopener" title="View public page">${icon("external")}</a>` : ""}
        <button class="btn btn-sm btn-outline btn-icon" type="button" data-edit data-id="${h.id}" title="Edit">${icon("edit")}</button>
        <button class="btn btn-sm btn-danger btn-icon" type="button" data-delete data-id="${h.id}" title="Delete">${icon("trash")}</button>
      </div></td>
    </tr>`).join("");
}

async function load() {
  if (!tbody) return;
  tbody.innerHTML = rowSkeleton();
  if (pagerEl) pagerEl.innerHTML = "";
  try {
    const data = await apiFetch("/admin/hackathons", { auth: true, params: { page: state.page, size: SIZE } });
    const items = (data && data.content) || [];
    if (infoEl) infoEl.textContent = pageInfo(data);
    render(items);
    if (pagerEl) renderPagination(pagerEl, data, (p) => { state.page = p; load(); });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="state state-error" style="border:none;">
      <span class="state-icon">${icon("alert")}</span>
      <h3 class="state-title">Could not load hackathons</h3>
      <p class="state-text">${esc(errorMessage(err, "An error occurred while loading hackathons."))}</p>
      <button class="btn btn-outline btn-sm" type="button" id="retry">${icon("arrow-right")} Retry</button>
    </div></td></tr>`;
    const retry = tbody.querySelector("#retry");
    if (retry) retry.addEventListener("click", load);
  }
}

function openCreate() {
  form.reset();
  document.getElementById("h-id").value = "";
  document.getElementById("hackathon-modal-title").textContent = "New hackathon";
  openDialog(modal);
}

function openEdit(h) {
  form.reset();
  document.getElementById("h-id").value = h.id;
  document.getElementById("h-name").value = h.name || "";
  document.getElementById("h-organizer").value = h.organizer || "";
  document.getElementById("h-date").value = h.date ? String(h.date).slice(0, 10) : "";
  document.getElementById("h-description").value = h.description || "";
  document.getElementById("h-challenge").value = h.challenge || "";
  document.getElementById("h-result").value = h.result || "";
  document.getElementById("h-cert-url").value = h.certificateUrl || "";
  document.getElementById("h-pres-url").value = h.presentationUrl || "";
  document.getElementById("hackathon-modal-title").textContent = `Edit — ${h.name || "hackathon"}`;
  openDialog(modal);
}

async function submit(e) {
  e.preventDefault();
  const payload = collect();
  if (!payload.name) {
    toast("Name is required", "warning");
    return;
  }
  const id = document.getElementById("h-id").value;
  const saveBtn = form.querySelector("button[type=submit]");
  saveBtn.disabled = true;
  try {
    if (id) {
      await apiFetch(`/admin/hackathons/${id}`, { method: "PUT", body: payload, auth: true });
      toast("Hackathon updated", "success");
    } else {
      await apiFetch("/admin/hackathons", { method: "POST", body: payload, auth: true });
      toast("Hackathon created", "success");
    }
    closeDialog(modal);
    state.page = 0;
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not save the hackathon."), "error");
  } finally {
    saveBtn.disabled = false;
  }
}

async function removeHackathon(id, name) {
  const ok = await confirmDialog({
    title: "Delete hackathon?",
    message: `"${name}" and its links will be permanently removed.`,
    confirmLabel: "Delete",
  });
  if (!ok) return;
  try {
    await apiFetch(`/admin/hackathons/${id}`, { method: "DELETE", auth: true });
    toast("Hackathon deleted", "success");
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not delete the hackathon."), "error");
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
        const h = cache.get(String(editBtn.dataset.id));
        if (h) openEdit(h);
        return;
      }
      const delBtn = e.target.closest("[data-delete]");
      if (delBtn) {
        const h = cache.get(String(delBtn.dataset.id));
        removeHackathon(delBtn.dataset.id, (h && h.name) || "this entry");
      }
    });
  }
}

async function boot() {
  const user = await guardAdmin();
  if (!user) return;
  injectAdminShell("hackathons", user);
  wireEvents();
  load();
}

boot();
