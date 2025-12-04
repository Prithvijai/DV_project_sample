//Rishikumar Senthilvel
//rsenthi4@asu.edu

// Store our data
let dishes = [];
let subs = [];
let links = [];
let dataLoaded = false;

// Load and categorize all ingredients
async function loadAndProcessData() {
    try {
        const response = await fetch('Rishikumar_data/substitution_flow_enriched (1).json');
        const rawData = await response.json();
        
        const categories = {
            'Dairy Products': ['milk', 'butter', 'cream', 'cheese', 'yogurt', 'sour cream', 'whey', 'margarine'],
            'Animal Protein': ['chicken', 'beef', 'pork', 'turkey', 'fish', 'salmon', 'egg', 'ground beef', 'ground meat', 'meat'],
            'Oils & Fats': ['vegetable oil', 'olive oil', 'coconut oil', 'lard', 'shortening', 'canola oil'],
            'Stocks & Broths': ['chicken stock', 'beef broth', 'chicken broth', 'beef stock', 'broth'],
        };
        
        const substituteCategories = {
            'Plant Milk': ['soy milk', 'soymilk', 'almond milk', 'coconut milk', 'oat milk', 'rice milk'],
            'Plant Protein': ['tofu', 'tempeh', 'seitan', 'lentil', 'bean', 'chickpea', 'veggie crumble', 'textured soy'],
            'Vegetables': ['broccoli', 'zucchini', 'eggplant', 'mushroom', 'cauliflower', 'squash', 'carrot', 'celery', 'artichoke'],
            'Fruit-Based': ['applesauce', 'banana', 'apple juice', 'pineapple juice', 'apple', 'cranberry', 'grape juice'],
            'Nuts & Seeds': ['almond butter', 'peanut butter', 'cashew', 'tahini', 'nut'],
            'Plant Stocks': ['vegetable broth', 'vegetable stock', 'mushroom broth']
        };
        
        function categorizeIngredient(ingredient, categoryMap) {
            ingredient = ingredient.toLowerCase();
            for (const [category, keywords] of Object.entries(categoryMap)) {
                if (keywords.some(kw => ingredient.includes(kw))) {
                    return category;
                }
            }
            return null;
        }
        
        const linkMap = new Map();
        
        rawData.forEach(item => {
            const origCat = categorizeIngredient(item.original_ingredient, categories);
            const subCat = categorizeIngredient(item.substitute_ingredient, substituteCategories);
            
            if (!origCat || !subCat) return;
            
            const key = `${origCat}→${subCat}`;
            if (!linkMap.has(key)) {
                linkMap.set(key, {
                    source: origCat,
                    target: subCat,
                    count: 0,
                    examples: []
                });
            }
            
            const link = linkMap.get(key);
            link.count++;
            
            if (link.examples.length < 2) {
                link.examples.push({
                    original: item.original_ingredient,
                    substitute: item.substitute_ingredient
                });
            }
        });
        
        // Calculate nutrition benefits for each link
        const processedLinks = Array.from(linkMap.values())
            .filter(link => link.count >= 10)
            .map(link => {
                let avgCalReduction = 0;
                let avgProteinChange = 0;
                let avgFiberIncrease = 0;
                let validCount = 0;
                
                link.examples.forEach(ex => {
                    const origNut = rawData.find(d => 
                        d.original_ingredient === ex.original && 
                        d.substitute_ingredient === ex.substitute
                    );
                    
                    if (origNut && origNut.original_nutrients && origNut.substitute_nutrients) {
                        avgCalReduction += (origNut.original_nutrients.kcal - origNut.substitute_nutrients.kcal);
                        avgProteinChange += (origNut.substitute_nutrients.protein_g - origNut.original_nutrients.protein_g);
                        avgFiberIncrease += (origNut.substitute_nutrients.fiber_g - origNut.original_nutrients.fiber_g);
                        validCount++;
                    }
                });
                
                if (validCount > 0) {
                    link.avgCalReduction = avgCalReduction / validCount;
                    link.avgProteinChange = avgProteinChange / validCount;
                    link.avgFiberIncrease = avgFiberIncrease / validCount;
                } else {
                    link.avgCalReduction = 0;
                    link.avgProteinChange = 0;
                    link.avgFiberIncrease = 0;
                }
                
                return link;
            })
            .sort((a, b) => b.count - a.count);
        
        const sources = [...new Set(processedLinks.map(l => l.source))];
        const targets = [...new Set(processedLinks.map(l => l.target))];
        
        dishes = sources.map((name, i) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            cuisine: 'Animal-Based',
            order: i
        }));
        
        subs = targets.map((name, i) => ({
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: name,
            type: 'Plant-Based',
            diet: 'vegan',
            order: i
        }));
        
        links = processedLinks.map(link => {
            let badge = '';
            if (link.avgCalReduction > 20) badge = 'lower-cal';
            else if (link.avgFiberIncrease > 0.5) badge = 'high-fiber';
            
            return {
                source: link.source.toLowerCase().replace(/\s+/g, '-'),
                target: link.target.toLowerCase().replace(/\s+/g, '-'),
                count: link.count,
                examples: link.examples,
                why: link.examples.map(ex => `${ex.original} → ${ex.substitute}`).join(' • '),
                avgCalReduction: link.avgCalReduction,
                avgProteinChange: link.avgProteinChange,
                avgFiberIncrease: link.avgFiberIncrease,
                badge: badge,
                bestMatch: rawData.find(d => 
                    link.examples.some(ex => 
                        d.original_ingredient === ex.original && 
                        d.substitute_ingredient === ex.substitute
                    )
                )
            };
        });
        
        const minCount = d3.min(links, d => d.count);
        const maxCount = d3.max(links, d => d.count);
        linkWidthScale = d3.scaleLinear().domain([minCount, maxCount]).range([3, 24]);
        
        dataLoaded = true;
        return true;
    } catch (error) {
        console.error('Error loading data:', error);
        dataLoaded = false;
        return false;
    }
}

