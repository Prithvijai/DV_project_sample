// =====================
// INDIVIDUAL BACKGROUND + ZOOM CONTROL
// =====================
const BG_DATA = {
  "layer-top": {
    img: "Images/bunw.png",
    transform: "scale(1.5) translateY(-5%)"
  },
  "layer-lettuce": {
    img: "Images/letw.png",
    transform: "scale(1.89) translateY(16%)"
  },
  "layer-cheese": {
    img: "Images/cheesew.png",
    transform: "scale(1.5) translateY(5%)"
  },
  "layer-patty": {
    img: "Images/pattyw.png",
    transform: "scale(1.55) translateY(0%)"
  },
  "layer-bottom": {
    img: "Images/botw.png",
    transform: "scale(1.4) translateY(10%)"
  }
};

const layers = [
  "layer-top",
  "layer-lettuce",
  "layer-cheese",
  "layer-patty",
  "layer-bottom"
];

// =====================
// INTERSECTION OBSERVER LOGIC - EVENLY DISTRIBUTED
// =====================

document.addEventListener("DOMContentLoaded", () => {

  // Observer options - increased threshold for longer visibility
  const options = {
    root: null,
    threshold: 0.5, // Trigger when 50% visible (stays longer)
    rootMargin: "0px"
  };

  let currentLayer = null; // Track current layer to prevent rapid switching

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        console.log("Burger BG Stage:", id);

        // EVENLY DISTRIBUTED MAPPING ACROSS ALL VISUALIZATIONS
        // Viz 1-2: Top Bun
        if (id === 'viz1' || id === 'viz2') {
          if (currentLayer !== 'layer-top') {
            currentLayer = 'layer-top';
            showLayer('layer-top');
          }
        }
        // Viz 3: Lettuce
        else if (id === 'viz3') {
          if (currentLayer !== 'layer-lettuce') {
            currentLayer = 'layer-lettuce';
            showLayer('layer-lettuce');
          }
        }
        // Viz 4: Cheese
        else if (id === 'viz4') {
          if (currentLayer !== 'layer-cheese') {
            currentLayer = 'layer-cheese';
            showLayer('layer-cheese');
          }
        }
        // Viz 5-6-7: Patty
        else if (id === 'viz5_div' || id === 'viz6_div' || id === 'viz7' || id === 'intro' || id === 'outro') {
          if (currentLayer !== 'layer-patty') {
            currentLayer = 'layer-patty';
            showLayer('layer-patty');
          }
        }
        // Viz 9-10: Bottom Bun
        else if (id === 'viz9' || id === 'viz10') {
          if (currentLayer !== 'layer-bottom') {
            currentLayer = 'layer-bottom';
            showLayer('layer-bottom');
          }
        }
        // Viz 11 onwards: Full Burger
        else if (id === 'viz11' || id === 'thankyouPage') {
          if (currentLayer !== 'full') {
            currentLayer = 'full';
            showFull();
          }
        }
      }
    });
  }, options);

  // Elements to observe - expanded to cover all major sections
  const targets = [
    '#viz1', '#viz2', '#viz3', '#viz4', '#viz5_div',
    '#viz6_div', '#viz7', '#viz9', '#viz10', '#viz11', '#thankyouPage', '#intro'
  ];

  targets.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) {
      observer.observe(el);
      console.log("Observing:", selector);
    } else {
      console.warn("Element not found:", selector);
    }
  });

  // Initial state
  showFull();
});


// ========================
// FUNCTIONS
// ========================

// Show full burger
function showFull() {
  const bg = document.getElementById("image-bg");
  if (!bg) return;

  bg.style.opacity = "0";
  bg.style.backgroundImage = "none";
  bg.style.transform = "scale(1) translateY(0)";

  layers.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.style.opacity = "1";
      el.style.transform = "scale(1) translateY(0)";
      el.style.pointerEvents = "none";
    }
  });
}

// Show one layer (zoom)
function showLayer(id) {
  const TOP_LAYERS = ["layer-top", "layer-lettuce", "layer-cheese"];
  const BOTTOM_LAYERS = ["layer-patty", "layer-bottom"];

  const bg = document.getElementById("image-bg");
  if (!bg) return;

  // Apply the correct background + zoom
  if (BG_DATA[id]) {
    bg.style.backgroundImage = `url('${BG_DATA[id].img}')`;
    bg.style.opacity = "0.4"; // Increased from 0.3 for better visibility
    bg.style.transform = BG_DATA[id].transform;
  }

  layers.forEach(layer => {
    const el = document.getElementById(layer);
    if (!el) return;

    if (layer === id) {
      el.style.opacity = "1";

      if (TOP_LAYERS.includes(id)) {
        el.style.transform = "scale(3.5)";
      } else if (BOTTOM_LAYERS.includes(id)) {
        el.style.transform = "scale(3.5) translateY(-25%)";
      }

      // Keep the layer visible longer before fading to background
      setTimeout(() => {
        el.style.opacity = "0";
      }, 1000); // Increased from 500ms

    } else {
      el.style.opacity = "0";
      el.style.transform = "scale(1) translateY(0)";
    }
  });
}
