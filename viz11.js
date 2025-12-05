/***************************************
 * LOAD REAL DATASET FROM CSV
 ***************************************/
let foodData = [];
let spending = {};
let tutorialMode = false;
let tutorialStep = 0;

d3.csv("hanif_data/food_dataset.csv").then(data => {
    // Convert CSV rows into usable objects
    foodData = data.map(d => ({
        name: d.name,
        type: d.type,
        basePrice: +d.basePrice,
        healthROI: +d.healthROI,
        envROI: +d.envROI,
        color: d.color,
        emoji: d.emoji,
        mass: +d.mass
    }));

    // Initialize spending object
    foodData.forEach(f => spending[f.name] = f.basePrice);

    // Build sliders dynamically
    buildSliders();

    // Render all D3 visualizations
    updateAllVisualizations();
});


/***************************************
 * PARTICLE BACKGROUND ANIMATION
 ***************************************/
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
for (let i = 0; i < 100; i++) {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1
    });
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.fillStyle = `rgba(59, 130, 246, ${0.3 + Math.sin(Date.now() / 1000 + i) * 0.2})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach((p2, j) => {
            if (i < j) {
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.strokeStyle = `rgba(59, 130, 246, ${0.2 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });
    });

    requestAnimationFrame(animateParticles);
}
animateParticles();


/***************************************
 * SCROLL PROGRESS BAR & SECTION REVEAL
 ***************************************/
window.addEventListener('scroll', () => {
    const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
    document.getElementById('progress').style.width = scrolled + '%';

    document.querySelectorAll('.section').forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75) {
            section.classList.add('active');
        }
    });
});


/***************************************
 * ENHANCED AUTO-SCROLL TUTORIAL SYSTEM
 ***************************************/
const tutorialScenarios = [
    {
        section: 0,
        duration: 4000,
        changes: {},
        message: "🌍 Welcome to Your Food Impact Journey! Let's explore how different diets affect your health and our planet.",
        title: "Introduction"
    },
    
    // THE STANDARD AMERICAN DIET
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
    
    // FLEXITARIAN APPROACH
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
    
    // MEDITERRANEAN DIET
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
    
    // PESCATARIAN
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
    
    // VEGETARIAN
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
    
    // FULL PLANT-BASED
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
    
    // PROTEIN-FOCUSED CARNIVORE (For Comparison)
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
    
    // OPTIMAL BALANCED
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
    
    // FINAL SUMMARY
    {
        section: 0,
        duration: 6000,
        changes: {},
        message: "🎓 Journey Complete! You've seen how diet choices impact health and environment. Try the sliders yourself to find YOUR optimal balance!",
        title: "Your Turn!"
    }
];

function startTutorial() {
    tutorialMode = true;
    tutorialStep = 0;
    document.getElementById('tutorial-btn').style.display = 'none';
    document.getElementById('stop-tutorial-btn').style.display = 'inline-block';
    document.getElementById('tutorial-progress').style.opacity = '1';
    runTutorialStep();
}

function stopTutorial() {
    tutorialMode = false;
    document.getElementById('tutorial-btn').style.display = 'inline-block';
    document.getElementById('stop-tutorial-btn').style.display = 'none';
    hideTutorialMessage();
}

function runTutorialStep() {
    if (!tutorialMode || tutorialStep >= tutorialScenarios.length) {
        stopTutorial();
        return;
    }

    const scenario = tutorialScenarios[tutorialStep];
    
    // Show message with title
    showTutorialMessage(scenario.message, scenario.title);
    
    // Update progress indicator
    updateTutorialProgress();
    
    // Scroll to section
    const sections = document.querySelectorAll('.section');
    if (sections[scenario.section]) {
        sections[scenario.section].scrollIntoView({ behavior: 'smooth' });
    }
    
    // Apply spending changes gradually
    setTimeout(() => {
        applySpendingChanges(scenario.changes);
    }, 1000);
    
    // Move to next step
    tutorialStep++;
    setTimeout(() => {
        if (tutorialMode) runTutorialStep();
    }, scenario.duration);
}

function updateTutorialProgress() {
    const progressBar = document.getElementById('tutorial-progress-fill');
    const progressText = document.getElementById('tutorial-progress-text');
    
    const progress = ((tutorialStep + 1) / tutorialScenarios.length) * 100;
    progressBar.style.width = progress + '%';
    progressText.textContent = `Chapter ${tutorialStep + 1} of ${tutorialScenarios.length}`;
}

