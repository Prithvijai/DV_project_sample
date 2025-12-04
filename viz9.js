  document.addEventListener("DOMContentLoaded", () => {
    const fillLeft = document.getElementById("fillLeft");   // vegan (green)
    const fillRight = document.getElementById("fillRight"); // meat (red)
    const waveLeft = document.getElementById("waveLeft");
    const waveRight = document.getElementById("waveRight");

    const svgHeight = 950;

    // Keep humans side-by-side
    const container = document.querySelector(".figure-container");
    if (container) {
      container.style.display = "flex";
      container.style.justifyContent = "center";
      container.style.alignItems = "flex-start";
      container.style.gap = "150px";
    }

function animateFill(wave, lifePercent, duration = 1500, color = "#00ff99") {
  if (!wave) return;

  const clipTop = 150;
  const clipBottom = 775;
  const maxFillHeight = clipBottom - clipTop;

  const p = Math.max(10, Math.min(100, lifePercent));
  const targetHeight = (p / 100) * maxFillHeight;
  const targetY = clipBottom - targetHeight;

  // --- ✅ Track current Y position to continue from where it left off ---
  let currentD = wave.getAttribute("d");
  let currentMatch = currentD && currentD.match(/M0,([\d.]+)/);
  let startY = currentMatch ? parseFloat(currentMatch[1]) : clipBottom;

  const startTime = performance.now();

  function step(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = t * (2 - t);
    const baseY = startY + (targetY - startY) * eased;

    const waveAmp = 12;
    const offset = Math.sin(now / 700) * 20;
    const d = `
      M0,${baseY}
      Q150,${baseY - waveAmp} 300,${baseY + offset / 4}
      T550,${baseY}
      L550,950 L0,950 Z
    `;
    wave.setAttribute("d", d);

    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      // Continuous ripple motion
      requestAnimationFrame(function ripple(ts) {
        const offset = Math.sin(ts / 900) * 15;
        const d = `
          M0,${targetY}
          Q150,${targetY - waveAmp} 300,${targetY + offset / 4}
          T550,${targetY}
          L550,950 L0,950 Z
        `;
        wave.setAttribute("d", d);
        requestAnimationFrame(ripple);
      });
    }
  }

  requestAnimationFrame(step);
}
    // helper for respawned bubbles
  function createBubbles(containerId, color) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  const bubbleCount = 25; // number of bubbles
  const wave = containerId.includes("Left")
    ? document.getElementById("waveLeft")
    : document.getElementById("waveRight");

  // find current liquid top (extract Y value from wave path)
  function getLiquidY() {
    if (!wave) return 775;
    const d = wave.getAttribute("d");
    const match = d && d.match(/M0,([\d.]+)/);
    return match ? parseFloat(match[1]) : 775;
  }

  for (let i = 0; i < bubbleCount; i++) {
    spawnBubble(container, color);
  }

  function spawnBubble(container, color) {
    const cx = 70 + Math.random() * 260;
    const cy = 740 + Math.random() * 40;
    const r = 2 + Math.random() * 6;
    const bubble = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bubble.setAttribute("cx", cx);
    bubble.setAttribute("cy", cy);
    bubble.setAttribute("r", r);
    bubble.setAttribute("fill", color);
    bubble.setAttribute("opacity", "0.8");
    container.appendChild(bubble);

    const riseSpeed = 0.4 + Math.random() * 0.6;
    const phase = Math.random() * Math.PI * 2;

    const rise = () => {
      let y = parseFloat(bubble.getAttribute("cy"));
      let x = parseFloat(bubble.getAttribute("cx"));
      const liquidY = getLiquidY(); // dynamic top limit

      // gentle sideways sway
      bubble.setAttribute("cx", x + Math.sin(performance.now() / 600 + phase) * 0.3);
      bubble.setAttribute("cy", y - riseSpeed);

      // if bubble reaches the wave top, reset from bottom again
      if (y - riseSpeed > liquidY + 3) {
        requestAnimationFrame(rise);
      } else {
        bubble.setAttribute("cy", 740 + Math.random() * 40);
        bubble.setAttribute("cx", 70 + Math.random() * 260);
        requestAnimationFrame(rise);
      }
    };

    rise();
  }
}



    // --- Life expectancy formula (from your previous logic) ---
    function calc(type, g) {
      const d = {
        leanBeef:{protein:25,fat:11,sat:4,carb:0,chol:84,sod:75,proc:1.0},
        vegan:{protein:16,fat:12,sat:2.9,carb:7,chol:0,sod:300,proc:3.0}
      }[type];
      const s=g/100;
      const p=d.protein*s,f=d.fat*s,sf=d.sat*s,c=d.carb*s,ch=d.chol*s,so=d.sod*s,pr=d.proc;
      const muscle=(p/100)*100,fatp=(f/70)*100,cholp=(ch/300)*100,sodp=(so/2300)*100,sugar=(c/275)*100,heart=(sf/20)*100;
      const heartRisk=heart*pr,diab=sodp*pr,protOver=Math.max(0,muscle-100),musCap=Math.min(muscle,100);
      const net=heartRisk*0.3+diab*0.2+fatp*0.1+cholp*0.1+protOver*0.1+sugar*0.05-musCap*0.15;
      const life=Math.max(10,100-net);
      return {muscle,fat:fatp,chol:cholp,heart:heartRisk,diab,sugar,life};
    }

    // --- Auto animation on Calculate ---
    const input = document.getElementById("meatInput");
    const button = document.getElementById("submitMeat");
    const comparisonResults = document.getElementById("comparisonResults");
    const resultsTable = document.getElementById("resultsTable");

    // Hacking-style animated number flicker for life expectancy
   // Hacking-style flicker for the full "Life Expectancy: XX.XX years" line
