document.addEventListener("DOMContentLoaded", () => {
  const fi_le = document.getElementById("fillLeft");
  const fi_ri = document.getElementById("fillRight");
  const wa_le = document.getElementById("waveLeft");
  const wa_ri = document.getElementById("waveRight");

  const sv_he = 950;

  const fi_co = document.querySelector("#introPage .figure-container");

  function an_fi(wa, li_pe, du = 1500, co = "#00ff99") {
    if (!wa) return;

    const cl_to = 150;
    const cl_bo = 775;
    const ma_fi_he = cl_bo - cl_to;

    const p = Math.max(10, Math.min(100, li_pe));
    const ta_he = (p / 100) * ma_fi_he;
    const ta_y = cl_bo - ta_he;

    let cu_d = wa.getAttribute("d");
    let cu_ma = cu_d && cu_d.match(/M0,([\d.]+)/);
    let st_y = cu_ma ? parseFloat(cu_ma[1]) : cl_bo;

    const st_ti = performance.now();

    function st_fn(no) {
      const t = Math.min((no - st_ti) / du, 1);

      const ea = 1 - Math.pow(1 - t, 3);
      const ba_y = st_y + (ta_y - st_y) * ea;

      const wa_am = 10;
      const wa_fr = 800;
      const of = Math.sin(no / wa_fr) * 20;

      const d = `
      M0,${ba_y}
      Q150,${ba_y - wa_am + Math.sin(no / 500) * 5} 300,${ba_y + of / 4}
      T550,${ba_y}
      L550,950 L0,950 Z
    `;
      wa.setAttribute("d", d);

      if (t < 1) {
        requestAnimationFrame(st_fn);
      } else {

        requestAnimationFrame(function ri_fn(ts) {
          const of = Math.sin(ts / 1200) * 12;
          const d = `
          M0,${ta_y}
          Q150,${ta_y - wa_am + Math.sin(ts / 800) * 4} 300,${ta_y + of / 4}
          T550,${ta_y}
          L550,950 L0,950 Z
        `;
          wa.setAttribute("d", d);


          requestAnimationFrame(ri_fn);
        });
      }
    }

    requestAnimationFrame(st_fn);
  }

  function cr_bu(co_id, co) {
    const co_el = document.getElementById(co_id);
    if (!co_el) return;

    co_el.innerHTML = "";

    const bu_co = 25;
    const wa = co_id.includes("Left")
      ? document.getElementById("waveLeft")
      : document.getElementById("waveRight");


    function ge_li_y() {
      if (!wa) return 775;
      const d = wa.getAttribute("d");
      const ma = d && d.match(/M0,([\d.]+)/);
      return ma ? parseFloat(ma[1]) : 775;
    }

    for (let i = 0; i < bu_co; i++) {
      sp_bu(co_el, co);
    }

    function sp_bu(co_el, co) {
      const cx = 70 + Math.random() * 260;
      const cy = 740 + Math.random() * 40;
      const r = 2 + Math.random() * 6;
      const bu = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      bu.setAttribute("cx", cx);
      bu.setAttribute("cy", cy);
      bu.setAttribute("r", r);
      bu.setAttribute("fill", co);
      bu.setAttribute("opacity", "0.8");
      co_el.appendChild(bu);

      const ri_sp = 0.4 + Math.random() * 0.6;
      const ph = Math.random() * Math.PI * 2;

      const ri_fn = () => {
        let y = parseFloat(bu.getAttribute("cy"));
        let x = parseFloat(bu.getAttribute("cx"));
        const li_y = ge_li_y();

        bu.setAttribute("cx", x + Math.sin(performance.now() / 600 + ph) * 0.3);
        bu.setAttribute("cy", y - ri_sp);

        if (y - ri_sp > li_y + 3) {
          requestAnimationFrame(ri_fn);
        } else {
          bu.setAttribute("cy", 740 + Math.random() * 40);
          bu.setAttribute("cx", 70 + Math.random() * 260);
          requestAnimationFrame(ri_fn);
        }
      };

      ri_fn();
    }
  }

  function ca_nu(ty, gr) {
    const da = {
      leanBeef: { protein: 25, fat: 11, sat: 4, carb: 0, chol: 84, sod: 75, proc: 1.0 },
      vegan: { protein: 16, fat: 12, sat: 2.9, carb: 7, chol: 0, sod: 300, proc: 3.0 }
    }[ty];
    const sc = gr / 100;
    const pr = da.protein * sc, fa = da.fat * sc, sa_fa = da.sat * sc, ca = da.carb * sc, ch = da.chol * sc, so = da.sod * sc, proc = da.proc;
    const mu = (pr / 100) * 100, fa_pe = (fa / 70) * 100, ch_pe = (ch / 300) * 100, so_pe = (so / 2300) * 100, su = (ca / 275) * 100, he = (sa_fa / 20) * 100;
    const he_ri = he * proc, di = so_pe * proc, pr_ov = Math.max(0, mu - 100), mu_ca = Math.min(mu, 100);
    const ne = he_ri * 0.3 + di * 0.2 + fa_pe * 0.1 + ch_pe * 0.1 + pr_ov * 0.1 + su * 0.05 - mu_ca * 0.15;
    const li = Math.max(10, 100 - ne);
    return { muscle: mu, fat: fa_pe, chol: ch_pe, heart: he_ri, diab: di, sugar: su, life: li };
  }


  const me_in = document.getElementById("meatInput");
  const su_me = document.getElementById("submitMeat");
  const co_re = document.getElementById("comparisonResults");
  const re_ta = document.getElementById("resultsTable");


  function an_li_te(el, fi_va, du = 1500) {
    const fi_te = `Life Expectancy: ${fi_va.toFixed(2)} years`;
    const ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const to_le = fi_te.length;
    const st_ti = performance.now();

    clearInterval(el._flickerTimer);

    el._flickerTimer = setInterval(() => {
      const no = performance.now();
      const pr = Math.min((no - st_ti) / du, 1);
      let di = "";

      for (let i = 0; i < to_le; i++) {
        if (i / to_le < pr) {
          di += fi_te[i];
        } else {
          di += ch[Math.floor(Math.random() * ch.length)];
        }
      }

      el.textContent = di;

      el.style.textShadow = `0 0 ${8 + Math.random() * 12}px currentColor`;

      if (pr >= 1) {
        clearInterval(el._flickerTimer);
        el.textContent = fi_te;
        el.classList.add("animate");
        setTimeout(() => el.classList.remove("animate"), 600);
      }
    }, 40);
  }

  su_me.addEventListener("click", () => {
    const gr = parseFloat(me_in.value);
    if (isNaN(gr) || gr <= 0) return alert("Enter valid grams");
    const be = ca_nu("leanBeef", gr);
    const ve = ca_nu("vegan", gr);

    const me_fi = document.querySelector(".meat-figure");
    if (me_fi) {
      me_fi.classList.remove("animate-aura");
      void me_fi.offsetWidth;
      me_fi.classList.add("animate-aura");
    }

    const ve_fi = document.querySelector(".vegan-figure");
    if (ve_fi) {
      ve_fi.classList.add("aura-visible");
      ve_fi.classList.remove("animate-aura");
      void ve_fi.offsetWidth;
      ve_fi.classList.add("animate-aura");
    }

    re_ta.innerHTML = `
        <tr><td class="leftVal">${ve.muscle.toFixed(1)}</td><td class="metric">Muscle Gain %</td><td class="rightVal">${be.muscle.toFixed(1)}</td></tr>
        <tr><td class="leftVal">${ve.fat.toFixed(1)}</td><td class="metric">Fat Gain %</td><td class="rightVal">${be.fat.toFixed(1)}</td></tr>
        <tr><td class="leftVal">${ve.chol.toFixed(1)}</td><td class="metric">Cholesterol %</td><td class="rightVal">${be.chol.toFixed(1)}</td></tr>
        <tr><td class="leftVal">${ve.heart.toFixed(1)}</td><td class="metric">Heart Attack %</td><td class="rightVal">${be.heart.toFixed(1)}</td></tr>
        <tr><td class="leftVal">${ve.diab.toFixed(1)}</td><td class="metric">Diabetics %</td><td class="rightVal">${be.diab.toFixed(1)}</td></tr>
        <tr><td class="leftVal">${ve.sugar.toFixed(1)}</td><td class="metric">Blood Sugar %</td><td class="rightVal">${be.sugar.toFixed(1)}</td></tr>
      `;
    const ve_te = document.getElementById("lifeVegan");
    const me_te = document.getElementById("lifeMeat");

    if (ve_te && me_te) {

      [ve_te, me_te].forEach(el => {
        if (!el.classList.contains("visible")) el.classList.add("visible");
      });


      an_li_te(ve_te, ve.life);
      an_li_te(me_te, be.life);
    }
    an_fi(wa_le, ve.life, 1500, "#00ff99");
    an_fi(wa_ri, be.life, 1500, "#ff4444");
    cr_bu("bubblesLeft", "#00ff99");
    cr_bu("bubblesRight", "#ff4444");

    co_re.classList.remove("visible");
    if (fi_co) {
      fi_co.classList.add("results-visible");
    }
    setTimeout(() => co_re.classList.add("visible"), 100);
  });

  co_re.classList.remove("visible");
  setTimeout(() => co_re.classList.add("visible"), 100);
});

document.getElementById("exploreBtn").addEventListener("click", () => {
  const ne_el = document.getElementById("comparison");
  if (ne_el) ne_el.scrollIntoView({ behavior: "smooth" });
});
