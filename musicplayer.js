"use strict";

const audio = document.querySelector("#audio-player");
const selector = document.querySelector("#track-selector");
const status = document.querySelector("#library-status");
const title = document.querySelector("#track-title");
const group = document.querySelector("#track-group");
const vibe = document.querySelector("#current-vibe-tag");
const elapsedTime = document.querySelector("#elapsed-time");
const durationTime = document.querySelector("#duration-time");
const progress = document.querySelector("#progress-slider");
const previousButton = document.querySelector("#previous-button");
const playButton = document.querySelector("#play-button");
const nextButton = document.querySelector("#next-button");
const playIcon = document.querySelector("#play-icon");
const recInfo = document.querySelector("#recInfo");
const aiDebug = document.querySelector("#aiDebug");

const PLAY_ICON = "M8 5v14l11-7z";
const PAUSE_ICON = "M6 5h4v14H6zm8 0h4v14h-4z";

const RECOMMEND_ENDPOINT = "/.netlify/functions/recommend";

let tracks = [];
let currentTrackIndex = -1;
let audioUnlocked = false;
let requestCount = 0;

// The same mapping the serverless function uses, kept here as a last-resort
// fallback for when the network request itself fails.
const AREA_TO_BASE = {
  "H Village Vibe": "H Village Vibe",
  "Gym": "Exercise",
  "Media": "Research (Delta)",
  "Bus1": "Bus Waiting",
  "Bus2": "Bus Waiting",
  "Subwway": "General",
  "Sigma": "Research (Delta)",
  "AlphaOmega": "Classroom",
  "Cabins": "General",
  "Tennis": "Exercise",
  "Kappa1": "Classroom",
  "Kappa2": "Classroom",
  "Epsilon1": "Classroom",
  "Epsilon2": "Classroom",
  "Iota1": "Classroom",
  "Iota2": "Classroom",
  "Omnicron": "Classroom",
  "Omnicron2": "Classroom",
  "Lambda": "Classroom",
  "Theta": "Classroom",
  "Shrine": "General",
  "SBC": "SFC Office",
  "TauDelta": "Classroom",
  "Pond": "Komoike",
};

function isNight() {
  const hour = new Date().getHours();
  return hour >= 19 || hour < 5;
}

function fallbackFolder(area, activity) {
  const base = AREA_TO_BASE[area] || "General";

  if (base === "Classroom") {
    if (activity === "walking") return "Classroom/Walking";
    if (activity === "running") return "Classroom/Running";
    return "Classroom/Resting";
  }

  if (base === "Exercise") {
    if (area === "Gym" && activity === "exercise") return "Exercise/Gym";
    if (activity === "walking") return "Exercise/Walking";
    if (activity === "running") return "Exercise/Running";
    if (activity === "exercise") return "Exercise/Gym";
    return "Exercise/Resting";
  }

  if (base === "General") {
    if (activity === "running") return "General/Running";
    if (activity === "walking") return isNight() ? "General/Walking(Night)" : "General/Walking";
    if (activity === "exercise") return "General/Running";
    return isNight() ? "General/Resting(Night)" : "General/Resting";
  }

  return base;
}

function clockTime() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function setAiDebug(lines) {
  if (aiDebug) aiDebug.textContent = lines.join("\n");
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function setStatus(message, state = "ready") {
  status.textContent = message;
  status.dataset.state = state;
}

function setRecInfo(message) {
  if (recInfo) recInfo.textContent = message;
}

function setControlsEnabled(enabled) {
  selector.disabled = !enabled;
  previousButton.disabled = !enabled;
  playButton.disabled = !enabled;
  nextButton.disabled = !enabled;
}

function resetProgress() {
  progress.value = "0";
  progress.style.setProperty("--progress", "0%");
  elapsedTime.textContent = "0:00";
  durationTime.textContent = "0:00";
  progress.setAttribute("aria-valuetext", "0:00 of 0:00");
}

function updatePlayButton(isPlaying) {
  playButton.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  playIcon.setAttribute("d", isPlaying ? PAUSE_ICON : PLAY_ICON);
}

function populateSelector() {
  selector.replaceChildren();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a track...";
  selector.append(placeholder);

  const groupedTracks = new Map();
  tracks.forEach((track, index) => {
    const items = groupedTracks.get(track.group) || [];
    items.push({ track, index });
    groupedTracks.set(track.group, items);
  });

  groupedTracks.forEach((items, groupName) => {
    const optionGroup = document.createElement("optgroup");
    optionGroup.label = groupName;

    items.forEach(({ track, index }) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = track.title;
      optionGroup.append(option);
    });

    selector.append(optionGroup);
  });
}

async function playCurrentTrack() {
  if (currentTrackIndex === -1 && tracks.length > 0) {
    loadTrack(0);
  }

  try {
    await audio.play();
  } catch (error) {
    setStatus("Playback was blocked. Press Play to try again.", "error");
    console.error(error);
  }
}

function loadTrack(index, shouldPlay = false) {
  if (index < 0 || index >= tracks.length) {
    return;
  }

  currentTrackIndex = index;
  const track = tracks[index];

  audio.src = track.url;
  audio.load();
  selector.value = String(index);
  title.textContent = track.title;
  title.title = track.title;
  group.textContent = track.group;
  group.title = track.group;
  vibe.textContent = track.group;
  resetProgress();
  progress.disabled = true;
  updatePlayButton(false);
  setStatus(`Selected: ${track.title}`);

  if (shouldPlay) {
    playCurrentTrack();
  }
}

function changeTrack(offset) {
  if (tracks.length === 0) {
    return;
  }

  const wasPlaying = !audio.paused;
  const startingIndex = currentTrackIndex === -1 ? 0 : currentTrackIndex;
  const nextIndex = (startingIndex + offset + tracks.length) % tracks.length;
  loadTrack(nextIndex, wasPlaying);
}

