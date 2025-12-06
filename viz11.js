
let fo_da = [];
let sp = {};
let tu_mo = false;
let tu_st = 0;

d3.csv("hanif_data/food_dataset.csv").then(da => {
    fo_da = da.map(d => ({
        name: d.name,
        type: d.type,
        basePrice: +d.basePrice,
        healthROI: +d.healthROI,
        envROI: +d.envROI,
        color: d.color,
        emoji: d.emoji,
        mass: +d.mass
    }));

    fo_da.forEach(f => sp[f.name] = f.basePrice);

    bu_sl();

    up_al_vi();
});

const ca = document.getElementById('particles');
const ct = ca.getContext('2d');
ca.width = window.innerWidth;
ca.height = window.innerHeight;

const pa = [];
for (let i = 0; i < 100; i++) {
    pa.push({
        x: Math.random() * ca.width,
        y: Math.random() * ca.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
    });
}

function an_pa() {
    ct.clearRect(0, 0, ca.width, ca.height);

    pa.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > ca.width) p.vx *= -1;
        if (p.y < 0 || p.y > ca.height) p.vy *= -1;

        ct.fillStyle = `rgba(59, 130, 246, ${0.3 + Math.sin(Date.now() / 1000 + i) * 0.2})`;
        ct.beginPath();
        ct.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ct.fill();

        pa.forEach((p2, j) => {
            if (i < j) {
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ct.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - dist / 100)})`;
                    ct.lineWidth = 0.5;
                    ct.beginPath();
                    ct.moveTo(p.x, p.y);
                    ct.lineTo(p2.x, p2.y);
                    ct.stroke();
                }
            }
        });
    });

    requestAnimationFrame(an_pa);
}
an_pa();

window.addEventListener('scroll', () => {
    const sc = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    document.getElementById('progress').style.width = sc + '%';

    document.querySelectorAll('.section').forEach(se => {
        const re = se.getBoundingClientRect();
        if (re.top < window.innerHeight * 0.75) {
            se.classList.add('active');
        }
    });
});

const tu_sc = [
    {
        section: 0,
        duration: 4000,
        changes: {},
        message: "🌍 Welcome to Your Food Impact Journey! Let's explore how different diets affect your health and our planet.",
        title: "Introduction"
    },
    {
        section: 1,
        duration: 5000,
        changes: { "Beef": 22, "Chicken": 18, "Pork": 15, "Cheese": 12, "Eggs": 8 },
        message: "🍔 Chapter 1: The Traditional Western Diet - High in animal products. Notice how the seesaw tips heavily to the left (red side).",
        title: "Standard American Diet"
    },
    {
        section: 2,
        duration: 5000,
        changes: { "Beef": 22, "Chicken": 18, "Pork": 15, "Cheese": 12, "Eggs": 8 },
        message: "📊 Impact Check: This diet shows negative environmental ROI. The planets cluster toward the center, indicating lower combined benefits.",
        title: "Traditional Diet Impact"
    },
    {
        section: 1,
        duration: 5000,
        changes: { "Chicken": 12, "Fish": 10, "Eggs": 8, "Lentils": 10, "Quinoa": 8, "Broccoli": 8, "Spinach": 8 },
        message: "🔄 Chapter 2: The Flexitarian - Reducing meat, adding plants. The seesaw starts to balance as we introduce more plant foods.",
        title: "Flexitarian Balance"
    },
    {
        section: 2,
        duration: 5000,
        changes: { "Chicken": 12, "Fish": 10, "Eggs": 8, "Lentils": 10, "Quinoa": 8, "Broccoli": 8, "Spinach": 8 },
        message: "📈 Getting Better: Notice how the planets spread outward? That's improved health and environmental scores combining!",
        title: "Flexitarian Results"
    },
    {
        section: 1,
        duration: 5000,
        changes: { "Fish": 15, "Cheese": 8, "Chickpeas": 12, "Lentils": 10, "Spinach": 10, "Broccoli": 10, "Quinoa": 8 },
        message: "🌊 Chapter 3: The Mediterranean Way - Fish-forward with abundant plants. The seesaw achieves near balance!",
        title: "Mediterranean Diet"
    },
    {
        section: 2,
        duration: 5000,
        changes: { "Fish": 15, "Cheese": 8, "Chickpeas": 12, "Lentils": 10, "Spinach": 10, "Broccoli": 10, "Quinoa": 8 },
        message: "✨ Strong Performance: Planets move further out, showing positive ROI. Health and environment both benefit!",
        title: "Mediterranean Impact"
    },
    {
        section: 1,
        duration: 5000,
        changes: { "Fish": 18, "Eggs": 10, "Tofu": 12, "Lentils": 12, "Broccoli": 10, "Spinach": 10, "Chickpeas": 8 },
        message: "🐟 Chapter 4: The Pescatarian - Fish and plants only, no land animals. Watch the seesaw tip toward the green (right) side!",
        title: "Pescatarian Approach"
    },
    {
        section: 2,
        duration: 5000,
        changes: { "Fish": 18, "Eggs": 10, "Tofu": 12, "Lentils": 12, "Broccoli": 10, "Spinach": 10, "Chickpeas": 8 },
        message: "🌟 Excellent Progress: The cosmic view shows planets pushing into the outer orbits. Strong combined benefits!",
        title: "Pescatarian Benefits"
    },
    {
        section: 1,
        duration: 5000,
        changes: { "Eggs": 12, "Cheese": 10, "Tofu": 14, "Lentils": 14, "Quinoa": 10, "Broccoli": 12, "Spinach": 12 },
        message: "🥚 Chapter 5: The Vegetarian - No meat, but includes eggs and dairy. The seesaw strongly favors the plant side now!",
        title: "Vegetarian Lifestyle"
    },
    {
        section: 2,
        duration: 5000,
        changes: { "Eggs": 12, "Cheese": 10, "Tofu": 14, "Lentils": 14, "Quinoa": 10, "Broccoli": 12, "Spinach": 12 },
        message: "🚀 Outstanding Impact: Most planets reach the outer orbits. High positive ROI for both health and environment!",
        title: "Vegetarian Results"
    },
    {
        section: 1,
        duration: 5000,
        changes: { "Tofu": 16, "Lentils": 16, "Chickpeas": 14, "Quinoa": 12, "Broccoli": 12, "Spinach": 12, "Rice": 10 },
        message: "🌱 Chapter 6: The Plant-Based Diet - 100% plants. The seesaw tilts fully to the green side. Maximum plant power!",
        title: "Plant-Based Diet"
    },
    {
        section: 2,
        duration: 5000,
        changes: { "Tofu": 16, "Lentils": 16, "Chickpeas": 14, "Quinoa": 12, "Broccoli": 12, "Spinach": 12, "Rice": 10 },
        message: "🌈 Peak Performance: The planets reach their maximum distance from center. Optimal ROI across both dimensions!",
        title: "Plant-Based Impact"
    },
    {
        section: 1,
        duration: 5000,
        changes: { "Beef": 25, "Pork": 20, "Chicken": 18, "Fish": 15, "Eggs": 12 },
        message: "🥩 Chapter 7: The High-Protein Carnivore - For comparison: animal-heavy diet. See the dramatic seesaw tilt to the left!",
        title: "High-Protein Diet"
    },
    {
        section: 2,
        duration: 5000,
        changes: { "Beef": 25, "Pork": 20, "Chicken": 18, "Fish": 15, "Eggs": 12 },
        message: "⚠️ Reality Check: Planets cluster near center with lower scores. This shows the trade-offs of protein-heavy animal diets.",
        title: "Carnivore Trade-offs"
    },
    {
        section: 1,
        duration: 5000,
        changes: { "Fish": 10, "Chicken": 8, "Eggs": 6, "Lentils": 14, "Tofu": 12, "Quinoa": 10, "Broccoli": 12, "Spinach": 10, "Chickpeas": 10 },
        message: "⚖️ Chapter 8: The Balanced Optimum - A sustainable middle path with mostly plants and some animal foods.",
        title: "Optimal Balance"
    },
    {
        section: 2,
        duration: 5000,
        changes: { "Fish": 10, "Chicken": 8, "Eggs": 6, "Lentils": 14, "Tofu": 12, "Quinoa": 10, "Broccoli": 12, "Spinach": 10, "Chickpeas": 10 },
        message: "💚 Finding Balance: Strong planetary distribution showing excellent overall performance. A realistic, sustainable approach!",
        title: "Balanced Results"
    },
    {
        section: 0,
        duration: 6000,
        changes: {},
        message: "🎓 Journey Complete! You've seen how diet choices impact health and environment. Try the sliders yourself to find YOUR optimal balance!",
        title: "Your Turn!"
    }
];

function st_tu() {
    tu_mo = true;
    tu_st = 0;
    document.getElementById('tutorial-btn').style.display = 'none';
    document.getElementById('stop-tutorial-btn').style.display = 'inline-block';
    document.getElementById('tutorial-progress').style.opacity = '1';
    ru_tu_st();
}

function so_tu() {
    tu_mo = false;
    document.getElementById('tutorial-btn').style.display = 'inline-block';
    document.getElementById('stop-tutorial-btn').style.display = 'none';
    hi_tu_me();
}

function ru_tu_st() {
    if (!tu_mo || tu_st >= tu_sc.length) {
        so_tu();
        return;
    }

    const sc = tu_sc[tu_st];

    sh_tu_me(sc.message, sc.title);

    up_tu_pr();

    const se = document.querySelectorAll('.section');
    if (se[sc.section]) {
        se[sc.section].scrollIntoView({ behavior: 'smooth' });
    }

    setTimeout(() => {
        ap_sp_ch(sc.changes);
    }, 1000);

    tu_st++;
    setTimeout(() => {
        if (tu_mo) ru_tu_st();
    }, sc.duration);
}

function up_tu_pr() {
    const pr_ba = document.getElementById('tutorial-progress-fill');
    const pr_te = document.getElementById('tutorial-progress-text');

    const pr = ((tu_st + 1) / tu_sc.length) * 100;
    pr_ba.style.width = pr + '%';
    pr_te.textContent = `Chapter ${tu_st + 1} of ${tu_sc.length}`;
}

function ap_sp_ch(ch) {
    const ha_cu_sc = Object.keys(ch).length > 0;

    fo_da.forEach(f => {
        const ta_va = ha_cu_sc
            ? (Object.prototype.hasOwnProperty.call(ch, f.name) ? ch[f.name] : 0)
            : f.basePrice;
        an_sl_ch(f.name, ta_va);
    });
}

function an_sl_ch(fo_na, ta_va) {
    const cu_va = sp[fo_na];
    const du = 1500;
    const st_ps = 30;
    const in_cr = (ta_va - cu_va) / st_ps;
    let st = 0;

    const in_vl = setInterval(() => {
        st++;
        sp[fo_na] = cu_va + (in_cr * st);

        const sl = d3.select(`#slider-${fo_na}`).node();
        if (sl) {
            sl.value = sp[fo_na];
            d3.select(`#val-${fo_na}`).text('$' + sp[fo_na].toFixed(1));
        }

        up_al_vi();

        if (st >= st_ps) {
            clearInterval(in_vl);
            sp[fo_na] = ta_va;
        }
    }, du / st_ps);
}

