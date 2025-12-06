
let li_da = [];
let sl_da = {};
let sl_ti_se = {};
let se_an = null;

function pa_ti_to_we(ti_st) {
    const cl = ti_st.replace(/\*/g, '').replace(/Up to\s+/i, '').trim();
    const ra_ma = cl.match(/(\d+\.?\d*)-(\d+\.?\d*)\s*(day|days|week|weeks|month|months|year|years)/i);
    if (ra_ma) {
        const min = parseFloat(ra_ma[1]);
        const max = parseFloat(ra_ma[2]);
        const avg = (min + max) / 2;
        const un = ra_ma[3].toLowerCase();
        return co_to_we(avg, un);
    }
    const si_ma = cl.match(/(\d+\.?\d*)\s*(day|days|week|weeks|month|months|year|years)/i);
    if (si_ma) {
        const va = parseFloat(si_ma[1]);
        const un = si_ma[2].toLowerCase();
        return co_to_we(va, un);
    }
    return 0;
}

function co_to_we(va, un) {
    const un_lo = un.toLowerCase();
    if (un_lo.startsWith('day')) return va / 7;
    if (un_lo.startsWith('week')) return va;
    if (un_lo.startsWith('month')) return va * 4.33;
    if (un_lo.startsWith('year')) return va * 52;
    return 0;
}

function ma_sp_to_sl_da(ca) {
    const mp = {
        'Chickens': 'chickens',
        'Cows': 'cattle',
        'Pigs': 'pigs',
        'Sheep': 'sheep',
        'Goats': 'goat',
        'Ducks': 'ducks',
        'Geese': 'geese',
        'Turkeys': 'turkeys',
        'Rabbits': 'rabbits'
    };
    return mp[ca] || null;
}

function ge_an_co(sp) {
    return '#B71C1C';
}


async function lo_al_da() {
    try {
        const li_ra = await d3.csv('Rishikumar_data/lifespan.csv');
        const sl_ra = await d3.csv('Rishikumar_data/Land animals slaughter.csv');

        const sl_by_an = {};
        const ti_se_by_an = {};

        sl_ra.forEach(ro => {
            const it = ro.Item?.toLowerCase() || '';
            const ye = parseInt(ro.Year);
            const va = parseFloat(ro.Value);

            if (va && !isNaN(va) && ye >= 1961) {
                let an_ty = null;
                if (it.includes('cattle')) an_ty = 'cattle';
                else if (it.includes('chicken')) an_ty = 'chickens';
                else if (it.includes('pig')) an_ty = 'pigs';
                else if (it.includes('sheep')) an_ty = 'sheep';
                else if (it.includes('goat')) an_ty = 'goat';
                else if (it.includes('duck')) an_ty = 'ducks';
                else if (it.includes('turk')) an_ty = 'turkeys';
                else if (it.includes('rabbit') || it.includes('hare')) an_ty = 'rabbits';
                else if (it.includes('geese')) an_ty = 'geese';

                if (an_ty) {
                    if (ye === 2022) {
                        sl_by_an[an_ty] = (sl_by_an[an_ty] || 0) + va;
                    }
                    if (!ti_se_by_an[an_ty]) {
                        ti_se_by_an[an_ty] = {};
                    }
                    ti_se_by_an[an_ty][ye] = (ti_se_by_an[an_ty][ye] || 0) + va;
                }
            }
        });

        sl_da = sl_by_an;
        sl_ti_se = ti_se_by_an;

        const gr_da = {};
        li_ra.forEach(ro => {
            if (!ro.species || !ro.typical_slaughter_age || !ro.natural_lifespan) return;

            const sp = ro.species;
            let ca = sp;

            if (sp.toLowerCase().includes('chicken')) {
                ca = 'Chickens';
            } else if (sp.toLowerCase().includes('cattle') || sp.toLowerCase().includes('cow') || sp.toLowerCase().includes('beef') || sp.toLowerCase().includes('veal')) {
                ca = 'Cows';
            } else if (sp.toLowerCase().includes('pig')) {
                ca = 'Pigs';
            } else if (sp.toLowerCase().includes('lamb')) {
                ca = 'Sheep';
            } else {
                ca = sp;
            }

            if (!gr_da[ca]) {
                gr_da[ca] = {
                    entries: [],
                    slaughterWeeks: [],
                    naturalWeeks: []
                };
            }

            gr_da[ca].entries.push(ro);
            gr_da[ca].slaughterWeeks.push(pa_ti_to_we(ro.typical_slaughter_age));
            gr_da[ca].naturalWeeks.push(pa_ti_to_we(ro.natural_lifespan));
        });

        li_da = Object.keys(gr_da).map(ca => {
            const gr = gr_da[ca];
            const av_sl_we = gr.slaughterWeeks.reduce((a, b) => a + b, 0) / gr.slaughterWeeks.length;
            const av_na_we = gr.naturalWeeks.reduce((a, b) => a + b, 0) / gr.naturalWeeks.length;
            const an_ty = ma_sp_to_sl_da(ca);
            const sl_vo = an_ty ? sl_da[an_ty] : null;

            return {
                species: ca,
                slaughterWeeks: av_sl_we,
                naturalWeeks: av_na_we,
                slaughterVolume: sl_vo,
                color: ge_an_co(ca)
            };
        });

        li_da.sort((a, b) => (b.naturalWeeks - b.slaughterWeeks) - (a.naturalWeeks - a.slaughterWeeks));

        in_vi();
    } catch (er) {
        console.error('Error loading CSV data:', er);
    }
}

