/**
 * Core Net Profit Optimizer Component
 * Directly addresses Kalpvruksh 2.0 Problem P22:
 * Deceptive Quoted Prices vs. Real Take-Home Cash.
 */

const ProfitCalculatorComponent = (function () {
  let crops = [];
  let currentRankings = [];

  function init(availableCrops) {
    crops = availableCrops;
    populateCropDropdown();
    bindFormEvents();
    recalculate();
  }

  function populateCropDropdown() {
    const cropSelect = document.getElementById("calc-crop-select");
    if (!cropSelect) return;
    cropSelect.innerHTML = "";
    crops.forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.name} (${c.gujarati_name}) - MSP: ₹${c.govt_msp || 'N/A'}`;
      cropSelect.appendChild(opt);
    });
    // Default to Groundnut (Saurashtra staple) or Wheat
    cropSelect.value = "CROP-GND";
  }

  function bindFormEvents() {
    const inputs = [
      "calc-crop-select",
      "calc-quantity",
      "calc-unit-select",
      "calc-moisture-slider",
      "calc-foreign-slider",
      "calc-vehicle-select",
      "calc-fpo-bypass",
      "calc-radius-slider"
    ];

    inputs.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener("input", () => {
          updateSliderDisplays();
          recalculate();
        });
      }
    });

    updateSliderDisplays();
  }

  function updateSliderDisplays() {
    const mSlider = document.getElementById("calc-moisture-slider");
    const mDisplay = document.getElementById("calc-moisture-val");
    if (mSlider && mDisplay) mDisplay.textContent = `${mSlider.value}%`;

    const fSlider = document.getElementById("calc-foreign-slider");
    const fDisplay = document.getElementById("calc-foreign-val");
    if (fSlider && fDisplay) fDisplay.textContent = `${fSlider.value}%`;

    const rSlider = document.getElementById("calc-radius-slider");
    const rDisplay = document.getElementById("calc-radius-val");
    if (rSlider && rDisplay) rDisplay.textContent = `${rSlider.value} km`;
  }

  async function recalculate() {
    const cropId = document.getElementById("calc-crop-select")?.value || "CROP-GND";
    const quantity = parseFloat(document.getElementById("calc-quantity")?.value) || 50;
    const unit = document.getElementById("calc-unit-select")?.value || "quintal";
    const moisture = parseFloat(document.getElementById("calc-moisture-slider")?.value) || 11.5;
    const foreign = parseFloat(document.getElementById("calc-foreign-slider")?.value) || 1.0;
    const vehicle = document.getElementById("calc-vehicle-select")?.value || "tractor_trolley";
    const bypassComm = document.getElementById("calc-fpo-bypass")?.checked || false;
    const radius = parseFloat(document.getElementById("calc-radius-slider")?.value) || 150;

    const farmerLoc = window.MapComponent ? window.MapComponent.getFarmerLocation() : { lat: 22.05, lng: 70.82 };

    const payload = {
      crop_id: cropId,
      gross_quantity: quantity,
      unit: unit,
      farmer_lat: farmerLoc.lat,
      farmer_lng: farmerLoc.lng,
      actual_moisture_pct: moisture,
      foreign_matter_pct: foreign,
      vehicle_type: vehicle,
      bypass_commission: bypassComm,
      max_radius_km: radius
    };

    try {
      const res = await window.ApiClient.calculateNetProfit(payload);
      currentRankings = res.rankings;
      renderResults(res);
    } catch (err) {
      console.error("Calculation failed:", err);
    }
  }

  function renderResults(res) {
    const bannerContainer = document.getElementById("calc-alert-banner");
    const tableBody = document.getElementById("calc-matrix-tbody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    const best = res.rankings[0];
    const deceptive = res.rankings.find(r => r.is_deceptive_winner);

    // Render Educational P22 Banner
    if (bannerContainer) {
      if (deceptive) {
        bannerContainer.className = "banner-alert banner-warning";
        bannerContainer.innerHTML = `
          <div style="font-size: 24px;">⚠️</div>
          <div>
            <strong>Deceptive Quoted Price Trap Detected!</strong><br>
            <strong>${deceptive.mandi_name}</strong> quotes the highest gross price in the region (<strong>₹${deceptive.quoted_price_per_quintal}/Q</strong> or <strong>₹${deceptive.quoted_price_per_mann}/Mann</strong>), 
            but you will actually pocket <strong>₹${Math.abs(deceptive.profit_difference_vs_best).toLocaleString('en-IN')} LESS</strong> take-home cash compared to <strong>${best.mandi_name}</strong> 
            after factoring in extra travel distance (${deceptive.distance_km} km) and gate delay.
          </div>
        `;
        bannerContainer.style.display = "flex";
      } else if (best) {
        bannerContainer.className = "banner-alert banner-success";
        bannerContainer.innerHTML = `
          <div style="font-size: 24px;">💡</div>
          <div>
            <strong>Optimal Market Realization:</strong> Selling your ${res.gross_quantity_quintals} Quintals (${res.gross_quantity_mann} Mann) at 
            <strong>${best.mandi_name}</strong> yields the highest net cash of <strong>₹${best.net_take_home_profit.toLocaleString('en-IN')}</strong> 
            (Effective rate: <strong>₹${best.effective_realized_rate_per_quintal}/Q</strong> / <strong>₹${best.effective_realized_rate_per_mann}/Mann</strong>).
          </div>
        `;
        bannerContainer.style.display = "flex";
      }
    }

    // Render Matrix Rows
    res.rankings.forEach((r, idx) => {
      const tr = document.createElement("tr");
      
      const rankBadgeClass = idx === 0 ? "rank-1" : (idx === 1 ? "rank-2" : "rank-other");
      const diffTag = r.profit_difference_vs_best === 0 
        ? `<span class="diff-tag-pos">⭐ Top Profit</span>`
        : `<span class="diff-tag-neg">-₹${Math.abs(r.profit_difference_vs_best).toLocaleString('en-IN')}</span>`;

      tr.innerHTML = `
        <td>
          <div class="rank-badge ${rankBadgeClass}">${r.rank}</div>
        </td>
        <td>
          <strong>${r.mandi_name}</strong>
          <div style="font-size: 11px; color: var(--text-muted);">${r.gujarati_name || ''} (${r.district})</div>
          ${r.is_deceptive_winner ? '<span style="font-size: 10px; color: #f59e0b; background: rgba(245,158,11,0.1); padding: 1px 5px; border-radius: 4px;">⚠️ Misleading High Quote</span>' : ''}
        </td>
        <td>
          <div><strong>₹${r.quoted_price_per_quintal}</strong> /Q</div>
          <div style="font-size: 11px; color: var(--accent-gold);">₹${r.quoted_price_per_mann} /મણ</div>
        </td>
        <td>
          <div>${r.distance_km} km</div>
          <div style="font-size: 11px; color: var(--text-muted);">Transit: ₹${r.total_transit_cost.toLocaleString('en-IN')}</div>
        </td>
        <td>
          <div>-₹${r.moisture_loss_rupees.toLocaleString('en-IN')}</div>
          <div style="font-size: 11px; color: var(--text-muted);">Cut: ${r.moisture_dockage_pct}%</div>
        </td>
        <td>
          <div style="font-size: 12px;">Cess/Comm: ₹${(r.apmc_cess_cost + r.commission_cost).toLocaleString('en-IN')}</div>
          <div style="font-size: 11px; color: var(--text-muted);">Wait: ~${r.travel_hours}h travel</div>
        </td>
        <td>
          <div class="profit-highlight">₹${r.net_take_home_profit.toLocaleString('en-IN')}</div>
          ${diffTag}
        </td>
        <td>
          <div style="font-weight: 700; color: #10b981;">₹${r.effective_realized_rate_per_quintal} /Q</div>
          <div style="font-size: 11px; color: var(--accent-gold);">₹${r.effective_realized_rate_per_mann} /મણ</div>
        </td>
      `;

      tableBody.appendChild(tr);
    });
  }

  return { init, recalculate };
})();

window.ProfitCalculatorComponent = ProfitCalculatorComponent;
