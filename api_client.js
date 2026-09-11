/**
 * KisanMarg Unified API & Fallback Client for Frontend
 */

const ApiClient = (function () {
  let backendAvailable = null;
  const BASE_URL = window.location.origin.includes(":8000") 
    ? "http://127.0.0.1:8000/api" 
    : (window.location.origin.includes("localhost") ? "http://127.0.0.1:8000/api" : "/api");

  let cachedFallbackData = null;

  async function loadFallbackData() {
    if (cachedFallbackData) return cachedFallbackData;
    try {
      const res = await fetch("./data/mandis_gujarat.json");
      if (!res.ok) throw new Error("Fallback JSON not reachable");
      cachedFallbackData = await res.json();
      return cachedFallbackData;
    } catch (err) {
      console.warn("Could not fetch ./data/mandis_gujarat.json directly", err);
      throw err;
    }
  }

  async function checkBackend() {
    if (backendAvailable !== null) return backendAvailable;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);
      const res = await fetch(`${BASE_URL}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      backendAvailable = res.ok;
    } catch (e) {
      backendAvailable = false;
    }
    return backendAvailable;
  }

  // Client-side math engine matching Python logic exactly
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371.0;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function clientSideCalculate(data, params) {
    const crop = data.crops.find(c => c.id === params.crop_id) || data.crops[0];
    const unitMap = { quintal: 1.0, mann: 0.2, bag_50kg: 0.5, metric_ton: 10.0, kg: 0.01 };
    const unitFactor = unitMap[params.unit] || 1.0;
    const grossQuintals = params.gross_quantity * unitFactor;
    const grossMann = grossQuintals * 5.0;

    // Speeds and freight
    const freightRates = { tractor_trolley: 35.0, pickup_truck: 28.0, medium_truck_6w: 55.0, heavy_truck_10w: 75.0 };
    const speeds = { tractor_trolley: 28.0, pickup_truck: 45.0, medium_truck_6w: 40.0, heavy_truck_10w: 38.0 };
    const freightRate = freightRates[params.vehicle_type] || 35.0;
    const speed = speeds[params.vehicle_type] || 35.0;

    // Excess moisture & dockage
    const excessMoisture = Math.max(0, (params.actual_moisture_pct || 12.0) - crop.base_moisture_pct);
    const moistureDockagePct = excessMoisture * crop.dockage_rate_pct;
    const excessForeign = Math.max(0, (params.foreign_matter_pct || 1.0) - 1.5);
    const totalDockagePct = moistureDockagePct + excessForeign;

    const deductedQuintals = grossQuintals * (totalDockagePct / 100.0);
    const payableQuintals = Math.max(0, grossQuintals - deductedQuintals);
    const isRejected = (params.actual_moisture_pct || 12.0) > crop.max_acceptable_moisture_pct;

    const rankings = [];

    data.mandis.forEach(mandi => {
      const roadKm = Math.round(haversine(params.farmer_lat, params.farmer_lng, mandi.latitude, mandi.longitude) * 1.25 * 10) / 10;
      if (params.max_radius_km && roadKm > params.max_radius_km) return;

      const priceItem = data.todays_prices.find(p => p.mandi_id === mandi.id && p.crop_id === crop.id) || {
        modal_price: crop.govt_msp * 1.05,
        price_per_mann: (crop.govt_msp * 1.05) / 5
      };

      const quotedPerQ = priceItem.modal_price;
      const quotedPerMann = priceItem.price_per_mann || (quotedPerQ / 5);
      const theoreticalRevenue = grossQuintals * quotedPerQ;
      const effectiveGrossRevenue = payableQuintals * quotedPerQ;
      const moistureLossRs = theoreticalRevenue - effectiveGrossRevenue;

      // Transit cost
      const roundTripKm = roadKm * 2;
      const freightCost = roundTripKm * freightRate;
      const tollsCost = (roadKm > 45 && params.vehicle_type !== "tractor_trolley") ? Math.round((roadKm / 50) * 110) : 0;
      const totalTransitCost = freightCost + tollsCost;
      const travelHours = Math.round((roadKm / speed) * 10) / 10;

      // Handling & APMC
      const hamali = grossQuintals * (mandi.hamali_per_quintal || 25.0);
      const weighment = mandi.weighment_fee_per_vehicle || 120.0;
      const apmcCess = effectiveGrossRevenue * ((mandi.apmc_cess_pct || 1.0) / 100);
      const commPct = params.bypass_commission ? 0.0 : (mandi.trader_commission_pct || 1.5);
      const commission = effectiveGrossRevenue * (commPct / 100);
      const delayCost = Math.max(0, (mandi.avg_gate_wait_hours || 3.0) - 2.0) * 150.0;

      const totalDeductions = totalTransitCost + hamali + weighment + apmcCess + commission + delayCost + moistureLossRs;
      const netTakeHome = Math.round(effectiveGrossRevenue - (totalTransitCost + hamali + weighment + apmcCess + commission + delayCost));
      const realizedRatePerQ = Math.round((netTakeHome / grossQuintals) * 100) / 100;
      const realizedRatePerMann = Math.round((realizedRatePerQ / 5) * 100) / 100;

      rankings.push({
        mandi_id: mandi.id,
        mandi_name: mandi.name,
        gujarati_name: mandi.gujarati_name,
        district: mandi.district,
        latitude: mandi.latitude,
        longitude: mandi.longitude,
        quoted_price_per_quintal: quotedPerQ,
        quoted_price_per_mann: quotedPerMann,
        distance_km: roadKm,
        travel_hours: travelHours,
        total_transit_cost: totalTransitCost,
        moisture_loss_rupees: Math.round(moistureLossRs),
        moisture_dockage_pct: Math.round(totalDockagePct * 10) / 10,
        hamali_cost: Math.round(hamali),
        weighment_cost: weighment,
        apmc_cess_cost: Math.round(apmcCess),
        commission_cost: Math.round(commission),
        delay_detention_cost: Math.round(delayCost),
        total_deductions: Math.round(totalDeductions),
        net_take_home_profit: netTakeHome,
        effective_realized_rate_per_quintal: realizedRatePerQ,
        effective_realized_rate_per_mann: realizedRatePerMann,
        is_rejected: isRejected,
        rejection_warning: isRejected ? `Moisture ${params.actual_moisture_pct}% exceeds max threshold ${crop.max_acceptable_moisture_pct}%. Pre-drying required.` : "",
        queue_trucks: mandi.current_queue_vehicles || 15
      });
    });

    rankings.sort((a, b) => b.net_take_home_profit - a.net_take_home_profit);

    if (rankings.length > 0) {
      const best = rankings[0];
      const highestQuoted = [...rankings].sort((a, b) => b.quoted_price_per_quintal - a.quoted_price_per_quintal)[0];

      rankings.forEach((r, idx) => {
        r.rank = idx + 1;
        r.profit_difference_vs_best = r.net_take_home_profit - best.net_take_home_profit;
        if (r.mandi_id === highestQuoted.mandi_id && r.rank > 1) {
          r.is_deceptive_winner = true;
          r.deceptive_warning = `⚠️ DECEPTIVE HIGH QUOTE: Quotes highest market rate (₹${r.quoted_price_per_quintal}/Q), but yields ₹${Math.abs(r.profit_difference_vs_best).toLocaleString('en-IN')} LESS take-home cash than ${best.mandi_name} due to road distance and gate deductions.`;
        } else {
          r.is_deceptive_winner = false;
          r.deceptive_warning = "";
        }
      });
    }

    return {
      crop_id: crop.id,
      crop_name: crop.name,
      gross_quantity_quintals: grossQuintals,
      gross_quantity_mann: grossMann,
      best_mandi_id: rankings[0] ? rankings[0].mandi_id : "",
      best_mandi_name: rankings[0] ? rankings[0].mandi_name : "",
      max_take_home_profit: rankings[0] ? rankings[0].net_take_home_profit : 0,
      total_mandis_compared: rankings.length,
      rankings: rankings
    };
  }

  return {
    async getHealth() {
      const isOnline = await checkBackend();
      return { online: isOnline, mode: isOnline ? "Live FastAPI Service" : "Offline / Static Client Engine" };
    },

    async getCrops() {
      const isOnline = await checkBackend();
      if (isOnline) {
        try {
          const res = await fetch(`${BASE_URL}/crops`);
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      const data = await loadFallbackData();
      return { count: data.crops.length, crops: data.crops };
    },

    async getMandis(district) {
      const isOnline = await checkBackend();
      if (isOnline) {
        try {
          const url = district ? `${BASE_URL}/mandis?district=${encodeURIComponent(district)}` : `${BASE_URL}/mandis`;
          const res = await fetch(url);
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      const data = await loadFallbackData();
      let mandis = data.mandis;
      if (district) mandis = mandis.filter(m => m.district.toLowerCase() === district.toLowerCase());
      return { count: mandis.length, mandis };
    },

    async calculateNetProfit(params) {
      const isOnline = await checkBackend();
      if (isOnline) {
        try {
          const res = await fetch(`${BASE_URL}/calculate-net-profit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params)
          });
          if (res.ok) return await res.json();
        } catch (e) {
          console.warn("Backend call failed, fallback calculation", e);
        }
      }
      const data = await loadFallbackData();
      return clientSideCalculate(data, params);
    },

    async getQueues() {
      const isOnline = await checkBackend();
      if (isOnline) {
        try {
          const res = await fetch(`${BASE_URL}/queues`);
          if (res.ok) return await res.json();
        } catch (e) {}
      }
      const data = await loadFallbackData();
      return {
        queues: data.mandis.map(m => ({
          mandi_id: m.id,
          mandi_name: m.name,
          district: m.district,
          latitude: m.latitude,
          longitude: m.longitude,
          trucks_in_queue: m.current_queue_vehicles,
          estimated_wait_hours: m.avg_gate_wait_hours,
          unloading_bays_active: m.current_queue_vehicles > 20 ? 6 : 4,
          congestion_level: m.current_queue_vehicles > 25 ? "HIGH" : (m.current_queue_vehicles > 14 ? "MODERATE" : "LOW"),
          gate_advisory: "Peak arrivals 8:30 AM - 11:30 AM. Electronic weighbridge active."
        }))
      };
    },

    async getWarehouses() {
      const data = await loadFallbackData();
      return { warehouses: data.warehouses || [] };
    },

    async getBuyers(mandiId) {
      const data = await loadFallbackData();
      let buyers = data.buyers || [];
      if (mandiId) buyers = buyers.filter(b => b.mandi_id === mandiId);
      return { buyers };
    }
  };
})();

window.ApiClient = ApiClient;
