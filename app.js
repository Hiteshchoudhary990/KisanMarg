/**
 * Main Application Orchestrator for KisanMarg
 * Kalpvruksh 2.0 Hackathon Problem P22:
 * Limited Visibility Into Profitable Grain Market Choices (Gujarat Centric)
 */

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🌾 KisanMarg Application Bootstrapping...");

  // 1. Initialize Sidebar Navigation
  if (window.SidebarComponent) {
    window.SidebarComponent.init();
  }

  // 1b. Initialize Farmer Auth Manager
  if (window.AuthManager) {
    window.AuthManager.init();
  }

  // 2. Theme Toggle Listener
  const themeToggle = document.getElementById("theme-toggle-btn");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const nextTheme = current === "light" ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", nextTheme);
      themeToggle.textContent = nextTheme === "light" ? "🌙 Dark" : "☀️ Light";
    });
  }

  // 3. Load Crops and Mandis Data
  try {
    const health = await window.ApiClient.getHealth();
    const statusText = document.getElementById("api-status-text");
    if (statusText) statusText.textContent = health.mode;

    const cropsRes = await window.ApiClient.getCrops();
    const mandisRes = await window.ApiClient.getMandis();

    const crops = cropsRes.crops || [];
    const mandis = mandisRes.mandis || [];

    // Populate District Filter in Map
    populateDistricts(mandis);

    // 4. Initialize Interactive Map
    if (window.MapComponent) {
      window.MapComponent.init(mandis, (mandiId) => {
        window.MapComponent.selectMandi(mandiId);
      });
    }

    // 5. Initialize Crop Profit & Distance Finder (Dashboard Page)
    if (window.HarvestFinderComponent) {
      window.HarvestFinderComponent.init(crops);
    }

    // 6. Initialize Net Profit Optimizer
    if (window.ProfitCalculatorComponent) {
      window.ProfitCalculatorComponent.init(crops);
    }

    // 7. Initialize Gate Queue Tracker
    if (window.QueueTrackerComponent) {
      window.QueueTrackerComponent.init();
    }

    // 8. Initialize Price Trends
    if (window.TrendsViewComponent) {
      window.TrendsViewComponent.init(crops);
    }

    // 9. Initialize Distress Sale Advisor
    if (window.DistressAdvisorComponent) {
      window.DistressAdvisorComponent.init();
    }

    // 10. Initialize Verified Buyers Directory
    initBuyersDirectory();

    // 11. Initialize Grade & Moisture Dockage Inspector
    initDockageInspector(crops);

    console.log("✅ KisanMarg Initialized Successfully with 15 Gujarat APMC Mandis!");
  } catch (err) {
    console.error("Initialization error:", err);
  }
});

function populateDistricts(mandis) {
  const select = document.getElementById("map-district-filter");
  if (!select) return;
  const districts = Array.from(new Set(mandis.map(m => m.district))).sort();
  districts.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = `${d} District`;
    select.appendChild(opt);
  });
}

async function initBuyersDirectory() {
  const container = document.getElementById("buyers-content-area");
  if (!container) return;

  try {
    const res = await window.ApiClient.getBuyers();
    const buyers = res.buyers || [];

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
        ${buyers.map(b => `
          <div class="glass-card">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
              <div>
                <h3 style="font-size: 16px; font-weight: 700; color: var(--text-primary); margin: 0;">${b.name}</h3>
                <p style="font-size: 12px; color: #10b981; margin: 2px 0 0; font-weight: 600;">⭐ ${b.rating} / 5.0 • Verified APMC License</p>
              </div>
              <span style="font-size: 11px; background: rgba(16,185,129,0.12); color: #10b981; padding: 3px 8px; border-radius: 6px; font-weight: 700;">
                ${b.buyer_type}
              </span>
            </div>

            <div style="font-size: 12px; color: var(--text-secondary); margin: 10px 0;">
              <div><strong>License:</strong> <code>${b.verified_license_no}</code></div>
              <div style="margin-top: 4px;"><strong>Payment Terms:</strong> ${b.prompt_payment_terms}</div>
              <div style="margin-top: 4px;"><strong>Direct Procurement:</strong> ${b.preferred_crops}</div>
            </div>

            <div style="margin-top: 14px; display: flex; gap: 8px;">
              <a href="tel:${b.contact_phone}" class="btn btn-primary" style="flex: 1; font-size: 12px; padding: 7px 10px;">
                📞 Direct Call: ${b.contact_phone}
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (e) {
    console.error("Failed to load buyers:", e);
  }
}

function initDockageInspector(crops) {
  const cropSelect = document.getElementById("dockage-crop-select");
  const moistureInput = document.getElementById("dockage-moisture-input");
  const qtyInput = document.getElementById("dockage-qty-input");
  const resultArea = document.getElementById("dockage-results-area");

  if (!cropSelect || !resultArea) return;

  cropSelect.innerHTML = "";
  crops.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.gujarati_name})`;
    cropSelect.appendChild(opt);
  });
  cropSelect.value = "CROP-GND";

  function computeDockage() {
    const crop = crops.find(c => c.id === cropSelect.value) || crops[0];
    const moisture = parseFloat(moistureInput.value) || 12.0;
    const qty = parseFloat(qtyInput.value) || 100;

    const baseM = crop.base_moisture_pct;
    const maxM = crop.max_acceptable_moisture_pct;
    const excess = Math.max(0, moisture - baseM);
    const cutPct = excess * crop.dockage_rate_pct;
    const deductedQty = (qty * cutPct) / 100;
    const payableQty = Math.max(0, qty - deductedQty);
    const isRejected = moisture > maxM;

    const price = (crop.govt_msp || 6000);
    const cashLoss = deductedQty * price;

    resultArea.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-top: 18px;">
        <div class="glass-card">
          <span style="font-size: 11px; color: var(--text-muted);">STANDARD APMC MOISTURE</span>
          <div style="font-size: 22px; font-weight: 800; color: #10b981; margin-top: 4px;">${baseM}% Safe Limit</div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Max limit before rejection: ${maxM}%</div>
        </div>

        <div class="glass-card">
          <span style="font-size: 11px; color: var(--text-muted);">WEIGHT REDUCTION CUT</span>
          <div style="font-size: 22px; font-weight: 800; color: ${cutPct > 0 ? '#ef4444' : '#10b981'}; margin-top: 4px;">
            -${deductedQty.toFixed(2)} Quintals (${(deductedQty * 5).toFixed(1)} Mann)
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Dockage rate: ${cutPct.toFixed(1)}% total cut</div>
        </div>

        <div class="glass-card">
          <span style="font-size: 11px; color: var(--text-muted);">ESTIMATED CASH LOSS</span>
          <div style="font-size: 22px; font-weight: 800; color: ${cashLoss > 0 ? '#ef4444' : '#10b981'}; margin-top: 4px;">
            -₹${cashLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">Based on prevailing market baseline</div>
        </div>
      </div>

      ${isRejected ? `
        <div class="banner-alert banner-warning" style="margin-top: 16px;">
          ⚠️ <strong>APMC GATE REJECTION WARNING:</strong> Moisture of ${moisture}% exceeds the maximum permissible APMC threshold of ${maxM}%. 
          The mandi auctioneer may outright refuse weighment or apply punitive 5% distress cuts. 
          Recommendation: Sun-dry your grain for 48 hours before loading vehicles!
        </div>
      ` : ''}
    `;
  }

  cropSelect.addEventListener("change", computeDockage);
  moistureInput.addEventListener("input", computeDockage);
  qtyInput.addEventListener("input", computeDockage);
  computeDockage();
}