function sh_tu_me(me, ti) {
    const ms_bo = document.getElementById('tutorial-message');
    const ti_bo = document.getElementById('tutorial-title');
    const co = document.getElementById('tutorial-message-container');

    ti_bo.textContent = ti || '';
    ms_bo.textContent = me;

    co.style.opacity = '1';
    ms_bo.style.opacity = '1';
    ms_bo.style.transform = 'translateY(0)';
}

function hi_tu_me() {
    const ms_bo = document.getElementById('tutorial-message');
    const co = document.getElementById('tutorial-message-container');
    const pr_co = document.getElementById('tutorial-progress');

    co.style.opacity = '0';
    ms_bo.style.opacity = '0';
    ms_bo.style.transform = 'translateY(-20px)';
    pr_co.style.opacity = '0';
}


function bu_sl() {
    const sl_co = d3.select('#sliders');
    sl_co.selectAll('*').remove();

    fo_da.forEach(f => {
        const it = sl_co.append('div')
            .attr('class', 'slider-item')
            .style('border-left-color', f.color);

        it.append('div')
            .attr('class', 'slider-label')
            .html(`
                <span>${f.emoji} ${f.name}</span>
                <span class="slider-value" id="val-${f.name}">$${f.basePrice}</span>
            `);

        it.append('input')
            .attr('type', 'range')
            .attr('id', `slider-${f.name}`)
            .attr('min', 0)
            .attr('max', 30)
            .attr('step', 0.5)
            .attr('value', f.basePrice)
            .on('input', function () {
                if (tu_mo) return;
                sp[f.name] = +this.value;
                d3.select(`#val-${f.name}`).text('$' + this.value);
                up_al_vi();
            });
    });
}

