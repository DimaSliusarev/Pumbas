"use strict";

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");

const ROOT_DIRECTORY = __dirname;
const MUSIC_DIRECTORY = path.join(ROOT_DIRECTORY, "usa-1");
const PORT = Number(process.env.PORT) || 8080;
const SUPPORTED_EXTENSIONS = new Set([".mp3", ".m4a", ".aac", ".ogg", ".wav", ".flac", ".mp4"]);

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".ogg": "audio/ogg",
  ".wav": "audio/wav",
  ".flac": "audio/flac",
  ".mp4": "video/mp4",
};

async function scanMusicDirectory(directory = MUSIC_DIRECTORY) {
  const entries = await fs.promises.readdir(directory, { withFileTypes: true });
  const tracks = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      tracks.push(...await scanMusicDirectory(fullPath));
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!entry.isFile() || !SUPPORTED_EXTENSIONS.has(extension)) {
      continue;
    }

    const relativePath = path.relative(ROOT_DIRECTORY, fullPath);
    const musicRelativePath = path.relative(MUSIC_DIRECTORY, fullPath);
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
  return tracks.sort((first, second) => {
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

function sendJson(response, statusCode, data) {
  const body = JSON.stringify(data);
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
  });
  response.end(body);
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(message),
  });
  response.end(message);
}

function isAllowedStaticPath(relativePath) {
  const appFiles = new Set(["musicplayer.html", "styles.css", "musicplayer.js"]);
  return appFiles.has(relativePath) || relativePath.startsWith(`usa-1${path.sep}`);
}

function streamFile(request, response, filePath, stats) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[extension] || "application/octet-stream";
  const range = request.headers.range;

  if (range) {
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      response.writeHead(416, { "Content-Range": `bytes */${stats.size}` });
      response.end();
      return;
    }

    const start = match[1] === "" ? 0 : Number(match[1]);
    const end = match[2] === "" ? stats.size - 1 : Number(match[2]);

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || start > end || end >= stats.size) {
      response.writeHead(416, { "Content-Range": `bytes */${stats.size}` });
      response.end();
      return;
    }

    response.writeHead(206, {
      "Accept-Ranges": "bytes",
      "Content-Type": contentType,
      "Content-Length": end - start + 1,
      "Content-Range": `bytes ${start}-${end}/${stats.size}`,
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    fs.createReadStream(filePath, { start, end }).pipe(response);
    return;
  }

  response.writeHead(200, {
    "Accept-Ranges": "bytes",
    "Content-Type": contentType,
    "Content-Length": stats.size,
  });

  if (request.method === "HEAD") {
    response.end();
    return;
  }

  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendText(response, 405, "Method not allowed");
    return;
  }

  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (requestUrl.pathname === "/api/tracks") {
    try {
      const tracks = sortTracks(await scanMusicDirectory());
      sendJson(response, 200, { tracks });
    } catch (error) {
      console.error("Could not scan the music directory:", error);
      sendJson(response, 500, { error: "Could not scan the music directory" });
    }
    return;
  }

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(requestUrl.pathname);
  } catch {
    sendText(response, 400, "Invalid URL");
    return;
  }

  const requestedPath = decodedPath === "/" ? "musicplayer.html" : decodedPath.replace(/^\/+/, "");
  const filePath = path.resolve(ROOT_DIRECTORY, requestedPath);
  const relativePath = path.relative(ROOT_DIRECTORY, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath) || !isAllowedStaticPath(relativePath)) {
    sendText(response, 404, "Not found");
    return;
  }

  try {
    const stats = await fs.promises.stat(filePath);
    if (!stats.isFile()) {
      sendText(response, 404, "Not found");
      return;
    }

    streamFile(request, response, filePath, stats);
  } catch (error) {
    if (error.code === "ENOENT") {
      sendText(response, 404, "Not found");
      return;
    }

    console.error("Could not serve a file:", error);
    sendText(response, 500, "Server error");
  }
});

server.listen(PORT, () => {
  console.log(`Pumbas music player: http://localhost:${PORT}`);
  console.log("Reload the page after adding music to usa-1.");
});
