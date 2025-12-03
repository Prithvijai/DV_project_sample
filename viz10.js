// -----------------------------
// CONFIG
// -----------------------------
const nutrients = ["Protein", "Fiber", "Fat", "Carbohydrates", "Sodium Content", "Water Content"];
const width = 700, height = 700, margin = 80;
const radius = Math.min(width, height) / 2 - margin;
const maxScaleValue = 40;

let allPredData = [];
let allFoodData = [];

// -----------------------------
// SVG & SCALES
// -----------------------------
const svg = d3.select("#chart")
  .attr("width", width)
  .attr("height", height)
  .append("g")
  .attr("transform", `translate(${width / 2}, ${height / 2})`);

const tooltip = d3.select("#tooltip");

const rScale = d3.scaleLinear()
  .range([0, radius])
  .domain([0, maxScaleValue]);

const angleSlice = (Math.PI * 2) / nutrients.length;

// Radar line uses d.value (already clamped)
const radarLine = d3.lineRadial()
  .radius(d => rScale(d.value))
  .angle((d, i) => i * angleSlice)
  .curve(d3.curveLinearClosed);

// -----------------------------
// GRID & AXES
// -----------------------------
for (let i = 1; i <= 4; i++) {
  svg.append("circle")
    .attr("class", "radar-ring")
    .attr("r", (radius / 4) * i);
  svg.append("text")
    .attr("class", "ring-label")
    .attr("y", -(radius / 4) * i + 4)
    .attr("text-anchor", "middle")
    .attr("fill", "#777")
    .text((maxScaleValue / 4) * i);
}

svg.selectAll(".axis-line")
  .data(nutrients)
  .enter()
  .append("line")
  .attr("class", "axis-line")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", (d, i) => radius * Math.cos(angleSlice * i - Math.PI / 2))
  .attr("y2", (d, i) => radius * Math.sin(angleSlice * i - Math.PI / 2))
  .attr("stroke", "#ffffff22");

svg.selectAll(".label")
  .data(nutrients)
  .enter()
  .append("text")
  .attr("class", "label")
  .attr("x", (d, i) => (radius + 25) * Math.cos(angleSlice * i - Math.PI / 2))
  .attr("y", (d, i) => (radius + 25) * Math.sin(angleSlice * i - Math.PI / 2))
  .attr("text-anchor", "middle")
  .attr("fill", "#fff")
  .text(d => d);

// -----------------------------
// LOAD DATA
// -----------------------------
Promise.all([
  d3.csv("PrithviSasikumar_data/pred_food.csv"),
  d3.csv("PrithviSasikumar_data/food.csv")
]).then(([predData, foodData]) => {
  allPredData = predData;
  allFoodData = foodData;
  setupDropdowns(predData, foodData);
}).catch(err => console.error("Error loading CSV:", err));

// -----------------------------
// NAME MAPPING
// -----------------------------
const NAME_MAP_FOOD = {
  "Beef": 'BEEF, GROUND, 95% LN MEAT / 5% FAT, RAW',
  "Chicken": 'CHICKEN, BROILERS OR FRYERS, BREAST, MEAT ONLY, RAW',
  "Lamb": 'LAMB, DOM, LEG, SIRLOIN HALF, LN, 1/4" FAT, CHOIC, RAW',
  "Fish": 'SALMON, ATLANTIC, WILD, RAW',
  "Vegetables": 'VEGETABLES, MXD (CORN,LIMA BNS,PEAS,GRN BNS,CRRT) CND,NO SALT',
  "Turkey": "TURKEY BREAST,PRE-BASTED,MEAT&SKN,CKD,RSTD",

  // Tofu, Beans, Nuts etc will be matched by contains
};

const NAME_MAP_PRED = {
  "Vegan Meat": "Vegan Meat"
};

