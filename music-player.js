(() => {
  "use strict";

  const box = document.getElementById("music-box");
  const audio = document.getElementById("music-audio");
  if (!box || !audio) return;

  const title = document.getElementById("music-title");
  const cover = document.getElementById("music-cover");
  const fallback = document.getElementById("music-cover-fallback");
  const play = document.getElementById("music-play");
  const progress = document.getElementById("music-progress");
  const current = document.getElementById("music-current");
  const duration = document.getElementById("music-duration");
  const status = document.getElementById("music-status");
  const sourceLink = document.getElementById("music-source");
  const config = window.SITE_MUSIC || {};
  const mobile = window.matchMedia("(max-width: 700px)");
  let audioContext = null;
  let reverbEnabled = false;

  function connectReverb() {
    if (audioContext) return reverbEnabled;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return false;

    let source = null;
    try {
      audioContext = new AudioContextClass();
      source = audioContext.createMediaElementSource(audio);
      source.connect(audioContext.destination);
      const bass = audioContext.createBiquadFilter();
      bass.type = "lowshelf";
      bass.frequency.value = 105;
      bass.gain.value = 7;
      const dry = audioContext.createGain();
      const convolver = audioContext.createConvolver();
      const wet = audioContext.createGain();
      const mix = audioContext.createGain();
      const compressor = audioContext.createDynamicsCompressor();
      const sampleRate = audioContext.sampleRate;
      const reverbLength = Math.floor(sampleRate * 2.4);
      const impulse = audioContext.createBuffer(2, reverbLength, sampleRate);

      for (let channel = 0; channel < impulse.numberOfChannels; channel += 1) {
        const samples = impulse.getChannelData(channel);
        for (let i = 0; i < samples.length; i += 1) {
          const fade = Math.pow(1 - i / samples.length, 2.8);
          samples[i] = (Math.random() * 2 - 1) * fade;
        }
      }

      convolver.buffer = impulse;
      dry.gain.value = 0.84;
      wet.gain.value = 0.26;
      compressor.threshold.value = -12;
      compressor.knee.value = 10;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.18;
      source.disconnect();
      source.connect(bass);
      bass.connect(dry);
      dry.connect(mix);
      bass.connect(convolver);
      convolver.connect(wet);
      wet.connect(mix);
      mix.connect(compressor);
      compressor.connect(audioContext.destination);
      reverbEnabled = true;
      return true;
    } catch (error) {
      // If Web Audio is unavailable for this media element, keep normal playback usable.
      try {
        if (source && audioContext) {
          source.disconnect();
          source.connect(audioContext.destination);
        }
      } catch (_) {}
      return false;
    }
  }

  box.open = !mobile.matches;
  mobile.addEventListener("change", () => { box.open = !mobile.matches; });
  document.querySelector(".nav-toggle")?.addEventListener("click", () => {
    if (mobile.matches) box.open = false;
  });
  box.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      box.open = false;
      box.querySelector("summary").focus();
    }
  });

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const wholeSeconds = Math.floor(seconds);
    return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
  }

  function updatePosition() {
    const position = Number.isFinite(audio.currentTime) ? audio.currentTime : 0;
    progress.value = String(position);
    progress.style.setProperty("--progress", `${audio.duration ? position / audio.duration * 100 : 0}%`);
    current.textContent = formatTime(position);
    progress.setAttribute("aria-valuetext", `${current.textContent} / ${duration.textContent}`);
  }

  const songTitle = typeof config.title === "string" && config.title.trim() ? config.title.trim() : "Under Bright Lights";
  const songArtist = typeof config.artist === "string" ? config.artist.trim() : "";
  const songCredit = typeof config.credit === "string" ? config.credit.trim() : "";
  title.textContent = songTitle;
  title.title = [songTitle, songArtist, songCredit].filter(Boolean).join(" · ");
  document.getElementById("music-artist").textContent = songArtist;
  const credit = document.getElementById("music-credit");
  credit.textContent = songCredit;
  credit.hidden = !songCredit;

  if (config.cover) {
    cover.addEventListener("load", () => { cover.hidden = false; fallback.hidden = true; });
    cover.addEventListener("error", () => { cover.hidden = true; fallback.hidden = false; });
    cover.alt = `${songTitle} · 歌曲封面`;
    cover.src = config.cover;
  }

  sourceLink.href = config.sourcePage || "https://soundcloud.com/nightmoderecs/underbrightlights";
  sourceLink.textContent = "NIGHTMODE · 曲目信息";
  const configuredDuration = Number(config.duration);
  duration.textContent = formatTime(configuredDuration || 0);
  status.textContent = "点击播放即可加载音源";
  audio.preload = "metadata";
  audio.volume = 0.65;
  audio.src = config.audioSrc || "music/under-bright-lights.mp3";
  // Mobile browsers may defer metadata preloading until a user gesture.
  // Let visitors start playback immediately; enable seeking after metadata arrives.
  play.disabled = false;

  audio.addEventListener("loadedmetadata", () => {
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;
    progress.max = String(audio.duration);
    progress.disabled = false;
    play.disabled = false;
    duration.textContent = formatTime(audio.duration);
    status.textContent = "本地完整音源 · 点击播放";
    updatePosition();
  });
  audio.addEventListener("play", () => {
    box.classList.add("is-active");
    box.classList.remove("is-playing");
    play.setAttribute("aria-label", "暂停");
    status.textContent = "正在加载完整音源…";
  });
  audio.addEventListener("playing", () => {
    box.classList.add("is-playing");
    status.textContent = reverbEnabled ? "正在播放 · 重低音 / 混响已开启" : "正在播放完整音源";
  });
  audio.addEventListener("waiting", () => {
    if (!audio.paused) {
      box.classList.remove("is-playing");
      status.textContent = "音源缓冲中…";
    }
  });
  audio.addEventListener("pause", () => {
    box.classList.remove("is-playing");
    play.setAttribute("aria-label", "播放");
    if (!audio.ended && !audio.error) status.textContent = "已暂停";
  });
  audio.addEventListener("timeupdate", updatePosition);
  audio.addEventListener("seeked", updatePosition);
  audio.addEventListener("ended", () => {
    box.classList.remove("is-active", "is-playing");
    play.setAttribute("aria-label", "播放");
    status.textContent = "播放结束";
  });
  audio.addEventListener("error", () => {
    play.disabled = true;
    progress.disabled = true;
    status.textContent = "完整音源无法加载";
  });

  play.addEventListener("click", async () => {
    if (audio.paused) {
      const hasReverb = connectReverb();
      try {
        if (hasReverb && audioContext.state === "suspended") await audioContext.resume();
        await audio.play();
      } catch (_) {
        status.textContent = "播放失败，请重试";
      }
    } else {
      audio.pause();
    }
  });
  progress.addEventListener("input", () => {
    if (!progress.disabled) audio.currentTime = Number(progress.value);
  });

  audio.load();
})();