const flowConfig = {
    width: 950,
    height: 620,
    margin: { top: 40, right: 20, bottom: 40, left: 20 },
    nodeWidth: 180,
    nodeHeight: 55,
    nodeRadius: 12
};

const innerFlowWidth = flowConfig.width - flowConfig.margin.left - flowConfig.margin.right;
const innerFlowHeight = flowConfig.height - flowConfig.margin.top - flowConfig.margin.bottom;

let currentFilter = 'all';
let selectedDish = null;
let linkWidthScale = null;

function calculatePositions() {
    const positions = { dishes: {}, subs: {} };
    const availableHeight = flowConfig.height - flowConfig.margin.top - flowConfig.margin.bottom;
    
    const leftSpacing = Math.min(availableHeight / (dishes.length + 1), 100);
    const leftStartY = flowConfig.margin.top + (availableHeight - (dishes.length - 1) * leftSpacing) / 2;
    const xLeft = flowConfig.margin.left + 20;
    
    dishes.forEach((dish, i) => {
        positions.dishes[dish.id] = {
            x: xLeft,
            y: leftStartY + i * leftSpacing,
            width: flowConfig.nodeWidth,
            height: flowConfig.nodeHeight
        };
    });
    
    const rightSpacing = Math.min(availableHeight / (subs.length + 1), 100);
    const rightStartY = flowConfig.margin.top + (availableHeight - (subs.length - 1) * rightSpacing) / 2;
    const xRight = flowConfig.width - flowConfig.margin.right - flowConfig.nodeWidth - 20;
    
    subs.forEach((sub, i) => {
        positions.subs[sub.id] = {
            x: xRight,
            y: rightStartY + i * rightSpacing,
            width: flowConfig.nodeWidth,
            height: flowConfig.nodeHeight
        };
    });
    
    return positions;
}

function createLinkPath(sourcePos, targetPos) {
    const sx = sourcePos.x + sourcePos.width;
    const sy = sourcePos.y + sourcePos.height / 2;
    const tx = targetPos.x;
    const ty = targetPos.y + targetPos.height / 2;
    const controlOffset = 60;
    return `M ${sx},${sy} C ${sx + controlOffset},${sy} ${tx - controlOffset},${ty} ${tx},${ty}`;
}

