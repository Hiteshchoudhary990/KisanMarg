/**
 * My Harvest Profit & Market Distance Finder Component
 * Allows the farmer to enter their crop details and immediately computes
 * the most suitable market, road distance, travel time, and net take-home profit.
 */

const HarvestFinderComponent = (function () {
  let crops = [];

  // Gujarat presets for quick location selection
  const GUJARAT_LOCATIONS = [
    { name: "Gondal Rural (Rajkot)", lat: 21.9619, lng: 70.7937, district: "Rajkot" },
    { name: "Jasdan Taluka (Rajkot)", lat: 22.0336, lng: 71.2066, district: "Rajkot" },
    { name: "Jetpur (Rajkot)", lat: 21.7586, lng: 70.6276, district: "Rajkot" },
    { name: "Unjha Rural (Mehsana)", lat: 23.8038, lng: 72.3926, district: "Mehsana" },
    { name: "Visnagar (Mehsana)", lat: 23.7020, lng: 72.5520, district: "Mehsana" },
    { name: "Amreli Rural (Amreli)", lat: 21.6032, lng: 71.2221, district: "Amreli" },
    { name: "Dhari (Amreli)", lat: 21.3250, lng: 71.0250, district: "Amreli" },
    { name: "Junagadh Rural", lat: 21.5222, lng: 70.4579, district: "Junagadh" },
    { name: "Keshod (Junagadh)", lat: 21.3000, lng: 70.2500, district: "Junagadh" },
    { name: "Botad Rural", lat: 22.1706, lng: 71.6664, district: "Botad" },
    { name: "Halvad (Morbi)", lat: 23.0134, lng: 71.1824, district: "Morbi" },
    { name: "Deesa (Banaskantha)", lat: 24.2586, lng: 72.1818, district: "Banaskantha" }
  ];

  function init(availableCrops) {
    crops = availableCrops;
    populateDropdowns();
    bindEvents();
    // Run initial search
    calculateBestMarket();
  }

  function populateDropdowns() {
    // Populate locations
    const locSelect = document.getElementById("finder-location-select");
    if (locSelect) {
      locSelect.innerHTML = "";
      GUJARAT_LOCATIONS.forEach((loc, idx) => {
        const opt = document.createElement("option");
        opt.value = idx;
        opt.textContent = `📍 ${loc.name}`;
        locSelect.appendChild(opt);
      });
      locSelect.value = "0"; // Default Gondal Rural
    }

    // Populate crops
    const cropSelect = document.getElementById("finder-crop-select");
    if (cropSelect) {
      cropSelect.innerHTML = "";
      crops.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.name} (${c.gujarati_name}) - MSP: ₹${c.govt_msp || 'N/A'}`;
        cropSelect.appendChild(opt);
      });
      cropSelect.value = "CROP-GND"; // Default Groundnut
    }
  }

  function bindEvents() {
    const btn = document.getElementById("finder-submit-btn");
    if (btn) {
      btn.addEventListener("click", calculateBestMarket);
    }

    const moistureSlider = document.getElementById("finder-moisture-slider");
    const moistureVal = document.getElementById("finder-moisture-display");
    if (moistureSlider && moistureVal) {
      moistureSlider.addEventListener("input", (e) => {
        moistureVal.textContent = `${e.target.value}%`;
      });
    }

    // Auto update when inputs change
    const inputs = [
      "finder-location-select",
      "finder-crop-select",
      "finder-qty-input",
      "finder-unit-select",
      "finder-vehicle-select"
    ];
    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", calculateBestMarket);
    });
  }

  async function calculateBestMarket() {
    const locIdx = parseInt(document.getElementById("finder-location-select")?.value || "0", 10);
    const selectedLoc = GUJARAT_LOCATIONS[locIdx] || GUJARAT_LOCATIONS[0];
    
    const cropId = document.getElementById("finder-crop-select")?.value || "CROP-GND";
    const quantity = parseFloat(document.getElementById("finder-qty-input")?.value) || 100;
    const unit = document.getElementById("finder-unit-select")?.value || "quintal";
    const moisture = parseFloat(document.getElementById("finder-moisture-slider")?.value) || 11.5;
    const vehicle = document.getElementById("finder-vehicle-select")?.value || "tractor_trolley";

    const payload = {
      crop_id: cropId,
      gross_quantity: quantity,
      unit: unit,
      farmer_lat: selectedLoc.lat,
      farmer_lng: selectedLoc.lng,
      actual_moisture_pct: moisture,
      foreign_matter_pct: 1.0,
      vehicle_type: vehicle,
      bypass_commission: false,
      max_radius_km: 200
    };

    try {
      const res = await window.ApiClient.calculateNetProfit(payload);
      renderResults(res, selectedLoc);
    } catch (err) {
      console.error("Failed to calculate harvest suitability:", err);
    }
  }

  function renderResults(res, selectedLoc) {
    const container = document.getElementById("finder-results-container");
    if (!container) return;

    if (!res.rankings || res.rankings.length === 0) {
      container.innerHTML = `<div class="glass-card"><p>No APMC mandis found within search radius.</p></div>`;
      return;
    }

    const best = res.rankings[0];
    const second = res.rankings[1];
    const diffText = second ? `+₹${Math.abs(best.net_take_home_profit - second.net_take_home_profit).toLocaleString('en-IN')} higher cash than #2 ${second.mandi_name}` : "Highest profit in state";

    container.innerHTML = `
      <!-- TOP RECOMMENDATION SPOTLIGHT CARD -->
      <div class="glass-card" style="border: 2px solid #10b981; background: linear-gradient(145deg, rgba(16,185,129,0.08) 0%, rgba(18,28,38,0.95) 100%); margin-bottom: 24px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
          <div>
            <span style="font-size: 11px; font-weight: 800; background: #10b981; color: white; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
              🏆 Most Suitable Market Choice
            </span>
            <h2 style="font-size: 24px; font-weight: 800; color: var(--text-primary); margin: 10px 0 4px;">
              ${best.mandi_name}
            </h2>
            <p style="font-size: 14px; color: var(--text-muted); margin: 0;">
              ${best.gujarati_name || ''} • ${best.district} District APMC Yard
            </p>
          </div>

          <!-- Print / Share Button -->
          <div style="display: flex; gap: 8px;">
            <button onclick="window.print()" class="btn btn-outline" style="font-size: 12px; padding: 7px 12px;">
              🖨️ Print Slip
            </button>
            <button onclick="window.HarvestFinderComponent.shareOnWhatsApp('${best.mandi_name}', ${best.distance_km}, ${best.net_take_home_profit})" class="btn btn-primary" style="font-size: 12px; padding: 7px 12px; background: #25D366; border: none;">
              📲 Share on WhatsApp
            </button>
          </div>
        </div>

        <!-- Metric Cards Row -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 20px 0;">
          
          <div style="background: var(--bg-input); padding: 14px; border-radius: 10px; border: 1px solid var(--border-color);">
            <div style="font-size: 12px; color: var(--text-muted);">🛣️ MARKET DISTANCE</div>
            <div style="font-size: 24px; font-weight: 800; color: #3b82f6; margin-top: 4px;">
              ${best.distance_km} km
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              ~${best.travel_hours} hrs travel from ${selectedLoc.name}
            </div>
          </div>

          <div style="background: var(--bg-input); padding: 14px; border-radius: 10px; border: 1px solid var(--border-color);">
            <div style="font-size: 12px; color: var(--text-muted);">💰 NET TAKE-HOME CASH</div>
            <div style="font-size: 24px; font-weight: 800; color: #10b981; margin-top: 4px;">
              ₹${best.net_take_home_profit.toLocaleString('en-IN')}
            </div>
            <div style="font-size: 12px; color: #10b981; margin-top: 2px;">
              ${diffText}
            </div>
          </div>

          <div style="background: var(--bg-input); padding: 14px; border-radius: 10px; border: 1px solid var(--border-color);">
            <div style="font-size: 12px; color: var(--text-muted);">⚖️ EFFECTIVE REALIZED RATE</div>
            <div style="font-size: 24px; font-weight: 800; color: #f59e0b; margin-top: 4px;">
              ₹${best.effective_realized_rate_per_quintal} <span style="font-size: 14px;">/Q</span>
            </div>
            <div style="font-size: 12px; color: var(--accent-gold); margin-top: 2px;">
              ₹${best.effective_realized_rate_per_mann} per Mann (મણ)
            </div>
          </div>

          <div style="background: var(--bg-input); padding: 14px; border-radius: 10px; border: 1px solid var(--border-color);">
            <div style="font-size: 12px; color: var(--text-muted);">⏱️ GATE WAIT & QUEUE</div>
            <div style="font-size: 24px; font-weight: 800; color: ${best.queue_trucks > 25 ? '#ef4444' : '#10b981'}; margin-top: 4px;">
              ${best.queue_trucks} Trucks
            </div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
              ~${best.gate_wait_hours} hrs turnaround time
            </div>
          </div>

        </div>

        <!-- Itemized Deductions Transparency -->
        <div style="background: rgba(0,0,0,0.25); padding: 14px 18px; border-radius: 8px; font-size: 13px; line-height: 1.6; border: 1px solid var(--border-color);">
          <strong style="color: var(--text-primary);">Detailed Cost & Profit Deductions:</strong><br>
          Quoted Gross Value: <strong>₹${best.theoretical_gross_revenue.toLocaleString('en-IN')}</strong> | 
          Transport Freight: <strong style="color:#ef4444;">-₹${best.total_transit_cost.toLocaleString('en-IN')}</strong> | 
          Moisture Cut (${best.moisture_dockage_pct}%): <strong style="color:#ef4444;">-₹${best.moisture_loss_rupees.toLocaleString('en-IN')}</strong> | 
          Hamali/Loading: <strong style="color:#ef4444;">-₹${best.hamali_cost.toLocaleString('en-IN')}</strong> | 
          APMC Cess: <strong style="color:#ef4444;">-₹${best.apmc_cess_cost.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      <!-- ALL NEARBY MARKETS COMPARISON CARDS -->
      <h3 style="font-size: 18px; font-weight: 700; color: var(--text-primary); margin-bottom: 14px;">
        📍 Nearby Markets: Distance vs. Profit Realization
      </h3>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
        ${res.rankings.map((r, idx) => `
          <div class="glass-card" style="position: relative; ${idx === 0 ? 'border-color: #10b981;' : ''}">
            ${idx === 0 ? '<span style="position:absolute; top:12px; right:14px; font-size:10px; background:#10b981; color:white; padding:2px 8px; border-radius:10px; font-weight:700;">BEST CHOICE</span>' : ''}
            
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
              <div class="rank-badge ${idx === 0 ? 'rank-1' : (idx === 1 ? 'rank-2' : 'rank-other')}">${r.rank}</div>
              <div>
                <h4 style="font-size: 15px; font-weight: 700; margin: 0; color: var(--text-primary);">${r.mandi_name}</h4>
                <span style="font-size: 11px; color: var(--text-muted);">${r.gujarati_name || ''} (${r.district})</span>
              </div>
            </div>

            <div style="margin: 12px 0; display: flex; justify-content: space-between; align-items: flex-end; background: var(--bg-input); padding: 10px 12px; border-radius: 8px;">
              <div>
                <div style="font-size: 11px; color: var(--text-muted);">ROAD DISTANCE</div>
                <div style="font-size: 18px; font-weight: 700; color: #3b82f6;">${r.distance_km} km</div>
                <div style="font-size: 11px; color: var(--text-secondary);">Transit: ₹${r.total_transit_cost.toLocaleString('en-IN')}</div>
              </div>

              <div style="text-align: right;">
                <div style="font-size: 11px; color: var(--text-muted);">TAKE-HOME CASH</div>
                <div style="font-size: 18px; font-weight: 800; color: #10b981;">₹${r.net_take_home_profit.toLocaleString('en-IN')}</div>
                <div style="font-size: 11px; color: var(--accent-gold);">₹${r.effective_realized_rate_per_mann}/Mann</div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-secondary); margin-top: 6px;">
              <span>Quoted Rate: <strong>₹${r.quoted_price_per_quintal}/Q</strong></span>
              <span>Wait: <strong>~${r.travel_hours}h trip</strong></span>
            </div>

            <button onclick="window.HarvestFinderComponent.selectForRoute('${r.mandi_id}')" class="btn btn-outline" style="width: 100%; margin-top: 12px; font-size: 12px; padding: 6px 0;">
              🗺️ View Route on Map
            </button>
          </div>
        `).join('')}
      </div>
    `;
  }

  function shareOnWhatsApp(mandiName, distance, profit) {
    const text = encodeURIComponent(
      `🌾 *KisanMarg Harvest Recommendation*\n` +
      `Best Market Choice: *${mandiName}*\n` +
      `Distance: *${distance} km*\n` +
      `Estimated Net Profit: *₹${profit.toLocaleString('en-IN')}*\n` +
      `Calculated via KisanMarg - Smart Mandi Intelligence`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  function selectForRoute(mandiId) {
    if (window.MapComponent) {
      window.MapComponent.selectMandi(mandiId);
    }
  }

  return { init, calculateBestMarket, shareOnWhatsApp, selectForRoute };
})();

window.HarvestFinderComponent = HarvestFinderComponent;