let v11_to = d3.select('.viz11-tooltip');

function ap_v11_to_st(se) {
    se
        .style('position', 'fixed')
        .style('padding', '12px 16px')
        .style('background', 'rgba(15, 20, 25, 0.95)')
        .style('color', '#e8eaed')
        .style('border-radius', '8px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('display', 'none')
        .style('font-size', '14px')
        .style('box-shadow', '0 4px 12px rgba(0,0,0,0.5)')
        .style('border', '1px solid rgba(59, 130, 246, 0.3)')
        .style('z-index', '9999')
        .style('transition', 'opacity 0.2s')
        .style('white-space', 'nowrap');
}

function en_v11_to() {
    if (v11_to.empty() || !v11_to.node() || !v11_to.node().isConnected) {
        v11_to = d3.select('.viz11-tooltip');
        if (v11_to.empty()) {
            v11_to = d3.select('body').append('div').attr('class', 'viz11-tooltip');
        }
    }

    const no = v11_to.node();
    if (no && no.parentNode !== document.body) {
        document.body.appendChild(no);
    }

    ap_v11_to_st(v11_to);
}

en_v11_to();

function sh_to(ev, f) {
    en_v11_to();
    const we = sp[f.name] * f.mass;
    v11_to.html(`
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">
            ${f.emoji} ${f.name}
        </div>
        <div style="margin-bottom: 4px;">Type: <span style="color: ${f.color}">${f.type}</span></div>
        <div style="margin-bottom: 4px;">Spending: $${sp[f.name].toFixed(2)}</div>
        <div style="margin-bottom: 4px;">Weight: ${we.toFixed(1)} units</div>
        <div style="margin-bottom: 4px;">Health ROI: <span style="color: ${f.healthROI > 0 ? '#10b981' : '#ef4444'}">${f.healthROI > 0 ? '+' : ''}${f.healthROI}</span></div>
        <div>Environment ROI: <span style="color: ${f.envROI > 0 ? '#10b981' : '#ef4444'}">${f.envROI > 0 ? '+' : ''}${f.envROI}</span></div>
    `)
        .style('left', (ev.clientX + 15) + 'px')
        .style('top', (ev.clientY - 15) + 'px')
        .style('display', 'block')
        .style('opacity', 1);
}

function hi_to() {
    en_v11_to();
    v11_to
        .style('opacity', 0)
        .style('display', 'none');
}

const se_wi = 1200;
const se_he = 700;
const se_sv = d3.select('#seesaw-viz')
    .attr('viewBox', `0 0 ${se_wi} ${se_he}`);

const ce_x = se_wi / 2;
const fu_y = se_he / 2 + 50;

const de = se_sv.append('defs');

const gr_gr = de.append('linearGradient')
    .attr('id', 'groundGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '0%').attr('y2', '100%');
gr_gr.append('stop').attr('offset', '0%').attr('stop-color', '#1a2332');
gr_gr.append('stop').attr('offset', '100%').attr('stop-color', '#0f1419');

se_sv.append('rect')
    .attr('x', 0)
    .attr('y', fu_y + 80)
    .attr('width', se_wi)
    .attr('height', 200)
    .attr('fill', 'url(#groundGradient)');

const fu_gr = de.append('linearGradient')
    .attr('id', 'fulcrumGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '0%').attr('y2', '100%');
fu_gr.append('stop').attr('offset', '0%').attr('stop-color', '#2563eb');
fu_gr.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6');

const fu = se_sv.append('g')
    .attr('transform', `translate(${ce_x},${fu_y})`);
fu.append('polygon')
    .attr('points', '-40,80 40,80 0,0')
    .attr('fill', 'url(#fulcrumGradient)')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 3);

const pl_gr = se_sv.append('g').attr('class', 'plank-group');
const pl_le = 500;

const pl_gr_ad = de.append('linearGradient')
    .attr('id', 'plankGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '0%');
pl_gr_ad.append('stop').attr('offset', '0%').attr('stop-color', '#ef4444');
pl_gr_ad.append('stop').attr('offset', '50%').attr('stop-color', '#64748b');
pl_gr_ad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981');

pl_gr.append('rect')
    .attr('x', -pl_le / 2)
    .attr('y', -15)
    .attr('width', pl_le)
    .attr('height', 30)
    .attr('rx', 15)
    .attr('fill', 'url(#plankGradient)')
    .attr('stroke', '#e8eaed')
    .attr('stroke-width', 2)
    .style('filter', 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))');

const le_si = pl_gr.append('g').attr('class', 'left-side');
const ri_si = pl_gr.append('g').attr('class', 'right-side');

const ra_wi = 1200;
const ra_he = 800;

const ra_sv = d3.select('#radial-viz')
    .attr('viewBox', `0 0 ${ra_wi} ${ra_he}`);

const ra_ce_x = ra_wi / 2;
const ra_ce_y = ra_he / 2;

const co_bg = ra_sv.append('g').attr('class', 'cosmic-bg');

const or = [50, 100, 150, 200, 250, 300];
or.forEach((ra, i) => {
    co_bg.append('circle')
        .attr('cx', ra_ce_x)
        .attr('cy', ra_ce_y)
        .attr('r', 0)
        .attr('fill', 'none')
        .attr('stroke', `rgba(59, 130, 246, ${0.3 - i * 0.04})`)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .transition()
        .delay(i * 200)
        .duration(1500)
        .attr('r', ra);

    if (i > 0) {
        co_bg.append('text')
            .attr('x', ra_ce_x)
            .attr('y', ra_ce_y - ra)
            .attr('text-anchor', 'middle')
            .attr('fill', `rgba(59, 130, 246, ${0.5 - i * 0.05})`)
            .attr('font-size', '12px')
            .attr('opacity', 0)
            .text(`+${i * 30} ROI`)
            .transition()
            .delay(i * 200 + 1000)
            .duration(500)
            .attr('opacity', 1);
    }
});

const co = ra_sv.append('g')
    .attr('transform', `translate(${ra_ce_x},${ra_ce_y})`);

co.append('circle')
    .attr('r', 0)
    .attr('fill', 'url(#coreGradient)')
    .style('filter', 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.8))')
    .transition()
    .duration(2000)
    .attr('r', 40);

const co_gr = de.append('radialGradient')
    .attr('id', 'coreGradient');
co_gr.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6');
co_gr.append('stop').attr('offset', '100%').attr('stop-color', '#2563eb');

co.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '.3em')
    .attr('fill', '#fff')
    .attr('font-size', '16px')
    .attr('font-weight', 'bold')
    .attr('opacity', 0)
    .text('YOU')
    .transition()
    .delay(1500)
    .duration(500)
    .attr('opacity', 1);

