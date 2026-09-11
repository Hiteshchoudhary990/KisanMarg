/**
 * Distress Sale & Urgent Cash Advisor Component
 * Solves Problem P22: Middleman exploitation during urgent cash needs.
 */

const DistressAdvisorComponent = (function () {
  let warehouses = [];

  async function init() {
    try {
      const res = await window.ApiClient.getWarehouses();
      warehouses = res.warehouses || [];
      render();
    } catch (err) {
      console.error("Failed to load warehouses:", err);
    }
  }

  function render() {
    const container = document.getElementById("distress-content-area");
    if (!container) return;

    container.innerHTML = `
      <div class="banner-alert banner-warning" style="margin-bottom: 24px;">
        <div style="font-size: 24px;">🛡️</div>
        <div>
          <strong>Urgent Cash Need? Don't Sell in Distress!</strong><br>
          Middlemen exploit harvest gluts by offering immediate cash at steep 15-25% discounts. 
          Under the Government of India & Gujarat Warehousing Development and Regulatory Authority (WDRA) scheme, 
          you can deposit your produce in an accredited warehouse and receive an <strong>instant 75-80% bank pledge loan (e-NWR)</strong> 
          against your electronic warehouse receipt within 24 hours at 7% interest!
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 28px;">
        <!-- Option A: Distress Village Middleman -->
        <div class="glass-card" style="border-left: 4px solid #ef4444;">
          <span style="font-size: 11px; font-weight: 700; color: #ef4444; text-transform: uppercase;">Option 1: Distress Village Sale</span>
          <h3 style="font-size: 18px; font-weight: 700; margin: 8px 0;">Local Middleman / Trader</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">Immediate cash at farm gate, but severe 20% price penalty.</p>
          <div style="font-size: 22px; font-weight: 800; color: #ef4444;">-₹75,000 Loss</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">On 50 Quintals of Groundnut</div>
        </div>

        <!-- Option B: Best Mandi via KisanMarg -->
        <div class="glass-card" style="border-left: 4px solid #10b981;">
          <span style="font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase;">Option 2: Smart APMC Mandi</span>
          <h3 style="font-size: 18px; font-weight: 700; margin: 8px 0;">Top APMC Yard (e.g. Gondal)</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">Full competitive auction price minus calculated logistics.</p>
          <div style="font-size: 22px; font-weight: 800; color: #10b981;">₹3,62,000 Net Cash</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Realized within same day</div>
        </div>

        <!-- Option C: WDRA Warehouse Loan -->
        <div class="glass-card" style="border-left: 4px solid #3b82f6;">
          <span style="font-size: 11px; font-weight: 700; color: #3b82f6; text-transform: uppercase;">Option 3: WDRA Pledge Loan</span>
          <h3 style="font-size: 18px; font-weight: 700; margin: 8px 0;">Warehouse Receipt Loan (e-NWR)</h3>
          <p style="font-size: 13px; color: var(--text-secondary); margin-bottom: 12px;">Instant 75% liquidity from SBI/BOB bank; sell after price surge.</p>
          <div style="font-size: 22px; font-weight: 800; color: #3b82f6;">₹2,70,000 Advance Cash</div>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">Plus extra ₹45,000 gain in 3 months</div>
        </div>
      </div>

      <div class="glass-card">
        <h3 style="font-size: 16px; font-weight: 700; margin-bottom: 16px;">Nearby WDRA Accredited Warehouses in Gujarat</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
          ${warehouses.map(w => `
            <div style="background: var(--bg-input); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color);">
              <h4 style="margin: 0 0 6px; font-size: 14px; color: var(--text-primary);">${w.name}</h4>
              <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">${w.district} District | Capacity: ${w.capacity_tonnes} MT</div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
                <span style="color: var(--text-muted);">Storage Charge:</span>
                <strong>₹${w.monthly_storage_rate_per_quintal} /Q /month</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 10px;">
                <span style="color: var(--text-muted);">Pledge Loan Available:</span>
                <strong style="color: #3b82f6;">Up to ${w.pledge_loan_ltv_pct}% Value</strong>
              </div>
              <a href="tel:${w.contact_number}" style="display: inline-block; width: 100%; text-align: center; background: rgba(59, 130, 246, 0.15); color: #60a5fa; padding: 6px 0; border-radius: 6px; font-size: 12px; text-decoration: none; font-weight: 600;">
                📞 Call Warehouse: ${w.contact_number}
              </a>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return { init };
})();

window.DistressAdvisorComponent = DistressAdvisorComponent;
