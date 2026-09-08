const { test } = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../script.js"), "utf8");

function fixture({ blockedStorage = false } = {}) {
  function element(initial = {}) {
    const attributes = new Map();
    const classes = new Set();
    const events = {};
    return Object.assign(
      {
        events,
        attributes,
        classList: {
          add: (name) => classes.add(name),
          remove: (name) => classes.delete(name),
          contains: (name) => classes.has(name),
          toggle: (name, value) =>
            value ? classes.add(name) : classes.delete(name),
        },
        addEventListener: (name, callback) => {
          events[name] = callback;
        },
        setAttribute: (name, value) => attributes.set(name, value),
        getAttribute: (name) => attributes.get(name),
        removeAttribute: (name) => attributes.delete(name),
        focus() {
          this.focused = true;
        },
        getBoundingClientRect() {
          return { top: this.top };
        },
      },
      initial,
    );
  }
  const sections = ["home", "about", "games", "contact"].map((id, i) =>
    element({ id, top: i * 800 }),
  );
  const links = sections.map((section) => element({ hash: "#" + section.id }));
  const menu = element();
  const toggle = element({ hidden: true });
  const year = element();
  const media = element();
  const document = element({
    documentElement: element({ scrollHeight: 3200 }),
    querySelector: (selector) =>
      ({ "#nav-menu": menu, ".nav-toggle": toggle, "#year": year })[selector],
    querySelectorAll: () => links,
    getElementById: (id) => sections.find((section) => section.id === id),
  });
  const frames = [];
  const window = element({
    innerHeight: 800,
    scrollY: 0,
    matchMedia: () => media,
    requestAnimationFrame: (callback) => frames.push(callback),
  });
  const storage = new Map([
    ["georgehan_isAdmin", "true"],
    ["georgehan_bindings", "{malformed"],
    ["other-site-data", "keep"],
  ]);
  const localStorage = {
    removeItem(key) {
      if (blockedStorage) throw new Error("Storage denied");
      storage.delete(key);
    },
  };
  vm.runInNewContext(source, { document, window, localStorage, Date });
  return {
    document,
    window,
    menu,
    toggle,
    year,
    media,
    sections,
    links,
    storage,
    frames,
  };
}

test("removes retired keys without parsing corrupt data or touching unrelated storage", () => {
  const state = fixture();
  assert.deepEqual([...state.storage], [["other-site-data", "keep"]]);
});

test("blocked storage does not prevent navigation or year initialization", () => {
  const { toggle, year } = fixture({ blockedStorage: true });
  assert.equal(toggle.hidden, false);
  toggle.events.click();
  assert.equal(toggle.getAttribute("aria-expanded"), "true");
  assert.equal(year.textContent, String(new Date().getFullYear()));
});

test("menu toggle and Escape keep visibility, accessible labels and focus in sync", () => {
  const { toggle, menu, document } = fixture();
  toggle.events.click();
  assert.equal(menu.classList.contains("is-open"), true);
  assert.equal(toggle.getAttribute("aria-label"), "关闭导航菜单");
  document.events.keydown({ key: "Escape" });
  assert.equal(menu.classList.contains("is-open"), false);
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(toggle.getAttribute("aria-label"), "打开导航菜单");
  assert.equal(toggle.focused, true);
});

test("navigation focuses its destination and closes the menu", () => {
  const { links, sections, toggle } = fixture();
  toggle.events.click();
  links[2].events.click();
  assert.equal(toggle.getAttribute("aria-expanded"), "false");
  assert.equal(sections[2].focused, true);
  assert.equal(sections[2].getAttribute("tabindex"), "-1");
});

test("outside click, focus departure and breakpoint change close the menu", () => {
  const { document, media, toggle } = fixture();
  for (const close of [
    () => document.events.click({ target: { closest: () => null } }),
    () => document.events.focusin({ target: { closest: () => null } }),
    () => media.events.change(),
  ]) {
    toggle.events.click();
    close();
    assert.equal(toggle.getAttribute("aria-expanded"), "false");
  }
});

test("scroll updates are batched and correctly identify the current and last section", () => {
  const { links, window, frames, sections } = fixture();
  assert.equal(links[0].getAttribute("aria-current"), "location");
  sections.forEach((section) => {
    section.top -= 1600;
  });
  window.scrollY = 1600;
  window.events.scroll();
  window.events.scroll();
  assert.equal(frames.length, 1);
  frames.shift()();
  assert.equal(links[2].getAttribute("aria-current"), "location");
  assert.equal(links[0].getAttribute("aria-current"), undefined);
  window.scrollY = 2400;
  window.events.scroll();
  frames.shift()();
  assert.equal(links[3].getAttribute("aria-current"), "location");
});
