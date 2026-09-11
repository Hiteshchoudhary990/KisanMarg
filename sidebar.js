/**
 * Sidebar Navigation & Language Manager Component
 */

const SidebarComponent = (function () {
  const currentLang = "en"; // 'en', 'gu', 'hi'

  const TRANSLATIONS = {
    en: {
      brandSub: "Smart APMC Market Intelligence",
      navMap: "Mandi Map Navigator",
      navCalc: "Net Profit Optimizer",
      navDockage: "Grade & Moisture Dockage",
      navQueues: "Live Gate & Queues",
      navTrends: "Price Trends & MSP",
      navBuyers: "Verified Direct Buyers",
      navDistress: "Distress Sale Advisor",
      farmerBase: "Base Location",
      regionalUnitNote: "Gujarat APMC: 1 Mann (મણ) = 20 kg"
    },
    gu: {
      brandSub: "સ્માર્ટ એ.પી.એમ.સી. બજાર માર્ગદર્શક",
      navMap: "માર્કેટ યાર્ડ નકશો",
      navCalc: "ચોખ્ખો નફો કેલ્ક્યુલેટર",
      navDockage: "ગુણવત્તા અને ભેજ કપાત",
      navQueues: "લાઈવ લાઈન અને વાહનો",
      navTrends: "ભાવ વલણ અને ટેકાના ભાવ",
      navBuyers: "ચકાસાયેલ ખરીદદારો / FPO",
      navDistress: "તાત્કાલિક નાણાં સલાહકાર",
      farmerBase: "ખેડૂતનું સ્થળ",
      regionalUnitNote: "ગુજરાત માર્કેટ: ૧ મણ = ૨૦ કિલો"
    },
    hi: {
      brandSub: "स्मार्ट मंडी बाजार इंटेलिजेंस",
      navMap: "मंडी मैप नेविगेटर",
      navCalc: "शुद्ध मुनाफा कैलकुलेटर",
      navDockage: "गुणवत्ता एवं नमी कटौती",
      navQueues: "लाइव गेट और कतार",
      navTrends: "भाव रुझान और MSP",
      navBuyers: "सत्यापित खरीदार / FPO",
      navDistress: "आपातकालीन नकदी सलाहकार",
      farmerBase: "किसान का स्थान",
      regionalUnitNote: "गुजरात मंडी: 1 मण = 20 किग्रा"
    }
  };

  function init() {
    const navItems = document.querySelectorAll(".nav-item");
    const panels = document.querySelectorAll(".view-panel");

    navItems.forEach(item => {
      item.addEventListener("click", () => {
        const targetView = item.getAttribute("data-view");
        
        // Switch active link
        navItems.forEach(n => n.classList.remove("active"));
        item.classList.add("active");

        // Switch active view panel
        panels.forEach(p => {
          if (p.id === `view-${targetView}`) {
            p.classList.add("active");
          } else {
            p.classList.remove("active");
          }
        });

        // Trigger resize for Leaflet map if map view selected
        if (targetView === "map" && window.MapComponent) {
          window.MapComponent.invalidateSize();
        }

        // Close mobile sidebar if open
        const sidebar = document.getElementById("sidebar");
        if (sidebar && sidebar.classList.contains("mobile-open")) {
          sidebar.classList.remove("mobile-open");
        }
      });
    });

    // Language selector listener
    const langSelect = document.getElementById("lang-select");
    if (langSelect) {
      langSelect.addEventListener("change", (e) => {
        applyLanguage(e.target.value);
      });
    }

    // Mobile menu toggle
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    const sidebar = document.getElementById("sidebar");
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
      });
    }
  }

  function applyLanguage(lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (t[key]) el.textContent = t[key];
    });
  }

  return { init, applyLanguage };
})();

window.SidebarComponent = SidebarComponent;