function applySpendingChanges(changes) {
    const hasCustomScenario = Object.keys(changes).length > 0;
    
    foodData.forEach(food => {
        const targetValue = hasCustomScenario
            ? (Object.prototype.hasOwnProperty.call(changes, food.name) ? changes[food.name] : 0)
            : food.basePrice;
        animateSliderChange(food.name, targetValue);
    });
}

function animateSliderChange(foodName, targetValue) {
    const currentValue = spending[foodName];
    const duration = 1500;
    const steps = 30;
    const increment = (targetValue - currentValue) / steps;
    let step = 0;

    const interval = setInterval(() => {
        step++;
        spending[foodName] = currentValue + (increment * step);
        
        // Update slider
        const slider = d3.select(`#slider-${foodName}`).node();
        if (slider) {
            slider.value = spending[foodName];
            d3.select(`#val-${foodName}`).text('$' + spending[foodName].toFixed(1));
        }
        
        updateAllVisualizations();
        
        if (step >= steps) {
            clearInterval(interval);
            spending[foodName] = targetValue;
        }
    }, duration / steps);
}

function showTutorialMessage(message, title) {
    const msgBox = document.getElementById('tutorial-message');
    const titleBox = document.getElementById('tutorial-title');
    const container = document.getElementById('tutorial-message-container');
    
    titleBox.textContent = title || '';
    msgBox.textContent = message;
    
    container.style.opacity = '1';
    msgBox.style.opacity = '1';
    msgBox.style.transform = 'translateY(0)';
}

function hideTutorialMessage() {
    const msgBox = document.getElementById('tutorial-message');
    const container = document.getElementById('tutorial-message-container');
    const progressContainer = document.getElementById('tutorial-progress');
    
    container.style.opacity = '0';
    msgBox.style.opacity = '0';
    msgBox.style.transform = 'translateY(-20px)';
    progressContainer.style.opacity = '0';
}


/***************************************
 * SLIDER BUILDER (Runs after CSV loads)
 ***************************************/
function buildSliders() {
    const sliderContainer = d3.select('#sliders');
    sliderContainer.selectAll('*').remove();

    foodData.forEach(food => {
        const item = sliderContainer.append('div')
            .attr('class', 'slider-item')
            .style('border-left-color', food.color);

        item.append('div')
            .attr('class', 'slider-label')
            .html(`
                <span>${food.emoji} ${food.name}</span>
                <span class="slider-value" id="val-${food.name}">$${food.basePrice}</span>
            `);

        item.append('input')
            .attr('type', 'range')
            .attr('id', `slider-${food.name}`)
            .attr('min', 0)
            .attr('max', 30)
            .attr('step', 0.5)
            .attr('value', food.basePrice)
            .on('input', function () {
                if (tutorialMode) return; // Disable manual control during tutorial
                spending[food.name] = +this.value;
                d3.select(`#val-${food.name}`).text('$' + this.value);
                updateAllVisualizations();
            });
    });
}


/***************************************
 * TOOLTIP SYSTEM (SCOPED TO VIZ11)
 ***************************************/
// Scoped tooltip utilities
let viz11Tooltip = d3.select('.viz11-tooltip');