function animateLifeText(element, finalValue, duration = 1500) {
  const finalText = `Life Expectancy: ${finalValue.toFixed(2)} years`;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const totalLength = finalText.length;
  const startTime = performance.now();

  clearInterval(element._flickerTimer);

  element._flickerTimer = setInterval(() => {
    const now = performance.now();
    const progress = Math.min((now - startTime) / duration, 1);
    let display = "";

    // progressively reveal correct characters
    for (let i = 0; i < totalLength; i++) {
      if (i / totalLength < progress) {
        display += finalText[i]; // reveal real letter
      } else {
        // random flickering symbol for unrevealed ones
        display += chars[Math.floor(Math.random() * chars.length)];
      }
    }

    element.textContent = display;

    element.style.textShadow = `0 0 ${8 + Math.random() * 12}px currentColor`;

    if (progress >= 1) {
      clearInterval(element._flickerTimer);
      element.textContent = finalText; // final clean text
      element.classList.add("animate");
      setTimeout(() => element.classList.remove("animate"), 600);
    }
  }, 40); // update every 40ms
}



    button.addEventListener("click", () => {
      const g = parseFloat(input.value);
      if (isNaN(g) || g <= 0) return alert("Enter valid grams");
      const beef = calc("leanBeef", g);
      const vegan = calc("vegan", g);
      // Trigger meat aura animation
      const meatFigure = document.querySelector(".meat-figure");
      if (meatFigure) {
        meatFigure.classList.remove("animate-aura");
        void meatFigure.offsetWidth; // restart animation
        meatFigure.classList.add("animate-aura");
      }
      // Trigger vegan aura animation and ensure visibility
      const veganFigure = document.querySelector(".vegan-figure");
      if (veganFigure) {
        veganFigure.classList.add("aura-visible");   // make visible after first click
        veganFigure.classList.remove("animate-aura");
        void veganFigure.offsetWidth;                // restart animation
        veganFigure.classList.add("animate-aura");
      }



      // update results box
      resultsTable.innerHTML = `
        <tr><td class="leftVal">${vegan.muscle.toFixed(1)}</td><td class="metric">Muscle Gain %</td><td class="rightVal">${beef.muscle.toFixed(1)}</td></tr>
        <tr><td class="leftVal">${vegan.fat.toFixed(1)}</td><td class="metric">Fat Gain %</td><td class="rightVal">${beef.fat.toFixed(1)}</td></tr>
        <tr><td class="leftVal">${vegan.chol.toFixed(1)}</td><td class="metric">Cholesterol %</td><td class="rightVal">${beef.chol.toFixed(1)}</td></tr>
        <tr><td class="leftVal">${vegan.heart.toFixed(1)}</td><td class="metric">Heart Attack %</td><td class="rightVal">${beef.heart.toFixed(1)}</td></tr>
        <tr><td class="leftVal">${vegan.diab.toFixed(1)}</td><td class="metric">Diabetics %</td><td class="rightVal">${beef.diab.toFixed(1)}</td></tr>
        <tr><td class="leftVal">${vegan.sugar.toFixed(1)}</td><td class="metric">Blood Sugar %</td><td class="rightVal">${beef.sugar.toFixed(1)}</td></tr>
      `;
      const veganText = document.getElementById("lifeVegan");
      const meatText = document.getElementById("lifeMeat");

      if (veganText && meatText) {
        // Reveal text only after first click
        [veganText, meatText].forEach(el => {
          if (!el.classList.contains("visible")) el.classList.add("visible");
        });

        // Run the hacking-style animation for both
        animateLifeText(veganText, vegan.life);
        animateLifeText(meatText, beef.life);
      }
      animateFill(waveLeft, vegan.life, 1500, "#00ff99");
      animateFill(waveRight, beef.life, 1500, "#ff4444");
      createBubbles("bubblesLeft", "#00ff99");
      createBubbles("bubblesRight", "#ff4444");



      // Animate appearance (fade + slide)
      comparisonResults.classList.remove("visible");
      setTimeout(() => comparisonResults.classList.add("visible"), 100);
          });

      // Animate appearance (fade + slide)
      comparisonResults.classList.remove("visible");
      setTimeout(() => comparisonResults.classList.add("visible"), 100);
          });

    // Keep explore button scroll
    document.getElementById("exploreBtn").addEventListener("click", () => {
      const next = document.getElementById("comparison");
      if (next) next.scrollIntoView({ behavior: "smooth" });
    });
