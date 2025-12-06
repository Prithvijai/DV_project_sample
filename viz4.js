


let di = [];
let su = [];
let li = [];
let da_lo = false;


async function lo_an_pr_da() {
    try {
        const re = await fetch('Rishikumar_data/substitution_flow_enriched (1).json');
        const ra_da = await re.json();

        const ca = {
            'Dairy Products': ['milk', 'butter', 'cream', 'cheese', 'yogurt', 'sour cream', 'whey', 'margarine'],
            'Animal Protein': ['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'egg', 'ground beef', 'ground meat', 'meat'],
            'Oils & Fats': ['vegetable oil', 'olive oil', 'coconut oil', 'lard', 'shortening', 'canola oil'],
            'Stocks & Broths': ['chicken stock', 'beef broth', 'chicken broth', 'beef stock', 'broth'],
        };

        const su_ca = {
            'Plant Milk': ['soy milk', 'soymilk', 'almond milk', 'coconut milk', 'oat milk', 'rice milk'],
            'Plant Protein': ['tofu', 'tempeh', 'seitan', 'lentil', 'bean', 'chickpea', 'veggie crumble', 'textured soy'],
            'Vegetables': ['broccoli', 'zucchini', 'eggplant', 'mushroom', 'cauliflower', 'squash', 'carrot', 'celery', 'artichoke'],
            'Fruit-Based': ['applesauce', 'banana', 'apple juice', 'pineapple juice', 'apple', 'cranberry', 'grape juice'],
            'Nuts & Seeds': ['almond butter', 'peanut butter', 'cashew', 'tahini', 'nut'],
            'Plant Stocks': ['vegetable broth', 'vegetable stock', 'mushroom broth']
        };

        function ca_in(in_gr, ca_ma) {
            in_gr = in_gr.toLowerCase();
            for (const [ca_key, ke_wo] of Object.entries(ca_ma)) {
                if (ke_wo.some(kw => in_gr.includes(kw))) {
                    return ca_key;
                }
            }
            return null;
        }

        const li_ma = new Map();

        ra_da.forEach(it => {
            const or_ca = ca_in(it.original_ingredient, ca);
            const su_ct = ca_in(it.substitute_ingredient, su_ca);

            if (!or_ca || !su_ct) return;

            const key = `${or_ca}→${su_ct}`;
            if (!li_ma.has(key)) {
                li_ma.set(key, {
                    source: or_ca,
                    target: su_ct,
                    count: 0,
                    examples: []
                });
            }

            const mo_li = li_ma.get(key);
            mo_li.count++;

            if (mo_li.examples.length < 2) {
                mo_li.examples.push({
                    original: it.original_ingredient,
                    substitute: it.substitute_ingredient
                });
            }
        });


        const pr_li = Array.from(li_ma.values())
            .filter(lk => lk.count >= 10)
            .map(lk => {
                let av_ca_re = 0;
                let av_pr_ch = 0;
                let av_fi_in = 0;
                let va_co = 0;

                lk.examples.forEach(ex => {
                    const or_nu = ra_da.find(d =>
                        d.original_ingredient === ex.original &&
                        d.substitute_ingredient === ex.substitute
                    );

                    if (or_nu && or_nu.original_nutrients && or_nu.substitute_nutrients) {
                        av_ca_re += (or_nu.original_nutrients.kcal - or_nu.substitute_nutrients.kcal);
                        av_pr_ch += (or_nu.substitute_nutrients.protein_g - or_nu.original_nutrients.protein_g);
                        av_fi_in += (or_nu.substitute_nutrients.fiber_g - or_nu.original_nutrients.fiber_g);
                        va_co++;
                    }
                });

                if (va_co > 0) {
                    lk.avgCalReduction = av_ca_re / va_co;
                    lk.avgProteinChange = av_pr_ch / va_co;
                    lk.avgFiberIncrease = av_fi_in / va_co;
                } else {
                    lk.avgCalReduction = 0;
                    lk.avgProteinChange = 0;
                    lk.avgFiberIncrease = 0;
                }

                return lk;
            })
            .sort((a, b) => b.count - a.count);

        const so = [...new Set(pr_li.map(l => l.source))];
        const ta = [...new Set(pr_li.map(l => l.target))];

        di = so.map((name, i) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            cuisine: 'Animal-Based',
            order: i
        }));

        su = ta.map((name, i) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            type: 'Plant-Based',
            diet: 'vegan',
            order: i
        }));

        li = pr_li.map(lk => {
            let ba = '';
            if (lk.avgCalReduction > 20) ba = 'lower-cal';
            else if (lk.avgFiberIncrease > 0.5) ba = 'high-fiber';

            return {
                source: lk.source.toLowerCase().replace(/\s+/g, '-'),
                target: lk.target.toLowerCase().replace(/\s+/g, '-'),
                count: lk.count,
                examples: lk.examples,
                why: lk.examples.map(ex => `${ex.original} → ${ex.substitute}`).join(' • '),
                avgCalReduction: lk.avgCalReduction,
                avgProteinChange: lk.avgProteinChange,
                avgFiberIncrease: lk.avgFiberIncrease,
                badge: ba,
                bestMatch: ra_da.find(d =>
                    lk.examples.some(ex =>
                        d.original_ingredient === ex.original &&
                        d.substitute_ingredient === ex.substitute
                    )
                )
            };
        });

        const mi_co = d3.min(li, d => d.count);
        const ma_co = d3.max(li, d => d.count);
        li_wi_sc = d3.scaleLinear().domain([mi_co, ma_co]).range([3, 24]);

        da_lo = true;
        return true;
    } catch (er) {
        console.error('Error loading data:', er);
        da_lo = false;
        return false;
    }
}

