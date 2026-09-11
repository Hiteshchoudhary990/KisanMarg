/**
 * Farmer Authentication & Profile Manager
 * Handles login, registration, and 1-click Gujarat farmer demo accounts.
 */

const AuthManager = (function () {
  const STORAGE_KEY = "kisanmarg_farmer_session";

  // Pre-configured Gujarat Farmer Demo Profiles
  const DEMO_PROFILES = [
    {
      id: "farmer_01",
      name: "Ramesh Patel",
      phone: "98250 12345",
      district: "Rajkot",
      village: "Gondal Rural",
      lat: 21.9619,
      lng: 70.7937,
      crops: "Groundnut, Wheat, Cotton"
    },
    {
      id: "farmer_02",
      name: "Hasmukh Prajapati",
      phone: "98790 67890",
      district: "Mehsana",
      village: "Unjha Ganj",
      lat: 23.8038,
      lng: 72.3926,
      crops: "Cumin Seeds (Jeera), Mustard"
    },
    {
      id: "farmer_03",
      name: "Devendra Ahir",
      phone: "97240 55443",
      district: "Amreli",
      village: "Amreli Rural",
      lat: 21.6032,
      lng: 71.2221,
      crops: "Cotton, Groundnut, Sesame"
    }
  ];

  let currentUser = null;

  function init() {
    // Check localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        currentUser = JSON.parse(saved);
      } catch (e) {
        currentUser = null;
      }
    } else {
      // Default to Ramesh Patel so user immediately sees a functioning logged-in state!
      currentUser = DEMO_PROFILES[0];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
    }

    renderUserUI();
    bindModalEvents();
  }

  function renderUserUI() {
    const userContainer = document.getElementById("topbar-auth-container");
    if (!userContainer) return;

    if (currentUser) {
      userContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; background: rgba(16,185,129,0.12); padding: 5px 12px; border-radius: 20px; border: 1px solid rgba(16,185,129,0.3);">
          <span style="font-size: 16px;">👨‍🌾</span>
          <div style="font-size: 12px; text-align: left;">
            <strong style="color: #10b981; display: block;">${currentUser.name}</strong>
            <span style="font-size: 10px; color: var(--text-muted);">${currentUser.village}, ${currentUser.district}</span>
          </div>
          <button onclick="window.AuthManager.logout()" class="btn btn-outline" style="padding: 2px 8px; font-size: 11px; margin-left: 6px; border-radius: 12px;">
            Logout
          </button>
        </div>
      `;
    } else {
      userContainer.innerHTML = `
        <button onclick="window.AuthManager.openLoginModal()" class="btn btn-primary" style="font-size: 12px; padding: 6px 14px;">
          🔑 Farmer Login / Register
        </button>
      `;
    }
  }

  function bindModalEvents() {
    const modal = document.getElementById("auth-modal");
    const closeBtn = document.getElementById("auth-modal-close");
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    // Demo profile clicks
    document.querySelectorAll(".demo-farmer-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = btn.getAttribute("data-demo-id");
        const profile = DEMO_PROFILES.find(p => p.id === id);
        if (profile) {
          loginAs(profile);
          if (modal) modal.style.display = "none";
        }
      });
    });

    // Custom Login Form
    const loginForm = document.getElementById("custom-login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("login-name-input")?.value || "Kisan";
        const phone = document.getElementById("login-phone-input")?.value || "9800000000";
        const village = document.getElementById("login-village-input")?.value || "Gujarat";
        const district = document.getElementById("login-district-select")?.value || "Rajkot";

        const customUser = {
          id: "custom_" + Date.now(),
          name: name,
          phone: phone,
          village: village,
          district: district,
          lat: 22.05,
          lng: 70.82,
          crops: "Groundnut, Wheat"
        };
        loginAs(customUser);
        if (modal) modal.style.display = "none";
      });
    }
  }

  function loginAs(profile) {
    currentUser = profile;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    renderUserUI();

    // Notify user
    alert(`Welcome, ${profile.name}! Your farm profile (${profile.village}, ${profile.district}) is now active.`);

    // Switch to harvest finder tab
    const harvestTab = document.querySelector('[data-view="harvest-finder"]');
    if (harvestTab) harvestTab.click();
  }

  function logout() {
    currentUser = null;
    localStorage.removeItem(STORAGE_KEY);
    renderUserUI();
  }

  function openLoginModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) modal.style.display = "flex";
  }

  return {
    init,
    loginAs,
    logout,
    openLoginModal,
    getCurrentUser: () => currentUser
  };
})();

window.AuthManager = AuthManager;
