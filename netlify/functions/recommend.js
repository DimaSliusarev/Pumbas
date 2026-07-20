"use strict";

// Netlify serverless function.
// No npm packages are used, because a drag-and-drop deploy has no build step
// and therefore cannot install dependencies. The OpenAI REST API is called
// directly with the fetch that is built into the Node runtime.

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
  // Netlify runs in UTC, so shift to Japan Standard Time before reading the hour.
  const hour = (new Date().getUTCHours() + 9) % 24;
  return hour >= 19 || hour < 5;
}

// The rule the server uses when the model gives us something unusable,
// and also the rule used to expand a bare base name such as "Classroom".
function ruleFolder(base, activity) {
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
    if (activity === "walking") return isNight() ? "General/Walking(Night)" : "General/Walking";
    if (activity === "exercise") return "General/Running";
    return isNight() ? "General/Resting(Night)" : "General/Resting";
  }

  if (ALLOWED_FOLDERS.indexOf(base) >= 0) return base;

  return null;
}

function fallbackFolder(area, activity) {
  const base = AREA_TO_BASE[area] || "General";
  return ruleFolder(base, activity) || "General/Resting";
}

// Turn whatever the model said into a real folder name if we possibly can.
// Returns { folder, how } where how explains what repair was needed.
function normalise(rawInput, activity) {
  const raw = String(rawInput || "")
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[.!]+$/g, "")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s+/g, " ")
    .trim();

  if (raw === "") return { folder: null, how: "empty reply" };

  // Exact match, ignoring case only.
  const exact = ALLOWED_FOLDERS.find(
    (candidate) => candidate.toLowerCase() === raw.toLowerCase(),
  );
  if (exact) return { folder: exact, how: "exact match" };

  // The model gave a bare base such as "Classroom", "Exercise" or "General".
  const base = ["Classroom", "Exercise", "General"].find(
    (candidate) => candidate.toLowerCase() === raw.toLowerCase(),
  );
  if (base) {
    const expanded = ruleFolder(base, activity);
    if (expanded) return { folder: expanded, how: `expanded "${raw}" using activity` };
  }

  // The model wrote something like "Exercise / Gym" or "the Komoike folder".
  const contained = ALLOWED_FOLDERS.find(
    (candidate) => raw.toLowerCase().indexOf(candidate.toLowerCase()) >= 0,
  );
  if (contained) return { folder: contained, how: "found folder inside a longer reply" };

  return { folder: null, how: "no usable folder in reply" };
}

function buildPrompt(area, activity) {
  return `
You are selecting music for a university student.

Current campus location:
${area || "unknown"}

Current activity:
${activity || "unknown"}

The campus locations correspond to music folder groups as follows:

H Village Vibe -> H Village Vibe
Gym -> Exercise
Media -> Research (Delta)
Bus1 -> Bus Waiting
Bus2 -> Bus Waiting
Subwway -> General
Sigma -> Research (Delta)
AlphaOmega -> Classroom
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
SBC -> SFC Office
TauDelta -> Classroom
Pond -> Komoike

The ONLY valid answers are these exact strings:

${ALLOWED_FOLDERS.map((folder) => "- " + folder).join("\n")}

Note that "Classroom", "Exercise" and "General" are NOT valid answers on their own.
They are groups, and you must choose the full name including the part after the slash,
based on the activity.

Rules:
- Activity resting means choose a Resting folder.
- Activity walking means choose a Walking folder.
- Activity running means choose a Running folder.
- Activity exercise in the Gym means Exercise/Gym.
- If the location is unknown or unmapped, choose a General folder matching the activity.
- Bus Waiting, Komoike, SFC Office, Research (Delta) and H Village Vibe have no
  activity variants, so use them exactly as written.

Reply with ONE line containing ONLY the exact folder string. No quotes, no full stop,
no explanation.
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

  try {
    const payload = JSON.parse(event.body || "{}");
    area = payload.area;
    activity = payload.activity;
  } catch (error) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Body was not valid JSON" }),
    };
  }

  const backup = fallbackFolder(area, activity);

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
            elapsedMs: Date.now() - started,
          },
          extra,
        ),
      ),
    };
  }

  if (!apiKey) {
    return reply({
      folder: backup,
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
        max_tokens: 20,
        messages: [{ role: "user", content: buildPrompt(area, activity) }],
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      const detail = await response.text();
      console.error("OpenAI error:", response.status, detail);
      return reply({
        folder: backup,
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

    const result = normalise(raw, activity);

    if (!result.folder) {
      console.error("Unusable model reply:", JSON.stringify(raw));
      return reply({
        folder: backup,
        source: "server rule",
        raw: raw,
        detail: `Model reply could not be matched (${result.how})`,
      });
    }

    return reply({
      folder: result.folder,
      source: "AI pick",
      raw: raw,
      detail: result.how,
      model: data.model || "gpt-4.1-mini",
    });
  } catch (error) {
    const aborted = error && error.name === "AbortError";
    console.error(error);
    return reply({
      folder: backup,
      source: "server rule",
      raw: null,
      detail: aborted ? "OpenAI did not answer within 8 seconds" : String(error.message || error),
    });
  }
};