//NOTE: I commented out the Map Logic cause 
// I assume we dont need it for the final App 
// but you guys can test it out.

// List of all the Areas
// We can change/ad more locations later if we want more

var areas = [
  { label: "HVillage", corners: [
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
var watchId = null; //Toggle for ON an OFF for tracking 
var currentAreas = []; //Use this to get the current area for the music app

//Setting the Decimal Point (Accuracy)
function fmt(n){ return Number(n).toFixed(6); }

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

//For getting position
//Detection
function toggleWatch(){
  if (watchId === null) startWatch();
  else stopWatch();
}

function startWatch(){
  if (!navigator.geolocation){
    alert('Geolocation not supported.');
    return;
  }
  watchId = navigator.geolocation.watchPosition(
    function(p){
      lastPosition = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
      // drawPosition(); //Can comment out to remove map
      evaluatePosition();
      document.getElementById('posInfo').textContent =
        'Position: ' + fmt(lastPosition.lat) + ', ' + fmt(lastPosition.lng) +
        ' (accuracy +/- ' + Math.round(lastPosition.accuracy) + ' m)';
    },
    function(err){
      document.getElementById('posInfo').textContent = 'Error: ' + err.message;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
  document.getElementById('watchBtn').textContent = 'Stop tracking';
}

function stopWatch(){
  if (watchId !== null){ navigator.geolocation.clearWatch(watchId); watchId = null; }
  document.getElementById('watchBtn').textContent = 'Start tracking';
  document.getElementById('status').textContent = 'Detection stopped.';
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

  updateStatusDisplay();
  // redrawAreas(insideSet); //Can comment out to remove map
}

function updateStatusDisplay(){ //For updating status in the UI
  document.getElementById('status').textContent =
    currentAreas.length ? ('You are in: ' + currentAreas.join(', ')) : 'Not in any area.';
}


//Stuff for Drawing the Map and UI. Not really necessary for the app

//Render Each Area in the List
function renderList(){ //Can comment out to remove list
  var wrap = document.getElementById('areaList');
  if (areas.length === 0){ wrap.textContent = 'No areas loaded.'; return; }
  var html = '<table border="1" cellpadding="5"><tr><th>Label</th><th>Corners (lat, lng)</th></tr>';
  for (var i = 0; i < areas.length; i++){
    var a = areas[i];
    var lines = [];
    for (var k = 0; k < a.corners.length; k++){
      lines.push((k + 1) + ': ' + fmt(a.corners[k].lat) + ', ' + fmt(a.corners[k].lng));
    }
    html += '<tr><td>' + a.label + '</td><td>' + lines.join('<br>') + '</td></tr>';
  }
  html += '</table>';
  wrap.innerHTML = html;
}

//Map
// var map = L.map('map').setView([35.38757, 139.42723], 16); //Can comment out to remove map
// L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { //Can comment out to remove map
//   maxZoom: 19}).addTo(map); //Can comment out to remove map

// var posMarker = null; //Can comment out to remove map
// var accCircle = null; //Can comment out to remove map
// var polyLayers = []; //Can comment out to remove map

// function latlngs(area){ //Can comment out to remove map
//   return area.corners.map(function(c){ return [c.lat, c.lng]; });
// }

//Draw areas
// function redrawAreas(insideSet){ //Can comment out to remove map
//   for (var i = 0; i < polyLayers.length; i++){ map.removeLayer(polyLayers[i]); }
//   polyLayers = [];
//   insideSet = insideSet || {};
//   for (var j = 0; j < areas.length; j++){
//     var hit = insideSet[j] === true;
//     var poly = L.polygon(latlngs(areas[j]), {
//       color: hit ? 'red' : 'blue',
//       weight: 2,
//       fillOpacity: hit ? 0.3 : 0.1
//     }).addTo(map).bindTooltip(areas[j].label);
//     polyLayers.push(poly);
//   }
// }

// //Draw current position
// function drawPosition(){ //Can comment out to remove map
//   if (!lastPosition) return;
//   var ll = [lastPosition.lat, lastPosition.lng];
//   if (posMarker) map.removeLayer(posMarker);
//   if (accCircle) map.removeLayer(accCircle);
//   posMarker = L.marker(ll).addTo(map).bindTooltip('You');
//   accCircle = L.circle(ll, { radius: lastPosition.accuracy, weight: 1, fillOpacity: 0.1 }).addTo(map);
// }






//Initialize
renderList();
// redrawAreas(); //Can comment out to remove map
// if (areas.length){ //Can comment out to remove map
//   map.fitBounds(L.polygon(latlngs(areas[0])).getBounds(), { maxZoom: 18 }); 
// }
