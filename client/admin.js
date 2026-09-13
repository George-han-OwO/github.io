export async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("服务未连接，请通过服务器地址打开网站。");
  }
  if (!response.ok) throw new Error(data.error || "请求没有完成，请稍后再试。");
  return data;
}
export function initAdmin(onSettings) {
  const button = document.querySelector("#admin-open");
  const dialog = document.querySelector("#admin-dialog");
  const login = document.querySelector("#admin-login");
  const settings = document.querySelector("#admin-settings");
  const message = document.querySelector("#admin-message");
  const motion = document.querySelector("#admin-motion");
  const chat = document.querySelector("#admin-chat");
  let csrf = "";
  button.hidden = false;
  async function load() {
    message.textContent = "";
    const session = await api("/api/admin/session");
    csrf = session.csrf || "";
    login.hidden = session.authenticated;
    settings.hidden = !session.authenticated;
    button.textContent = session.authenticated
      ? "管理员 · " + session.username
      : "管理员登录";
    if (session.authenticated) {
      const value = await api("/api/admin/settings");
      motion.checked = value.motionEnabled;
      chat.checked = value.chatEnabled;
      document.querySelector("#admin-status").textContent = value.chatReady
        ? `DeepSeek 已配置 · ${value.model}`
        : "DeepSeek 尚未配置，请在服务器运行 npm run setup。";
      const used =
        value.usage.day === new Date().toISOString().slice(0, 10)
          ? value.usage.used
          : 0;
      document.querySelector("#admin-usage").textContent =
        `今日已使用 ${used} / ${value.dailyLimit} 次对话（UTC 日期）`;
    }
  }
  button.addEventListener("click", async () => {
    dialog.showModal();
    try {
      await load();
      (login.hidden ? motion : login.elements.username).focus();
    } catch (error) {
      message.textContent = error.message;
    }
  });
  document
    .querySelector("#admin-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    login.elements.password.value = "";
    button.focus();
  });
  login.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = login.querySelector("[type=submit]");
    submit.disabled = true;
    message.textContent = "正在验证…";
    try {
      await api("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({
          username: login.elements.username.value,
          password: login.elements.password.value,
        }),
      });
      login.elements.password.value = "";
      await load();
    } catch (error) {
      message.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });
  settings.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = settings.querySelector("[type=submit]");
    submit.disabled = true;
    try {
      const value = await api("/api/admin/settings", {
        method: "PUT",
        headers: { "X-CSRF-Token": csrf },
        body: JSON.stringify({
          motionEnabled: motion.checked,
          chatEnabled: chat.checked,
        }),
      });
      onSettings(value);
      message.textContent = "已保存，所有访客将在一分钟内应用新设置。";
    } catch (error) {
      message.textContent = error.message;
    } finally {
      submit.disabled = false;
    }
  });
  document
    .querySelector("#admin-logout")
    .addEventListener("click", async () => {
      try {
        await api("/api/admin/logout", {
          method: "POST",
          headers: { "X-CSRF-Token": csrf },
          body: "{}",
        });
        await load();
      } catch (error) {
        message.textContent = error.message;
      }
    });
}