// Draw the main flow visualization
function createFlowChart() {
    d3.select("#substitution-chart").selectAll("*").remove();
    
    const positions = calculatePositions();
    const svg = d3.select("#substitution-chart").append("svg").attr("width", flowConfig.width).attr("height", flowConfig.height);
    
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient").attr("id", "link-gradient").attr("x1", "0%").attr("x2", "100%");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#9AD1B3").attr("stop-opacity", 0.6);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#9AD1B3").attr("stop-opacity", 0.8);
    
    const linksGroup = svg.append("g").attr("class", "links-group");
    const nodesGroup = svg.append("g").attr("class", "nodes-group");
    
    const linkData = links.map(link => ({
        ...link,
        path: createLinkPath(positions.dishes[link.source], positions.subs[link.target])
    }));
    
    // Draw white halos for visibility
    linksGroup.selectAll(".flow-link-halo")
        .data(linkData)
        .join("path")
        .attr("class", "flow-link-halo")
        .attr("d", d => d.path)
        .attr("stroke", "white")
        .attr("stroke-width", d => linkWidthScale(d.count) + 4)
        .attr("fill", "none")
        .attr("opacity", 0.8)
        .style("pointer-events", "none");
    
    // Draw colored links
    const linkElements = linksGroup.selectAll(".flow-link")
        .data(linkData)
        .join("path")
        .attr("class", d => `flow-link ${d.badge ? 'has-badge' : ''}`)
        .attr("d", d => d.path)
        .attr("stroke", "url(#link-gradient)")
        .attr("stroke-width", d => linkWidthScale(d.count))
        .attr("fill", "none")
        .attr("data-source", d => d.source)
        .attr("data-target", d => d.target)
        .on("mouseenter", handleLinkHover)
        .on("mousemove", handleLinkMove)
        .on("mouseleave", handleLinkLeave);
    
    
    // Draw animal-based nodes on left
    const dishNodes = nodesGroup.selectAll(".dish-node")
        .data(dishes)
        .join("g")
        .attr("class", "dish-node")
        .attr("transform", d => `translate(${positions.dishes[d.id].x}, ${positions.dishes[d.id].y})`)
        .on("click", handleDishClick);
    
    dishNodes.append("rect").attr("width", flowConfig.nodeWidth).attr("height", flowConfig.nodeHeight).attr("rx", flowConfig.nodeRadius);
    
    dishNodes.append("text")
        .attr("class", "node-title")
        .attr("x", flowConfig.nodeWidth / 2).attr("y", flowConfig.nodeHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(d => d.name)
        .each(function(d) {
            const text = d3.select(this);
            const words = d.name.split(/\s+/);
            if (words.length > 2) {
                text.text('');
                text.append("tspan").attr("x", flowConfig.nodeWidth / 2).attr("dy", "-0.3em").text(words.slice(0, 2).join(' '));
                text.append("tspan").attr("x", flowConfig.nodeWidth / 2).attr("dy", "1.1em").text(words.slice(2).join(' '));
            }
        });
    
    // Draw plant-based nodes on right
    const subNodes = nodesGroup.selectAll(".substitute-node")
        .data(subs)
        .join("g")
        .attr("class", "substitute-node")
        .attr("transform", d => `translate(${positions.subs[d.id].x}, ${positions.subs[d.id].y})`);
    
    subNodes.append("rect").attr("width", flowConfig.nodeWidth).attr("height", flowConfig.nodeHeight).attr("rx", flowConfig.nodeRadius);
    
    subNodes.append("text")
        .attr("class", "node-title")
        .attr("x", flowConfig.nodeWidth / 2).attr("y", flowConfig.nodeHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(d => d.name)
        .each(function(d) {
            const text = d3.select(this);
            const words = d.name.split(/\s+/);
            if (words.length > 2) {
                text.text('');
                text.append("tspan").attr("x", flowConfig.nodeWidth / 2).attr("dy", "-0.3em").text(words.slice(0, 2).join(' '));
                text.append("tspan").attr("x", flowConfig.nodeWidth / 2).attr("dy", "1.1em").text(words.slice(2).join(' '));
            }
        });
    
    applyFilter(currentFilter);
}

function handleLinkHover(event, d) {
    if (selectedDish) return;
    
    d3.select(event.currentTarget).classed("highlighted", true);
    d3.selectAll(".flow-link").filter(link => link !== d).classed("dimmed", true);
    d3.selectAll(".flow-link-halo").filter(link => link !== d).classed("dimmed", true);
    d3.selectAll(".dish-node").classed("highlighted", node => node.id === d.source).classed("dimmed", node => node.id !== d.source);
    d3.selectAll(".substitute-node").classed("highlighted", node => node.id === d.target).classed("dimmed", node => node.id !== d.target);
    
    const tooltip = d3.select("#flow-tooltip");
    const sourceDish = dishes.find(dish => dish.id === d.source);
    const targetSub = subs.find(sub => sub.id === d.target);
    
    tooltip.classed("visible", true);
    
    let nutritionHtml = '';
    const benefits = [];
    
    if (d.avgCalReduction > 5) {
        benefits.push(`<span class="nutrition-badge cal-badge">-${Math.round(d.avgCalReduction)} cal</span>`);
    }
    if (d.avgFiberIncrease > 0.3) {
        benefits.push(`<span class="nutrition-badge fiber-badge">+${d.avgFiberIncrease.toFixed(1)}g fiber</span>`);
    }
    
    if (benefits.length > 0) {
        nutritionHtml = `<div style="margin-top: 0.5rem; display: flex; gap: 0.25rem; flex-wrap: wrap;">${benefits.join('')}</div>`;
    }
    
    const exampleText = d.examples && d.examples.length > 0 
        ? `<div style="font-size: 11px; color: rgba(255,255,255,0.75); margin-top: 0.5rem;">Example: ${d.examples[0].original} → ${d.examples[0].substitute}</div>`
        : '';
    
    tooltip.html(`
        <div class="tooltip-species"><strong>${sourceDish.name}</strong> → <strong>${targetSub.name}</strong></div>
        <div style="margin-top: 0.25rem; font-size: 12px; color: rgba(255,255,255,0.9);">
            ${d.count} substitution options
        </div>
        ${nutritionHtml}
        ${exampleText}
    `);
}

function handleLinkMove(event) {
    const tooltip = d3.select("#flow-tooltip");
    const tooltipNode = tooltip.node();
    const tooltipWidth = tooltipNode.offsetWidth;
    const tooltipHeight = tooltipNode.offsetHeight;
    
    let left = event.pageX + 15;
    let top = event.pageY - tooltipHeight / 2;
    
    if (left + tooltipWidth > window.innerWidth) {
        left = event.pageX - tooltipWidth - 15;
    }
    
    tooltip.style("left", `${left}px`).style("top", `${top}px`);
}

function handleLinkLeave() {
    if (selectedDish) return;
    d3.selectAll(".flow-link").classed("highlighted", false).classed("dimmed", false);
    d3.selectAll(".flow-link-halo").classed("dimmed", false);
    d3.selectAll(".dish-node").classed("highlighted", false).classed("dimmed", false);
    d3.selectAll(".substitute-node").classed("highlighted", false).classed("dimmed", false);
    d3.select("#flow-tooltip").classed("visible", false);
}

function handleDishClick(event, d) {
    if (selectedDish === d.id) {
        selectedDish = null;
        hideRecipeCard();
        resetHighlights();
    } else {
        selectedDish = d.id;
        showRecipeCard(d);
        highlightDishConnections(d.id);
    }
}

function highlightDishConnections(dishId) {
    const connectedLinks = links.filter(link => link.source === dishId);
    const connectedTargets = connectedLinks.map(link => link.target);
    
    d3.selectAll(".flow-link").classed("highlighted", link => link.source === dishId).classed("dimmed", link => link.source !== dishId);
    d3.selectAll(".flow-link-halo").classed("dimmed", link => link.source !== dishId);
    d3.selectAll(".dish-node").classed("highlighted", node => node.id === dishId).classed("dimmed", node => node.id !== dishId);
    d3.selectAll(".substitute-node").classed("highlighted", node => connectedTargets.includes(node.id)).classed("dimmed", node => !connectedTargets.includes(node.id));
}

function resetHighlights() {
    d3.selectAll(".flow-link").classed("highlighted", false).classed("dimmed", false);
    d3.selectAll(".flow-link-halo").classed("dimmed", false);
    d3.selectAll(".dish-node").classed("highlighted", false).classed("dimmed", false);
    d3.selectAll(".substitute-node").classed("highlighted", false).classed("dimmed", false);
}

function showRecipeCard(dish) {
    const recipeCard = d3.select("#recipe-card");
    const connectedLinks = links.filter(link => link.source === dish.id).sort((a, b) => b.avgCalReduction - a.avgCalReduction);
    
    if (connectedLinks.length === 0) return;
    
    d3.select("#recipe-title").text(`${dish.name} Alternatives`);
    
    const recipeList = d3.select("#recipe-list");
    recipeList.selectAll("*").remove();
    
    connectedLinks.slice(0, 4).forEach(link => {
        const subName = subs.find(s => s.id === link.target)?.name || link.target;
        const benefits = [];
        if (link.avgCalReduction > 5) {
            benefits.push(`<span class="nutrition-badge cal-badge">-${Math.round(link.avgCalReduction)} cal avg</span>`);
        }
        if (link.avgFiberIncrease > 0.3) {
            benefits.push(`<span class="nutrition-badge fiber-badge">+${link.avgFiberIncrease.toFixed(1)}g fiber</span>`);
        }
        
        const benefitHtml = benefits.length > 0 ? `<div style="margin-top: 0.35rem;">${benefits.join(' ')}</div>` : '';
        
        recipeList.append("li").html(`
            <strong>${subName}</strong><br/>
            <span style="font-size: 11px; color: #90a4ae;">${link.count} options available</span>
            ${benefitHtml}
        `);
    });
    
    recipeCard.classed("hidden", false);
}

function hideRecipeCard() {
    d3.select("#recipe-card").classed("hidden", true);
}

function applyFilter(filter) {
    currentFilter = filter;
    
    if (filter === 'all') {
        d3.selectAll(".flow-link").style("display", "block");
        d3.selectAll(".substitute-node").style("opacity", 1);
    } else {
        d3.selectAll(".flow-link").style("display", function(d) {
            const targetSub = subs.find(sub => sub.id === d.target);
            return targetSub.diet === filter ? "block" : "none";
        });
        
        d3.selectAll(".substitute-node").style("opacity", function(d) {
            return d.diet === filter ? 1 : 0.3;
        });
    }
}

function handleFilterClick(filter) {
    d3.selectAll(".filter-chip").classed("active", function() {
        return this.dataset.filter === filter;
    });
    
    if (selectedDish) {
        selectedDish = null;
        hideRecipeCard();
        resetHighlights();
    }
    
    applyFilter(filter);
}

document.querySelectorAll(".filter-chip").forEach(chip => {
    chip.addEventListener("click", function() {
        handleFilterClick(this.dataset.filter);
    });
});

document.getElementById("close-recipe").addEventListener("click", () => {
    selectedDish = null;
    hideRecipeCard();
    resetHighlights();
});

async function initialize() {
    d3.select("#substitution-chart").html('<div style="text-align: center; padding: 100px; color: #546e7a;">Loading substitution data...</div>');
    
    const loaded = await loadAndProcessData();
    
    if (loaded && dataLoaded) {
        createFlowChart();
    } else {
        d3.select("#substitution-chart").html('<div style="text-align: center; padding: 100px; color: #B6473B;">Error loading data. Please refresh the page.</div>');
    }
}
initialize();

// Redraw on window resize
let flowResizeTimer;
window.addEventListener("resize", () => {
    clearTimeout(flowResizeTimer);
    flowResizeTimer = setTimeout(() => {
        createFlowChart();
        if (selectedDish) {
            const dish = dishes.find(d => d.id === selectedDish);
            if (dish) {
                showRecipeCard(dish);
                highlightDishConnections(selectedDish);
            }
        }
    }, 250);
});
