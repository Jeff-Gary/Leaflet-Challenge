// Create the base map
let myMap = L.map("map", {
  center: [37.09, -95.71], // Center on the U.S.
  zoom: 4
});

// Add a tile layer (background map)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap Contributors"
}).addTo(myMap);

// Fetch earthquake GeoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {

  // Function to determine marker size based on magnitude
  function getRadius(magnitude) {
      return magnitude ? magnitude * 4 : 1; // Scale magnitude for visibility
  }

  // Function to determine marker color based on depth
  function getColor(depth) {
      return depth > 90 ? "#ff5f65" :
             depth > 70 ? "#fca35d" :
             depth > 50 ? "#fdb72a" :
             depth > 30 ? "#f7db11" :
             depth > 10 ? "#dcf400" :
                          "#a3f600";
  }

  // Function to style each marker
  function styleInfo(feature) {
      return {
          radius: getRadius(feature.properties.mag),
          fillColor: getColor(feature.geometry.coordinates[2]), // Depth-based color
          color: "#000",
          weight: 0.5,
          opacity: 1,
          fillOpacity: 0.7
      };
  }

  // Add GeoJSON layer to the map
  L.geoJson(data, {
      pointToLayer: function(feature, latlng) {
          return L.circleMarker(latlng);
      },
      style: styleInfo,
      onEachFeature: function(feature, layer) {
          layer.bindPopup(
              `<h3>${feature.properties.place}</h3>
              <hr>
              <p><strong>Magnitude:</strong> ${feature.properties.mag}</p>
              <p><strong>Depth:</strong> ${feature.geometry.coordinates[2]} km</p>
              <p><strong>Time:</strong> ${new Date(feature.properties.time)}</p>`
          );
      }
  }).addTo(myMap);
});

// Create a legend control
let legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
  let div = L.DomUtil.create("div", "info legend");
  let depthLevels = [-10, 10, 30, 50, 70, 90];
  let colors = ["#a3f600", "#dcf400", "#f7db11", "#fdb72a", "#fca35d", "#ff5f65"];

  // Loop through depth levels to generate legend labels
  for (let i = 0; i < depthLevels.length; i++) {
      div.innerHTML +=
          `<i style="background: ${colors[i]}"></i> ${depthLevels[i]}${depthLevels[i + 1] ? "&ndash;" + depthLevels[i + 1] + " km<br>" : "+ km"}`;
  }

  return div;
};

// Add legend to the map
legend.addTo(myMap);

// Optional: Fetch and add tectonic plates layer
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData) {
  L.geoJson(plateData, {
      color: "orange",
      weight: 2
  }).addTo(myMap);
});
