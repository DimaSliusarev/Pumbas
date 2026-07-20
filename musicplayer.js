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
const libraryDebug = document.querySelector("#libraryDebug");
const queueInfo = document.querySelector("#queueInfo");

const PLAY_ICON = "M8 5v14l11-7z";
const PAUSE_ICON = "M6 5h4v14H6zm8 0h4v14h-4z";

const RECOMMEND_ENDPOINT = "/.netlify/functions/recommend";
const FADE_MS = 900;

let tracks = [];
let currentTrackIndex = -1;
let audioUnlocked = false;
let requestCount = 0;

// The playback queue, built from the three folders the model ranks.
let queueFolders = [];
let queue = [];
let queuePos = -1;

// Campus mapping. This is the client-side fallback and must stay identical
// to the copy inside netlify/functions/recommend.js.
const AREA_TO_BASE = {
  "H Village Vibe": "H Village Vibe",
  "Gym": "Exercise",
  "Media": "Library Music",
  "Bus1": "Bus Waiting",
  "Bus2": "Bus Waiting",
  "Subwway": "Cafeteria",
  "Sigma": "Cafeteria",
  "AlphaOmega": "SFC Office",
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
  "SBC": "H Village Vibe",
  "TauDelta": "Research (Delta)",
  "Pond": "Komoike",
};

const ALLOWED_FOLDERS = [
  "Bus Waiting",
  "Cafeteria",
  "Classroom/Resting",
  "Classroom/Running",
  "Classroom/Walking",
  "Exercise/Gym",
  "Exercise/Resting",
  "Exercise/Running",
  "Exercise/Walking",
  "General/Resting",
  "General/Resting(Night)",
  "General/Running",
  "General/Walking",
  "General/Walking(Night)",
  "H Village Vibe",
  "Komoike",
  "Library Music",
  "Research (Delta)",
  "SFC Office",
];

function ruleFolder(base, activity, night) {
  if (base === "Classroom") {
    if (activity === "walking") return "Classroom/Walking";
    if (activity === "running") return "Classroom/Running";
    return "Classroom/Resting";
  }

  if (base === "Exercise") {
    if (activity === "walking") return "Exercise/Walking";
    if (activity === "running") return "Exercise/Running";
    if (activity === "exercise") return "Exercise/Gym";
    return "Exercise/Resting";
  }

  if (base === "General") {
    if (activity === "running") return "General/Running";
    if (activity === "walking") return night ? "General/Walking(Night)" : "General/Walking";
    if (activity === "exercise") return "General/Running";
    return night ? "General/Resting(Night)" : "General/Resting";
  }

  return ALLOWED_FOLDERS.includes(base) ? base : null;
}

function variantsOf(base, night) {
  if (base === "Classroom") {
    return ["Classroom/Resting", "Classroom/Walking", "Classroom/Running"];
  }
  if (base === "Exercise") {
    return ["Exercise/Gym", "Exercise/Running", "Exercise/Walking", "Exercise/Resting"];
  }
  if (base === "General") {
    return night
      ? ["General/Resting(Night)", "General/Walking(Night)", "General/Running"]
      : ["General/Resting", "General/Walking", "General/Running"];
  }
  return [base];
}

// The last-resort ranking used when the network request itself fails.
function fallbackRanking(area, activity, night) {
  const base = AREA_TO_BASE[area] || "General";
  const list = [];

  const push = (folder) => {
    if (folder && ALLOWED_FOLDERS.includes(folder) && !list.includes(folder)) {
      list.push(folder);
    }
  };

  push(ruleFolder(base, activity, night));
  variantsOf(base, night).forEach(push);
  push("Library Music");
  push("Cafeteria");
  variantsOf("General", night).forEach(push);

  return list.slice(0, 3);
}


// ---------------------------------------------------------------------------
// Folder matching.
//
// Two separate things used to break this, and both are handled here.
//
// 1. Depth. track.group is the full path under usa-1, so a song stored at
//    usa-1/General/Walking/Chill/song.mp3 has the group "General/Walking/Chill".
//    A track therefore belongs to a folder if its group IS that folder or sits
//    anywhere beneath it. The slash boundary is what stops "General/Resting"
//    from also swallowing "General/Resting (Night)".
//
// 2. Spacing. The library on disk uses "General/Walking (Night)" with a space,
//    while the allowed list spells it "General/Walking(Night)". Comparing those
//    character by character failed, the folder looked empty, and it was dropped
//    from the ranked list. Both sides are now stripped of all whitespace before
//    comparing, so spacing and capitalisation no longer matter. None of the
//    nineteen allowed names collide once whitespace is removed, so this cannot
//    cause a false match.
// ---------------------------------------------------------------------------

