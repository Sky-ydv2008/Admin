import { apiFetch, errorMessage } from "../api.js";
import { guardAdmin } from "../auth.js";
import {
  icon, esc, formatDateTime, statusBadge, injectAdminShell,
  openDialog, closeDialog, confirmDialog, toast, renderPagination, pageInfo,
} from "../components.js";

const SIZE = 15;
const state = { page: 0, q: "", status: "" };
const cache = new Map();

const tbody = document.getElementById("table-body");
const pagerEl = document.getElementById("table-pager");
const infoEl = document.getElementById("list-info");
const modal = document.getElementById("event-modal");
const form = document.getElementById("event-form");

function rowSkeleton() {
  return `<tr><td colspan="6" style="padding:1rem;"><div class="sk-list">
    <div class="sk sk-row w100"></div><div class="sk sk-row w100"></div><div class="sk sk-row w100"></div>
  </div></td></tr>`;
}

function collect() {
  const val = (id) => document.getElementById(id)?.value.trim() ?? "";
  const opt = (v) => (v ? v : null);
  return {
    title: val("e-title"),
    date: opt(val("e-date")),
    status: val("e-status"),
    location: opt(val("e-location")),
    registerUrl: opt(val("e-register-url")),
    description: opt(val("e-description")),
  };
}

function render(items) {
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-row">No events created yet. Click "New Event" to add one.</td></tr>`;
    return;
  }
  items.forEach((item) => cache.set(String(item.id), item));
  tbody.innerHTML = items.map((e) => `
    <tr>
      <td><span class="cell-stack"><span class="cell-main">${esc(e.title || "Untitled")}</span></span></td>
      <td>${e.date ? esc(formatDateTime(e.date)) : "—"}</td>
      <td>${e.location ? esc(e.location) : "—"}</td>
      <td>${statusBadge(e.status || "UPCOMING")}</td>
      <td class="hide-md">${e.registerUrl ? `<a href="${esc(e.registerUrl)}" target="_blank" rel="noopener" class="link-muted">${icon("external")} Link</a>` : "—"}</td>
      <td><div class="row-actions">
        <button class="btn btn-sm btn-outline btn-icon" type="button" data-edit data-id="${e.id}" title="Edit">${icon("edit")}</button>
        <button class="btn btn-sm btn-danger btn-icon" type="button" data-delete data-id="${e.id}" title="Delete">${icon("trash")}</button>
      </div></td>
    </tr>`).join("");
}

async function load() {
  if (!tbody) return;
  tbody.innerHTML = rowSkeleton();
  if (pagerEl) pagerEl.innerHTML = "";
  try {
    const data = await apiFetch("/admin/events", { auth: true, params: { page: state.page, size: SIZE, q: state.q || undefined, status: state.status || undefined } });
    const items = (data && data.content) || [];
    if (infoEl) infoEl.textContent = pageInfo(data);
    render(items);
    if (pagerEl) renderPagination(pagerEl, data, (p) => { state.page = p; load(); });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="state state-error" style="border:none;">
      <span class="state-icon">${icon("alert")}</span>
      <h3 class="state-title">Could not load events</h3>
      <p class="state-text">${esc(errorMessage(err, "An error occurred while loading events."))}</p>
      <button class="btn btn-outline btn-sm" type="button" id="retry">${icon("arrow-right")} Retry</button>
    </div></td></tr>`;
    const retry = tbody.querySelector("#retry");
    if (retry) retry.addEventListener("click", load);
  }
}

function openCreate() {
  form.reset();
  document.getElementById("e-id").value = "";
  document.getElementById("event-modal-title").textContent = "New Event";
  openDialog(modal);
}

function openEdit(eItem) {
  form.reset();
  document.getElementById("e-id").value = eItem.id;
  document.getElementById("e-title").value = eItem.title || "";
  document.getElementById("e-date").value = eItem.date ? String(eItem.date).slice(0, 16) : "";
  document.getElementById("e-status").value = eItem.status || "UPCOMING";
  document.getElementById("e-location").value = eItem.location || "";
  document.getElementById("e-register-url").value = eItem.registerUrl || "";
  document.getElementById("e-description").value = eItem.description || "";
  document.getElementById("event-modal-title").textContent = `Edit — ${eItem.title || "event"}`;
  openDialog(modal);
}

async function submit(e) {
  e.preventDefault();
  const payload = collect();
  if (!payload.title) {
    toast("Title is required", "warning");
    return;
  }
  const id = document.getElementById("e-id").value;
  const saveBtn = form.querySelector("button[type=submit]");
  saveBtn.disabled = true;
  try {
    if (id) {
      await apiFetch(`/admin/events/${id}`, { method: "PUT", body: payload, auth: true });
      toast("Event updated", "success");
    } else {
      await apiFetch("/admin/events", { method: "POST", body: payload, auth: true });
      toast("Event created", "success");
    }
    closeDialog(modal);
    state.page = 0;
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not save the event."), "error");
  } finally {
    saveBtn.disabled = false;
  }
}

async function removeEvent(id, title) {
  const ok = await confirmDialog({
    title: "Delete event?",
    message: `"${title}" will be permanently removed.`,
    confirmLabel: "Delete",
  });
  if (!ok) return;
  try {
    await apiFetch(`/admin/events/${id}`, { method: "DELETE", auth: true });
    toast("Event deleted", "success");
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not delete the event."), "error");
  }
}

function wireEvents() {
  const newBtn = document.getElementById("btn-new");
  if (newBtn) newBtn.addEventListener("click", openCreate);
  if (form) form.addEventListener("submit", submit);

  const qEl = document.getElementById("filter-q");
  if (qEl) {
    let timer = null;
    qEl.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => { state.q = qEl.value.trim(); state.page = 0; load(); }, 300);
    });
  }

  const statusEl = document.getElementById("filter-status");
  if (statusEl) {
    statusEl.addEventListener("change", () => {
      state.status = statusEl.value;
      state.page = 0;
      load();
    });
  }

  if (tbody) {
    tbody.addEventListener("click", (e) => {
      const editBtn = e.target.closest("[data-edit]");
      if (editBtn) {
        const item = cache.get(String(editBtn.dataset.id));
        if (item) openEdit(item);
        return;
      }
      const delBtn = e.target.closest("[data-delete]");
      if (delBtn) {
        const item = cache.get(String(delBtn.dataset.id));
        removeEvent(delBtn.dataset.id, (item && item.title) || "this event");
      }
    });
  }
}

async function boot() {
  const user = await guardAdmin();
  if (!user) return;
  injectAdminShell("events", user);
  wireEvents();
  load();
}

boot();