function pu_co() {
    co.select('circle')
        .transition()
        .duration(2000)
        .attr('r', 45)
        .transition()
        .duration(2000)
        .attr('r', 40)
        .on('end', pu_co);
}
setTimeout(pu_co, 2000);

const fo_pl = ra_sv.append('g').attr('class', 'food-planets');

function up_se() {
    const no_ve = fo_da.filter(f => f.type === 'animal');
    const ve = fo_da.filter(f => f.type === 'plant');

    const no_ve_to = no_ve.reduce((s, f) => s + sp[f.name] * f.mass, 0);
    const ve_to = ve.reduce((s, f) => s + sp[f.name] * f.mass, 0);

    const to_we = no_ve_to + ve_to;
    const ba = (ve_to - no_ve_to) / (to_we || 1);
    const an = ba * 25;

    pl_gr.transition().duration(1000).ease(d3.easeBounceOut)
        .attr('transform', `translate(${ce_x},${fu_y}) rotate(${an})`);

    d3.select('#non-vegan-total').text(no_ve.reduce((s, f) => s + sp[f.name], 0).toFixed(2));
    d3.select('#vegan-total').text(ve.reduce((s, f) => s + sp[f.name], 0).toFixed(2));

    le_si.selectAll('*').remove();
    ri_si.selectAll('*').remove();

    function re_si(it, gr, is_ve) {
        it.forEach((f, i) => {
            const we = sp[f.name] * f.mass;
            const si = Math.sqrt(we) * 8 + 20;
            const x = is_ve ? pl_le / 2 - 60 : -pl_le / 2 + 60;
            const y = -si - 20 - i * (si + 10);

            const g = gr.append('g')
                .attr('class', 'food-item')
                .style('cursor', 'pointer')
                .on('mouseover', function (ev) {
                    sh_to(ev, f);
                })
                .on('mousemove', function (ev) {
                    v11_to.style('left', (ev.clientX + 15) + 'px')
                        .style('top', (ev.clientY - 15) + 'px');
                })
                .on('mouseout', hi_to);

            g.attr('transform', `translate(${x},${-200})`)
                .transition().delay(i * 100).duration(800).ease(d3.easeBounceOut)
                .attr('transform', `translate(${x},${y})`);

            g.append('circle')
                .attr('r', 0)
                .attr('fill', f.color)
                .attr('stroke', '#e8eaed')
                .attr('stroke-width', 3)
                .style('filter', `drop-shadow(0 5px 15px ${f.color})`)
                .transition().delay(i * 100 + 400).duration(400)
                .attr('r', si / 2);

            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '.3em')
                .style('font-size', `${si / 2.5}px`)
                .style('opacity', 0)
                .text(f.emoji)
                .transition().delay(i * 100 + 600).duration(300)
                .style('opacity', 1);

            g.append('text')
                .attr('y', si / 2 + 20)
                .attr('text-anchor', 'middle')
                .attr('fill', '#e8eaed')
                .style('font-size', '11px')
                .style('font-weight', 'bold')
                .style('opacity', 0)
                .text(`${sp[f.name].toFixed(1)}`)
                .transition().delay(i * 100 + 700).duration(300)
                .style('opacity', 1);
        });
    }

    re_si(no_ve, le_si, false);
    re_si(ve, ri_si, true);
}