function applyViz11TooltipStyles(selection) {
    selection
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

function ensureViz11Tooltip() {
    if (viz11Tooltip.empty() || !viz11Tooltip.node() || !viz11Tooltip.node().isConnected) {
        viz11Tooltip = d3.select('.viz11-tooltip');
        if (viz11Tooltip.empty()) {
            viz11Tooltip = d3.select('body').append('div').attr('class', 'viz11-tooltip');
        }
    }

    const node = viz11Tooltip.node();
    if (node && node.parentNode !== document.body) {
        document.body.appendChild(node);
    }

    applyViz11TooltipStyles(viz11Tooltip);
}

ensureViz11Tooltip();

function showTooltip(event, food) {
    ensureViz11Tooltip();
    const weight = spending[food.name] * food.mass;
    viz11Tooltip.html(`
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 16px;">
            ${food.emoji} ${food.name}
        </div>
        <div style="margin-bottom: 4px;">Type: <span style="color: ${food.color}">${food.type}</span></div>
        <div style="margin-bottom: 4px;">Spending: $${spending[food.name].toFixed(2)}</div>
        <div style="margin-bottom: 4px;">Weight: ${weight.toFixed(1)} units</div>
        <div style="margin-bottom: 4px;">Health ROI: <span style="color: ${food.healthROI > 0 ? '#10b981' : '#ef4444'}">${food.healthROI > 0 ? '+' : ''}${food.healthROI}</span></div>
        <div>Environment ROI: <span style="color: ${food.envROI > 0 ? '#10b981' : '#ef4444'}">${food.envROI > 0 ? '+' : ''}${food.envROI}</span></div>
    `)
    .style('left', (event.clientX + 15) + 'px')
    .style('top', (event.clientY - 15) + 'px')
    .style('display', 'block')
    .style('opacity', 1);
}

function hideTooltip() {
    ensureViz11Tooltip();
    viz11Tooltip
        .style('opacity', 0)
        .style('display', 'none');
}


/***************************************
 * SEE-SAW VISUALIZATION
 ***************************************/
const seesawWidth = 1200;
const seesawHeight = 700;
const seesawSvg = d3.select('#seesaw-viz')
    .attr('viewBox', `0 0 ${seesawWidth} ${seesawHeight}`);

const centerX = seesawWidth / 2;
const fulcrumY = seesawHeight / 2 + 50;

const defs = seesawSvg.append('defs');

// Ground Gradient
const groundGrad = defs.append('linearGradient')
    .attr('id', 'groundGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '0%').attr('y2', '100%');
groundGrad.append('stop').attr('offset', '0%').attr('stop-color', '#1a2332');
groundGrad.append('stop').attr('offset', '100%').attr('stop-color', '#0f1419');

// Draw ground
seesawSvg.append('rect')
    .attr('x', 0)
    .attr('y', fulcrumY + 80)
    .attr('width', seesawWidth)
    .attr('height', 200)
    .attr('fill', 'url(#groundGradient)');

// Fulcrum Gradient
const fulcrumGrad = defs.append('linearGradient')
    .attr('id', 'fulcrumGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '0%').attr('y2', '100%');
fulcrumGrad.append('stop').attr('offset', '0%').attr('stop-color', '#2563eb');
fulcrumGrad.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6');

// Fulcrum triangle
const fulcrum = seesawSvg.append('g')
    .attr('transform', `translate(${centerX},${fulcrumY})`);
fulcrum.append('polygon')
    .attr('points', '-40,80 40,80 0,0')
    .attr('fill', 'url(#fulcrumGradient)')
    .attr('stroke', '#3b82f6')
    .attr('stroke-width', 3);

// Plank group
const plankGroup = seesawSvg.append('g').attr('class', 'plank-group');
const plankLength = 500;

// Plank graphic
const plankGrad = defs.append('linearGradient')
    .attr('id', 'plankGradient')
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '0%');
plankGrad.append('stop').attr('offset', '0%').attr('stop-color', '#ef4444');
plankGrad.append('stop').attr('offset', '50%').attr('stop-color', '#64748b');
plankGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981');

plankGroup.append('rect')
    .attr('x', -plankLength / 2)
    .attr('y', -15)
    .attr('width', plankLength)
    .attr('height', 30)
    .attr('rx', 15)
    .attr('fill', 'url(#plankGradient)')
    .attr('stroke', '#e8eaed')
    .attr('stroke-width', 2)
    .style('filter', 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))');

const leftSide = plankGroup.append('g').attr('class', 'left-side');
const rightSide = plankGroup.append('g').attr('class', 'right-side');


/***************************************
 * RADIAL COSMIC VISUALIZATION
 ***************************************/
const radialWidth = 1200;
const radialHeight = 800;

const radialSvg = d3.select('#radial-viz')
    .attr('viewBox', `0 0 ${radialWidth} ${radialHeight}`);

const radialCenterX = radialWidth / 2;
const radialCenterY = radialHeight / 2;

const cosmicBg = radialSvg.append('g').attr('class', 'cosmic-bg');

// Orbital rings
const orbits = [50, 100, 150, 200, 250, 300];
orbits.forEach((radius, i) => {
    cosmicBg.append('circle')
        .attr('cx', radialCenterX)
        .attr('cy', radialCenterY)
        .attr('r', 0)
        .attr('fill', 'none')
        .attr('stroke', `rgba(59, 130, 246, ${0.3 - i * 0.04})`)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .transition()
        .delay(i * 200)
        .duration(1500)
        .attr('r', radius);

    if (i > 0) {
        cosmicBg.append('text')
            .attr('x', radialCenterX)
            .attr('y', radialCenterY - radius)
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

// Core
const core = radialSvg.append('g')
    .attr('transform', `translate(${radialCenterX},${radialCenterY})`);

core.append('circle')
    .attr('r', 0)
    .attr('fill', 'url(#coreGradient)')
    .style('filter', 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.8))')
    .transition()
    .duration(2000)
    .attr('r', 40);

// Core gradient
const coreGrad = defs.append('radialGradient')
    .attr('id', 'coreGradient');
coreGrad.append('stop').attr('offset', '0%').attr('stop-color', '#3b82f6');
coreGrad.append('stop').attr('offset', '100%').attr('stop-color', '#2563eb');

core.append('text')
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


function pulseCore() {
    core.select('circle')
        .transition()
        .duration(2000)
        .attr('r', 45)
        .transition()
        .duration(2000)
        .attr('r', 40)
        .on('end', pulseCore);
}
setTimeout(pulseCore, 2000);

const foodPlanets = radialSvg.append('g').attr('class', 'food-planets');


/***************************************
 * SEE-SAW UPDATE FUNCTION
 ***************************************/
function updateSeeSaw() {
    const nonVegan = foodData.filter(f => f.type === 'animal');
    const vegan = foodData.filter(f => f.type === 'plant');

    const nonVeganTotal = nonVegan.reduce((sum, f) => sum + spending[f.name] * f.mass, 0);
    const veganTotal = vegan.reduce((sum, f) => sum + spending[f.name] * f.mass, 0);

    const totalWeight = nonVeganTotal + veganTotal;
    const balance = (veganTotal - nonVeganTotal) / (totalWeight || 1);
    const angle = balance * 25;

    plankGroup.transition().duration(1000).ease(d3.easeBounceOut)
        .attr('transform', `translate(${centerX},${fulcrumY}) rotate(${angle})`);

    d3.select('#non-vegan-total').text(nonVegan.reduce((s, f) => s + spending[f.name], 0).toFixed(2));
    d3.select('#vegan-total').text(vegan.reduce((s, f) => s + spending[f.name], 0).toFixed(2));

    leftSide.selectAll('*').remove();
    rightSide.selectAll('*').remove();

    function renderSide(items, group, isVegan) {
        items.forEach((food, i) => {
            const weight = spending[food.name] * food.mass;
            const size = Math.sqrt(weight) * 8 + 20;
            const xPos = isVegan ? plankLength / 2 - 60 : -plankLength / 2 + 60;
            const yPos = -size - 20 - i * (size + 10);

            const g = group.append('g')
                .attr('class', 'food-item')
                .style('cursor', 'pointer')
                .on('mouseover', function(event) {
                    showTooltip(event, food);
                })
                .on('mousemove', function(event) {
                    viz11Tooltip.style('left', (event.clientX + 15) + 'px')
                           .style('top', (event.clientY - 15) + 'px');
                })
                .on('mouseout', hideTooltip);

            g.attr('transform', `translate(${xPos},${-200})`)
                .transition().delay(i * 100).duration(800).ease(d3.easeBounceOut)
                .attr('transform', `translate(${xPos},${yPos})`);

            g.append('circle')
                .attr('r', 0)
                .attr('fill', food.color)
                .attr('stroke', '#e8eaed')
                .attr('stroke-width', 3)
                .style('filter', `drop-shadow(0 5px 15px ${food.color})`)
                .transition().delay(i * 100 + 400).duration(400)
                .attr('r', size / 2);

            g.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', '.3em')
                .style('font-size', `${size / 2.5}px`)
                .style('opacity', 0)
                .text(food.emoji)
                .transition().delay(i * 100 + 600).duration(300)
                .style('opacity', 1);

            g.append('text')
                .attr('y', size / 2 + 20)
                .attr('text-anchor', 'middle')
                .attr('fill', '#e8eaed')
                .style('font-size', '11px')
                .style('font-weight', 'bold')
                .style('opacity', 0)
                .text(`${spending[food.name].toFixed(1)}`)
                .transition().delay(i * 100 + 700).duration(300)
                .style('opacity', 1);
        });
    }

    renderSide(nonVegan, leftSide, false);
    renderSide(vegan, rightSide, true);
}


/***************************************
 * RADIAL UPDATE FUNCTION
 ***************************************/
function updateRadial() {
    foodPlanets.selectAll('*').remove();

    const roiScale = d3.scaleLinear().domain([-70, 100]).range([80, 300]);

    foodData.forEach((food, i) => {
        const combined = food.healthROI + food.envROI;
        const angle = (i / foodData.length) * 2 * Math.PI - Math.PI / 2;
        const dist = roiScale(combined);

        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;

        const size = Math.sqrt(spending[food.name]) * 6 + 15;

        const planet = foodPlanets.append('g')
            .attr('transform', `translate(${radialCenterX},${radialCenterY})`)
            .style('cursor', 'pointer')
            .on('mouseover', function(event) {
                showTooltip(event, food);
            })
            .on('mousemove', function(event) {
                viz11Tooltip.style('left', (event.clientX + 15) + 'px')
                       .style('top', (event.clientY - 15) + 'px');
            })
            .on('mouseout', hideTooltip);

        planet.append('circle')
            .attr('r', 0)
            .attr('fill', food.color)
            .attr('opacity', 0.2)
            .transition().delay(i * 150).duration(1000)
            .attr('transform', `translate(${x},${y})`)
            .attr('r', size * 1.5);

        planet.append('circle')
            .attr('r', 0)
            .attr('fill', food.color)
            .attr('stroke', '#e8eaed')
            .attr('stroke-width', 2)
            .style('filter', `drop-shadow(0 0 15px ${food.color})`)
            .transition().delay(i * 150).duration(1000)
            .attr('transform', `translate(${x},${y})`)
            .attr('r', size);

        planet.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em')
            .text(food.emoji)
            .style('font-size', `${size * 0.8}px`)
            .style('opacity', 0)
            .transition().delay(i * 150 + 800).duration(400)
            .attr('transform', `translate(${x},${y})`)
            .style('opacity', 1);

        planet.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '2.8em')
            .text(food.name)
            .style('fill', '#e8eaed')
            .style('font-weight', 'bold')
            .style('opacity', 0)
            .transition().delay(i * 150 + 1000).duration(400)
            .attr('transform', `translate(${x},${y})`)
            .style('opacity', 1);
    });

    // ROI totals
    let totalHealth = 0;
    let totalEnv = 0;
    foodData.forEach(food => {
        const weight = spending[food.name] / 30;
        totalHealth += food.healthROI * weight;
        totalEnv += food.envROI * weight;
    });

    d3.select('#health-roi').text(totalHealth.toFixed(0));
    d3.select('#env-roi').text(totalEnv.toFixed(0));
    d3.select('#total-roi').text((totalHealth + totalEnv).toFixed(0));
}


/***************************************
 * MASTER UPDATE FUNCTION
 ***************************************/
function updateAllVisualizations() {
    if (!foodData.length) return;
    updateSeeSaw();
    updateRadial();
}


/***************************************
 * SECTION FADE-IN OBSERVER
 ***************************************/
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
    });
}, { threshold: 0.3 });

