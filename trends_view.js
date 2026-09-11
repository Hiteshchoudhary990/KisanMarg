/**
 * Price Trends & MSP Benchmark Component
 */

const TrendsViewComponent = (function () {
  let crops = [];

  function init(availableCrops) {
    crops = availableCrops;
    const select = document.getElementById("trends-crop-select");
    if (select) {
      select.innerHTML = "";
      crops.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.name} (${c.gujarati_name})`;
        select.appendChild(opt);
      });
      select.value = "CROP-GND";
      select.addEventListener("change", renderChart);
    }
    renderChart();
  }

  function renderChart() {
    const cropId = document.getElementById("trends-crop-select")?.value || "CROP-GND";
    const crop = crops.find(c => c.id === cropId) || crops[0];
    const container = document.getElementById("trends-content-area");
    if (!container) return;

    // Simulated 14-day data points for 3 top Gujarat mandis
    const days = ["14d ago", "12d ago", "10d ago", "8d ago", "6d ago", "4d ago", "2d ago", "Today"];
    const baseMsp = crop.govt_msp || 6783;

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div class="glass-card">
          <span style="font-size: 12px; color: var(--text-muted);">GOVERNMENT MSP (2025-26)</span>
          <div style="font-family: var(--font-heading); font-size: 26px; font-weight: 800; color: #3b82f6; margin-top: 4px;">
            ₹${baseMsp.toLocaleString('en-IN')} <span style="font-size: 13px; font-weight: 500;">/Quintal</span>
          </div>
          <div style="font-size: 12px; color: var(--accent-gold); margin-top: 2px;">
            ₹${Math.round(baseMsp / 5).toLocaleString('en-IN')} /Mann (મણ)
          </div>
        </div>

        <div class="glass-card">
          <span style="font-size: 12px; color: var(--text-muted);">TOP GUJARAT APMC (GONDAL)</span>
          <div style="font-family: var(--font-heading); font-size: 26px; font-weight: 800; color: #10b981; margin-top: 4px;">
            ₹${Math.round(baseMsp * 1.08).toLocaleString('en-IN')} <span style="font-size: 13px; font-weight: 500;">/Quintal</span>
          </div>
          <div style="font-size: 12px; color: #10b981; margin-top: 2px;">
            +8.0% Above Central MSP Benchmark
          </div>
        </div>

        <div class="glass-card">
          <span style="font-size: 12px; color: var(--text-muted);">PRICE VOLATILITY INDEX</span>
          <div style="font-family: var(--font-heading); font-size: 26px; font-weight: 800; color: #f59e0b; margin-top: 4px;">
            LOW-MODERATE
          </div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
            Stable arrivals across Saurashtra yards
          </div>
        </div>
      </div>

      <div class="glass-card">
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">14-Day Modal Price Trajectory: Gondal vs Rajkot vs Unjha vs MSP</h3>
        
        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${renderBarComparison("Gondal APMC Yard", Math.round(baseMsp * 1.08), "#10b981", "Highest Groundnut liquidity")}
          ${renderBarComparison("Rajkot Bedi Yard", Math.round(baseMsp * 1.05), "#0ea5e9", "Consistent buyer auctions")}
          ${renderBarComparison("Unjha APMC Yard", Math.round(baseMsp * 1.02), "#8b5cf6", "Premier spice and oilseed hub")}
          ${renderBarComparison("Govt MSP Baseline", baseMsp, "#e2e8f0", "Minimum statutory procurement rate")}
        </div>
      </div>
    `;
  }

  function renderBarComparison(label, price, color, note) {
    const widthPct = Math.min(100, Math.max(30, (price / 8000) * 100));
    return `
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px;">
          <strong style="color: var(--text-primary);">${label}</strong>
          <span style="font-weight: 700; color: ${color};">₹${price.toLocaleString('en-IN')} /Q (₹${Math.round(price/5)}/Mann)</span>
        </div>
        <div style="height: 10px; border-radius: 5px; background: rgba(255,255,255,0.08); overflow: hidden;">
          <div style="height: 100%; width: ${widthPct}%; background: ${color}; border-radius: 5px; transition: width 0.8s ease;"></div>
        </div>
        <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${note}</div>
      </div>
    `;
  }

  return { init };
})();

window.TrendsViewComponent = TrendsViewComponent;
