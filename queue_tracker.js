/**
 * Live APMC Gate & Truck Queue Tracker Component
 */

const QueueTrackerComponent = (function () {
  async function init() {
    const container = document.getElementById("queues-cards-container");
    if (!container) return;

    try {
      const res = await window.ApiClient.getQueues();
      renderQueues(res.queues, container);
    } catch (err) {
      console.error("Failed to load queue telemetry:", err);
    }
  }

  function renderQueues(queues, container) {
    container.innerHTML = "";

    queues.forEach(q => {
      const card = document.createElement("div");
      card.className = "queue-card";

      const congClass = q.congestion_level === "HIGH" ? "cong-high" : (q.congestion_level === "MODERATE" ? "cong-mod" : "cong-low");
      
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; margin: 0; color: var(--text-primary);">${q.mandi_name}</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">${q.district} District APMC Yard</p>
          </div>
          <span class="congestion-badge ${congClass}">${q.congestion_level} TRAFFIC</span>
        </div>

        <div class="truck-counter">
          ${q.trucks_in_queue}
          <span>vehicles at gate</span>
        </div>

        <div style="display: flex; gap: 14px; font-size: 13px; color: var(--text-secondary); margin: 12px 0;">
          <div>⏱️ Turnaround: <strong>~${q.estimated_wait_hours} hrs</strong></div>
          <div>🚜 Unloading Bays: <strong>${q.unloading_bays_active} Active</strong></div>
        </div>

        <div style="background: var(--bg-input); padding: 10px 12px; border-radius: 8px; font-size: 12px; color: var(--text-muted); border: 1px solid var(--border-color); line-height: 1.4;">
          📢 <em>${q.gate_advisory}</em>
        </div>
      `;

      container.appendChild(card);
    });
  }

  return { init };
})();

window.QueueTrackerComponent = QueueTrackerComponent;
