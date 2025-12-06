


const sh_cs_ur =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vTRX4JFdcOJMJkUJmnMxKWJ9qtmoLofmMdIVwGjg7_04F0B5PnxU58Qvx6ts-IYOvXgYKJZzxfYClr_/pub?output=csv";

const us_la_n_ro = null;





async function lo_di_da_fr_sh() {
  try {
    const data = await d3.csv(sh_cs_ur);
    return data;
  } catch (err) {
    console.error("Error loading CSV:", err);
    return [];
  }
}





function co_di(responses) {
  let vegan = 0;
  let meat = 0;


  if (!responses.length) return { vegan, meat };

  const sa_ro = responses[0];
  const di_ke = Object.keys(sa_ro).find(k =>
    k.toLowerCase().includes("diet")
  );

  console.log("Diet column detected as:", di_ke);

  responses.forEach(row => {
    const diet = (row[di_ke] || "").trim();

    if (diet === "Vegan") vegan++;
    if (diet === "Meat") meat++;
  });

  return { vegan, meat };
}





function ap_dy_gr(vegan, meat) {
  const total = vegan + meat;
  if (total === 0) return;

  const score = vegan / total;
  const sp_po = 10 + score * 80;

  const me_co = "#ee0202ff";
  const ve_co = "#00ff99";

  const gradient = `linear-gradient(45deg,
                    ${ve_co} ${sp_po}%,
                    ${me_co} ${sp_po}%)`;

  console.log("Vegan:", vegan, "Meat:", meat, "Score:", score, "Split:", sp_po);

  const text = document.getElementById("thankyouText");
  text.style.background = "";
  setTimeout(() => {
    text.style.background = gradient;
    text.style.webkitBackgroundClip = "text";
    text.style.webkitTextFillColor = "transparent";
  }, 30);


  const countsEl = document.getElementById("dietCounts");
  if (countsEl) {
    countsEl.textContent = `Vegan: ${vegan}   |   Meat: ${meat}`;
  }
}





function ge_qr() {
  const fo_ur =
    "https://docs.google.com/forms/d/e/1FAIpQLSeKWhOey2Fnub4We1R65JzPYFEGG86PISleW0Gdp0PWFuuFJA/viewform?usp=dialog";

  const qr_ap =
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(fo_ur)}`;

  document.getElementById("qrCode").src = qr_ap;
}





async function updateGradient() {
  let responses = await lo_di_da_fr_sh();

  if (us_la_n_ro && responses.length > us_la_n_ro) {
    responses = responses.slice(-us_la_n_ro);
  }

  console.log("Total responses read:", responses.length);

  const { vegan, meat } = co_di(responses);
  ap_dy_gr(vegan, meat);
}

document.addEventListener("DOMContentLoaded", async () => {
  ge_qr();

  // Initial load
  await updateGradient();

  // Auto-refresh every 5 seconds
  setInterval(updateGradient, 5000);
});
