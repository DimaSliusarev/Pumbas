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

const PLAY_ICON = "M8 5v14l11-7z";
const PAUSE_ICON = "M6 5h4v14H6zm8 0h4v14h-4z";

let tracks = [];
let currentTrackIndex = -1;

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

async function loadLibrary() {
  try {
    const response = await fetch("./api/tracks", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Music library request failed with ${response.status}`);
    }

    const library = await response.json();
    tracks = library.tracks;

    if (!Array.isArray(tracks) || tracks.length === 0) {
      throw new Error("No supported music files were found in usa-1");
    }

    populateSelector();
    setControlsEnabled(true);
    setStatus(`${tracks.length} tracks available`);
  } catch (error) {
    selector.replaceChildren(new Option("Music library unavailable", ""));
    setStatus("Could not scan usa-1. Start this page with npm start from the musicplayer folder.", "error");
    console.error(error);
  }
}

selector.addEventListener("change", () => {
  if (selector.value !== "") {
    loadTrack(Number(selector.value), true);
  }
});

playButton.addEventListener("click", () => {
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
  setStatus(`Playing: ${tracks[currentTrackIndex].title}`);
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
