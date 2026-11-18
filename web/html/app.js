"use strict";

const STORAGE_KEY = "cv-devops:nombre";
const $ = (selector) => document.querySelector(selector);

const welcome = $("#welcome");
const site = $("#site");
const form = $("#name-form");
const input = $("#name-input");
const submit = $("#name-submit");
const errorBox = $("#name-error");

/* ---------- Bienvenida: pedir el nombre y guardarlo en la API ---------- */

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

async function registerVisitor(name) {
  const response = await fetch("/api/visitors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (response.status === 400) throw new Error("invalid");
  if (!response.ok) throw new Error("server");
  return response.json();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorBox.hidden = true;

  const name = input.value.trim();
  if (name.length < 1 || name.length > 50) {
    showError("Escribí un nombre de hasta 50 caracteres.");
    return;
  }

  submit.disabled = true;
  try {
    const visitor = await registerVisitor(name);
    sessionStorage.setItem(STORAGE_KEY, visitor.name);
    showSite(visitor.name);
  } catch (error) {
    showError(error.message === "invalid"
      ? "El nombre no es válido. Probá con otro."
      : "No pude conectar con la API. ¿Está levantado el stack?");
  } finally {
    submit.disabled = false;
  }
});

/* ---------- Página del CV ---------- */

async function loadCount() {
  try {
    const response = await fetch("/api/visitors/count");
    if (!response.ok) throw new Error();
    $("#visitor-count").textContent = await response.text();
  } catch {
    $("#visitor-count").textContent = "–";
  }
}

function showSite(name) {
  welcome.hidden = true;
  site.hidden = false;
  // textContent (no innerHTML): el nombre lo escribe el visitante
  $("#greeting").textContent = `Hola ${name}, esta es una versión más desarrollada de mi currículum`;
  loadCount();
  selectTab(location.hash.slice(1) || "contenedores", false);
}

$("#change-name").addEventListener("click", () => {
  sessionStorage.removeItem(STORAGE_KEY);
  site.hidden = true;
  welcome.hidden = false;
  input.value = "";
  input.focus();
});

/* ---------- Solapas ---------- */

const tabs = [...document.querySelectorAll('[role="tab"]')];

function selectTab(slug, focus = true) {
  const target = tabs.find((tab) => tab.id === `tab-${slug}`) ?? tabs[0];
  for (const tab of tabs) {
    const active = tab === target;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
  }
  history.replaceState(null, "", `#${target.id.replace("tab-", "")}`);
  if (focus) target.focus();
}

for (const tab of tabs) {
  tab.addEventListener("click", () => selectTab(tab.id.replace("tab-", "")));
  tab.addEventListener("keydown", (event) => {
    const index = tabs.indexOf(tab);
    const moves = { ArrowRight: 1, ArrowLeft: -1 };
    if (event.key in moves) {
      event.preventDefault();
      const next = tabs[(index + moves[event.key] + tabs.length) % tabs.length];
      selectTab(next.id.replace("tab-", ""));
    }
  });
}

/* ---------- Arranque ---------- */

const savedName = sessionStorage.getItem(STORAGE_KEY);
if (savedName) showSite(savedName);