function up_ra() {
    fo_pl.selectAll('*').remove();

    const ro_sc = d3.scaleLinear().domain([-70, 100]).range([80, 300]);

    fo_da.forEach((f, i) => {
        const co_sc = f.healthROI + f.envROI;
        const an = (i / fo_da.length) * 2 * Math.PI - Math.PI / 2;
        const dist = ro_sc(co_sc);

        const x = Math.cos(an) * dist;
        const y = Math.sin(an) * dist;

        const si = Math.sqrt(sp[f.name]) * 6 + 15;

        const pl = fo_pl.append('g')
            .attr('transform', `translate(${ra_ce_x},${ra_ce_y})`)
            .style('cursor', 'pointer')
            .on('mouseover', function (ev) {
                sh_to(ev, f);
            })
            .on('mousemove', function (ev) {
                v11_to.style('left', (ev.clientX + 15) + 'px')
                    .style('top', (ev.clientY - 15) + 'px');
            })
            .on('mouseout', hi_to);

        pl.append('circle')
            .attr('r', 0)
            .attr('fill', f.color)
            .attr('opacity', 0.2)
            .transition().delay(i * 150).duration(1000)
            .attr('transform', `translate(${x},${y})`)
            .attr('r', si * 1.5);

        pl.append('circle')
            .attr('r', 0)
            .attr('fill', f.color)
            .attr('stroke', '#e8eaed')
            .attr('stroke-width', 2)
            .style('filter', `drop-shadow(0 0 15px ${f.color})`)
            .transition().delay(i * 150).duration(1000)
            .attr('transform', `translate(${x},${y})`)
            .attr('r', si);

        pl.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .text(f.emoji)
            .style('font-size', `${si * 0.8}px`)
            .style('opacity', 0)
            .transition().delay(i * 150 + 800).duration(400)
            .attr('transform', `translate(${x},${y})`)
            .style('opacity', 1);

        pl.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '2.8em')
            .text(f.name)
            .style('fill', '#e8eaed')
            .style('font-weight', 'bold')
            .style('opacity', 0)
            .transition().delay(i * 150 + 1000).duration(400)
            .attr('transform', `translate(${x},${y})`)
            .style('opacity', 1);
    });

    let to_he = 0;
    let to_en = 0;
    fo_da.forEach(f => {
        const we = sp[f.name] / 30;
        to_he += f.healthROI * we;
        to_en += f.envROI * we;
    });

    d3.select('#health-roi').text(to_he.toFixed(0));
    d3.select('#env-roi').text(to_en.toFixed(0));
    d3.select('#total-roi').text((to_he + to_en).toFixed(0));
}

