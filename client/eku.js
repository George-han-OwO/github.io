import { EkuRenderer } from "./renderer.js";
import { api, initAdmin } from "./admin.js";
import { clamp, safePosition, visibleRect, ease } from "./motion.js";

const canvas = document.querySelector("#eku-canvas");
const actorButton = document.querySelector("#eku-actor");
const bubble = document.querySelector("#eku-bubble");
const prop = document.querySelector("#eku-word");
const status = document.querySelector("#eku-status");
const panel = document.querySelector("#eku-chat");
const chatToggle = document.querySelector("#eku-chat-toggle");
const pauseButton = document.querySelector("#eku-pause");
const hideButton = document.querySelector("#eku-hide");
const chatForm = document.querySelector("#eku-chat-form");
const history = document.querySelector("#eku-messages");
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
const targets = [...document.querySelectorAll("[data-eku-target]")];
const progress = document.querySelector("#eku-load");
const runtime = {
  config: { motionEnabled: true, chatEnabled: true, chatReady: false },
  paused: reduced.matches,
  hidden: false,
  ready: false,
};
let renderer;
let position = { x: window.innerWidth - 150, y: window.innerHeight - 76 };
let action = { type: "idle", start: 0, end: 0, target: null };
let nextAuto = performance.now() + 8000;
let bubbleUntil = 0,
  lastDraw = 0;
let picked = null,
  pickedOpacity = "";
let conversation = [],
  request = null;
let drag = null;

function visibleTargets() {
  return targets.filter(
    (target) =>
      visibleRect(target.getBoundingClientRect(), innerWidth, innerHeight) &&
      target.getBoundingClientRect().top > 90,
  );
}
function textNode(target) {
  return target.matches("article") ? target.querySelector("h3") : target;
}
function targetText(target) {
  return textNode(target).textContent.replace(/\s+/g, " ").trim();
}
function context() {
  return visibleTargets().map((target) => ({
    id: target.dataset.ekuTarget,
    text: targetText(target).slice(0, 100),
  }));
}
function safe(x, y) {
  return safePosition(
    x,
    y,
    document.documentElement.clientWidth,
    innerHeight,
    renderer?.size || 180,
  );
}
function say(text, duration = 4500) {
  bubble.textContent = text;
  bubble.hidden = runtime.hidden;
  bubbleUntil = performance.now() + duration;
}
function restoreWord() {
  if (picked) picked.style.opacity = pickedOpacity;
  picked = null;
  prop.hidden = true;
  prop.textContent = "";
}
function stop() {
  restoreWord();
  const now = performance.now();
  action = { type: "idle", start: now, end: now };
}
function perform(type, targetId = "") {
  if (!runtime.ready || runtime.hidden) return;
  stop();
  if (runtime.paused || !runtime.config.motionEnabled) {
    say("我就在这里陪你。开启游走后，我再去探索。");
    return;
  }
  const available = visibleTargets();
  const target =
    available.find((t) => t.dataset.ekuTarget === targetId) ||
    available[Math.floor(Math.random() * available.length)];
  if (!target || type === "wave" || type === "idle") {
    action = {
      type: type === "idle" ? "idle" : "wave",
      start: performance.now(),
      end: performance.now() + 2200,
    };
    return;
  }
  const rect = target.getBoundingClientRect();
  const destination =
    type === "climb"
      ? safe(rect.left + 28, rect.bottom + renderer.size * 0.6)
      : safe(rect.right + 45, rect.bottom + renderer.size * 0.7);
  const duration = clamp(
    Math.hypot(destination.x - position.x, destination.y - position.y) / 0.16,
    600,
    3800,
  );
  action = {
    type: "walk",
    then: type,
    target,
    from: { ...position },
    to: destination,
    start: performance.now(),
    end: performance.now() + duration,
  };
  nextAuto = performance.now() + duration + 14000;
}
function arrive(now) {
  const target = action.target;
  const type = action.then;
  if (!target || type === "walk") {
    stop();
    return;
  }
  const rect = target.getBoundingClientRect();
  if (!visibleRect(rect, innerWidth, innerHeight)) {
    stop();
    return;
  }
  if (type === "climb") {
    action = {
      type,
      target,
      from: { ...position },
      to: safe(rect.left + 28, rect.top + 4),
      start: now,
      end: now + 2600,
    };
    say("借这个边框，往上爬一点。");
  } else {
    action = { type, target, start: now, end: now + 4300 };
    if (type === "pickup") {
      picked = textNode(target);
      pickedOpacity = picked.style.opacity;
      picked.style.opacity = ".25";
      prop.textContent = targetText(target).slice(0, 24);
      prop.hidden = false;
      say("借我看一下，一会儿就放回去。");
    } else say(`让我看看「${targetText(target).slice(0, 20)}」…`);
  }
}
function updateSettings(config) {
  runtime.config = { ...runtime.config, ...config };
  if (!runtime.config.motionEnabled) stop();
  pauseButton.disabled = !runtime.config.motionEnabled;
  pauseButton.textContent = !runtime.config.motionEnabled
    ? "游走已关闭"
    : runtime.paused
      ? "继续游走"
      : "暂停游走";
  chatForm.querySelector("[type=submit]").disabled =
    Boolean(request) || !runtime.config.chatEnabled;
  document.querySelector("#eku-connection").textContent = !runtime.config
    .chatEnabled
    ? "对话暂时休息中"
    : runtime.config.chatReady
      ? "DeepSeek · 已配置"
      : "等待管理员配置对话";
}
async function refreshSettings() {
  try {
    updateSettings(await api("/api/config"));
  } catch {
    document.querySelector("#eku-connection").textContent = "服务器未连接";
  }
}
initAdmin(updateSettings);
refreshSettings();
setInterval(() => {
  if (!document.hidden) refreshSettings();
}, 60000);

