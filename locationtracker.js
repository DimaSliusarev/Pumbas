// Campus Context Tracker
// Location (geofencing) + Activity recognition + Map + LLM prompt generation.
// One button turns both sensors on.


// List of all the Areas
// We can change/add more locations later if we want more

var areas = [
  { label: "H Village Vibe", corners: [
    { lat: 35.389433, lng: 139.427365 },
    { lat: 35.389211, lng: 139.428019 },
    { lat: 35.390549, lng: 139.428786 },
    { lat: 35.390868, lng: 139.427740 }
  ]},
  { label: "Gym", corners: [
    { lat: 35.389701, lng: 139.427311 },
    { lat: 35.390645, lng: 139.427515 },
    { lat: 35.391007, lng: 139.425240 },
    { lat: 35.390037, lng: 139.425031 }
  ]},
  { label: "Media", corners: [
    { lat: 35.387845, lng: 139.427425 },
    { lat: 35.388608, lng: 139.427629 },
    { lat: 35.388681, lng: 139.427208 },
    { lat: 35.387900, lng: 139.427009 }
  ]},
  { label: "Bus1", corners: [
    { lat: 35.389245, lng: 139.432027 },
    { lat: 35.389727, lng: 139.432170 },
    { lat: 35.389888, lng: 139.431499 },
    { lat: 35.389263, lng: 139.430938 }
  ]},
  { label: "Subwway", corners: [
    { lat: 35.387463, lng: 139.427521 },
    { lat: 35.387690, lng: 139.427554 },
    { lat: 35.387727, lng: 139.427293 },
    { lat: 35.387526, lng: 139.427234 }
  ]},
  { label: "Sigma", corners: [
    { lat: 35.386900, lng: 139.426304 },
    { lat: 35.387477, lng: 139.426355 },
    { lat: 35.387508, lng: 139.425899 },
    { lat: 35.386950, lng: 139.425858 }
  ]},
  { label: "AlphaOmega", corners: [
    { lat: 35.387559, lng: 139.427562 },
    { lat: 35.387500, lng: 139.428077 },
    { lat: 35.388675, lng: 139.428309 },
    { lat: 35.388758, lng: 139.427858 }
  ]},
  { label: "Bus2", corners: [
    { lat: 35.387374, lng: 139.428114 },
    { lat: 35.387284, lng: 139.428549 },
    { lat: 35.387774, lng: 139.428667 },
    { lat: 35.387899, lng: 139.428342 }
  ]},
  { label: "Cabins", corners: [
    { lat: 35.387299, lng: 139.429554 },
    { lat: 35.386532, lng: 139.429162 },
    { lat: 35.386908, lng: 139.428593 },
    { lat: 35.387398, lng: 139.428818 }
  ]},
  { label: "Tennis", corners: [
    { lat: 35.386572, lng: 139.429214 },
    { lat: 35.386454, lng: 139.429568 },
    { lat: 35.387070, lng: 139.429911 },
    { lat: 35.387195, lng: 139.429544 }
  ]},
  { label: "Kappa1", corners: [
    { lat: 35.387642, lng: 139.425963 },
    { lat: 35.387596, lng: 139.426218 },
    { lat: 35.387794, lng: 139.426271 },
    { lat: 35.387838, lng: 139.426014 }
  ]},
  { label: "Kappa2", corners: [
    { lat: 35.387573, lng: 139.426330 },
    { lat: 35.387532, lng: 139.426591 },
    { lat: 35.387731, lng: 139.426644 },
    { lat: 35.387772, lng: 139.426395 }
  ]},
  { label: "Epsilon1", corners: [
    { lat: 35.387981, lng: 139.426046 },
    { lat: 35.387926, lng: 139.426317 },
    { lat: 35.388132, lng: 139.426371 },
    { lat: 35.388178, lng: 139.426100 }
  ]},
  { label: "Epsilon2", corners: [
    { lat: 35.387901, lng: 139.426430 },
    { lat: 35.387860, lng: 139.426687 },
    { lat: 35.388069, lng: 139.426735 },
    { lat: 35.388115, lng: 139.426483 }
  ]},
  { label: "Iota1", corners: [
    { lat: 35.388307, lng: 139.426124 },
    { lat: 35.388268, lng: 139.426406 },
    { lat: 35.388471, lng: 139.426448 },
    { lat: 35.388519, lng: 139.426188 }
  ]},
  { label: "Iota2", corners: [
    { lat: 35.388247, lng: 139.426524 },
    { lat: 35.388214, lng: 139.426760 },
    { lat: 35.388415, lng: 139.426816 },
    { lat: 35.388452, lng: 139.426572 }
  ]},
  { label: "Omnicron", corners: [
    { lat: 35.388652, lng: 139.426226 },
    { lat: 35.388606, lng: 139.426491 },
    { lat: 35.388811, lng: 139.426542 },
    { lat: 35.388853, lng: 139.426277 }
  ]},
  { label: "Omnicron2", corners: [
    { lat: 35.388582, lng: 139.426609 },
    { lat: 35.388541, lng: 139.426845 },
    { lat: 35.388749, lng: 139.426899 },
    { lat: 35.388795, lng: 139.426655 }
  ]},
  { label: "Lambda", corners: [
    { lat: 35.388985, lng: 139.426510 },
    { lat: 35.388876, lng: 139.427145 },
    { lat: 35.389103, lng: 139.427191 },
    { lat: 35.389190, lng: 139.426566 }
  ]},
  { label: "Theta", corners: [
    { lat: 35.388817, lng: 139.427232 },
    { lat: 35.388706, lng: 139.427755 },
    { lat: 35.389027, lng: 139.427851 },
    { lat: 35.389119, lng: 139.427309 }
  ]},
  { label: "Shrine", corners: [
    { lat: 35.387100, lng: 139.425040 },
    { lat: 35.387303, lng: 139.425126 },
    { lat: 35.387262, lng: 139.425389 },
    { lat: 35.387036, lng: 139.425368 }
  ]},
  { label: "SBC", corners: [
    { lat: 35.389612, lng: 139.428706 },
    { lat: 35.389608, lng: 139.430009 },
    { lat: 35.389993, lng: 139.430042 },
    { lat: 35.390430, lng: 139.428861 }
  ]},
  { label: "TauDelta", corners: [
    { lat: 35.387835, lng: 139.425537 },
    { lat: 35.389302, lng: 139.425944 },
    { lat: 35.389446, lng: 139.425440 },
    { lat: 35.387848, lng: 139.425325 }
  ]},
  { label: "Pond", corners: [
    { lat: 35.387468, lng: 139.427197 },
    { lat: 35.387717, lng: 139.426706 },
    { lat: 35.387050, lng: 139.426469 },
    { lat: 35.387372, lng: 139.428028 }
  ]}
];

