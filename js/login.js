/**
 * Apex Innovators Admin — login.js
 */

import { login, getUser } from "./auth.js";
import { icon, esc, toast } from "./components.js";

const form = document.getElementById("login-form");
const alertHost = document.getElementById("login-alert");

function showError(text) {
  if (alertHost) {
    alertHost.innerHTML = `<div class="alert alert-error">${icon("alert")}<span>${esc(text)}</span></div>`;
  }
}

function safeNext() {
  const raw = new URLSearchParams(window.location.search).get("next");
  if (!raw) return "";
  if (/^[a-zA-Z0-9_./?&=#%-]*$/.test(raw) && !/^(\/\/|https?:|javascript:)/i.test(raw)) return raw;
  return "";
}

function redirectFor(user) {
  const next = safeNext();
  const dest = next || "dashboard.html";
  window.location.assign(dest);
}

const existing = getUser();
if (existing && localStorage.getItem("ai_token")) {
  redirectFor(existing);
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (alertHost) alertHost.innerHTML = "";

    const email = form.elements.email.value.trim();
    const password = form.elements.password.value;
    if (!email || !password) {
      showError("Enter your email and password.");
      return;
    }

    const submitBtn = form.querySelector("button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon("clock")} Signing in…`;

    try {
      const user = await login(email, password);
      toast(`Welcome back, ${user.name}`, "success");
      redirectFor(user);
    } catch (err) {
      const message = (err && (err.messageText || err.message)) || "Incorrect email or password.";
      showError(message);
      toast(message, "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>Sign In to Admin Panel</span>`;
    }
  });
}
