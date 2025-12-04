// ================================
// LIVE GOOGLE SHEET CSV URL
// ================================
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRX4JFdcOJMJkUJmnMxKWJ9qtmoLofmMdIVwGjg7_04F0B5PnxU58Qvx6ts-IYOvXgYKJZzxfYClr_/pub?output=csv";

// how many latest responses to use for the ratio
// set to null to use ALL rows
const USE_LAST_N_ROWS = null; // e.g. 2 if you want just last 2


// ================================
// FETCH LIVE FORM RESPONSES (with d3.csv)
// ================================
async function loadDietDataFromSheet() {
  try {
    const data = await d3.csv(SHEET_CSV_URL);
    return data;
  } catch (err) {
    console.error("Error loading CSV:", err);
    return [];
  }
}


// ================================
// COUNT DIETS FROM LIVE DATA
// ================================
function countDiet(responses) {
  let vegan = 0;
  let meat = 0;

  // auto-detect the diet column (contains "diet")
  if (!responses.length) return { vegan, meat };

  const sampleRow = responses[0];
  const dietKey = Object.keys(sampleRow).find(k =>
    k.toLowerCase().includes("diet")
  );

  console.log("Diet column detected as:", dietKey);

  responses.forEach(row => {
    const diet = (row[dietKey] || "").trim();

    if (diet === "Vegan") vegan++;
    if (diet === "Meat") meat++;
  });

  return { vegan, meat };
}


// ================================
// APPLY DIAGONAL GRADIENT
// ================================
function applyDynamicGradient(vegan, meat) {
  const total = vegan + meat;
  if (total === 0) return;

  const score = vegan / total;          // 0 = all Meat, 1 = all Vegan
  const splitPoint = 10 + score * 80;   // 10% → 90%

  const meatColor  = "#ee0202ff";
  const veganColor = "#00ff99";

  const gradient = `linear-gradient(45deg,
                    ${meatColor} ${splitPoint}%,
                    ${veganColor} ${splitPoint}%)`;

  console.log("Vegan:", vegan, "Meat:", meat, "Score:", score, "Split:", splitPoint);

  const text = document.getElementById("thankyouText");
  text.style.background = "";
  setTimeout(() => {
    text.style.background = gradient;
    text.style.webkitBackgroundClip = "text";
    text.style.webkitTextFillColor = "transparent";
  }, 30);

  // OPTIONAL: show counts on screen for debugging
  const countsEl = document.getElementById("dietCounts");
  if (countsEl) {
    countsEl.textContent = `Vegan: ${vegan}   |   Meat: ${meat}`;
  }
}


// ================================
// QR CODE FOR YOUR FORM
// ================================
function generateQR() {
  const formURL =
    "https://docs.google.com/forms/d/e/1FAIpQLSeKWhOey2Fnub4We1R65JzPYFEGG86PISleW0Gdp0PWFuuFJA/viewform?usp=dialog";

  const qrAPI =
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(formURL)}`;

  document.getElementById("qrCode").src = qrAPI;
}


// ================================
// INIT
// ================================
document.addEventListener("DOMContentLoaded", async () => {
  generateQR();

  let responses = await loadDietDataFromSheet();

  // if you only want last N responses, slice here
  if (USE_LAST_N_ROWS && responses.length > USE_LAST_N_ROWS) {
    responses = responses.slice(-USE_LAST_N_ROWS);
  }

  console.log("Total responses read:", responses.length);

  const { vegan, meat } = countDiet(responses);
  applyDynamicGradient(vegan, meat);
});