//State
var lastPosition = null; // { lat, lng, accuracy }
var watchId = null;      //Toggle for ON and OFF for tracking
var currentAreas = [];   //Use this to get the current area for the music app

//Setting the Decimal Point (Accuracy)
function fmt(n){ return Number(n).toFixed(6); }

//Writes to a span only if it exists, so the UI can be trimmed freely
function setText(id, value){
  var node = document.getElementById(id);
  if (node) node.textContent = value;
}

// Ray-casting point-in-polygon
function pointInPolygon(lat, lng, corners){
  var inside = false;
  var n = corners.length;
  for (var i = 0, j = n - 1; i < n; j = i++){
    var yi = corners[i].lat, xi = corners[i].lng;
    var yj = corners[j].lat, xj = corners[j].lng;
    var intersect = ((yi > lat) !== (yj > lat)) &&
      (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

function startWatch(){
  if (!navigator.geolocation){
    setText('warn', 'Geolocation is not supported by this browser.');
    return;
  }
  watchId = navigator.geolocation.watchPosition(
    function(p){
      lastPosition = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
      drawPosition();
      evaluatePosition();
      setText('posInfo',
        'Position: ' + fmt(lastPosition.lat) + ', ' + fmt(lastPosition.lng) +
        ' (accuracy ' + Math.round(lastPosition.accuracy) + ' m)');
    },
    function(err){
      setText('posInfo', 'Location error: ' + err.message);
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function stopWatch(){
  if (watchId !== null){ navigator.geolocation.clearWatch(watchId); watchId = null; }
}

function evaluatePosition(){
  if (!lastPosition) return;
  var insideSet = {};
  var names = [];
  for (var i = 0; i < areas.length; i++){
    if (pointInPolygon(lastPosition.lat, lastPosition.lng, areas[i].corners)){
      insideSet[i] = true;
      names.push(areas[i].label);
    }
  }
  currentAreas = names;

  redrawAreas(insideSet);
  updateContextDisplay();
}


// Adjustable settings, saved on this phone so they survive a reload.

var DECISION_WINDOW_KEY = 'pumbas.decisionWindowSeconds';
var COOLDOWN_KEY = 'pumbas.cooldownSeconds';

var DECISION_WINDOW_DEFAULT = 10;
var DECISION_WINDOW_MIN = 5;
var DECISION_WINDOW_MAX = 120;

var COOLDOWN_DEFAULT = 180;
var COOLDOWN_MIN = 10;
var COOLDOWN_MAX = 1800;

function clampNumber(value, min, max, fallback){
  var n = Number(value);
  if (!isFinite(n)) return fallback;
  n = Math.round(n);
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function readStored(key, min, max, fallback){
  try {
    var raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return clampNumber(raw, min, max, fallback);
  } catch (e){
    return fallback;
  }
}

function writeStored(key, value){
  try {
    window.localStorage.setItem(key, String(value));
  } catch (e){
    //Private browsing can refuse this. It only costs us persistence.
  }
}

function getDecisionWindowMs(){
  var node = document.getElementById('decisionWindowInput');
  if (!node) return DECISION_WINDOW_DEFAULT * 1000;
  return clampNumber(node.value, DECISION_WINDOW_MIN, DECISION_WINDOW_MAX,
                     DECISION_WINDOW_DEFAULT) * 1000;
}

function getCooldownMs(){
  var node = document.getElementById('cooldownInput');
  if (!node) return COOLDOWN_DEFAULT * 1000;
  return clampNumber(node.value, COOLDOWN_MIN, COOLDOWN_MAX, COOLDOWN_DEFAULT) * 1000;
}

function setupSettingsInputs(){
  var windowInput = document.getElementById('decisionWindowInput');
  var cooldownInput = document.getElementById('cooldownInput');

  if (windowInput){
    windowInput.value = readStored(DECISION_WINDOW_KEY, DECISION_WINDOW_MIN,
                                   DECISION_WINDOW_MAX, DECISION_WINDOW_DEFAULT);
    windowInput.addEventListener('change', function(){
      var clean = clampNumber(windowInput.value, DECISION_WINDOW_MIN,
                              DECISION_WINDOW_MAX, DECISION_WINDOW_DEFAULT);
      windowInput.value = clean;
      writeStored(DECISION_WINDOW_KEY, clean);
      updateStabilityDisplay();
    });
  }

  if (cooldownInput){
    cooldownInput.value = readStored(COOLDOWN_KEY, COOLDOWN_MIN, COOLDOWN_MAX, COOLDOWN_DEFAULT);
    cooldownInput.addEventListener('change', function(){
      var clean = clampNumber(cooldownInput.value, COOLDOWN_MIN, COOLDOWN_MAX, COOLDOWN_DEFAULT);
      cooldownInput.value = clean;
      writeStored(COOLDOWN_KEY, clean);
      updateStabilityDisplay();
    });
  }
}


// Time description, worked out on the phone rather than on the server,
// because Netlify runs in UTC and would otherwise guess your timezone wrongly.

function describeTimeBand(hour){
  if (hour < 5)  return "late night";
  if (hour < 11) return "morning";
  if (hour < 14) return "midday";
  if (hour < 17) return "afternoon";
  if (hour < 20) return "evening";
  return "night";
}

function timeInfo(){
  var days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  var d = new Date();
  var hour = d.getHours();
  var hh = hour < 10 ? "0" + hour : "" + hour;
  var mm = d.getMinutes() < 10 ? "0" + d.getMinutes() : "" + d.getMinutes();

  return {
    hour: hour,
    minute: d.getMinutes(),
    weekday: days[d.getDay()],
    weekend: (d.getDay() === 0 || d.getDay() === 6),
    band: describeTimeBand(hour),
    isNight: (hour >= 19 || hour < 5),
    local: hh + ":" + mm
  };
}

//Exposed at the top level so the music player can read it at any time.
//It reports the voted values, not the raw instantaneous ones, so the request
//that goes to the model matches the decision that triggered it.
window.getCurrentContext = function(){
  return {
    area: lastNotifiedArea,
    activity: lastNotifiedActivity,
    time: timeInfo()
  };
};


//Activity Recognition Part


var NUM_DATA_PER_FRAME = 200; //samples per classification window (~3.4 s at 59 Hz)
var SLIDE = 50;               //how many old samples to drop after each classification

//Short inner vote. Its only job is to knock out single-window spikes.
//The real smoothing is the adjustable decision window further down.
var VOTE_WINDOW_MS = 3000;

var magdata = [];   //acceleration magnitudes
var timedata = [];  //event timestamps in ms, so we can measure the true sample rate

//Features
var magMean = 0, magStd = 0, magMad = 0, magRms = 0;
var magMax = 0, magRange = 0, magCrossRate = 0, magPeakRate = 0;

var voteBuffer = [];   // { t, label }
var lastVoteTally = {};
var currentActivity = "unknown";
var currentActivityRaw = "unknown";

//Statistics so you can see how often the label actually moves
var classificationCount = 0;
var classificationTimes = [];
var activitySwitchCount = 0;
var lastSwitchTime = 0;

var motionListening = false;
var accelSource = "none";
var uiTimer = null;

//Low-pass gravity estimate. Only used if the browser cannot give us
//gravity-free acceleration directly.
var GRAVITY_ALPHA = 0.95;
var gravity = { x: 0, y: 0, z: 0 };
var gravitySamples = 0;

function startDeviceMotion(){
  if (motionListening) return;
  window.addEventListener('devicemotion', handleAcceleration, false);
  motionListening = true;
  magdata = [];
  timedata = [];
  voteBuffer = [];
  lastVoteTally = {};
  classificationCount = 0;
  classificationTimes = [];
  activitySwitchCount = 0;
  lastSwitchTime = 0;
  gravity = { x: 0, y: 0, z: 0 };
  gravitySamples = 0;
  if (uiTimer === null) uiTimer = setInterval(refreshFeatureUI, 300);
}

function stopDeviceMotion(){
  window.removeEventListener('devicemotion', handleAcceleration, false);
  motionListening = false;
  magdata = [];
  timedata = [];
  voteBuffer = [];
  if (uiTimer !== null){ clearInterval(uiTimer); uiTimer = null; }
}

function handleAcceleration(ev){
  var ax, ay, az;
  var a = ev.acceleration;
  var degenerate = !a || a.x === null || a.x === undefined ||
                   (a.x === 0 && a.y === 0 && a.z === 0);

  if (!degenerate){
    //Browser gives real gravity-free acceleration
    accelSource = 'acceleration';
    ax = a.x; ay = a.y; az = a.z;
  } else {
    //low-pass filter
    var g = ev.accelerationIncludingGravity;
    if (!g || g.x === null || g.x === undefined){
      accelSource = 'unavailable';
      setText('warn', 'This browser gives no usable acceleration. Use Safari or Chrome over https.');
      return;
    }
    accelSource = 'gravity removed by filter';

    gravity.x = GRAVITY_ALPHA * gravity.x + (1 - GRAVITY_ALPHA) * g.x;
    gravity.y = GRAVITY_ALPHA * gravity.y + (1 - GRAVITY_ALPHA) * g.y;
    gravity.z = GRAVITY_ALPHA * gravity.z + (1 - GRAVITY_ALPHA) * g.z;

    ax = g.x - gravity.x;
    ay = g.y - gravity.y;
    az = g.z - gravity.z;

    //Let the filter settle before trusting it
    gravitySamples++;
    if (gravitySamples < 60) return;
  }

  magdata.push(Math.sqrt(ax * ax + ay * ay + az * az));
  timedata.push(ev.timeStamp || Date.now());

  if (magdata.length >= NUM_DATA_PER_FRAME){
    featureExtraction();

    var previousActivity = currentActivity;

    currentActivityRaw = smooth(classifyRaw());
    currentActivity = toMainClass(currentActivityRaw);

    classificationCount++;
    classificationTimes.push(Date.now());
    if (classificationTimes.length > 30) classificationTimes.shift();

    if (previousActivity !== currentActivity && previousActivity !== "unknown"){
      activitySwitchCount++;
      lastSwitchTime = Date.now();
    }

    recordContext();
    updateContextDisplay();

    //Slide the window instead of clearing it, so we keep classifying continuously
    magdata = magdata.slice(SLIDE);
    timedata = timedata.slice(SLIDE);
  }
}

//Runs on a timer so the features move in real time, not once per window
function refreshFeatureUI(){
  setText('accelSource', accelSource);
  setText('sampleCount', magdata.length);
  if (magdata.length > 1) featureExtraction();
  updateActivityDebug();
}

function featureExtraction(){
  var n = magdata.length;
  if (n < 2) return;
  var i;

  var sum = 0;
  for (i = 0; i < n; i++){ sum += magdata[i]; }
  magMean = sum / n;

  var sqSum = 0, absSum = 0, sqValSum = 0;
  var mx = magdata[0], mn = magdata[0];
  for (i = 0; i < n; i++){
    var v = magdata[i];
    var d = v - magMean;
    sqSum += d * d;
    absSum += Math.abs(d);
    sqValSum += v * v;
    if (v > mx) mx = v;
    if (v < mn) mn = v;
  }
  magStd = Math.sqrt(sqSum / n);
  magMad = absSum / n;
  magRms = Math.sqrt(sqValSum / n);
  magMax = mx;
  magRange = mx - mn;

  //Window duration from real timestamps, so cadence stays correct on any device
  var duration = (timedata[n - 1] - timedata[0]) / 1000;
  if (!(duration > 0)) duration = n / 59;

  //Mean-crossing rate: the cadence feature that separates walking from squatting
  var crossings = 0;
  for (i = 1; i < n; i++){
    if ((magdata[i - 1] < magMean) !== (magdata[i] < magMean)) crossings++;
  }
  magCrossRate = crossings / duration;

  //Peak rate: peaks above mean + 0.5*std, with a gap so one bump counts once
  var thresh = magMean + 0.5 * magStd;
  var peaks = 0;
  i = 1;
  while (i < n - 1){
    if (magdata[i] > thresh && magdata[i] >= magdata[i - 1] && magdata[i] > magdata[i + 1]){
      peaks++;
      i += 12;
    } else {
      i++;
    }
  }
  magPeakRate = peaks / duration;

  setText('magMean',      magMean.toFixed(4));
  setText('magStd',       magStd.toFixed(4));
  setText('magMad',       magMad.toFixed(4));
  setText('magRms',       magRms.toFixed(4));
  setText('magMax',       magMax.toFixed(4));
  setText('magRange',     magRange.toFixed(4));
  setText('magCrossRate', magCrossRate.toFixed(3));
  setText('magPeakRate',  magPeakRate.toFixed(3));
}

//J48 tree from WEKA
function classifyRaw(){
  if (magRms <= 5.70){
    if (magMean <= 0.95351){
      return "standing";
    } else {
      if (magCrossRate <= 6.49){
        if (magPeakRate <= 2.065){
          return "squating";
        } else {
          if (magMean <= 2.22829){
            return "squating";
          } else {
            return "walking";
          }
        }
      } else {
        if (magPeakRate <= 1.77){
          if (magCrossRate <= 7.08){
            return "squating";
          } else {
            return "walking";
          }
        } else {
          return "walking";
        }
      }
    }
  } else {
    return "running";
  }
}

//Short majority vote, measured in real time rather than in a fixed
//number of windows, so it behaves the same on every phone.
function smooth(raw){
  var now = Date.now();
  voteBuffer.push({ t: now, label: raw });

  var cutoff = now - VOTE_WINDOW_MS;
  while (voteBuffer.length && voteBuffer[0].t < cutoff){
    voteBuffer.shift();
  }

  var tally = {};
  var best = raw, bestCount = 0;
  for (var i = 0; i < voteBuffer.length; i++){
    var label = voteBuffer[i].label;
    tally[label] = (tally[label] || 0) + 1;
    if (tally[label] > bestCount){ bestCount = tally[label]; best = label; }
  }

  lastVoteTally = tally;
  return best;
}

//Fold the tree leaves into the classes the music app cares about
function toMainClass(raw){
  switch (raw){
    case "standing":  return "resting";
    case "walking":   return "walking";
    case "running":   return "running";
    case "squating":  return "exercise";
    default:          return "unknown";
  }
}

//Shows how fast the classifier is running and how stable it actually is
function updateActivityDebug(){
  var node = document.getElementById('activityDebug');
  if (!node) return;

  if (!motionListening){
    node.textContent = 'Motion sensing is not running.';
    return;
  }

  var rate = 0;
  if (classificationTimes.length > 1){
    var span = (classificationTimes[classificationTimes.length - 1] - classificationTimes[0]) / 1000;
    if (span > 0) rate = (classificationTimes.length - 1) / span;
  }

  var parts = [];
  for (var key in lastVoteTally){
    if (Object.prototype.hasOwnProperty.call(lastVoteTally, key)){
      parts.push(key + ' x' + lastVoteTally[key]);
    }
  }

  var sinceSwitch = lastSwitchTime === 0
    ? 'no switch yet'
    : Math.round((Date.now() - lastSwitchTime) / 1000) + ' s ago';

  var lines = [
    'classifications: ' + classificationCount,
    'classification rate: ' + rate.toFixed(2) + ' per second',
    'inner vote window: ' + (VOTE_WINDOW_MS / 1000) + ' s, holding ' + voteBuffer.length + ' votes',
    'inner vote breakdown: ' + (parts.length ? parts.join(', ') : 'empty'),
    'raw label: ' + currentActivityRaw + '  ->  smoothed: ' + currentActivity,
    'label switches since start: ' + activitySwitchCount + ' (last ' + sinceSwitch + ')'
  ];

  node.textContent = lines.join('\n');
}


//Full information of location + activity
function getContext(){
  return {
    areas: currentAreas,
    activity: currentActivity,
    activityRaw: currentActivityRaw
  };
}

function updateContextDisplay(){
  var where = currentAreas.length ? currentAreas.join(', ') : 'no area';
  setText('context', where + ' / ' + currentActivity);
}


// Decision layer.
// The current area and activity are sampled on a fixed timer, so the vote is
// weighted by time rather than by how often each sensor happens to fire.
// The winner of each is taken independently, which handles the case where the
// area jitters while the activity is steady, or the other way round.

var CONTEXT_SAMPLE_MS = 500;
var NO_AREA_KEY = "(no area)";

var contextSamples = [];      // { t, area, activity }
var contextSampleTimer = null;

var lastAreaTally = {};
var lastActivityTally = {};
var lastAreaWinner = null;
var lastActivityWinner = null;

var lastNotifiedArea = null;
var lastNotifiedActivity = null;
var lastNotifyTime = 0;
var notifyCount = 0;

function tallyWinner(values, preferredKey){
  var tally = {};
  for (var i = 0; i < values.length; i++){
    var key = values[i];
    tally[key] = (tally[key] || 0) + 1;
  }

  var best = null, bestCount = -1;
  for (var k in tally){
    if (!Object.prototype.hasOwnProperty.call(tally, k)) continue;
    if (tally[k] > bestCount){
      bestCount = tally[k];
      best = k;
    } else if (tally[k] === bestCount && k === preferredKey){
      //A tie resolves in favour of whatever we are already playing,
      //so a fifty-fifty split does not flap between two folders.
      best = k;
    }
  }

  return { winner: best, tally: tally, count: bestCount, total: values.length };
}

function sampleContext(){
  if (!running) return;

  var now = Date.now();
  contextSamples.push({
    t: now,
    area: currentAreas[0] || null,
    activity: currentActivity
  });

  var windowMs = getDecisionWindowMs();
  var cutoff = now - windowMs;
  while (contextSamples.length && contextSamples[0].t < cutoff){
    contextSamples.shift();
  }

  decideContext(windowMs);
  updateStabilityDisplay();
}

function decideContext(windowMs){
  if (contextSamples.length < 3) return;

  //Only decide once the buffer actually covers most of the window, otherwise
  //the first few seconds after pressing start would vote on almost nothing.
  var span = contextSamples[contextSamples.length - 1].t - contextSamples[0].t;
  if (span < windowMs * 0.8) return;

  var areaValues = [];
  var activityValues = [];

  for (var i = 0; i < contextSamples.length; i++){
    areaValues.push(contextSamples[i].area === null ? NO_AREA_KEY : contextSamples[i].area);
    //An unclassified activity should never win the vote, so it is left out
    //rather than being allowed to outnumber the real labels.
    if (contextSamples[i].activity !== "unknown"){
      activityValues.push(contextSamples[i].activity);
    }
  }

  var areaResult = tallyWinner(
    areaValues,
    lastNotifiedArea === null ? NO_AREA_KEY : lastNotifiedArea
  );
  var activityResult = tallyWinner(activityValues, lastNotifiedActivity);

  lastAreaTally = areaResult.tally;
  lastActivityTally = activityResult.tally;

  lastAreaWinner = areaResult.winner === NO_AREA_KEY ? null : areaResult.winner;
  lastActivityWinner = activityResult.winner;

  //Nothing usable yet
  if (lastActivityWinner === null || lastActivityWinner === undefined) return;

  //The winner is the same as the one already playing
  if (lastAreaWinner === lastNotifiedArea && lastActivityWinner === lastNotifiedActivity) return;

  var now = Date.now();
  if (lastNotifyTime !== 0 && (now - lastNotifyTime) < getCooldownMs()) return;

  lastNotifiedArea = lastAreaWinner;
  lastNotifiedActivity = lastActivityWinner;
  lastNotifyTime = now;
  notifyCount++;

  window.dispatchEvent(new Event('areaChanged'));
}

function describeTally(tally){
  var parts = [];
  for (var key in tally){
    if (Object.prototype.hasOwnProperty.call(tally, key)){
      parts.push(key + ' x' + tally[key]);
    }
  }
  return parts.length ? parts.join(', ') : 'empty';
}

function updateStabilityDisplay(){
  var node = document.getElementById('stabilityInfo');
  if (!node) return;

  if (!running){
    node.textContent = '';
    return;
  }

  var now = Date.now();
  var windowSeconds = Math.round(getDecisionWindowMs() / 1000);
  var span = contextSamples.length > 1
    ? ((contextSamples[contextSamples.length - 1].t - contextSamples[0].t) / 1000)
    : 0;

  var coolText;
  if (lastNotifyTime === 0){
    coolText = 'gap timer idle, ready to change';
  } else {
    var remaining = Math.max(0, Math.round((getCooldownMs() - (now - lastNotifyTime)) / 1000));
    coolText = remaining > 0
      ? ('next change allowed in ' + remaining + ' s')
      : 'gap elapsed, ready to change';
  }

  var lines = [
    'vote over last ' + windowSeconds + ' s: ' + contextSamples.length +
      ' samples covering ' + span.toFixed(1) + ' s',
    'area votes: ' + describeTally(lastAreaTally),
    'activity votes: ' + describeTally(lastActivityTally),
    'winner: ' + (lastAreaWinner === null ? 'no area' : lastAreaWinner) +
      ' / ' + (lastActivityWinner || 'none'),
    'playing for: ' + (lastNotifiedArea === null ? 'no area' : lastNotifiedArea) +
      ' / ' + (lastNotifiedActivity || 'none') + ' (' + notifyCount + ' changes)',
    coolText
  ];

  node.textContent = lines.join('\n');
}


// Llm prompt part

var HISTORY_SECONDS = 60;       //how far back the prompt looks
var PROMPT_INTERVAL_MS = 60000; //regenerate the prompt every 60 seconds

var contextHistory = [];  //{ t, activity, areas }
var promptTimer = null;
var lastPrompt = "";


function recordContext(){
  var now = Date.now();
  contextHistory.push({ t: now, activity: currentActivity, areas: currentAreas.slice() });

  //Drop anything older than the window we care about
  var cutoff = now - HISTORY_SECONDS * 1000;
  while (contextHistory.length && contextHistory[0].t < cutoff){
    contextHistory.shift();
  }
}

//Work out what the user was mostly doing over the last minute.
//Returns { activity, share, samples } where share is 0..1.
function summarizeLastMinute(){
  var cutoff = Date.now() - HISTORY_SECONDS * 1000;
  var recent = [];
  for (var i = 0; i < contextHistory.length; i++){
    if (contextHistory[i].t >= cutoff) recent.push(contextHistory[i]);
  }
  if (recent.length === 0){
    return { activity: "unknown", share: 0, samples: 0 };
  }

  var tally = {};
  var best = "unknown", bestCount = 0;
  for (var j = 0; j < recent.length; j++){
    var act = recent[j].activity;
    tally[act] = (tally[act] || 0) + 1;
    if (tally[act] > bestCount){ bestCount = tally[act]; best = act; }
  }
  return { activity: best, share: bestCount / recent.length, samples: recent.length };
}

//Human readable time, e.g. "Monday 14:32 (afternoon)"
function describeTime(){
  var info = timeInfo();
  return info.weekday + " " + info.local + " (" + info.band + ")";
}

//Human readable location
function describeLocation(){
  if (!lastPosition) return "somewhere on the SFC campus (location not yet fixed)";
  if (currentAreas.length === 0) return "outdoors on the SFC campus, not inside any mapped area";
  if (currentAreas.length === 1) return "at " + currentAreas[0] + " on the SFC campus";
  return "at " + currentAreas.join(" and ") + " on the SFC campus";
}

//Turn a class label into something an LLM reads naturally
function describeActivity(activity){
  switch (activity){
    case "resting":  return "resting or standing still";
    case "walking":  return "walking";
    case "running":  return "running";
    case "exercise": return "exercising";
    default:         return "doing something we could not classify";
  }
}

//The template. This one is display only and is never sent anywhere.
function buildPrompt(){
  var summary = summarizeLastMinute();
  var percent = Math.round(summary.share * 100);

  var confidence;
  if (summary.samples === 0){
    confidence = "We have no reliable activity reading yet.";
  } else if (percent >= 80) {
    confidence = "This was consistent for essentially the whole minute.";
  } else {
    confidence = "The reading was mixed, so treat it as a rough impression rather than a certainty.";
  }

  return "You are a DJ choosing the next song for one listener, and you can see what they are doing right now.\n\n" +
         "The time is " + describeTime() + ".\n" +
         "The user is " + describeLocation() + ".\n" +
         "Over the past minute they were detected to be " + describeActivity(summary.activity) +
         " for about " + percent + "% of the time. " + confidence + "\n\n" +
         "What song would you play to fit this moment? Give one track, and one sentence explaining why it suits " +
         "their location, the time of day, and what their body is doing.";
}

//Regenerate the prompt and show it on the page
function refreshPrompt(){
  lastPrompt = buildPrompt();
  setText('prompt', lastPrompt);
  setText('promptTime', 'last generated at ' + describeTime() +
    ' (from ' + summarizeLastMinute().samples + ' classifications)');
}

//Exposed so the music app can grab the current prompt whenever it wants
function getPrompt(){
  return lastPrompt;
}


// Button that starts location and motion together

var running = false;

function toggleAll(){
  if (running) stopAll();
  else startAll();
}

function startAll(){
  setText('warn', '');
  contextHistory = [];

  contextSamples = [];
  lastAreaTally = {};
  lastActivityTally = {};
  lastAreaWinner = null;
  lastActivityWinner = null;
  lastNotifiedArea = null;
  lastNotifiedActivity = null;
  lastNotifyTime = 0;
  notifyCount = 0;

  //Mobile browsers only allow audio to start from a real tap, and iOS only
  //allows the Web Audio graph used for fading to be built from a real tap,
  //so both happen here inside the button handler.
  if (typeof window.primeAudio === 'function') window.primeAudio();

  startWatch();

  //iOS 13+ needs the permission request to happen inside a real tap
  if (typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'){
    DeviceMotionEvent.requestPermission().then(function(state){
      if (state === 'granted'){
        startDeviceMotion();
      } else {
        setText('warn', 'Motion permission denied. Settings > Apps > Safari > Motion & Orientation Access.');
      }
    }).catch(function(e){
      setText('warn', 'Motion permission failed: ' + e + ' (the page must be https)');
    });
  } else {
    startDeviceMotion();
  }

  //The decision vote samples on its own clock, independent of the sensors
  if (contextSampleTimer === null){
    contextSampleTimer = setInterval(sampleContext, CONTEXT_SAMPLE_MS);
  }

  //Fire the display prompt every 60 seconds
  if (promptTimer === null){
    promptTimer = setInterval(refreshPrompt, PROMPT_INTERVAL_MS);
  }

  running = true;
  setText('startBtn', 'Stop tracking');
  setText('status', 'Tracking.');
}

function stopAll(){
  stopWatch();
  stopDeviceMotion();
  if (promptTimer !== null){ clearInterval(promptTimer); promptTimer = null; }
  if (contextSampleTimer !== null){ clearInterval(contextSampleTimer); contextSampleTimer = null; }
  running = false;
  setText('startBtn', 'Start tracking');
  setText('status', 'Stopped.');
  setText('accelSource', 'none');
  setText('sampleCount', '0');
  setText('stabilityInfo', '');
  updateActivityDebug();
}



// MAP

var map = L.map('map').setView([35.38757, 139.42723], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

var posMarker = null;
var accCircle = null;
var polyLayers = [];
var followMe = true;

function latlngs(area){
  return area.corners.map(function(c){ return [c.lat, c.lng]; });
}

//Bounding box of every mapped area, used both for the fit button and to decide
//whether following your position would drag the view away from campus.
function campusBounds(){
  var points = [];
  for (var i = 0; i < areas.length; i++){
    for (var j = 0; j < areas[i].corners.length; j++){
      points.push([areas[i].corners[j].lat, areas[i].corners[j].lng]);
    }
  }
  return L.latLngBounds(points);
}

var CAMPUS_BOUNDS = campusBounds();
var CAMPUS_FOLLOW_BOUNDS = CAMPUS_BOUNDS.pad(1.0);

function fitCampus(){
  map.fitBounds(CAMPUS_BOUNDS.pad(0.1));
  updateMapInfo();
}

//Draw areas, red if you are inside them.
//The outlines are deliberately heavier than before, because a thin blue line
//at low opacity is very hard to see over street tiles on a phone in daylight.
function redrawAreas(insideSet){
  for (var i = 0; i < polyLayers.length; i++){ map.removeLayer(polyLayers[i]); }
  polyLayers = [];
  insideSet = insideSet || {};

  for (var j = 0; j < areas.length; j++){
    var hit = insideSet[j] === true;
    var poly = L.polygon(latlngs(areas[j]), {
      color: hit ? '#dc2626' : '#1d4ed8',
      weight: hit ? 4 : 3,
      opacity: 1,
      fillColor: hit ? '#dc2626' : '#3b82f6',
      fillOpacity: hit ? 0.45 : 0.22
    }).addTo(map).bindTooltip(areas[j].label, { sticky: true });
    polyLayers.push(poly);
  }

  updateMapInfo();
}

//Draw current position
function drawPosition(){
  if (!lastPosition) return;
  var ll = [lastPosition.lat, lastPosition.lng];
  if (posMarker) map.removeLayer(posMarker);
  if (accCircle) map.removeLayer(accCircle);
  posMarker = L.marker(ll).addTo(map).bindTooltip('You');
  accCircle = L.circle(ll, { radius: lastPosition.accuracy, weight: 1, fillOpacity: 0.1 }).addTo(map);

  //Only follow you while you are near campus. Following unconditionally is what
  //pushed the area boxes off screen when testing away from SFC.
  if (followMe && CAMPUS_FOLLOW_BOUNDS.contains(L.latLng(ll))){
    map.setView(ll);
  }

  updateMapInfo();
}

function updateMapInfo(){
  var node = document.getElementById('mapInfo');
  if (!node) return;

  var centre = map.getCenter();
  var nearCampus = lastPosition
    ? CAMPUS_FOLLOW_BOUNDS.contains(L.latLng([lastPosition.lat, lastPosition.lng]))
    : false;

  var lines = [
    'area boxes drawn: ' + polyLayers.length + ' of ' + areas.length,
    'map centre: ' + centre.lat.toFixed(5) + ', ' + centre.lng.toFixed(5) + ' at zoom ' + map.getZoom(),
    'your position is ' + (lastPosition ? (nearCampus ? 'near campus' : 'far from campus') : 'not fixed yet'),
    'follow me: ' + (followMe ? 'on' : 'off')
  ];

  node.textContent = lines.join('\n');
}

function setupMapButtons(){
  var fitBtn = document.getElementById('fitCampusBtn');
  var followBtn = document.getElementById('followMeBtn');

  if (fitBtn){
    fitBtn.addEventListener('click', fitCampus);
  }

  if (followBtn){
    followBtn.addEventListener('click', function(){
      followMe = !followMe;
      followBtn.textContent = 'Follow me: ' + (followMe ? 'on' : 'off');
      updateMapInfo();
    });
  }

  map.on('moveend zoomend', updateMapInfo);
}

//Phones frequently lay the page out after Leaflet has measured the container,
//which leaves the map sized wrongly until it is told to remeasure.
function refreshMapSize(){
  map.invalidateSize();
  updateMapInfo();
}


//Initialize
setText('windowSize', NUM_DATA_PER_FRAME);
setupSettingsInputs();
setupMapButtons();
redrawAreas();
fitCampus();
updateContextDisplay();
updateActivityDebug();

setTimeout(refreshMapSize, 300);
setTimeout(refreshMapSize, 1200);
window.addEventListener('resize', refreshMapSize);
window.addEventListener('orientationchange', function(){ setTimeout(refreshMapSize, 300); });