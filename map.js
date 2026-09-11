/**
 * Interactive Leaflet Map Component for Gujarat Mandis
 */

const MapComponent = (function () {
  let map = null;
  let markersLayer = null;
  let radiusCircle = null;
  let routeLine = null;
  let farmerMarker = null;

  // Default farmer position: Saurashtra / Gondal-Rajkot belt (22.05, 70.82)
  let currentFarmerLocation = { lat: 22.0500, lng: 70.8200, name: "Gondal Rural, Rajkot District" };
  let currentRadiusKm = 75;
  let allMandis = [];
  let latestRankings = [];

  function init(mandis, onMandiSelect) {
    allMandis = mandis;

    // Center on Gujarat / Saurashtra agricultural core
    map = L.map("leaflet-map", {
      center: [22.35, 71.30],
      zoom: 8,
      zoomControl: true
    });

    // High quality OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | KisanMarg',
      maxZoom: 18
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    // Setup Farmer Marker
    renderFarmerMarker();
    updateRadiusCircle(currentRadiusKm);
    renderMandiMarkers(onMandiSelect);

    // Bind radius slider
    const radiusSlider = document.getElementById("map-radius-slider");
    const radiusValDisplay = document.getElementById("map-radius-val");
    if (radiusSlider && radiusValDisplay) {
      radiusSlider.value = currentRadiusKm;
      radiusSlider.addEventListener("input", (e) => {
        currentRadiusKm = parseInt(e.target.value, 10);
        radiusValDisplay.textContent = `${currentRadiusKm} km`;
        updateRadiusCircle(currentRadiusKm);
        renderMandiMarkers(onMandiSelect);
      });
    }

    // Bind district filter dropdown
    const districtFilter = document.getElementById("map-district-filter");
    if (districtFilter) {
      districtFilter.addEventListener("change", () => {
        renderMandiMarkers(onMandiSelect);
      });
    }

    // Bind search input
    const searchInput = document.getElementById("map-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        renderMandiMarkers(onMandiSelect);
      });
    }
  }

  function renderFarmerMarker() {
    if (farmerMarker) map.removeLayer(farmerMarker);

    const farmerIcon = L.divIcon({
      className: "custom-mandi-pin pin-farmer",
      html: `<div style="width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#2563eb;color:white;font-size:16px;box-shadow:0 0 15px #3b82f6;">🚜</div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    farmerMarker = L.marker([currentFarmerLocation.lat, currentFarmerLocation.lng], {
      icon: farmerIcon,
      draggable: true
    }).addTo(map);

    farmerMarker.bindPopup(`
      <div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:180px;">
        <h4 style="margin:0 0 4px; color:#1e40af; font-size:14px;">🚜 Your Harvest Location</h4>
        <p style="margin:0; font-size:12px; color:#475569;">${currentFarmerLocation.name}</p>
        <span style="display:inline-block; margin-top:6px; font-size:10px; background:#eff6ff; color:#1d4ed8; padding:2px 6px; border-radius:4px;">Drag pin to update your farm location</span>
      </div>
    `);

    farmerMarker.on("dragend", function (e) {
      const coord = e.target.getLatLng();
      currentFarmerLocation.lat = coord.lat;
      currentFarmerLocation.lng = coord.lng;
      updateRadiusCircle(currentRadiusKm);
      if (window.ProfitCalculatorComponent) {
        window.ProfitCalculatorComponent.recalculate();
      }
    });
  }

  function updateRadiusCircle(radiusKm) {
    if (radiusCircle) map.removeLayer(radiusCircle);

    radiusCircle = L.circle([currentFarmerLocation.lat, currentFarmerLocation.lng], {
      radius: radiusKm * 1000,
      color: "#10b981",
      fillColor: "#10b981",
      fillOpacity: 0.08,
      weight: 1.5,
      dashArray: "6, 8"
    }).addTo(map);
  }

  function renderMandiMarkers(onMandiSelect) {
    markersLayer.clearLayers();

    const district = document.getElementById("map-district-filter")?.value || "ALL";
    const searchQuery = document.getElementById("map-search-input")?.value?.toLowerCase() || "";
    const listContainer = document.getElementById("map-mandis-list");
    if (listContainer) listContainer.innerHTML = "";

    allMandis.forEach((mandi, idx) => {
      // Filter check
      if (district !== "ALL" && mandi.district !== district) return;
      if (searchQuery && !mandi.name.toLowerCase().includes(searchQuery) && !mandi.gujarati_name?.toLowerCase().includes(searchQuery)) return;

      // Road distance
      const straightKm = haversineDistance(currentFarmerLocation.lat, currentFarmerLocation.lng, mandi.latitude, mandi.longitude);
      const roadKm = Math.round(straightKm * 1.25 * 10) / 10;

      // Check radius
      const isInsideRadius = roadKm <= currentRadiusKm;

      // Color coding: Rank 1 = Green, high queue = Orange/Red
      let pinClass = "pin-moderate";
      let rankText = `${idx + 1}`;
      if (idx === 0) pinClass = "pin-optimal";
      if (mandi.current_queue_vehicles > 25) pinClass = "pin-loss";

      const pinIcon = L.divIcon({
        className: `custom-mandi-pin ${pinClass}`,
        html: `<div style="width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:12px;">${rankText}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const marker = L.marker([mandi.latitude, mandi.longitude], {
        icon: pinIcon,
        opacity: isInsideRadius ? 1.0 : 0.45
      }).addTo(markersLayer);

      // Popup Content
      const popupHtml = `
        <div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:240px; padding:4px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px;">
            <div>
              <h4 style="margin:0; font-size:14px; font-weight:700; color:#0f172a;">${mandi.name}</h4>
              <p style="margin:0; font-size:12px; color:#64748b;">${mandi.gujarati_name || ''} (${mandi.district})</p>
            </div>
          </div>
          <div style="background:#f8fafc; padding:8px 10px; border-radius:6px; margin:8px 0; font-size:12px; border:1px solid #e2e8f0;">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span style="color:#64748b;">Road Distance:</span>
              <strong style="color:#0f172a;">${roadKm} km</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
              <span style="color:#64748b;">Gate Queue:</span>
              <strong style="color:${mandi.current_queue_vehicles > 25 ? '#ef4444' : '#10b981'};">${mandi.current_queue_vehicles} Trucks (~${mandi.avg_gate_wait_hours}h wait)</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color:#64748b;">Hamali / Loading:</span>
              <strong style="color:#0f172a;">₹${mandi.hamali_per_quintal}/Q</strong>
            </div>
          </div>
          <button onclick="window.MapComponent.selectMandi('${mandi.id}')" style="width:100%; background:#10b981; color:white; border:none; padding:7px 12px; border-radius:6px; font-weight:600; font-size:12px; cursor:pointer;">
            Select & Optimize Net Profit ➔
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Render into side list
      if (listContainer && isInsideRadius) {
        const item = document.createElement("div");
        item.className = "mandi-item-card";
        item.innerHTML = `
          <div class="mandi-item-header">
            <div>
              <div class="mandi-title">${mandi.name}</div>
              <div class="mandi-sub">${mandi.gujarati_name} • ${mandi.district}</div>
            </div>
            <div class="mandi-price-badge">
              ${roadKm} km
              <div class="mandi-price-mann">~${Math.round((roadKm / 35) * 10) / 10}h trip</div>
            </div>
          </div>
          <div class="mandi-meta-row">
            <span>⏱️ Queue: ${mandi.current_queue_vehicles} trucks</span>
            <span>💰 Hamali: ₹${mandi.hamali_per_quintal}/Q</span>
          </div>
        `;
        item.addEventListener("click", () => {
          map.flyTo([mandi.latitude, mandi.longitude], 12);
          marker.openPopup();
          drawRoute(mandi.latitude, mandi.longitude);
        });
        listContainer.appendChild(item);
      }
    });
  }

  function drawRoute(destLat, destLng) {
    if (routeLine) map.removeLayer(routeLine);
    routeLine = L.polyline([
      [currentFarmerLocation.lat, currentFarmerLocation.lng],
      [destLat, destLng]
    ], {
      color: "#3b82f6",
      weight: 3,
      dashArray: "5, 10"
    }).addTo(map);
  }

  function selectMandi(mandiId) {
    const mandi = allMandis.find(m => m.id === mandiId);
    if (!mandi) return;
    drawRoute(mandi.latitude, mandi.longitude);

    // Switch to calculator tab and recalculate
    const calcTab = document.querySelector('[data-view="calculator"]');
    if (calcTab) calcTab.click();
  }

  function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function invalidateSize() {
    if (map) {
      setTimeout(() => map.invalidateSize(), 150);
    }
  }

  return {
    init,
    selectMandi,
    invalidateSize,
    getFarmerLocation: () => currentFarmerLocation
  };
})();

window.MapComponent = MapComponent;