function normalizeFolderKey(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, "");
}

function tracksInFolder(folder) {
  const target = normalizeFolderKey(folder);
  if (target === "") return [];
  const prefix = target + "/";
  const indices = [];

  tracks.forEach((track, index) => {
    const g = normalizeFolderKey(track.group);
    if (g === target || g.startsWith(prefix)) indices.push(index);
  });

  return indices;
}

// Startup diagnostic. Tells you immediately which of the nineteen folders can
// actually be chosen, which are empty, and where the real folder name on disk
// differs from the name the app uses.
function reportLibrary() {
  if (!libraryDebug) return;

  if (tracks.length === 0) {
    libraryDebug.textContent = "No tracks loaded.";
    return;
  }

  const reachable = new Set();
  const lines = [];
  let emptyCount = 0;
  let renamedCount = 0;

  ALLOWED_FOLDERS.forEach((folder) => {
    const indices = tracksInFolder(folder);
    indices.forEach((i) => reachable.add(i));
    const count = String(indices.length).padStart(3, " ");

    if (indices.length === 0) {
      emptyCount += 1;
      lines.push(`${count}  ${folder}   <-- EMPTY, can never be chosen`);
      return;
    }

    // Show the real names on disk when they are spelled differently.
    const actual = [];
    indices.forEach((i) => {
      const g = tracks[i].group;
      if (!actual.includes(g)) actual.push(g);
    });

    const exact = actual.length === 1 && actual[0] === folder;
    if (exact) {
      lines.push(`${count}  ${folder}`);
    } else {
      renamedCount += 1;
      lines.push(`${count}  ${folder}   [on disk: ${actual.sort().join(" , ")}]`);
    }
  });

  const orphanGroups = [];
  tracks.forEach((track, index) => {
    if (!reachable.has(index) && !orphanGroups.includes(track.group)) {
      orphanGroups.push(track.group);
    }
  });

  const header = [
    `${tracks.length} tracks loaded, ${reachable.size} reachable by the 19 allowed folders`,
    emptyCount === 0
      ? "every allowed folder has at least one track"
      : `${emptyCount} allowed folder(s) are empty`,
    renamedCount === 0
      ? "every folder name matches exactly"
      : `${renamedCount} folder(s) matched by ignoring spacing or depth`,
    "",
  ];

  const footerLines = [""];
  if (orphanGroups.length === 0) {
    footerLines.push("no unreachable track folders");
  } else {
    footerLines.push("UNREACHABLE track folders (no allowed folder covers these):");
    orphanGroups.sort().forEach((g) => footerLines.push("   " + g));
  }

  libraryDebug.textContent = header.concat(lines).concat(footerLines).join("\n");
}


// Audio graph. iOS Safari ignores the volume property of an audio element,
// so fading has to go through a Web Audio gain node instead. If Web Audio is
// unavailable we quietly fall back to stepping volume, which works elsewhere.

let audioCtx = null;
let gainNode = null;
let mediaSource = null;
let webAudioReady = false;
let audioGraphTried = false;

function setupAudioGraph() {
  if (audioGraphTried) return;
  audioGraphTried = true;

  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;

  try {
    audioCtx = new Ctx();
    mediaSource = audioCtx.createMediaElementSource(audio);
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 1;
    mediaSource.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    webAudioReady = true;
  } catch (error) {
    console.error("Web Audio unavailable, falling back to element volume:", error);
    audioCtx = null;
    gainNode = null;
    webAudioReady = false;
  }
}

function resumeAudioContext() {
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
}

function setGainNow(value) {
  const clamped = Math.max(0, Math.min(1, value));

  if (webAudioReady && gainNode && audioCtx) {
    const t = audioCtx.currentTime;
    gainNode.gain.cancelScheduledValues(t);
    gainNode.gain.setValueAtTime(Math.max(clamped, 0.0001), t);
    return;
  }

  try {
    audio.volume = clamped;
  } catch (error) {
    // Some browsers refuse this. Nothing useful to do about it.
  }
}