// -----------------------------
// HELPERS
// -----------------------------
function normalizeText(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanNumber(v) {
  if (v === null || v === undefined || v === "") return 0;
  const n = parseFloat(v.toString().replace(/[^\d.-]/g, ""));
  return isNaN(n) ? 0 : n;
}

function findFoodRow(foodData, name) {
  const mapped = NAME_MAP_FOOD[name] || name;
  const targetNorm = normalizeText(mapped);

  // 1. Exact normalized match
  let row = foodData.find(d => normalizeText(d["Description"]) === targetNorm);
  if (row) return row;

  // 2. Fallback: contains
  row = foodData.find(d => normalizeText(d["Description"]).includes(targetNorm));
  if (row) return row;

  // 3. Last resort: contains simple name (e.g. "tofu")
  const simple = normalizeText(name);
  return foodData.find(d => normalizeText(d["Description"]).includes(simple)) || null;
}

function findPredRow(predData, name) {
  const mapped = NAME_MAP_PRED[name] || name;
  const targetNorm = normalizeText(mapped);
  let row = predData.find(d => normalizeText(d["Food Name"]) === targetNorm);
  if (row) return row;
  return predData.find(d => normalizeText(d["Food Name"]).includes(targetNorm)) || null;
}

// -----------------------------
// DATA RETRIEVAL (FINAL LOGIC)
// -----------------------------
function getValues(predData, foodData, name) {
  if (!name) return null;

  let f = null;
  let p = null;

  if (name === "Vegan Meat") {
    // ONLY from pred_food
    p = findPredRow(predData, name);
  } else {
    // EVERYONE ELSE ONLY from food.csv
    f = findFoodRow(foodData, name);
  }

  if (!f && !p) {
    console.warn(`No data found for "${name}"`);
    return null;
  }

  // Extract from food.csv row
  const fromFood = row => {
    if (!row) return {};
    const sodiumKey = Object.keys(row).find(k => k.toLowerCase().includes("sodium"));
    return {
      Protein: cleanNumber(row["Data.Protein"]),
      Fiber: cleanNumber(row["Data.Fiber"]),
      Fat: cleanNumber(row["Data.Fat.Total Lipid"]),
      Carbohydrates: cleanNumber(row["Data.Carbohydrate"]),
      "Sodium Content": cleanNumber(row[sodiumKey]),
      "Water Content": cleanNumber(row["Data.Water"]),
      Calories: cleanNumber(row["Data.Kilocalories"])
    };
  };

  // Extract from pred_food row (for Vegan Meat)
  const fromPred = row => {
    if (!row) return {};
    return {
      Protein: cleanNumber(row["Protein"]),
      Fiber: cleanNumber(row["Fiber Content"] || row["Fiber"]),
      Fat: cleanNumber(row["Fat"]),
      Carbohydrates: cleanNumber(row["Carbohydrates"]),
      "Sodium Content": cleanNumber(row["Sodium Content"]),
      "Water Content": 0,
      Calories: cleanNumber(row["Calories"])
    };
  };

  const base = name === "Vegan Meat" ? fromPred(p) : fromFood(f);

  return {
    ...base,
    fullSource: name === "Vegan Meat" ? "Predicted Dataset" : "USDA Food Data"
  };
}

// -----------------------------
// DROPDOWNS
// -----------------------------
function setupDropdowns(predData, foodData) {
  const veganOptions = [
    { name: "Tofu", label: "Tofu / Tempeh 🥢" },
    { name: "Beans", label: "Beans / Legumes 🫘" },
    { name: "Vegan Meat", label: "Vegan Meat 🌱" },
    { name: "Quinoa", label: "Quinoa 🌾" }, 
    { name: "Nuts", label: "Nuts / Seeds 🌰" },
    { name: "Vegetables", label: "Mixed Vegetables 🥦" }
    
  ];

  const meatOptions = [
    { name: "Beef", label: "Beef 🥩" },
    { name: "Chicken", label: "Chicken 🍗" },
    { name: "Lamb", label: "Lamb 🐑" },
    { name: "Pork", label: "Pork 🐖" },
    { name: "Fish", label: "Fish 🐟" },
    { name: "Turkey", label: "Turkey 🦃" }    
  ];

  setupSide("Left", veganOptions, meatOptions, predData, foodData);
  setupSide("Right", veganOptions, meatOptions, predData, foodData);
}

function setupSide(side, veganOpts, meatOpts, predData, foodData) {
  const styleSel = d3.select(`#style${side}`);
  const container = d3.select(`#food${side}Container`);

  styleSel.on("change", function () {
    const style = this.value;

    d3.select(`#${side.toLowerCase()}Control`)
      .classed("carnivore", style === "carnivore")
      .classed("vegan", style === "vegan");

    container.transition().duration(200).style("opacity", 0);

    setTimeout(() => {
      container.html("");

      if (style === "vegan") {
        container.html(makeSelectHTML(`food${side}`, "vegan-dropdown", veganOpts));
      } else if (style === "carnivore") {
        container.html(makeSelectHTML(`food${side}`, "meat-dropdown", meatOpts));
      }

      container.classed("active", !!style);
      container.transition().duration(400).style("opacity", 1);

      d3.select(`#food${side}`).on("change", () => updateRadar(predData, foodData));
    }, 250);
  });
}

function makeSelectHTML(id, cssClass, options) {
  let html = `<select id="${id}" class="${cssClass}"><option value="">--- Select Option ---</option>`;
  options.forEach(opt => {
    html += `<option value="${opt.name}">${opt.label}</option>`;
  });
  html += `</select>`;
  return html;
}

// -----------------------------
// SIDE PANEL RENDER
// -----------------------------
function renderInfo(panelId, name, data) {
  const panel = d3.select(`#${panelId}`);
  panel.html("");
  if (!data) return;

  const isLeft = panelId === "leftinfo";
  const styleSel = d3.select(`#style${isLeft ? "Left" : "Right"}`).property("value");
  const headerColor = styleSel === "carnivore" ? "#ff4444" : "#00ff88";

  const rows = [
    ["Calories (kcal)", data.Calories],
    ["Protein (g)", data.Protein],
    ["Fiber (g)", data.Fiber],
    ["Fat (g)", data.Fat],
    ["Carbohydrates (g)", data.Carbohydrates],
    ["Sodium (mg)", data["Sodium Content"]],
    ["Water (g)", data["Water Content"]]
  ];

  panel.append("div")
    .attr("class", "food-header")
    .style("color", headerColor)
    .html(
      `<b>${name}</b><br><small style="color:#aaa;">${data.fullSource}</small>`
    );

  const list = panel.append("ul")
    .attr("class", "nutri-list")
    .style("opacity", 0);

  list.selectAll("li")
    .data(rows)
    .enter()
    .append("li")
    .html(d => `<span class="label">${d[0]}</span><span class="value">${(d[1] ?? 0).toFixed(2)}</span>`);

  list.transition()
    .duration(400)
    .style("opacity", 1);
}

// -----------------------------
// RADAR UPDATE (CLAMP > 40)
// -----------------------------
function updateRadar(predData, foodData) {
  const left = d3.select("#foodLeft").property("value");
  const right = d3.select("#foodRight").property("value");
  if (!left || !right) return;

  const leftData = getValues(predData, foodData, left);
  const rightData = getValues(predData, foodData, right);
  if (!leftData || !rightData) return;

  // Update calories
  d3.select("#leftCalories").html(`${left}<br>${(leftData.Calories || 0).toFixed(0)} kcal`);
  d3.select("#rightCalories").html(`${right}<br>${(rightData.Calories || 0).toFixed(0)} kcal`);

  // Update side panels
  renderInfo("leftinfo", left, leftData);
  addFullFoodDetails("leftinfo", left);

  renderInfo("rightinfo", right, rightData);
  addFullFoodDetails("rightinfo", right);

  const dataset = [
    { name: left, color: "red", values: leftData },
    { name: right, color: "green", values: rightData }
  ];

  svg.selectAll(".radar-shape").remove();
  svg.selectAll(".data-dot").remove();

  dataset.forEach(set => {
    const arr = nutrients.map(axis => {
      const raw = Number(set.values[axis] ?? 0);
      return {
        axis,
        raw,
        value: Math.min(raw, maxScaleValue),
        color: set.color,
        name: set.name
      };
    });

    // Area
    svg.append("path")
      .datum(arr)
      .attr("class", "radar-shape")
      .attr("fill", set.color === "red" ? "rgba(255,0,0,0.35)" : "rgba(0,255,100,0.35)")
      .attr("stroke", set.color)
      .attr("stroke-width", 2)
      .attr("d", radarLine)
      .attr("opacity", 0)
      .attr("transform", "scale(0.8)")
      .transition()
      .duration(900)
      .ease(d3.easeElasticOut)
      .attr("opacity", 1)
      .attr("transform", "scale(1)");

    // Dots (with small offset so both visible)
    const cls = "data-dot-" + set.name.replace(/\s+/g, "");
    svg.selectAll("." + cls)
      .data(arr)
      .enter()
      .append("circle")
      .attr("class", "data-dot " + cls)
      .attr("r", 0)
      .attr("fill", set.color)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .attr("cx", d => {
        const baseX = rScale(d.value) * Math.cos(angleSlice * nutrients.indexOf(d.axis) - Math.PI / 2);
        return baseX + (set.color === "red" ? -3 : 3); // small offset
      })
      .attr("cy", d => {
        const baseY = rScale(d.value) * Math.sin(angleSlice * nutrients.indexOf(d.axis) - Math.PI / 2);
        return baseY;
      })
      .transition()
      .duration(500)
      .delay((d, i) => 600 + i * 80)
      .attr("r", 5);
  });

  // ✅ Combined Tooltip for overlapping values
  const allDots = svg.selectAll(".data-dot");

  allDots
    .on("mouseenter", function (event, d) {
      const sameAxis = svg.selectAll(".data-dot")
        .filter(p => p.axis === d.axis)
        .data();

      let html = `<b>${d.axis}</b><br>`;
      sameAxis.forEach(s => {
        html += `<span style="color:${s.color};font-weight:600;">${s.name}:</span> ${s.raw.toFixed(2)}<br>`;
      });

      tooltip
        .style("opacity", 1)
        .html(html)
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mousemove", event => {
      tooltip
        .style("left", event.pageX + 15 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseleave", () => {
      tooltip.transition().duration(200).style("opacity", 0);
    });
}
function addFullFoodDetails(panelId, name) {
  const panel = d3.select(`#${panelId}`);
  const mappedName = NAME_MAP_FOOD[name] || name;
  const targetNorm = normalizeText(mappedName);

  const f = allFoodData.find(d => normalizeText(d["Description"]).includes(targetNorm));
  if (!f) return;

  // Collect all Data.* fields and clean labels
  const cleanRows = Object.keys(f)
    .filter(k => k.startsWith("Data."))
    .map(k => {
      const val = f[k];
      const num = parseFloat(val);
      if (!val || isNaN(num)) return null;
      const label = k.replace(/^Data\./, "").replace(/\./g, " ");
      return { label, value: num.toFixed(2) };
    })
    .filter(Boolean);

  // Append these rows directly below previous panel content (no line)
  const list = panel.append("ul")
    .attr("class", "nutri-list")
    .style("opacity", 0);

  list.selectAll("li")
    .data(cleanRows)
    .enter()
    .append("li")
    .html(d => `<span class="label">${d.label}</span><span class="value">${d.value}</span>`);

  list.transition().duration(600).style("opacity", 1);
}
