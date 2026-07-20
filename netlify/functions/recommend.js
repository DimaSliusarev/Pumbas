"use strict";

// Netlify serverless function.
// No npm packages are used, because a drag-and-drop deploy has no build step
// and therefore cannot install dependencies. The OpenAI REST API is called
// directly with the fetch that is built into the Node runtime.
//
// This version returns THREE ranked folders rather than one, so the player can
// build a queue and move to the next most sensible folder when one runs out.

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
  "General/Resting (Night)",
  "General/Running",
  "General/Walking",
  "General/Walking (Night)",
  "H Village Vibe",
  "Komoike",
  "Library Music",
  "Research (Delta)",
  "SFC Office",
];

// Corrected campus mapping. Must stay identical to the copy in musicplayer.js.
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

  return ALLOWED_FOLDERS.indexOf(base) >= 0 ? base : null;
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

// The rule-based ranking, used when the model is unavailable and also to top
// up the list when the model returns fewer than three usable folders.
function ruleRanking(area, activity, night) {
  const base = AREA_TO_BASE[area] || "General";
  const list = [];

  const push = (folder) => {
    if (folder && ALLOWED_FOLDERS.indexOf(folder) >= 0 && list.indexOf(folder) < 0) {
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

// Turn one line of model output into a real folder name if we possibly can.
function normaliseLine(rawInput, activity, night) {
  const raw = String(rawInput || "")
    .trim()
    .replace(/^\s*\d+\s*[.)]\s*/, "")
    .replace(/^\s*[-*•]\s*/, "")
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[.!]+$/g, "")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
    .trim();

  if (raw === "") return null;

  const exact = ALLOWED_FOLDERS.find(
    (candidate) => candidate.toLowerCase() === raw.toLowerCase(),
  );
  if (exact) return exact;

  const base = ["Classroom", "Exercise", "General"].find(
    (candidate) => candidate.toLowerCase() === raw.toLowerCase(),
  );
  if (base) {
    const expanded = ruleFolder(base, activity, night);
    if (expanded) return expanded;
  }

  const contained = ALLOWED_FOLDERS.find(
    (candidate) => raw.toLowerCase().indexOf(candidate.toLowerCase()) >= 0,
  );
  if (contained) return contained;

  return null;
}

function describeTime(time) {
  if (!time || typeof time.hour !== "number") {
    return "The current local time is unknown.";
  }

  return [
    `Local time on the listener's phone: ${time.weekday || "unknown day"} ${time.local || ""}.`,
    `Time of day band: ${time.band || "unknown"}.`,
    `Is it night time: ${time.isNight === true ? "yes" : "no"}.`,
    `Is it a weekend: ${time.weekend === true ? "yes" : "no"}.`,
  ].join("\n");
}

function buildPrompt(area, activity, time) {
  return `
You are selecting music for a university student walking around Keio SFC campus.

Current campus location:
${area || "unknown"}

Current detected activity:
${activity || "unknown"}

${describeTime(time)}

The campus locations map to these music folder groups:

H Village Vibe -> H Village Vibe
Gym -> Exercise
Media -> Library Music
Bus1 -> Bus Waiting
Bus2 -> Bus Waiting
Subwway -> Cafeteria
Sigma -> Cafeteria
AlphaOmega -> SFC Office
Cabins -> General
Tennis -> Exercise
Kappa1 -> Classroom
Kappa2 -> Classroom
Epsilon1 -> Classroom
Epsilon2 -> Classroom
Iota1 -> Classroom
Iota2 -> Classroom
Omnicron -> Classroom
Omnicron2 -> Classroom
Lambda -> Classroom
Theta -> Classroom
Shrine -> General
SBC -> H Village Vibe
TauDelta -> Research (Delta)
Pond -> Komoike

The ONLY valid answers are these exact strings:

${ALLOWED_FOLDERS.map((folder) => "- " + folder).join("\n")}

Note that "Classroom", "Exercise" and "General" are NOT valid answers on their own.
They are groups, and you must give the full name including the part after the slash.

Rules:
- Activity resting means prefer a Resting folder.
- Activity walking means prefer a Walking folder.
- Activity running means prefer a Running folder.
- Activity exercise at the Gym means Exercise/Gym.
- When it is night time, prefer the (Night) variants where they exist.
- If the location is unknown or unmapped, use a General folder matching the activity.
- Bus Waiting, Cafeteria, Komoike, SFC Office, Library Music, Research (Delta) and
  H Village Vibe have no activity variants, so use them exactly as written.

Give a RANKED list of exactly THREE different folders. The first is the best fit for
the location, the activity and the time of day. The second and third are what should
play next once the first folder has been exhausted, so they should still make sense
for where the listener is and when it is.

Reply with exactly three lines. Each line contains only one exact folder string.
No numbering, no quotes, no full stops, no explanation.
`;
}

exports.handler = async function (event) {
  const started = Date.now();

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Use POST" }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  let area = null;
  let activity = null;
  let time = null;

  try {
    const payload = JSON.parse(event.body || "{}");
    area = payload.area;
    activity = payload.activity;
    time = payload.time || null;
  } catch (error) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Body was not valid JSON" }),
    };
  }

  const night = time && time.isNight === true;
  const backup = ruleRanking(area, activity, night);

  // Always answer with something playable, and describe how we got there,
  // so the phone can show the real story instead of a bare failure.
  function reply(extra) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        Object.assign(
          {
            area: area || null,
            activity: activity || null,
            night: night,
            elapsedMs: Date.now() - started,
          },
          extra,
        ),
      ),
    };
  }

  if (!apiKey) {
    return reply({
      folders: backup,
      folder: backup[0],
      source: "server rule",
      raw: null,
      detail: "OPENAI_API_KEY is not set on this site",
    });
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0,
        max_tokens: 60,
        messages: [{ role: "user", content: buildPrompt(area, activity, time) }],
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      const detail = await response.text();
      console.error("OpenAI error:", response.status, detail);
      return reply({
        folders: backup,
        folder: backup[0],
        source: "server rule",
        raw: null,
        detail: `OpenAI returned HTTP ${response.status}: ${detail.slice(0, 200)}`,
      });
    }

    const data = await response.json();
    const raw =
      data &&
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      typeof data.choices[0].message.content === "string"
        ? data.choices[0].message.content
        : "";

    const parsed = [];
    raw.split("\n").forEach((line) => {
      const folder = normaliseLine(line, activity, night);
      if (folder && parsed.indexOf(folder) < 0) parsed.push(folder);
    });

    const accepted = parsed.length;

    // Top the list up from the rule ranking if the model gave us fewer than three.
    backup.forEach((folder) => {
      if (parsed.length < 3 && parsed.indexOf(folder) < 0) parsed.push(folder);
    });

    if (parsed.length === 0) {
      console.error("Unusable model reply:", JSON.stringify(raw));
      return reply({
        folders: backup,
        folder: backup[0],
        source: "server rule",
        raw: raw,
        detail: "no line of the model reply matched an allowed folder",
      });
    }

    const folders = parsed.slice(0, 3);

    return reply({
      folders: folders,
      folder: folders[0],
      source: accepted > 0 ? "AI pick" : "server rule",
      raw: raw,
      detail: `model gave ${accepted} usable folder(s), list topped up to ${folders.length}`,
      model: data.model || "gpt-4.1-mini",
    });
  } catch (error) {
    const aborted = error && error.name === "AbortError";
    console.error(error);
    return reply({
      folders: backup,
      folder: backup[0],
      source: "server rule",
      raw: null,
      detail: aborted ? "OpenAI did not answer within 8 seconds" : String(error.message || error),
    });
  }
};