function rampGain(target, ms) {
  return new Promise((resolve) => {
    if (webAudioReady && gainNode && audioCtx) {
      const t = audioCtx.currentTime;
      const current = gainNode.gain.value;
      gainNode.gain.cancelScheduledValues(t);
      gainNode.gain.setValueAtTime(Math.max(current, 0.0001), t);
      gainNode.gain.linearRampToValueAtTime(Math.max(target, 0.0001), t + ms / 1000);
      setTimeout(resolve, ms + 60);
      return;
    }

    const steps = 20;
    let start = 1;
    try {
      start = audio.volume;
    } catch (error) {
      start = 1;
    }
    const delta = (target - start) / steps;
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      try {
        audio.volume = Math.max(0, Math.min(1, start + delta * step));
      } catch (error) {
        // ignore
      }
      if (step >= steps) {
        clearInterval(timer);
        resolve();
      }
    }, Math.max(10, ms / steps));
  });
}


function shuffled(values) {
  const copy = values.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = copy[i];
    copy[i] = copy[j];
    copy[j] = swap;
  }
  return copy;
}

// Build one queue from the already-resolved folders, shuffling inside each
// folder and never letting the same track appear twice.
function buildQueue(resolved) {
  const indices = [];
  const seen = new Set();

  resolved.forEach((entry) => {
    shuffled(entry.indices).forEach((index) => {
      if (!seen.has(index)) {
        seen.add(index);
        indices.push(index);
      }
    });
  });

  return indices;
}

function updateQueueInfo() {
  if (!queueInfo) return;

  if (queue.length === 0) {
    queueInfo.textContent = "Queue is empty.";
    return;
  }

  queueInfo.textContent =
    `Queue: ${queueFolders.join(" → ")} · track ${queuePos + 1} of ${queue.length}`;
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

  resumeAudioContext();

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
  updateQueueInfo();

  if (shouldPlay) {
    playCurrentTrack();
  }
}

// Move to a position in the queue, fading out the old track if one is playing
// and always fading the new one in.
async function playQueuePos(position, fadeOutFirst) {
  if (position < 0 || position >= queue.length) return;

  if (fadeOutFirst && !audio.paused) {
    await rampGain(0, FADE_MS);
  }

  queuePos = position;
  loadTrack(queue[position]);
  setGainNow(0);
  await playCurrentTrack();
  await rampGain(1, FADE_MS);
  updateQueueInfo();
}

function changeTrack(offset) {
  if (queue.length > 0) {
    const next = (queuePos + offset + queue.length) % queue.length;
    playQueuePos(next, true);
    return;
  }

  if (tracks.length === 0) return;

  const wasPlaying = !audio.paused;
  const startingIndex = currentTrackIndex === -1 ? 0 : currentTrackIndex;
  const nextIndex = (startingIndex + offset + tracks.length) % tracks.length;
  loadTrack(nextIndex, wasPlaying);
}

// Called from the Start tracking tap in locationtracker.js. This is the only
// moment iOS will let us build the Web Audio graph and unlock playback.
window.primeAudio = function () {
  setupAudioGraph();
  resumeAudioContext();

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
    reportLibrary();
  } catch (error) {
    selector.replaceChildren(new Option("Music library unavailable", ""));
    setStatus("Could not read tracks.json. Regenerate it with the tools script and redeploy.", "error");
    if (libraryDebug) libraryDebug.textContent = "tracks.json could not be read: " + error.message;
    console.error(error);
  }
}

// Apply a ranked list of folders. If the top folder that actually has music is
// the one already playing, the music is left alone and only the queue behind
// it is rebuilt, so the same song is never restarted.
async function applyRecommendation(folders, sourceLabel) {
  const resolved = [];
  const emptyFolders = [];

  folders.forEach((folder) => {
    const indices = tracksInFolder(folder);
    if (indices.length > 0) {
      resolved.push({ folder, indices });
    } else {
      emptyFolders.push(folder);
    }
  });

  if (resolved.length === 0) {
    setRecInfo(`${sourceLabel} chose ${folders.join(", ")}, but none of those folders contain tracks.`);
    return { applied: false, kept: false, playable: [], emptyFolders };
  }

  const playable = resolved.map((entry) => entry.folder);
  const sameTopFolder = queueFolders.length > 0 && queueFolders[0] === playable[0];
  const stillPlaying = currentTrackIndex !== -1 && !audio.paused;

  queueFolders = playable;
  queue = buildQueue(resolved);

  if (sameTopFolder && stillPlaying) {
    const position = queue.indexOf(currentTrackIndex);
    if (position >= 0) {
      queuePos = position;
    } else {
      queue.unshift(currentTrackIndex);
      queuePos = 0;
    }
    setRecInfo(`${sourceLabel}: ${playable.join(" → ")} (same folder, kept playing)`);
    updateQueueInfo();
    return { applied: true, kept: true, playable, emptyFolders };
  }

  setRecInfo(`${sourceLabel}: ${playable.join(" → ")}`);
  await playQueuePos(0, true);
  return { applied: true, kept: false, playable, emptyFolders };
}