function openChat(open) {
  panel.hidden = !open;
  chatToggle.setAttribute("aria-expanded", String(open));
  if (open) {
    stop();
    document.querySelector("#eku-input").focus();
  } else chatToggle.focus();
}
chatToggle.addEventListener("click", () => openChat(panel.hidden));
document
  .querySelector("#eku-chat-close")
  .addEventListener("click", () => openChat(false));
panel.addEventListener("keydown", (event) => {
  if (event.key === "Escape") openChat(false);
});
pauseButton.addEventListener("click", () => {
  runtime.paused = !runtime.paused;
  stop();
  updateSettings({});
  nextAuto = performance.now() + 2500;
  if (runtime.paused) say("好，我安静待一会儿。");
});
hideButton.addEventListener("click", () => {
  runtime.hidden = !runtime.hidden;
  stop();
  canvas.hidden = runtime.hidden;
  actorButton.hidden = runtime.hidden || !runtime.ready;
  bubble.hidden = true;
  hideButton.textContent = runtime.hidden ? "显示 EKU" : "收起 EKU";
});
reduced.addEventListener("change", (event) => {
  runtime.paused = event.matches;
  stop();
  updateSettings({});
});
document.querySelectorAll("[data-eku-action]").forEach((button) =>
  button.addEventListener("click", () => {
    openChat(false);
    perform(button.dataset.ekuAction);
  }),
);
function message(role, text) {
  const item = document.createElement("div");
  item.className = `eku-message eku-message-${role}`;
  const label = document.createElement("span");
  label.className = "eku-message-label";
  label.textContent = role === "user" ? "你" : "EKU";
  const content = document.createElement("p");
  content.textContent = text;
  item.append(label, content);
  history.append(item);
  history.scrollTop = history.scrollHeight;
  while (history.children.length > 30) history.firstElementChild.remove();
  return item;
}
chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (request) return;
  const input = document.querySelector("#eku-input");
  const text = input.value.trim();
  if (!text) return;
  const messages = [
    ...conversation.slice(-10),
    { role: "user", content: text },
  ];
  const userMessage = message("user", text);
  input.value = "";
  request = new AbortController();
  updateSettings({});
  document.querySelector("#eku-chat-stop").hidden = false;
  status.textContent = "EKU 正在想…";
  try {
    const reply = await api("/api/chat", {
      method: "POST",
      signal: request.signal,
      body: JSON.stringify({ messages, targets: context() }),
    });
    conversation = [
      ...messages,
      { role: "assistant", content: reply.reply },
    ].slice(-10);
    message("assistant", reply.reply);
    status.textContent = "";
    perform(reply.action, reply.target);
    say(reply.reply.slice(0, 80), 6000);
  } catch (error) {
    status.textContent =
      error.name === "AbortError" ? "已停止这次回复。" : error.message;
    input.value = text;
    userMessage.remove();
  } finally {
    request = null;
    updateSettings({});
    document.querySelector("#eku-chat-stop").hidden = true;
    input.focus();
  }
});
document
  .querySelector("#eku-chat-stop")
  .addEventListener("click", () => request?.abort());
document.querySelector("#eku-chat-clear").addEventListener("click", () => {
  if (request) return;
  conversation = [];
  history.replaceChildren();
  status.textContent = "";
  message("assistant", "重新开始吧。想聊什么？");
});

