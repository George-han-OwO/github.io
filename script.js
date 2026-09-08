"use strict";

// Remove only this site's retired account data; storage can be unavailable in private mode.
try {
  localStorage.removeItem("georgehan_isAdmin");
  localStorage.removeItem("georgehan_bindings");
} catch {
  // Navigation and content remain usable without browser storage.
}

const menu = document.querySelector("#nav-menu");
const toggle = document.querySelector(".nav-toggle");
const links = [...document.querySelectorAll(".nav-link")];
const mobile = window.matchMedia("(max-width: 700px)");

function closeMenu(returnFocus = false) {
  menu.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "打开导航菜单");
  if (returnFocus) toggle.focus();
}

if (menu && toggle) {
  toggle.hidden = false;
  document.documentElement.classList.add("js");
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") !== "true";
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "关闭导航菜单" : "打开导航菜单");
  });
  links.forEach((link) =>
    link.addEventListener("click", () => {
      closeMenu();
      // Preserve native hash navigation and put keyboard focus at the destination.
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
    }),
  );
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      toggle.getAttribute("aria-expanded") === "true"
    )
      closeMenu(true);
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".nav")) closeMenu();
  });
  document.addEventListener("focusin", (event) => {
    if (!event.target.closest(".nav")) closeMenu();
  });
  mobile.addEventListener("change", () => closeMenu());
}

// One update per frame; choose the section at the reading line, including page bottom.
const sections = links
  .map((link) => document.getElementById(link.hash.slice(1)))
  .filter(Boolean);
let scrollPending = false;
function updateActiveLink() {
  let current = sections[0];
  const readingLine = window.innerHeight * 0.3;
  for (const section of sections) {
    if (section.getBoundingClientRect().top <= readingLine) current = section;
  }
  if (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 2
  )
    current = sections.at(-1);
  links.forEach((link) => {
    if (current && link.hash === `#${current.id}`)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  scrollPending = false;
}
function scheduleNavigationUpdate() {
  if (scrollPending) return;
  scrollPending = true;
  window.requestAnimationFrame(updateActiveLink);
}
window.addEventListener("scroll", scheduleNavigationUpdate, { passive: true });
window.addEventListener("resize", scheduleNavigationUpdate);
window.addEventListener("load", scheduleNavigationUpdate);
updateActiveLink();
const year = document.querySelector("#year");
if (year) year.textContent = String(new Date().getFullYear());