function in_vi() {
    cr_dr();
    cr_pl();
}

function cr_dr() {
    const dr = d3.select("#animal-selector");
    dr.append("option").attr("value", "").text("Select an animal to explore...");

    li_da.forEach(d => {
        dr.append("option").attr("value", d.species).text(d.species);
    });

    dr.on("change", function () {
        const se = this.value;
        if (se) {
            se_an = li_da.find(d => d.species === se);
            up_vi();
        }
    });
}


function cr_pl() {
    const co = d3.select("#split-viz-container");
    co.html("");

    const ov_di = co.append("div")
        .style("padding", "0.5rem 1rem")
        .style("width", "100%")
        .style("max-width", "1500px")
        .style("margin", "0 auto")
        .style("background", "transparent")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "center");

    ov_di.append("h3")
        .style("text-align", "center")
        .style("font-size", "28px")
        .style("font-weight", "700")
        .style("color", "#9AD1B3")
        .style("margin-bottom", "0.25rem")
        .style("margin-top", "0")
        .style("opacity", "0")
        .style("font-family", "'Outfit', sans-serif")
        .style("font-style", "italic")
        .text("Compare Animal Lifespans")
        .transition().duration(600).style("opacity", "1");

    ov_di.append("p")
        .style("text-align", "center")
        .style("font-size", "14px")
        .style("color", "#9E9E9E")
        .style("margin-bottom", "0.75rem")
        .style("opacity", "0")
        .html("Click on any animal to explore detailed insights. <span style='color: #EF5350; font-weight: 600;'>Red</span> shows farming reality, <span style='color: #9E9E9E; font-weight: 600;'>gray</span> shows natural potential")
        .transition().duration(600).delay(200).style("opacity", "1");

    const wi = 1000;
    const he = 650;
    const ma = { top: 15, right: 120, bottom: 50, left: 120 };
    const in_wi = wi - ma.left - ma.right;
    const in_he = he - ma.top - ma.bottom;

    const sv = ov_di.append("svg")
        .attr("width", wi)
        .attr("height", he)
        .style("opacity", "0")
        .style("background", "rgba(0, 0, 0, 0.3)")
        .style("border-radius", "16px");

    sv.transition().duration(600).delay(400).style("opacity", "1");

    const g = sv.append("g").attr("transform", `translate(${ma.left}, ${ma.top})`);

    const so_da = li_da.slice().sort((a, b) => (b.naturalWeeks - b.slaughterWeeks) - (a.naturalWeeks - a.slaughterWeeks));

    const ma_we = d3.max(so_da, d => d.naturalWeeks);
    const x_sc = d3.scaleLinear().domain([0, ma_we]).range([0, in_wi]);
    const y_sc = d3.scaleBand().domain(so_da.map(d => d.species)).range([0, in_he]).padding(0.3);

    const an_gr = g.selectAll(".animal-group")
        .data(so_da)
        .enter().append("g")
        .attr("class", "animal-group")
        .attr("transform", d => `translate(0, ${y_sc(d.species)})`)
        .style("cursor", "pointer")
        .style("opacity", "0");


    const na_ba = an_gr.append("rect")
        .attr("class", "natural-bar")
        .attr("x", 0).attr("y", 0)
        .attr("width", 0)
        .attr("height", y_sc.bandwidth())
        .attr("fill", "#4A4A4A")
        .attr("rx", 6);


    const sl_ba = an_gr.append("rect")
        .attr("class", "slaughter-bar")
        .attr("x", 0).attr("y", 0)
        .attr("width", 0)
        .attr("height", y_sc.bandwidth())
        .attr("fill", "#EF5350")
        .attr("rx", 6)
        .attr("opacity", 0.95);


    const ob = new IntersectionObserver((en) => {
        en.forEach(entry => {
            if (entry.isIntersecting) {

                an_gr.transition().duration(400).delay((d, i) => 100 + i * 80).style("opacity", "1");


                na_ba.transition().duration(800).delay((d, i) => 200 + i * 80)
                    .attr("width", d => x_sc(d.naturalWeeks));


                sl_ba.transition().duration(800).delay((d, i) => 400 + i * 80)
                    .attr("width", d => x_sc(d.slaughterWeeks));

                ob.disconnect();
            }
        });
    }, { threshold: 0.3 });

    const ch_el = document.getElementById("split-viz-container");
    if (ch_el) ob.observe(ch_el);

    an_gr.append("text")
        .attr("x", -12).attr("y", y_sc.bandwidth() / 2).attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("font-size", "15px")
        .attr("font-weight", "600")
        .attr("fill", "#E0E0E0")
        .text(d => d.species);

    an_gr.append("text")
        .attr("class", "percent-label")
        .attr("x", in_wi + 15).attr("y", y_sc.bandwidth() / 2).attr("dy", "0.35em")
        .attr("font-size", "13px")
        .attr("font-weight", "600")
        .attr("fill", "#EF5350")
        .text(d => {
            const pe = ((d.slaughterWeeks / d.naturalWeeks) * 100).toFixed(0);
            return `${pe}% lived`;
        });

    an_gr
        .on("mouseenter", function (ev, d) {
            d3.select(this).select(".natural-bar").transition().duration(200).attr("fill", "#5A5A5A");
            d3.select(this).select(".slaughter-bar").transition().duration(200).attr("fill", "#FF6B6B").attr("opacity", 1);
            d3.select(this).select(".percent-label").transition().duration(200).attr("font-size", "14px").attr("font-weight", "700");
        })
        .on("mouseleave", function (ev, d) {
            d3.select(this).select(".natural-bar").transition().duration(200).attr("fill", "#4A4A4A");
            d3.select(this).select(".slaughter-bar").transition().duration(200).attr("fill", "#EF5350").attr("opacity", 0.95);
            d3.select(this).select(".percent-label").transition().duration(200).attr("font-size", "13px").attr("font-weight", "600");
        })
        .on("click", function (ev, d) {
            d3.select("#split-viz-container")
                .transition().duration(400).style("opacity", 0)
                .on("end", () => {
                    se_an = d;
                    document.getElementById("animal-selector").value = d.species;
                    up_vi();
                    d3.select("#split-viz-container").style("opacity", 0).transition().duration(600).style("opacity", 1);
                });
        });

    const x_ax = d3.axisBottom(x_sc).ticks(8).tickFormat(d => `${(d / 52).toFixed(0)}y`);
    const x_ax_gr = g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${in_he})`)
        .call(x_ax)
        .style("opacity", "0");

    x_ax_gr.selectAll("text").attr("fill", "#9E9E9E").attr("font-size", "12px");
    x_ax_gr.selectAll("line").attr("stroke", "#555");
    x_ax_gr.select(".domain").attr("stroke", "#555");
    x_ax_gr.transition().duration(600).delay(1500).style("opacity", "1");

    g.append("text")
        .attr("x", in_wi / 2).attr("y", in_he + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("fill", "#9E9E9E")
        .style("opacity", "0")
        .text("Natural Lifespan (years)")
        .transition().duration(600).delay(1600).style("opacity", "1");
}

function up_vi() {
    if (!se_an) return;

    const co = d3.select("#split-viz-container");
    co.html("");

    const ba_bu = co.append("div")
        .style("position", "absolute")
        .style("top", "-0.5rem").style("left", "0.5rem")
        .style("display", "inline-flex")
        .style("align-items", "center")
        .style("gap", "0.4rem")
        .style("padding", "0.35rem 0.75rem")
        .style("background", "#1a1a1a")
        .style("border", "1px solid #333333")
        .style("border-radius", "6px")
        .style("font-size", "11px")
        .style("font-weight", "500")
        .style("color", "#e0e0e0")
        .style("cursor", "pointer")
        .style("transition", "all 0.2s ease")
        .style("z-index", "10")
        .style("opacity", "0")
        .html("&larr; Back to overview");

    ba_bu.transition().duration(400).delay(200).style("opacity", "1");

    ba_bu
        .on("mouseenter", function () {
            d3.select(this).style("background", "#333333").style("border-color", "#B71C1C").style("color", "#B71C1C").style("transform", "translateX(-2px)");
        })
        .on("mouseleave", function () {
            d3.select(this).style("background", "#1a1a1a").style("border-color", "#333333").style("color", "#e0e0e0").style("transform", "translateX(0)");
        })
        .on("click", function () {
            d3.select("#split-viz-container")
                .transition().duration(300).style("opacity", 0)
                .on("end", () => {
                    se_an = null;
                    document.getElementById("animal-selector").value = "";
                    cr_pl();
                    d3.select("#split-viz-container").style("opacity", 0).transition().duration(400).style("opacity", 1);
                });
        });

    const le_pa = co.append("div").attr("class", "viz-panel left-panel");
    const ri_pa = co.append("div").attr("class", "viz-panel right-panel");

    const le_ti = le_pa.append("h3").attr("class", "panel-title");
    le_ti.append("span").text("Natural Life vs Reality: ");
    le_ti.append("span").style("color", "#EF5350").text(se_an.species);
    dr_li_ba(le_pa);

    const ri_ti = ri_pa.append("h3").attr("class", "panel-title");
    ri_ti.append("span").text("Global Slaughter Over Time: ");
    ri_ti.append("span").style("color", "#EF5350").text(se_an.species);
    dr_ti_se(ri_pa);
}


function dr_li_ba(co) {
    const wi = 650;
    const he = 420;
    const ma = { top: 60, right: 60, bottom: 60, left: 60 };
    const in_wi = wi - ma.left - ma.right;
    const in_he = he - ma.top - ma.bottom;

    const sv = co.append("svg").attr("width", wi).attr("height", he);
    const g = sv.append("g").attr("transform", `translate(${ma.left}, ${ma.top})`);

    const ma_we = se_an.naturalWeeks;
    const x_sc = d3.scaleLinear().domain([0, ma_we]).range([0, in_wi]);
    const y_po = in_he / 2;

    const sl_ye = (se_an.slaughterWeeks / 52).toFixed(1);
    const na_ye = (ma_we / 52).toFixed(1);
    const pe_li = ((se_an.slaughterWeeks / ma_we) * 100).toFixed(0);
    const pe_st = (100 - pe_li).toFixed(0);

    const le_gr = g.append("g").attr("opacity", 0);
    le_gr.append("text").attr("x", 0).attr("y", -20).attr("font-size", "28px").attr("font-weight", "700").attr("fill", "#EF5350").text(`${Math.round(se_an.slaughterWeeks)} weeks`);
    le_gr.append("text").attr("x", 0).attr("y", 0).attr("font-size", "14px").attr("fill", "#9E9E9E").text("Slaughtered at");
    le_gr.append("text").attr("x", 0).attr("y", 20).attr("font-size", "16px").attr("font-weight", "600").attr("fill", "#EF5350").text(`(${sl_ye} years old)`);
    le_gr.transition().duration(600).delay(1200).attr("opacity", 1);

    const ri_gr = g.append("g").attr("opacity", 0);
    ri_gr.append("text").attr("x", in_wi).attr("y", -20).attr("text-anchor", "end").attr("font-size", "28px").attr("font-weight", "700").attr("fill", "#9E9E9E").text(`${Math.round(ma_we)} weeks`);
    ri_gr.append("text").attr("x", in_wi).attr("y", 0).attr("text-anchor", "end").attr("font-size", "14px").attr("fill", "#9E9E9E").text("Natural lifespan");
    ri_gr.append("text").attr("x", in_wi).attr("y", 20).attr("text-anchor", "end").attr("font-size", "16px").attr("font-weight", "600").attr("fill", "#9E9E9E").text(`(${na_ye} years)`);
    ri_gr.transition().duration(600).delay(700).attr("opacity", 1);

    g.append("rect").attr("x", 0).attr("y", y_po - 20).attr("width", 0).attr("height", 40).attr("fill", "#4A4A4A").attr("rx", 6).transition().duration(800).attr("width", x_sc(ma_we));
    g.append("rect").attr("x", 0).attr("y", y_po - 20).attr("width", 0).attr("height", 40).attr("fill", "#EF5350").attr("rx", 6).attr("opacity", 0.95).transition().duration(1000).delay(400).attr("width", x_sc(se_an.slaughterWeeks));

    const cu_li_x = x_sc(se_an.slaughterWeeks);
    const cu_li = g.append("line").attr("x1", cu_li_x).attr("x2", cu_li_x).attr("y1", y_po - 35).attr("y2", y_po + 35).attr("stroke", "#EF5350").attr("stroke-width", 3).attr("stroke-dasharray", "5,5").attr("opacity", 0);
    cu_li.transition().duration(600).delay(1400).attr("opacity", 0.9);

    function pu_ls() {
        cu_li.transition().duration(1200).attr("opacity", 0.5).transition().duration(1200).attr("opacity", 0.9).on("end", pu_ls);
    }
    setTimeout(pu_ls, 2000);

    g.append("text").attr("x", cu_li_x).attr("y", y_po - 45).attr("text-anchor", "middle").attr("font-size", "20px").attr("opacity", 0).text("✂").transition().duration(400).delay(1600).attr("opacity", 0.7);

    const pe_li_bo = g.append("g").attr("transform", `translate(0, ${y_po + 70})`).attr("opacity", 0);
    pe_li_bo.append("rect").attr("x", 0).attr("y", 0).attr("width", in_wi * 0.45).attr("height", 60).attr("fill", "rgba(239, 83, 80, 0.15)").attr("rx", 8).attr("stroke", "#EF5350").attr("stroke-width", 1.5).attr("opacity", 0.8);
    pe_li_bo.append("text").attr("x", (in_wi * 0.45) / 2).attr("y", 25).attr("text-anchor", "middle").attr("font-size", "24px").attr("font-weight", "700").attr("fill", "#EF5350").text(`${pe_li}%`);
    pe_li_bo.append("text").attr("x", (in_wi * 0.45) / 2).attr("y", 45).attr("text-anchor", "middle").attr("font-size", "12px").attr("fill", "#9E9E9E").text("of potential life lived");
    pe_li_bo.transition().duration(600).delay(1900).attr("opacity", 1);

    const pe_un_bo = g.append("g").attr("transform", `translate(${in_wi * 0.55}, ${y_po + 70})`).attr("opacity", 0);
    pe_un_bo.append("rect").attr("x", 0).attr("y", 0).attr("width", in_wi * 0.45).attr("height", 60).attr("fill", "rgba(239, 83, 80, 0.2)").attr("rx", 8).attr("stroke", "#EF5350").attr("stroke-width", 2).attr("opacity", 0.9);
    pe_un_bo.append("text").attr("x", (in_wi * 0.45) / 2).attr("y", 25).attr("text-anchor", "middle").attr("font-size", "24px").attr("font-weight", "700").attr("fill", "#EF5350").text(`${pe_st}%`);
    pe_un_bo.append("text").attr("x", (in_wi * 0.45) / 2).attr("y", 45).attr("text-anchor", "middle").attr("font-size", "12px").attr("fill", "#9E9E9E").text("of life unlived");
    pe_un_bo.transition().duration(600).delay(2100).attr("opacity", 1);

    const bo_in = g.append("g").attr("transform", `translate(0, ${y_po + 145})`).attr("opacity", 0);

    let co_te;
    if (se_an.species === "Chickens") {
        co_te = `Broiler chickens are bred for rapid growth and slaughtered at just 5-7 weeks, having lived only ${pe_li}% of their potential ${na_ye}-year lifespan`;
    } else if (se_an.species === "Pigs") {
        co_te = `Pigs are intelligent animals that could live 10-12 years, but are slaughtered at just ${sl_ye} years old—only ${pe_li}% of their natural lifespan`;
    } else if (se_an.species === "Cattle") {
        co_te = `Cattle can naturally live 15-20 years, but beef cattle are slaughtered at just ${sl_ye} years—having experienced only ${pe_li}% of their potential life`;
    } else if (se_an.species === "Turkeys") {
        co_te = `Turkeys are slaughtered at 10-17 weeks for meat production, living only ${pe_li}% of their natural 15-year lifespan`;
    } else if (se_an.species === "Ducks") {
        co_te = `Ducks raised for meat are slaughtered at 7-8 weeks old, experiencing only ${pe_li}% of their 6-8 year natural lifespan`;
    } else if (se_an.species === "Rabbits") {
        co_te = `Rabbits are slaughtered at just 10-12 weeks old, living only ${pe_li}% of their potential 8-12 year lifespan`;
    } else if (se_an.species === "Goats") {
        co_te = `Goats can live 12-14 years in natural conditions, but are slaughtered at just ${sl_ye} years—only ${pe_li}% of their lifespan`;
    } else if (se_an.species === "Geese") {
        co_te = `Geese are slaughtered at 15-20 weeks for meat, having lived only ${pe_li}% of their potential 8-15 year lifespan`;
    } else if (se_an.species === "Sheep") {
        co_te = `Lambs are slaughtered at 4-12 months old, experiencing only ${pe_li}% of their natural 12-14 year lifespan`;
    } else {
        co_te = `These animals could naturally live ${na_ye} years, but are slaughtered at ${sl_ye} years—only ${pe_li}% of their potential lifespan`;
    }

    bo_in.append("text")
        .attr("x", in_wi / 2).attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-style", "italic")
        .attr("fill", "#9E9E9E")
        .attr("opacity", 0.9)
        .text(co_te)
        .call(wr_te, in_wi - 40);

    bo_in.transition().duration(500).delay(2300).attr("opacity", 1);
}

function wr_te(te, wi) {
    te.each(function () {
        const te_el = d3.select(this);
        const wo = te_el.text().split(/\s+/).reverse();
        let wo_it, li = [], li_nu = 0;
        const li_he = 1.3, y = te_el.attr("y"), dy = 0;
        let ts = te_el.text(null).append("tspan").attr("x", te_el.attr("x")).attr("y", y).attr("dy", dy + "em");

        while (wo_it = wo.pop()) {
            li.push(wo_it);
            ts.text(li.join(" "));
            if (ts.node().getComputedTextLength() > wi) {
                li.pop();
                ts.text(li.join(" "));
                li = [wo_it];
                ts = te_el.append("tspan").attr("x", te_el.attr("x")).attr("y", y).attr("dy", ++li_nu * li_he + dy + "em").text(wo_it);
            }
        }
    });
}


function dr_ti_se(co) {
    const an_ty = ma_sp_to_sl_da(se_an.species);
    if (!an_ty || !sl_ti_se[an_ty]) {
        co.append("div").style("padding", "2rem").style("color", "#90A4AE").text("No historical data available for this species");
        return;
    }

    const ti_da = sl_ti_se[an_ty];
    const da_po = Object.keys(ti_da).map(ye => ({ year: parseInt(ye), value: ti_da[ye] })).sort((a, b) => a.year - b.year);

    const wi = 650, he = 420;
    const ma = { top: 40, right: 40, bottom: 70, left: 90 };
    const in_wi = wi - ma.left - ma.right;
    const in_he = he - ma.top - ma.bottom;

    const sv = co.append("svg").attr("width", wi).attr("height", he);
    const g = sv.append("g").attr("transform", `translate(${ma.left}, ${ma.top})`);

    const x_sc = d3.scaleLinear().domain(d3.extent(da_po, d => d.year)).range([0, in_wi]);
    const y_sc = d3.scaleLinear().domain([0, d3.max(da_po, d => d.value)]).range([in_he, 0]).nice();

    const ar = d3.area().x(d => x_sc(d.year)).y0(in_he).y1(d => y_sc(d.value)).curve(d3.curveMonotoneX);
    const li = d3.line().x(d => x_sc(d.year)).y(d => y_sc(d.value)).curve(d3.curveMonotoneX);

    const ar_pa = g.append("path").datum(da_po).attr("fill", "#EF5350").attr("opacity", 0.25).attr("d", ar);
    const to_le = ar_pa.node().getTotalLength();
    ar_pa.attr("stroke-dasharray", to_le + " " + to_le).attr("stroke-dashoffset", to_le).attr("stroke", "none").transition().duration(1500).ease(d3.easeLinear).attr("stroke-dashoffset", 0);

    const li_pa = g.append("path").datum(da_po).attr("fill", "none").attr("stroke", "#EF5350").attr("stroke-width", 3).attr("d", li);
    const li_le = li_pa.node().getTotalLength();
    li_pa.attr("stroke-dasharray", li_le + " " + li_le).attr("stroke-dashoffset", li_le).transition().duration(1500).ease(d3.easeLinear).attr("stroke-dashoffset", 0);

    const x_ax = d3.axisBottom(x_sc).ticks(5).tickFormat(d3.format("d"));
    const y_ax = d3.axisLeft(y_sc).ticks(5).tickFormat(d => {
        if (d >= 1e9) return (d / 1e9).toFixed(1) + 'B';
        if (d >= 1e6) return (d / 1e6).toFixed(0) + 'M';
        return d;
    });

    const x_ax_gr_2 = g.append("g").attr("transform", `translate(0, ${in_he})`).call(x_ax).attr("opacity", 0);
    x_ax_gr_2.selectAll("text").attr("fill", "#9E9E9E");
    x_ax_gr_2.selectAll("line").attr("stroke", "#555");
    x_ax_gr_2.select(".domain").attr("stroke", "#555");
    x_ax_gr_2.transition().duration(400).delay(1500).attr("opacity", 1);

    const y_ax_gr = g.append("g").call(y_ax).attr("opacity", 0);
    y_ax_gr.selectAll("text").attr("fill", "#9E9E9E");
    y_ax_gr.selectAll("line").attr("stroke", "#555");
    y_ax_gr.select(".domain").attr("stroke", "#555");
    y_ax_gr.transition().duration(400).delay(1500).attr("opacity", 1);

    g.append("text").attr("x", in_wi / 2).attr("y", in_he + 45).attr("text-anchor", "middle").attr("font-size", "12px").attr("fill", "#9E9E9E").text("Year");
    g.append("text").attr("transform", "rotate(-90)").attr("x", -in_he / 2).attr("y", -60).attr("text-anchor", "middle").attr("font-size", "12px").attr("fill", "#9E9E9E").text("Animals Slaughtered");

    const fi_va = da_po[0].value;
    const la_va = da_po[da_po.length - 1].value;
    const pe_in = (((la_va - fi_va) / fi_va) * 100).toFixed(0);

    const st_bo = co.append("div").attr("class", "stats-box").style("opacity", 0);
    st_bo.append("div").attr("class", "stat-large").style("color", "#EF5350").html(`&uarr; ${pe_in}%`);
    st_bo.append("div").attr("class", "stat-label").text("increase since 1961");
    st_bo.transition().duration(400).delay(2000).style("opacity", 1);


    const cr_li = g.append("line").attr("class", "crosshair-line").attr("y1", 0).attr("y2", in_he).attr("stroke", "#EF5350").attr("stroke-width", 1).attr("stroke-dasharray", "4,4").attr("opacity", 0).attr("pointer-events", "none");
    const ho_ci = g.append("circle").attr("class", "hover-circle").attr("r", 5).attr("fill", "#EF5350").attr("stroke", "#000").attr("stroke-width", 2).attr("opacity", 0).attr("pointer-events", "none");
    const to = d3.select("#tooltip");
    const ov = g.append("rect").attr("class", "overlay").attr("width", in_wi).attr("height", in_he).attr("fill", "none").attr("pointer-events", "all").style("cursor", "crosshair");

    const bis = d3.bisector(d => d.year).left;

    ov
        .on("mousemove", function (ev) {
            const [mo_x] = d3.pointer(ev);
            const ye = x_sc.invert(mo_x);
            const in_idx = bis(da_po, ye);

            let cl_po;
            if (in_idx === 0) {
                cl_po = da_po[0];
            } else if (in_idx >= da_po.length) {
                cl_po = da_po[da_po.length - 1];
            } else {
                const d0 = da_po[in_idx - 1];
                const d1 = da_po[in_idx];
                cl_po = ye - d0.year > d1.year - ye ? d1 : d0;
            }

            const x = x_sc(cl_po.year);
            const y = y_sc(cl_po.value);
            cr_li.attr("x1", x).attr("x2", x).attr("opacity", 0.6);
            ho_ci.attr("cx", x).attr("cy", y).attr("opacity", 1);

            const pe_ch = (((cl_po.value - fi_va) / fi_va) * 100).toFixed(1);
            const ch_te = pe_ch >= 0 ? `+${pe_ch}%` : `${pe_ch}%`;

            let fo_va;
            if (cl_po.value >= 1e9) {
                fo_va = (cl_po.value / 1e9).toFixed(2) + 'B';
            } else if (cl_po.value >= 1e6) {
                fo_va = (cl_po.value / 1e6).toFixed(1) + 'M';
            } else {
                fo_va = cl_po.value.toLocaleString();
            }

            to.style("opacity", 1).html(`
                <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px; color: #EF5350;">
                    ${cl_po.year}
                </div>
                <div style="font-size: 13px; margin-bottom: 4px; color: #fff;">
                    <strong>${fo_va}</strong> animals
                </div>
                <div style="font-size: 12px; color: #9E9E9E;">
                    ${ch_te} since 1961
                </div>
            `).style("left", (ev.pageX + 15) + "px").style("top", (ev.pageY - 15) + "px");
        })
        .on("mouseleave", function () {
            cr_li.attr("opacity", 0);
            ho_ci.attr("opacity", 0);
            to.style("opacity", 0);
        });
}

lo_al_da();