const fl_co = {
    width: 950,
    height: 620,
    margin: { top: 40, right: 20, bottom: 40, left: 20 },
    nodeWidth: 180,
    nodeHeight: 55,
    nodeRadius: 12
};

const in_fl_wi = fl_co.width - fl_co.margin.left - fl_co.margin.right;
const in_fl_he = fl_co.height - fl_co.margin.top - fl_co.margin.bottom;

let cu_fi = 'all';
let se_di = null;
let li_wi_sc = null;

function ca_po() {
    const po = { dishes: {}, subs: {} };
    const av_he = fl_co.height - fl_co.margin.top - fl_co.margin.bottom;

    const le_sp = Math.min(av_he / (di.length + 1), 100);
    const le_st_y = fl_co.margin.top + (av_he - (di.length - 1) * le_sp) / 2;
    const x_le = fl_co.margin.left + 20;

    di.forEach((ds, i) => {
        po.dishes[ds.id] = {
            x: x_le,
            y: le_st_y + i * le_sp,
            width: fl_co.nodeWidth,
            height: fl_co.nodeHeight
        };
    });

    const ri_sp = Math.min(av_he / (su.length + 1), 100);
    const ri_st_y = fl_co.margin.top + (av_he - (su.length - 1) * ri_sp) / 2;
    const x_ri = fl_co.width - fl_co.margin.right - fl_co.nodeWidth - 20;

    su.forEach((sb, i) => {
        po.subs[sb.id] = {
            x: x_ri,
            y: ri_st_y + i * ri_sp,
            width: fl_co.nodeWidth,
            height: fl_co.nodeHeight
        };
    });

    return po;
}

function cr_li_pa(so_po, ta_po) {
    const sx = so_po.x + so_po.width;
    const sy = so_po.y + so_po.height / 2;
    const tx = ta_po.x;
    const ty = ta_po.y + ta_po.height / 2;
    const co_of = 60;
    return `M ${sx},${sy} C ${sx + co_of},${sy} ${tx - co_of},${ty} ${tx},${ty}`;
}