function up_al_vi() {
    if (!fo_da.length) return;
    up_se();
    up_ra();
}

const ob = new IntersectionObserver((en) => {
    en.forEach(it => {
        if (it.isIntersecting) it.target.classList.add('active');
    });
}, { threshold: 0.3 });

document.querySelectorAll('.section').forEach(se => ob.observe(se));

window.addEventListener('DOMContentLoaded', () => {

    const co = document.getElementById('story-mode-container');

    if (co) {
        co.innerHTML = `
            <div id="tutorial-controls-container" style="display: flex; gap: 10px; pointer-events: auto;">
                <button id="tutorial-btn" style="
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 16px;
                    font-weight: bold;
                    border-radius: 50px;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                    transition: all 0.3s;
                ">▶ Start Story Mode</button>
                <button id="stop-tutorial-btn" style="
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    font-size: 16px;
                    font-weight: bold;
                    border-radius: 50px;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
                    transition: all 0.3s;
                    display: none;
                ">⬛ Stop Story</button>
            </div>
        `;

        const ms_co = document.createElement('div');
        ms_co.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s;
            pointer-events: none;
        `;
        ms_co.setAttribute('id', 'tutorial-message-container');
        ms_co.innerHTML = `
            <div style="
                background: linear-gradient(135deg, rgba(15, 20, 25, 0.98) 0%, rgba(20, 25, 35, 0.98) 100%);
                padding: 25px 40px;
                border-radius: 20px;
                border: 2px solid #3b82f6;
                box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4), 0 0 100px rgba(59, 130, 246, 0.2);
                max-width: 700px;
                backdrop-filter: blur(10px);
                pointer-events: auto;
            ">
                <div id="tutorial-title" style="
                    color: #3b82f6;
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    text-align: center;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                "></div>
                <div id="tutorial-message" style="
                    color: #e8eaed;
                    font-size: 18px;
                    text-align: center;
                    line-height: 1.6;
                    opacity: 0;
                    transform: translateY(-20px);
                    transition: all 0.3s;
                "></div>
                
                <!-- Progress Bar -->
                <div id="tutorial-progress" style="
                    margin-top: 20px;
                    opacity: 0;
                    transition: opacity 0.3s;
                ">
                    <div id="tutorial-progress-text" style="
                        color: #94a3b8;
                        font-size: 12px;
                        text-align: center;
                        margin-bottom: 8px;
                        font-weight: 600;
                        letter-spacing: 1px;
                    ">Chapter 1 of 17</div>
                    <div style="
                        background: rgba(59, 130, 246, 0.2);
                        height: 6px;
                        border-radius: 10px;
                        overflow: hidden;
                    ">
                        <div id="tutorial-progress-fill" style="
                            background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
                            height: 100%;
                            width: 0%;
                            border-radius: 10px;
                            transition: width 0.5s ease;
                            box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                        "></div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(ms_co);

        const tu_bu = document.getElementById('tutorial-btn');
        const st_bu = document.getElementById('stop-tutorial-btn');

        if (tu_bu && st_bu) {
            tu_bu.addEventListener('mouseenter', function () {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
            });
            tu_bu.addEventListener('mouseleave', function () {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
            });

            st_bu.addEventListener('mouseenter', function () {
                this.style.transform = 'scale(1.05)';
                this.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.6)';
            });
            st_bu.addEventListener('mouseleave', function () {
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
            });

            tu_bu.addEventListener('click', st_tu);
            st_bu.addEventListener('click', so_tu);
        }
    }
});
