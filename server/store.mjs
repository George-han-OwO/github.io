import fs from "node:fs";
import path from "node:path";

export function createStore(directory) {
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
  const file = path.join(directory, "settings.json");
  let state = { motionEnabled: true, chatEnabled: true, day: "", used: 0 };
  if (fs.existsSync(file)) {
    const saved = JSON.parse(fs.readFileSync(file, "utf8"));
    if (
      typeof saved.motionEnabled !== "boolean" ||
      typeof saved.chatEnabled !== "boolean" ||
      !Number.isSafeInteger(saved.used) ||
      saved.used < 0
    )
      throw new Error("Invalid private/settings.json; restore a valid backup.");
    state = { ...state, ...saved };
  }
  function save() {
    fs.writeFileSync(file + ".tmp", JSON.stringify(state), { mode: 0o600 });
    fs.renameSync(file + ".tmp", file);
  }
  return {
    settings: () => ({
      motionEnabled: state.motionEnabled,
      chatEnabled: state.chatEnabled,
    }),
    update(settings) {
      state = { ...state, ...settings };
      save();
      return this.settings();
    },
    reserve(limit) {
      const day = new Date().toISOString().slice(0, 10);
      if (state.day !== day) {
        state.day = day;
        state.used = 0;
      }
      if (state.used >= limit) return false;
      state.used++;
      save();
      return true;
    },
    usage: () => ({ day: state.day, used: state.used }),
  };
}