async function requestRecommendation(context) {
  requestCount += 1;

  const label = requestCount;
  const area = context.area;
  const activity = context.activity;
  const time = context.time || {};
  const backup = fallbackRanking(area, activity, time.isNight === true);
  const sentAt = clockTime();

  const header = [
    `request #${label} at ${sentAt}`,
    `sent area: ${area === null ? "(none)" : area}`,
    `sent activity: ${activity}`,
    `sent time: ${time.weekday || "?"} ${time.local || "?"} (${time.band || "?"}, night=${time.isNight === true})`,
  ];

  setAiDebug(header.concat(["waiting for the function..."]));

  try {
    const response = await fetch(RECOMMEND_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ area, activity, time }),
    });

    const bodyText = await response.text();

    if (!response.ok) {
      const outcome = await applyRecommendation(backup, `Offline rule (HTTP ${response.status})`);
      setAiDebug(header.concat([
        `FAILED with HTTP ${response.status}`,
        response.status === 404
          ? "the function is not deployed at /.netlify/functions/recommend"
          : bodyText.slice(0, 300),
        `local fallback: ${backup.join(" → ")}`,
        outcome.emptyFolders.length
          ? `dropped as empty: ${outcome.emptyFolders.join(", ")}`
          : "no folder was dropped as empty",
      ]));
      return;
    }

    const data = JSON.parse(bodyText);
    const folders = Array.isArray(data.folders) && data.folders.length > 0 ? data.folders : backup;
    const outcome = await applyRecommendation(folders, data.source || "AI pick");

    setAiDebug(header.concat([
      `round trip: ${data.elapsedMs} ms`,
      `model: ${data.model || "(not called)"}`,
      `raw model reply: ${data.raw === null || data.raw === undefined ? "(none)" : JSON.stringify(data.raw)}`,
      `how it was resolved: ${data.detail}`,
      `ranked folders requested: ${folders.join(" → ")}`,
      outcome.emptyFolders.length
        ? `DROPPED, contain no tracks: ${outcome.emptyFolders.join(", ")}`
        : "no folder was dropped as empty",
      `folders actually used: ${outcome.playable.length ? outcome.playable.join(" → ") : "(none)"}`,
      `source: ${data.source}`,
      `web audio fading: ${webAudioReady ? "on" : "off, using element volume"}`,
      outcome.kept
        ? "same top folder, the current song was left alone"
        : (outcome.applied
            ? `queue rebuilt with ${queue.length} shuffled tracks, faded into the first one`
            : "NO TRACK EXISTS IN ANY OF THOSE FOLDERS"),
    ]));
  } catch (error) {
    console.error(error);
    const outcome = await applyRecommendation(backup, "Offline rule (network error)");
    setAiDebug(header.concat([
      `network error: ${error.message}`,
      `local fallback: ${backup.join(" → ")}`,
      outcome.emptyFolders.length
        ? `dropped as empty: ${outcome.emptyFolders.join(", ")}`
        : "no folder was dropped as empty",
    ]));
  }
}


selector.addEventListener("change", () => {
  if (selector.value !== "") {
    // A manual pick abandons the queue until the next recommendation.
    queue = [];
    queueFolders = [];
    queuePos = -1;
    setGainNow(1);
    loadTrack(Number(selector.value), true);
  }
});

playButton.addEventListener("click", () => {
  audioUnlocked = true;
  setupAudioGraph();
  resumeAudioContext();

  if (audio.paused) {
    setGainNow(1);
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

// When a song ends we walk the queue, which keeps us inside the three ranked
// folders instead of wandering into unrelated music.
audio.addEventListener("ended", () => {
  if (queue.length > 0) {
    const next = (queuePos + 1) % queue.length;
    playQueuePos(next, false);
    return;
  }

  if (tracks.length === 0) return;
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
  requestRecommendation(context);
});