// Called from the Start tracking tap in locationtracker.js.
window.primeAudio = function () {
  if (audioUnlocked || tracks.length === 0) return;

  if (currentTrackIndex === -1) {
    loadTrack(0);
  }

  const attempt = audio.play();
  if (attempt && typeof attempt.then === "function") {
    attempt
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audioUnlocked = true;
      })
      .catch(() => {
        audioUnlocked = false;
      });
  }
};

async function loadLibrary() {
  try {
    const response = await fetch("./tracks.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`tracks.json request failed with ${response.status}`);
    }

    const library = await response.json();
    tracks = library.tracks;

    if (!Array.isArray(tracks) || tracks.length === 0) {
      throw new Error("tracks.json contained no tracks");
    }

    populateSelector();
    setControlsEnabled(true);
    setStatus(`${tracks.length} tracks available`);
  } catch (error) {
    selector.replaceChildren(new Option("Music library unavailable", ""));
    setStatus("Could not read tracks.json. Regenerate it with the tools script and redeploy.", "error");
    console.error(error);
  }
}

function playFolder(folder, sourceLabel) {
  const index = tracks.findIndex((track) => track.group === folder);

  if (index < 0) {
    setRecInfo(`${sourceLabel} chose "${folder}", but no track sits in that folder.`);
    return false;
  }

  setRecInfo(`${sourceLabel}: ${folder}`);
  loadTrack(index, true);
  return true;
}

async function requestRecommendation(area, activity) {
  requestCount += 1;

  const label = requestCount;
  const backup = fallbackFolder(area, activity);
  const sentAt = clockTime();

  setAiDebug([
    `request #${label} at ${sentAt}`,
    `sent area: ${area === null ? "(none)" : area}`,
    `sent activity: ${activity}`,
    "waiting for the function...",
  ]);

  try {
    const response = await fetch(RECOMMEND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area, activity }),
    });

    const bodyText = await response.text();

    if (!response.ok) {
      setAiDebug([
        `request #${label} at ${sentAt}`,
        `sent area: ${area === null ? "(none)" : area}`,
        `sent activity: ${activity}`,
        `FAILED with HTTP ${response.status}`,
        response.status === 404
          ? "the function is not deployed at /.netlify/functions/recommend"
          : bodyText.slice(0, 300),
        `playing local fallback: ${backup}`,
      ]);
      playFolder(backup, `Offline rule (HTTP ${response.status})`);
      return;
    }

    const data = JSON.parse(bodyText);
    const played = playFolder(data.folder, data.source || "AI pick");

    setAiDebug([
      `request #${label} at ${sentAt}`,
      `sent area: ${area === null ? "(none)" : area}`,
      `sent activity: ${activity}`,
      `round trip: ${data.elapsedMs} ms`,
      `model: ${data.model || "(not called)"}`,
      `raw model reply: ${data.raw === null ? "(none)" : JSON.stringify(data.raw)}`,
      `how it was resolved: ${data.detail}`,
      `chosen folder: ${data.folder}`,
      `source: ${data.source}`,
      played ? "a track in that folder was found and started" : "NO TRACK EXISTS IN THAT FOLDER",
    ]);
  } catch (error) {
    console.error(error);
    setAiDebug([
      `request #${label} at ${sentAt}`,
      `sent area: ${area === null ? "(none)" : area}`,
      `sent activity: ${activity}`,
      `network error: ${error.message}`,
      `playing local fallback: ${backup}`,
    ]);
    playFolder(backup, "Offline rule (network error)");
  }
}

selector.addEventListener("change", () => {
  if (selector.value !== "") {
    loadTrack(Number(selector.value), true);
  }
});

playButton.addEventListener("click", () => {
  audioUnlocked = true;
  if (audio.paused) {
    playCurrentTrack();
  } else {
    audio.pause();
  }
});

previousButton.addEventListener("click", () => {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  changeTrack(-1);
});

nextButton.addEventListener("click", () => changeTrack(1));

progress.addEventListener("input", () => {
  if (Number.isFinite(audio.duration)) {
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  }
});

audio.addEventListener("loadedmetadata", () => {
  progress.disabled = false;
  durationTime.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  const percent = Number.isFinite(audio.duration) && audio.duration > 0
    ? (audio.currentTime / audio.duration) * 100
    : 0;

  progress.value = String(percent);
  progress.style.setProperty("--progress", `${percent}%`);
  elapsedTime.textContent = formatTime(audio.currentTime);
  durationTime.textContent = formatTime(audio.duration);
  progress.setAttribute(
    "aria-valuetext",
    `${formatTime(audio.currentTime)} of ${formatTime(audio.duration)}`,
  );
});

audio.addEventListener("play", () => {
  updatePlayButton(true);
  if (currentTrackIndex !== -1) {
    setStatus(`Playing: ${tracks[currentTrackIndex].title}`);
  }
});

audio.addEventListener("pause", () => {
  updatePlayButton(false);
  if (!audio.ended && currentTrackIndex !== -1) {
    setStatus(`Paused: ${tracks[currentTrackIndex].title}`);
  }
});

audio.addEventListener("ended", () => {
  const nextIndex = (currentTrackIndex + 1) % tracks.length;
  loadTrack(nextIndex, true);
});

audio.addEventListener("error", () => {
  if (audio.currentSrc) {
    setStatus("This track could not be played by the browser.", "error");
  }
});

loadLibrary();

window.addEventListener("areaChanged", () => {
  const context = window.getCurrentContext();
  console.log("Context changed:", context);
  requestRecommendation(context.area, context.activity);
});