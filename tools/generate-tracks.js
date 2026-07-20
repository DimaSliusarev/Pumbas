"use strict";

// Run this from the project root with:  node tools/generate-tracks.js
// It scans usa-1 and writes tracks.json, which replaces the old /api/tracks endpoint.

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");
const MUSIC_DIRECTORY = path.join(ROOT, "usa-1");
const OUTPUT_FILE = path.join(ROOT, "tracks.json");

const SUPPORTED_EXTENSIONS = new Set([
  ".mp3",
  ".m4a",
  ".aac",
  ".ogg",
  ".wav",
  ".flac",
  ".mp4",
]);

function scan(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  let tracks = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      tracks = tracks.concat(scan(fullPath));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!entry.isFile() || !SUPPORTED_EXTENSIONS.has(extension)) {
      continue;
    }

    const relative = path.relative(MUSIC_DIRECTORY, fullPath).split(path.sep);
    const folder = relative.slice(0, -1).join("/");

    tracks.push({
      title: path.basename(entry.name, extension),
      group: folder === "" ? "Uncategorized" : folder,
      url: "./usa-1/" + relative.map(encodeURIComponent).join("/"),
    });
  }

  return tracks;
}

function main() {
  if (!fs.existsSync(MUSIC_DIRECTORY)) {
    console.error("Could not find the usa-1 folder at " + MUSIC_DIRECTORY);
    process.exit(1);
  }

  const tracks = scan(MUSIC_DIRECTORY).sort((first, second) => {
    if (first.group === second.group) {
      return first.title.localeCompare(second.title, undefined, { numeric: true });
    }
    return first.group.localeCompare(second.group, undefined, { numeric: true });
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ tracks }, null, 2), "utf8");

  const folders = [...new Set(tracks.map((track) => track.group))].sort();

  console.log(`Wrote ${tracks.length} tracks to tracks.json`);
  console.log("Folders found:");
  folders.forEach((folder) => console.log("  - " + folder));
}

main();