document.querySelectorAll('.section').forEach(section => observer.observe(section));


/***************************************
 * INITIALIZE TUTORIAL BUTTONS & UI
 ***************************************/
window.addEventListener('DOMContentLoaded', () => {
    // Create tutorial control buttons and enhanced message display
    const tutorialControls = document.createElement('div');
    tutorialControls.innerHTML = `
        <!-- Tutorial Buttons -->
        <div style="position: fixed; bottom: 30px; right: 30px; z-index: 10000; display: flex; gap: 10px;">
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
        
        <!-- Enhanced Tutorial Message Box -->
        <div style="
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            opacity: 0;
            transition: all 0.3s;
        " id="tutorial-message-container">
            <div style="
                background: linear-gradient(135deg, rgba(15, 20, 25, 0.98) 0%, rgba(20, 25, 35, 0.98) 100%);
                padding: 25px 40px;
                border-radius: 20px;
                border: 2px solid #3b82f6;
                box-shadow: 0 20px 60px rgba(59, 130, 246, 0.4), 0 0 100px rgba(59, 130, 246, 0.2);
                max-width: 700px;
                backdrop-filter: blur(10px);
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
        </div>
    `;
    document.body.appendChild(tutorialControls);

    // Add hover effects
    const tutorialBtn = document.getElementById('tutorial-btn');
    const stopBtn = document.getElementById('stop-tutorial-btn');
    
    tutorialBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
    });
    tutorialBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
    });
    
    stopBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.05)';
        this.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.6)';
    });
    stopBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
    });

    // Attach click handlers
    tutorialBtn.addEventListener('click', startTutorial);
    stopBtn.addEventListener('click', stopTutorial);
});
                