function cr_fl_ch() {
    d3.select("#substitution-chart").selectAll("*").remove();

    const po = ca_po();
    const sv = d3.select("#substitution-chart").append("svg").attr("width", fl_co.width).attr("height", fl_co.height);

    const de = sv.append("defs");
    const gr = de.append("linearGradient").attr("id", "link-gradient").attr("x1", "0%").attr("x2", "100%");
    gr.append("stop").attr("offset", "0%").attr("stop-color", "#9AD1B3").attr("stop-opacity", 0.6);
    gr.append("stop").attr("offset", "100%").attr("stop-color", "#9AD1B3").attr("stop-opacity", 0.8);

    const li_gr = sv.append("g").attr("class", "links-group");
    const no_gr = sv.append("g").attr("class", "nodes-group");

    const li_da = li.map(lk => ({
        ...lk,
        path: cr_li_pa(po.dishes[lk.source], po.subs[lk.target])
    }));


    li_gr.selectAll(".flow-link-halo")
        .data(li_da)
        .join("path")
        .attr("class", "flow-link-halo")
        .attr("d", d => d.path)
        .attr("stroke", "white")
        .attr("stroke-width", d => li_wi_sc(d.count) + 4)
        .attr("fill", "none")
        .attr("opacity", 0.8)
        .style("pointer-events", "none");


    const li_el = li_gr.selectAll(".flow-link")
        .data(li_da)
        .join("path")
        .attr("class", d => `flow-link ${d.badge ? 'has-badge' : ''}`)
        .attr("d", d => d.path)
        .attr("stroke", "url(#link-gradient)")
        .attr("stroke-width", d => li_wi_sc(d.count))
        .attr("fill", "none")
        .attr("data-source", d => d.source)
        .attr("data-target", d => d.target)
        .attr("stroke-dasharray", function () { return this.getTotalLength(); })
        .attr("stroke-dashoffset", function () { return this.getTotalLength(); })
        .style("opacity", 0)
        .on("mouseenter", ha_li_ho)
        .on("mousemove", ha_li_mo)
        .on("mouseleave", ha_li_le);


    li_el.transition()
        .duration(1500)
        .delay((d, i) => i * 30)
        .ease(d3.easeCubicOut)
        .style("opacity", 1)
        .attr("stroke-dashoffset", 0);



    const di_no = no_gr.selectAll(".dish-node")
        .data(di)
        .join("g")
        .attr("class", "dish-node")
        .attr("transform", d => `translate(${po.dishes[d.id].x}, ${po.dishes[d.id].y})`)
        .style("opacity", 0)
        .style("transform", d => `translate(${po.dishes[d.id].x - 20}px, ${po.dishes[d.id].y}px)`)
        .on("click", ha_di_cl);


    di_no.transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .style("opacity", 1)
        .style("transform", d => `translate(${po.dishes[d.id].x}px, ${po.dishes[d.id].y}px)`);

    di_no.append("rect").attr("width", fl_co.nodeWidth).attr("height", fl_co.nodeHeight).attr("rx", fl_co.nodeRadius);

    di_no.append("text")
        .attr("class", "node-title")
        .attr("x", fl_co.nodeWidth / 2).attr("y", fl_co.nodeHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(d => d.name)
        .each(function (d) {
            const te = d3.select(this);
            const wo = d.name.split(/\s+/);
            if (wo.length > 2) {
                te.text('');
                te.append("tspan").attr("x", fl_co.nodeWidth / 2).attr("dy", "-0.3em").text(wo.slice(0, 2).join(' '));
                te.append("tspan").attr("x", fl_co.nodeWidth / 2).attr("dy", "1.1em").text(wo.slice(2).join(' '));
            }
        });


    const su_no = no_gr.selectAll(".substitute-node")
        .data(su)
        .join("g")
        .attr("class", "substitute-node")
        .attr("transform", d => `translate(${po.subs[d.id].x}, ${po.subs[d.id].y})`)
        .style("opacity", 0)
        .style("transform", d => `translate(${po.subs[d.id].x + 20}px, ${po.subs[d.id].y}px)`);


    su_no.transition()
        .duration(800)
        .delay((d, i) => 800 + i * 100)
        .style("opacity", 1)
        .style("transform", d => `translate(${po.subs[d.id].x}px, ${po.subs[d.id].y}px)`);

    su_no.append("rect").attr("width", fl_co.nodeWidth).attr("height", fl_co.nodeHeight).attr("rx", fl_co.nodeRadius);

    su_no.append("text")
        .attr("class", "node-title")
        .attr("x", fl_co.nodeWidth / 2).attr("y", fl_co.nodeHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(d => d.name)
        .each(function (d) {
            const te = d3.select(this);
            const wo = d.name.split(/\s+/);
            if (wo.length > 2) {
                te.text('');
                te.append("tspan").attr("x", fl_co.nodeWidth / 2).attr("dy", "-0.3em").text(wo.slice(0, 2).join(' '));
                te.append("tspan").attr("x", fl_co.nodeWidth / 2).attr("dy", "1.1em").text(wo.slice(2).join(' '));
            }
        });

    ap_fi(cu_fi);
}

function ha_li_ho(ev, d) {
    if (se_di) return;

    d3.select(ev.currentTarget).classed("highlighted", true);
    d3.selectAll(".flow-link").filter(l => l !== d).classed("dimmed", true);
    d3.selectAll(".flow-link-halo").filter(l => l !== d).classed("dimmed", true);
    d3.selectAll(".dish-node").classed("highlighted", n => n.id === d.source).classed("dimmed", n => n.id !== d.source);
    d3.selectAll(".substitute-node").classed("highlighted", n => n.id === d.target).classed("dimmed", n => n.id !== d.target);

    const to = d3.select("#flow-tooltip");
    const so_di = di.find(ds => ds.id === d.source);
    const ta_su = su.find(sb => sb.id === d.target);

    to.classed("visible", true);

    let nu_ht = '';
    const be = [];

    if (d.avgCalReduction > 5) {
        be.push(`<span class="nutrition-badge cal-badge">-${Math.round(d.avgCalReduction)} cal</span>`);
    }
    if (d.avgFiberIncrease > 0.3) {
        be.push(`<span class="nutrition-badge fiber-badge">+${d.avgFiberIncrease.toFixed(1)}g fiber</span>`);
    }

    if (be.length > 0) {
        nu_ht = `<div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; flex-wrap: wrap;">${be.join('')}</div>`;
    }

    const ex_te = d.examples && d.examples.length > 0
        ? `<div style="font-size: 11px; color: rgba(255,255,255,0.75); margin-top: 0.5rem;">Example: ${d.examples[0].original} → ${d.examples[0].substitute}</div>`
        : '';

    to.html(`
        <div class="tooltip-species"><strong>${so_di.name}</strong> → <strong>${ta_su.name}</strong></div>
        <div style="margin-top: 0.25rem; font-size: 12px; color: rgba(255,255,255,0.9);">
            ${d.count} substitution options
        </div>
        ${nu_ht}
        ${ex_te}
    `);
}

function ha_li_mo(ev) {
    const to = d3.select("#flow-tooltip");
    const to_no = to.node();
    const to_wi = to_no.offsetWidth;
    const to_he = to_no.offsetHeight;

    let le = ev.pageX + 15;
    let tp = ev.pageY - to_he / 2;

    if (le + to_wi > window.innerWidth) {
        le = ev.pageX - to_wi - 15;
    }

    to.style("left", `${le}px`).style("top", `${tp}px`);
}

function ha_li_le() {
    if (se_di) return;
    d3.selectAll(".flow-link").classed("highlighted", false).classed("dimmed", false);
    d3.selectAll(".flow-link-halo").classed("dimmed", false);
    d3.selectAll(".dish-node").classed("highlighted", false).classed("dimmed", false);
    d3.selectAll(".substitute-node").classed("highlighted", false).classed("dimmed", false);
    d3.select("#flow-tooltip").classed("visible", false);
}

function ha_di_cl(ev, d) {
    if (se_di === d.id) {
        se_di = null;
        hi_re_ca();
        re_hi();
    } else {
        se_di = d.id;
        sh_re_ca(d);
        hi_di_co(d.id);
    }
}

function hi_di_co(ds_id) {
    const co_li = li.filter(lk => lk.source === ds_id);
    const co_ta = co_li.map(lk => lk.target);

    d3.selectAll(".flow-link").classed("highlighted", lk => lk.source === ds_id).classed("dimmed", lk => lk.source !== ds_id);
    d3.selectAll(".flow-link-halo").classed("dimmed", lk => lk.source !== ds_id);
    d3.selectAll(".dish-node").classed("highlighted", no => no.id === ds_id).classed("dimmed", no => no.id !== ds_id);
    d3.selectAll(".substitute-node").classed("highlighted", no => co_ta.includes(no.id)).classed("dimmed", no => !co_ta.includes(no.id));
}

function re_hi() {
    d3.selectAll(".flow-link").classed("highlighted", false).classed("dimmed", false);
    d3.selectAll(".flow-link-halo").classed("dimmed", false);
    d3.selectAll(".dish-node").classed("highlighted", false).classed("dimmed", false);
    d3.selectAll(".substitute-node").classed("highlighted", false).classed("dimmed", false);
}

function sh_re_ca(ds) {
    const re_ca = d3.select("#recipe-card");
    const co_li = li.filter(lk => lk.source === ds.id).sort((a, b) => b.avgCalReduction - a.avgCalReduction);

    if (co_li.length === 0) return;

    d3.select("#recipe-title").text(`${ds.name} Alternatives`);

    const re_li = d3.select("#recipe-list");
    re_li.selectAll("*").remove();

    co_li.slice(0, 4).forEach(lk => {
        const su_na = su.find(s => s.id === lk.target)?.name || lk.target;
        const be = [];
        if (lk.avgCalReduction > 5) {
            be.push(`<span class="nutrition-badge cal-badge">-${Math.round(lk.avgCalReduction)} cal avg</span>`);
        }
        if (lk.avgFiberIncrease > 0.3) {
            be.push(`<span class="nutrition-badge fiber-badge">+${lk.avgFiberIncrease.toFixed(1)}g fiber</span>`);
        }

        const be_ht = be.length > 0 ? `<div style="margin-top: 0.35rem;">${be.join(' ')}</div>` : '';

        re_li.append("li").html(`
            <strong>${su_na}</strong><br/>
            <span style="font-size: 11px; color: #90a4ae;">${lk.count} options available</span>
            ${be_ht}
        `);
    });

    re_ca.classed("hidden", false);
}

function hi_re_ca() {
    d3.select("#recipe-card").classed("hidden", true);
}

function ap_fi(fi) {
    cu_fi = fi;

    if (fi === 'all') {
        d3.selectAll(".flow-link").style("display", "block");
        d3.selectAll(".substitute-node").style("opacity", 1);
    } else {
        d3.selectAll(".flow-link").style("display", function (d) {
            const ta_su = su.find(s => s.id === d.target);
            return ta_su.diet === fi ? "block" : "none";
        });

        d3.selectAll(".substitute-node").style("opacity", function (d) {
            return d.diet === fi ? 1 : 0.3;
        });
    }
}

function ha_fi_cl(fi) {
    d3.selectAll(".filter-chip").classed("active", function () {
        return this.dataset.filter === fi;
    });

    if (se_di) {
        se_di = null;
        hi_re_ca();
        re_hi();
    }

    ap_fi(fi);
}

document.querySelectorAll(".filter-chip").forEach(ch => {
    ch.addEventListener("click", function () {
        ha_fi_cl(this.dataset.filter);
    });
});

document.getElementById("close-recipe").addEventListener("click", () => {
    se_di = null;
    hi_re_ca();
    re_hi();
});

async function in_fn() {
    d3.select("#substitution-chart").html('<div style="text-align: center; padding: 100px; color: #546e7a;">Loading substitution data...</div>');

    const lo = await lo_an_pr_da();

    if (lo && da_lo) {
        cr_fl_ch();
    } else {
        d3.select("#substitution-chart").html('<div style="text-align: center; padding: 100px; color: #B6473B;">Error loading data. Please refresh the page.</div>');
    }
}
in_fn();


let fl_re_ti;
window.addEventListener("resize", () => {
    clearTimeout(fl_re_ti);
    fl_re_ti = setTimeout(() => {
        cr_fl_ch();
        if (se_di) {
            const ds = di.find(d => d.id === se_di);
            if (ds) {
                sh_re_ca(ds);
                hi_di_co(se_di);
            }
        }
    }, 250);
});