actorButton.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  drag = {
    x: event.clientX,
    y: event.clientY,
    start: { ...position },
    moved: false,
  };
  stop();
  actorButton.setPointerCapture(event.pointerId);
});
actorButton.addEventListener("pointermove", (event) => {
  if (!drag) return;
  if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 6)
    drag.moved = true;
  if (drag.moved)
    position = safe(
      drag.start.x + event.clientX - drag.x,
      drag.start.y + event.clientY - drag.y,
    );
});
actorButton.addEventListener("pointerup", (event) => {
  if (!drag) return;
  const moved = drag.moved;
  drag = null;
  actorButton.releasePointerCapture(event.pointerId);
  nextAuto = performance.now() + 10000;
  if (!moved) openChat(true);
});
actorButton.addEventListener("pointercancel", () => {
  drag = null;
});
actorButton.addEventListener("click", (event) => {
  if (event.detail === 0) openChat(true);
});
window.addEventListener("resize", () => {
  renderer?.resize();
  position = safe(position.x, position.y);
  stop();
});
window.addEventListener(
  "scroll",
  () => {
    if (action.target || picked) stop();
    position = safe(position.x, position.y);
    nextAuto = performance.now() + 2000;
  },
  { passive: true },
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) stop();
  nextAuto = performance.now() + 5000;
});

function frame(now) {
  requestAnimationFrame(frame);
  if (
    !runtime.ready ||
    runtime.hidden ||
    document.hidden ||
    now - lastDraw < 33
  )
    return;
  lastDraw = now;
  const staticMode = runtime.paused || !runtime.config.motionEnabled;
  if (!staticMode && !drag) {
    if (action.to && action.from) {
      const amount = ease(
        clamp((now - action.start) / (action.end - action.start), 0, 1),
      );
      position = safe(
        action.from.x + (action.to.x - action.from.x) * amount,
        action.from.y + (action.to.y - action.from.y) * amount,
      );
    }
    if (action.end > action.start && now >= action.end) {
      if (action.type === "walk" && action.then) arrive(now);
      else {
        const wasPickup = Boolean(picked);
        stop();
        if (wasPickup) say("看完啦，已经放回原处。");
      }
    }
    if (
      action.type === "idle" &&
      now > nextAuto &&
      panel.hidden &&
      !document.querySelector("#admin-dialog").open
    ) {
      const choices = ["walk", "climb", "read", "pickup"];
      perform(choices[Math.floor(Math.random() * choices.length)]);
      nextAuto = now + 18000;
    }
  }
  const direction =
    action.to && action.from && action.to.x < action.from.x ? -1 : 1;
  renderer.draw(
    position,
    staticMode ? "idle" : action.type,
    now / 1000,
    direction,
    staticMode,
  );
  actorButton.style.transform = `translate(${position.x - 40}px, ${position.y - renderer.size}px)`;
  actorButton.style.height = `${renderer.size}px`;
  const bubbleX = clamp(position.x - 100, 12, innerWidth - 222);
  bubble.style.transform = `translate(${bubbleX}px, ${Math.max(90, position.y - renderer.size - bubble.offsetHeight - 8)}px)`;
  if (now > bubbleUntil) bubble.hidden = true;
  if (picked) {
    const hand = renderer.hand();
    if (hand)
      prop.style.transform = `translate(${clamp(hand.x, prop.offsetWidth / 2 + 8, document.documentElement.clientWidth - prop.offsetWidth / 2 - 8)}px, ${hand.y - 6}px) translate(-50%, -50%) rotate(${Math.sin(now / 600) * 5}deg)`;
  }
}
async function startModel() {
  try {
    progress.hidden = false;
    progress.textContent = "EKU 正在过来…";
    renderer?.dispose();
    renderer = new EkuRenderer(canvas);
    await renderer.load(__EKU_MODEL_URL__, (percent) => {
      progress.textContent = `EKU 正在过来… ${percent}%`;
    });
    position = safe(position.x, position.y);
    runtime.ready = true;
    actorButton.hidden = runtime.hidden;
    progress.hidden = true;
    document.querySelector("#eku-retry").hidden = true;
    say("你好，我是 EKU。点我聊天，也可以拖动我。", 7000);
  } catch {
    progress.textContent = "EKU 模型暂时没能加载，对话面板仍可使用。";
    document.querySelector("#eku-retry").hidden = false;
  }
}
document.querySelector("#eku-retry").addEventListener("click", startModel);
startModel();
requestAnimationFrame(frame);
