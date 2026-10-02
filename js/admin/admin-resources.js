import { apiFetch, errorMessage } from "../api.js";
import { guardAdmin } from "../auth.js";
import {
  icon, esc, statusBadge, injectAdminShell,
  openDialog, closeDialog, confirmDialog, toast, renderPagination, pageInfo,
} from "../components.js";

const SIZE = 15;
const state = { page: 0, q: "", category: "" };
const cache = new Map();

const tbody = document.getElementById("table-body");
const pagerEl = document.getElementById("table-pager");
const infoEl = document.getElementById("list-info");
const modal = document.getElementById("resource-modal");
const form = document.getElementById("resource-form");

function rowSkeleton() {
  return `<tr><td colspan="5" style="padding:1rem;"><div class="sk-list">
    <div class="sk sk-row w100"></div><div class="sk sk-row w100"></div><div class="sk sk-row w100"></div>
  </div></td></tr>`;
}

function collect() {
  const val = (id) => document.getElementById(id)?.value.trim() ?? "";
  const opt = (v) => (v ? v : null);
  return {
    title: val("res-title"),
    category: val("res-category"),
    url: opt(val("res-url")),
    description: opt(val("res-description")),
  };
}

function render(items) {
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="empty-row">No developer resources created yet. Click "New Resource" to add one.</td></tr>`;
    return;
  }
  items.forEach((item) => cache.set(String(item.id), item));
  tbody.innerHTML = items.map((r) => `
    <tr>
      <td><span class="cell-stack"><span class="cell-main">${esc(r.title || "Untitled")}</span></span></td>
      <td><span class="badge b-info">${esc(r.category || "GUIDE")}</span></td>
      <td><span class="message-clip" title="${esc(r.description || "")}">${esc(r.description || "—")}</span></td>
      <td class="hide-md">${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener" class="link-muted">${icon("external")} Visit Resource</a>` : "—"}</td>
      <td><div class="row-actions">
        <button class="btn btn-sm btn-outline btn-icon" type="button" data-edit data-id="${r.id}" title="Edit">${icon("edit")}</button>
        <button class="btn btn-sm btn-danger btn-icon" type="button" data-delete data-id="${r.id}" title="Delete">${icon("trash")}</button>
      </div></td>
    </tr>`).join("");
}

async function load() {
  if (!tbody) return;
  tbody.innerHTML = rowSkeleton();
  if (pagerEl) pagerEl.innerHTML = "";
  try {
    const data = await apiFetch("/admin/resources", { auth: true, params: { page: state.page, size: SIZE, q: state.q || undefined, category: state.category || undefined } });
    const items = (data && data.content) || [];
    if (infoEl) infoEl.textContent = pageInfo(data);
    render(items);
    if (pagerEl) renderPagination(pagerEl, data, (p) => { state.page = p; load(); });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5"><div class="state state-error" style="border:none;">
      <span class="state-icon">${icon("alert")}</span>
      <h3 class="state-title">Could not load resources</h3>
      <p class="state-text">${esc(errorMessage(err, "An error occurred while loading resources."))}</p>
      <button class="btn btn-outline btn-sm" type="button" id="retry">${icon("arrow-right")} Retry</button>
    </div></td></tr>`;
    const retry = tbody.querySelector("#retry");
    if (retry) retry.addEventListener("click", load);
  }
}

function openCreate() {
  form.reset();
  document.getElementById("res-id").value = "";
  document.getElementById("resource-modal-title").textContent = "New Resource";
  openDialog(modal);
}

function openEdit(rItem) {
  form.reset();
  document.getElementById("res-id").value = rItem.id;
  document.getElementById("res-title").value = rItem.title || "";
  document.getElementById("res-category").value = rItem.category || "GUIDE";
  document.getElementById("res-url").value = rItem.url || "";
  document.getElementById("res-description").value = rItem.description || "";
  document.getElementById("resource-modal-title").textContent = `Edit — ${rItem.title || "resource"}`;
  openDialog(modal);
}

async function submit(e) {
  e.preventDefault();
  const payload = collect();
  if (!payload.title || !payload.url) {
    toast("Title and Resource Link are required", "warning");
    return;
  }
  const id = document.getElementById("res-id").value;
  const saveBtn = form.querySelector("button[type=submit]");
  saveBtn.disabled = true;
  try {
    if (id) {
      await apiFetch(`/admin/resources/${id}`, { method: "PUT", body: payload, auth: true });
      toast("Resource updated", "success");
    } else {
      await apiFetch("/admin/resources", { method: "POST", body: payload, auth: true });
      toast("Resource created", "success");
    }
    closeDialog(modal);
    state.page = 0;
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not save the resource."), "error");
  } finally {
    saveBtn.disabled = false;
  }
}

async function removeResource(id, title) {
  const ok = await confirmDialog({
    title: "Delete resource?",
    message: `"${title}" will be permanently removed.`,
    confirmLabel: "Delete",
  });
  if (!ok) return;
  try {
    await apiFetch(`/admin/resources/${id}`, { method: "DELETE", auth: true });
    toast("Resource deleted", "success");
    load();
  } catch (err) {
    toast(errorMessage(err, "Could not delete the resource."), "error");
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

  const categoryEl = document.getElementById("filter-category");
  if (categoryEl) {
    categoryEl.addEventListener("change", () => {
      state.category = categoryEl.value;
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
        removeResource(delBtn.dataset.id, (item && item.title) || "this resource");
      }
    });
  }
}

async function boot() {
  const user = await guardAdmin();
  if (!user) return;
  injectAdminShell("resources", user);
  wireEvents();
  load();
}

boot();
