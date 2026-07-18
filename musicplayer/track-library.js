"use strict";

const fs = require("node:fs");
const path = require("node:path");

const SUPPORTED_EXTENSIONS = new Set([".mp3", ".m4a", ".aac", ".ogg", ".wav", ".flac", ".mp4"]);

async function scanMusicDirectory(rootDirectory, musicDirectory, directory = musicDirectory) {
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });
  const tracks = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      tracks.push(...await scanMusicDirectory(rootDirectory, musicDirectory, fullPath));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!entry.isFile() || !SUPPORTED_EXTENSIONS.has(extension)) {
      continue;
    }

    const relativePath = path.relative(rootDirectory, fullPath);
    const musicRelativePath = path.relative(musicDirectory, fullPath);
    const folder = path.dirname(musicRelativePath);

    tracks.push({
      id: relativePath.split(path.sep).join("/"),
      title: path.basename(entry.name, extension),
      group: folder === "." ? "Uncategorized" : folder.split(path.sep).join(" / "),
      url: `./${relativePath.split(path.sep).map(encodeURIComponent).join("/")}`,
    });
  }

  return tracks;
}

function sortTracks(tracks) {
  return [...tracks].sort((first, second) => {
    const groupComparison = first.group.localeCompare(second.group, undefined, {
      numeric: true,
      sensitivity: "base",
    });

    return groupComparison || first.title.localeCompare(second.title, undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
}

module.exports = {
  scanMusicDirectory,
  sortTracks,
  SUPPORTED_EXTENSIONS,
};
