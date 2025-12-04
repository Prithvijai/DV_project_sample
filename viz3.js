//Rishikumar Senthilvel
//rsenthi4@asu.edu

// Store our data
let lifespanData = [];
let slaughterData = {};
let slaughterTimeSeries = {};
let selectedAnimal = null;

function parseTimeToWeeks(timeString) {
    const cleaned = timeString.replace(/\*/g, '').replace(/Up to\s+/i, '').trim();
    const rangeMatch = cleaned.match(/(\d+\.?\d*)-(\d+\.?\d*)\s*(day|days|week|weeks|month|months|year|years)/i);
    if (rangeMatch) {
        const min = parseFloat(rangeMatch[1]);
        const max = parseFloat(rangeMatch[2]);
        const avg = (min + max) / 2;
        const unit = rangeMatch[3].toLowerCase();
        return convertToWeeks(avg, unit);
    }
    const singleMatch = cleaned.match(/(\d+\.?\d*)\s*(day|days|week|weeks|month|months|year|years)/i);
    if (singleMatch) {
        const value = parseFloat(singleMatch[1]);
        const unit = singleMatch[2].toLowerCase();
        return convertToWeeks(value, unit);
    }
    return 0;
}

function convertToWeeks(value, unit) {
    const unitLower = unit.toLowerCase();
    if (unitLower.startsWith('day')) return value / 7;
    if (unitLower.startsWith('week')) return value;
    if (unitLower.startsWith('month')) return value * 4.33;
    if (unitLower.startsWith('year')) return value * 52;
    return 0;
}

function mapSpeciesToSlaughterData(category) {
    const mapping = {
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
    return mapping[category] || null;
}

function getAnimalColor(species) {
    return '#B71C1C';
}

// Load and process both CSV files
async function loadAllData() {
    try {
        const lifespanRaw = await d3.csv('Rishikumar_data/lifespan.csv');
        const slaughterRaw = await d3.csv('Rishikumar_data/Land animals slaughter.csv');
        
        const slaughterByAnimal = {};
        const timeSeriesByAnimal = {};
        
        slaughterRaw.forEach(row => {
            const item = row.Item?.toLowerCase() || '';
            const year = parseInt(row.Year);
            const value = parseFloat(row.Value);
            
            if (value && !isNaN(value) && year >= 1961) {
                let animalType = null;
                if (item.includes('cattle')) animalType = 'cattle';
                else if (item.includes('chicken')) animalType = 'chickens';
                else if (item.includes('pig')) animalType = 'pigs';
                else if (item.includes('sheep')) animalType = 'sheep';
                else if (item.includes('goat')) animalType = 'goat';
                else if (item.includes('duck')) animalType = 'ducks';
                else if (item.includes('turk')) animalType = 'turkeys';
                else if (item.includes('rabbit') || item.includes('hare')) animalType = 'rabbits';
                else if (item.includes('geese')) animalType = 'geese';
                
                if (animalType) {
                    if (year === 2022) {
                        slaughterByAnimal[animalType] = (slaughterByAnimal[animalType] || 0) + value;
                    }
                    if (!timeSeriesByAnimal[animalType]) {
                        timeSeriesByAnimal[animalType] = {};
                    }
                    timeSeriesByAnimal[animalType][year] = (timeSeriesByAnimal[animalType][year] || 0) + value;
                }
            }
        });
        
        slaughterData = slaughterByAnimal;
        slaughterTimeSeries = timeSeriesByAnimal;
        
        const grouped = {};
        lifespanRaw.forEach(row => {
            if (!row.species || !row.typical_slaughter_age || !row.natural_lifespan) return;
            
            const species = row.species;
            let category = species;
            
            if (species.toLowerCase().includes('chicken')) {
                category = 'Chickens';
            } else if (species.toLowerCase().includes('cattle') || species.toLowerCase().includes('cow') || species.toLowerCase().includes('beef') || species.toLowerCase().includes('veal')) {
                category = 'Cows';
            } else if (species.toLowerCase().includes('pig')) {
                category = 'Pigs';
            } else if (species.toLowerCase().includes('lamb')) {
                category = 'Sheep';
            } else {
                category = species;
            }
            
            if (!grouped[category]) {
                grouped[category] = {
                    entries: [],
                    slaughterWeeks: [],
                    naturalWeeks: []
                };
            }
            
            grouped[category].entries.push(row);
            grouped[category].slaughterWeeks.push(parseTimeToWeeks(row.typical_slaughter_age));
            grouped[category].naturalWeeks.push(parseTimeToWeeks(row.natural_lifespan));
        });
        
        lifespanData = Object.keys(grouped).map(category => {
            const group = grouped[category];
            const avgSlaughterWeeks = group.slaughterWeeks.reduce((a, b) => a + b, 0) / group.slaughterWeeks.length;
            const avgNaturalWeeks = group.naturalWeeks.reduce((a, b) => a + b, 0) / group.naturalWeeks.length;
            const animalType = mapSpeciesToSlaughterData(category);
            const slaughterVolume = animalType ? slaughterData[animalType] : null;
            
            return {
                species: category,
                slaughterWeeks: avgSlaughterWeeks,
                naturalWeeks: avgNaturalWeeks,
                slaughterVolume: slaughterVolume,
                color: getAnimalColor(category)
            };
        });
        
        lifespanData.sort((a, b) => (b.naturalWeeks - b.slaughterWeeks) - (a.naturalWeeks - a.slaughterWeeks));
        
        initializeVisualization();
    } catch (error) {
        console.error('Error loading CSV data:', error);
    }
}

function initializeVisualization() {
    createDropdown();
    createPlaceholder();
}

function createDropdown() {
    const dropdown = d3.select("#animal-selector");
    dropdown.append("option").attr("value", "").text("Select an animal to explore...");
    
    lifespanData.forEach(d => {
        dropdown.append("option").attr("value", d.species).text(d.species);
    });
    
    dropdown.on("change", function() {
        const selected = this.value;
        if (selected) {
            selectedAnimal = lifespanData.find(d => d.species === selected);
            updateVisualization();
        }
    });
}

// Show overview chart with all animals
function createPlaceholder() {
    const container = d3.select("#split-viz-container");
    container.html("");
    
    const overviewDiv = container.append("div")
        .style("padding", "0.5rem 1rem")
        .style("width", "100%")
        .style("max-width", "1500px")
        .style("margin", "0 auto")
        .style("background", "transparent")
        .style("display", "flex")
        .style("flex-direction", "column")
        .style("align-items", "center");
    
    overviewDiv.append("h3")
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
    
    overviewDiv.append("p")
        .style("text-align", "center")
        .style("font-size", "14px")
        .style("color", "#9E9E9E")
        .style("margin-bottom", "0.75rem")
        .style("opacity", "0")
        .html("Click on any animal to explore detailed insights. <span style='color: #EF5350; font-weight: 600;'>Red</span> shows farming reality, <span style='color: #9E9E9E; font-weight: 600;'>gray</span> shows natural potential")
        .transition().duration(600).delay(200).style("opacity", "1");
    
    const width = 1000;
    const height = 650;
    const margin = { top: 15, right: 120, bottom: 50, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = overviewDiv.append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("opacity", "0")
        .style("background", "rgba(0, 0, 0, 0.3)")
        .style("border-radius", "16px");
    
    svg.transition().duration(600).delay(400).style("opacity", "1");
    
    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    const sortedData = lifespanData.slice().sort((a, b) => (b.naturalWeeks - b.slaughterWeeks) - (a.naturalWeeks - a.slaughterWeeks));
    
    const maxWeeks = d3.max(sortedData, d => d.naturalWeeks);
    const xScale = d3.scaleLinear().domain([0, maxWeeks]).range([0, innerWidth]);
    const yScale = d3.scaleBand().domain(sortedData.map(d => d.species)).range([0, innerHeight]).padding(0.3);
    
    const animalGroups = g.selectAll(".animal-group")
        .data(sortedData)
        .enter().append("g")
        .attr("class", "animal-group")
        .attr("transform", d => `translate(0, ${yScale(d.species)})`)
        .style("cursor", "pointer")
        .style("opacity", "0");
    
    animalGroups.transition().duration(400).delay((d, i) => 600 + i * 80).style("opacity", "1");
    
    // Gray bars for natural lifespan
    animalGroups.append("rect")
        .attr("class", "natural-bar")
        .attr("x", 0).attr("y", 0)
        .attr("width", 0)
        .attr("height", yScale.bandwidth())
        .attr("fill", "#4A4A4A")
        .attr("rx", 6)
        .transition().duration(800).delay((d, i) => 700 + i * 80)
        .attr("width", d => xScale(d.naturalWeeks));
    
    // Red bars for slaughter age
    animalGroups.append("rect")
        .attr("class", "slaughter-bar")
        .attr("x", 0).attr("y", 0)
        .attr("width", 0)
        .attr("height", yScale.bandwidth())
        .attr("fill", "#EF5350")
        .attr("rx", 6)
        .attr("opacity", 0.95)
        .transition().duration(800).delay((d, i) => 900 + i * 80)
        .attr("width", d => xScale(d.slaughterWeeks));
    
    animalGroups.append("text")
        .attr("x", -12).attr("y", yScale.bandwidth() / 2).attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("font-size", "15px")
        .attr("font-weight", "600")
        .attr("fill", "#E0E0E0")
        .text(d => d.species);
    
    animalGroups.append("text")
        .attr("class", "percent-label")
        .attr("x", innerWidth + 15).attr("y", yScale.bandwidth() / 2).attr("dy", "0.35em")
        .attr("font-size", "13px")
        .attr("font-weight", "600")
        .attr("fill", "#EF5350")
        .text(d => {
            const percent = ((d.slaughterWeeks / d.naturalWeeks) * 100).toFixed(0);
            return `${percent}% lived`;
        });
    
    animalGroups
        .on("mouseenter", function(event, d) {
            d3.select(this).select(".natural-bar").transition().duration(200).attr("fill", "#5A5A5A");
            d3.select(this).select(".slaughter-bar").transition().duration(200).attr("fill", "#FF6B6B").attr("opacity", 1);
            d3.select(this).select(".percent-label").transition().duration(200).attr("font-size", "14px").attr("font-weight", "700");
        })
        .on("mouseleave", function(event, d) {
            d3.select(this).select(".natural-bar").transition().duration(200).attr("fill", "#4A4A4A");
            d3.select(this).select(".slaughter-bar").transition().duration(200).attr("fill", "#EF5350").attr("opacity", 0.95);
            d3.select(this).select(".percent-label").transition().duration(200).attr("font-size", "13px").attr("font-weight", "600");
        })
        .on("click", function(event, d) {
            d3.select("#split-viz-container")
                .transition().duration(400).style("opacity", 0)
                .on("end", () => {
                    selectedAnimal = d;
                    document.getElementById("animal-selector").value = d.species;
                    updateVisualization();
                    d3.select("#split-viz-container").style("opacity", 0).transition().duration(600).style("opacity", 1);
                });
        });
    
    const xAxis = d3.axisBottom(xScale).ticks(8).tickFormat(d => `${(d / 52).toFixed(0)}y`);
    const xAxisGroup = g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${innerHeight})`)
        .call(xAxis)
        .style("opacity", "0");
    
    xAxisGroup.selectAll("text").attr("fill", "#9E9E9E").attr("font-size", "12px");
    xAxisGroup.selectAll("line").attr("stroke", "#555");
    xAxisGroup.select(".domain").attr("stroke", "#555");
    xAxisGroup.transition().duration(600).delay(1500).style("opacity", "1");
    
    g.append("text")
        .attr("x", innerWidth / 2).attr("y", innerHeight + 40)
        .attr("text-anchor", "middle")
        .attr("font-size", "13px")
        .attr("fill", "#9E9E9E")
        .style("opacity", "0")
        .text("Natural Lifespan (years)")
        .transition().duration(600).delay(1600).style("opacity", "1");
}

function updateVisualization() {
    if (!selectedAnimal) return;
    
    const container = d3.select("#split-viz-container");
    container.html("");
    
    const backButton = container.append("div")
        .style("position", "absolute")
        .style("top", "-0.5rem").style("left", "0.5rem")
        .style("display", "inline-flex")
        .style("align-items", "center")
        .style("gap", "0.4rem")
        .style("padding", "0.35rem 0.75rem")
        .style("background", "#F5F7FA")
        .style("border", "1px solid #E0E0E0")
        .style("border-radius", "6px")
        .style("font-size", "11px")
        .style("font-weight", "500")
        .style("color", "#546E7A")
        .style("cursor", "pointer")
        .style("transition", "all 0.2s ease")
        .style("z-index", "10")
        .style("opacity", "0")
        .html("&larr; Back to overview");
    
    backButton.transition().duration(400).delay(200).style("opacity", "1");
    
    backButton
        .on("mouseenter", function() {
            d3.select(this).style("background", "#E8EAF0").style("border-color", "#B71C1C").style("color", "#B71C1C").style("transform", "translateX(-2px)");
        })
        .on("mouseleave", function() {
            d3.select(this).style("background", "#F5F7FA").style("border-color", "#E0E0E0").style("color", "#546E7A").style("transform", "translateX(0)");
        })
        .on("click", function() {
            d3.select("#split-viz-container")
                .transition().duration(300).style("opacity", 0)
                .on("end", () => {
                    selectedAnimal = null;
                    document.getElementById("animal-selector").value = "";
                    createPlaceholder();
                    d3.select("#split-viz-container").style("opacity", 0).transition().duration(400).style("opacity", 1);
                });
        });
    
    const leftPanel = container.append("div").attr("class", "viz-panel left-panel");
    const rightPanel = container.append("div").attr("class", "viz-panel right-panel");
    
    const leftTitle = leftPanel.append("h3").attr("class", "panel-title");
    leftTitle.append("span").text("Natural Life vs Reality: ");
    leftTitle.append("span").style("color", "#EF5350").text(selectedAnimal.species);
    drawLifespanBars(leftPanel);
    
    const rightTitle = rightPanel.append("h3").attr("class", "panel-title");
    rightTitle.append("span").text("Global Slaughter Over Time: ");
    rightTitle.append("span").style("color", "#EF5350").text(selectedAnimal.species);
    drawTimeSeries(rightPanel);
}

// Draw the lifespan comparison bars
function drawLifespanBars(container) {
    const width = 650;
    const height = 420;
    const margin = { top: 60, right: 60, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = container.append("svg").attr("width", width).attr("height", height);
    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    const maxWeeks = selectedAnimal.naturalWeeks;
    const xScale = d3.scaleLinear().domain([0, maxWeeks]).range([0, innerWidth]);
    const yPos = innerHeight / 2;
    
    const slaughterYears = (selectedAnimal.slaughterWeeks / 52).toFixed(1);
    const naturalYears = (maxWeeks / 52).toFixed(1);
    const percentLived = ((selectedAnimal.slaughterWeeks / maxWeeks) * 100).toFixed(0);
    const percentStolen = (100 - percentLived).toFixed(0);
    
    const leftGroup = g.append("g").attr("opacity", 0);
    leftGroup.append("text").attr("x", 0).attr("y", -20).attr("font-size", "28px").attr("font-weight", "700").attr("fill", "#EF5350").text(`${Math.round(selectedAnimal.slaughterWeeks)} weeks`);
    leftGroup.append("text").attr("x", 0).attr("y", 0).attr("font-size", "14px").attr("fill", "#9E9E9E").text("Slaughtered at");
    leftGroup.append("text").attr("x", 0).attr("y", 20).attr("font-size", "16px").attr("font-weight", "600").attr("fill", "#EF5350").text(`(${slaughterYears} years old)`);
    leftGroup.transition().duration(600).delay(1200).attr("opacity", 1);
    
    const rightGroup = g.append("g").attr("opacity", 0);
    rightGroup.append("text").attr("x", innerWidth).attr("y", -20).attr("text-anchor", "end").attr("font-size", "28px").attr("font-weight", "700").attr("fill", "#9E9E9E").text(`${Math.round(maxWeeks)} weeks`);
    rightGroup.append("text").attr("x", innerWidth).attr("y", 0).attr("text-anchor", "end").attr("font-size", "14px").attr("fill", "#9E9E9E").text("Natural lifespan");
    rightGroup.append("text").attr("x", innerWidth).attr("y", 20).attr("text-anchor", "end").attr("font-size", "16px").attr("font-weight", "600").attr("fill", "#9E9E9E").text(`(${naturalYears} years)`);
    rightGroup.transition().duration(600).delay(700).attr("opacity", 1);
    
    g.append("rect").attr("x", 0).attr("y", yPos - 20).attr("width", 0).attr("height", 40).attr("fill", "#4A4A4A").attr("rx", 6).transition().duration(800).attr("width", xScale(maxWeeks));
    g.append("rect").attr("x", 0).attr("y", yPos - 20).attr("width", 0).attr("height", 40).attr("fill", "#EF5350").attr("rx", 6).attr("opacity", 0.95).transition().duration(1000).delay(400).attr("width", xScale(selectedAnimal.slaughterWeeks));
    
    const cutLineX = xScale(selectedAnimal.slaughterWeeks);
    const cutLine = g.append("line").attr("x1", cutLineX).attr("x2", cutLineX).attr("y1", yPos - 35).attr("y2", yPos + 35).attr("stroke", "#EF5350").attr("stroke-width", 3).attr("stroke-dasharray", "5,5").attr("opacity", 0);
    cutLine.transition().duration(600).delay(1400).attr("opacity", 0.9);
    
    function pulse() {
        cutLine.transition().duration(1200).attr("opacity", 0.5).transition().duration(1200).attr("opacity", 0.9).on("end", pulse);
    }
    setTimeout(pulse, 2000);
    
    g.append("text").attr("x", cutLineX).attr("y", yPos - 45).attr("text-anchor", "middle").attr("font-size", "20px").attr("opacity", 0).text("✂").transition().duration(400).delay(1600).attr("opacity", 0.7);
    
    const percentLivedBox = g.append("g").attr("transform", `translate(0, ${yPos + 70})`).attr("opacity", 0);
    percentLivedBox.append("rect").attr("x", 0).attr("y", 0).attr("width", innerWidth * 0.45).attr("height", 60).attr("fill", "rgba(239, 83, 80, 0.15)").attr("rx", 8).attr("stroke", "#EF5350").attr("stroke-width", 1.5).attr("opacity", 0.8);
    percentLivedBox.append("text").attr("x", (innerWidth * 0.45) / 2).attr("y", 25).attr("text-anchor", "middle").attr("font-size", "24px").attr("font-weight", "700").attr("fill", "#EF5350").text(`${percentLived}%`);
    percentLivedBox.append("text").attr("x", (innerWidth * 0.45) / 2).attr("y", 45).attr("text-anchor", "middle").attr("font-size", "12px").attr("fill", "#9E9E9E").text("of potential life lived");
    percentLivedBox.transition().duration(600).delay(1900).attr("opacity", 1);
    
    const percentUnlivedBox = g.append("g").attr("transform", `translate(${innerWidth * 0.55}, ${yPos + 70})`).attr("opacity", 0);
    percentUnlivedBox.append("rect").attr("x", 0).attr("y", 0).attr("width", innerWidth * 0.45).attr("height", 60).attr("fill", "rgba(239, 83, 80, 0.2)").attr("rx", 8).attr("stroke", "#EF5350").attr("stroke-width", 2).attr("opacity", 0.9);
    percentUnlivedBox.append("text").attr("x", (innerWidth * 0.45) / 2).attr("y", 25).attr("text-anchor", "middle").attr("font-size", "24px").attr("font-weight", "700").attr("fill", "#EF5350").text(`${percentStolen}%`);
    percentUnlivedBox.append("text").attr("x", (innerWidth * 0.45) / 2).attr("y", 45).attr("text-anchor", "middle").attr("font-size", "12px").attr("fill", "#9E9E9E").text("of life unlived");
    percentUnlivedBox.transition().duration(600).delay(2100).attr("opacity", 1);
    
    const bottomInfo = g.append("g").attr("transform", `translate(0, ${yPos + 145})`).attr("opacity", 0);
    
    let contextText;
    if (selectedAnimal.species === "Chickens") {
        contextText = `Broiler chickens are bred for rapid growth and slaughtered at just 5-7 weeks, having lived only ${percentLived}% of their potential ${naturalYears}-year lifespan`;
    } else if (selectedAnimal.species === "Pigs") {
        contextText = `Pigs are intelligent animals that could live 10-12 years, but are slaughtered at just ${slaughterYears} years old—only ${percentLived}% of their natural lifespan`;
    } else if (selectedAnimal.species === "Cattle") {
        contextText = `Cattle can naturally live 15-20 years, but beef cattle are slaughtered at just ${slaughterYears} years—having experienced only ${percentLived}% of their potential life`;
    } else if (selectedAnimal.species === "Turkeys") {
        contextText = `Turkeys are slaughtered at 10-17 weeks for meat production, living only ${percentLived}% of their natural 15-year lifespan`;
    } else if (selectedAnimal.species === "Ducks") {
        contextText = `Ducks raised for meat are slaughtered at 7-8 weeks old, experiencing only ${percentLived}% of their 6-8 year natural lifespan`;
    } else if (selectedAnimal.species === "Rabbits") {
        contextText = `Rabbits are slaughtered at just 10-12 weeks old, living only ${percentLived}% of their potential 8-12 year lifespan`;
    } else if (selectedAnimal.species === "Goats") {
        contextText = `Goats can live 12-14 years in natural conditions, but are slaughtered at just ${slaughterYears} years—only ${percentLived}% of their lifespan`;
    } else if (selectedAnimal.species === "Geese") {
        contextText = `Geese are slaughtered at 15-20 weeks for meat, having lived only ${percentLived}% of their potential 8-15 year lifespan`;
    } else if (selectedAnimal.species === "Sheep") {
        contextText = `Lambs are slaughtered at 4-12 months old, experiencing only ${percentLived}% of their natural 12-14 year lifespan`;
    } else {
        contextText = `These animals could naturally live ${naturalYears} years, but are slaughtered at ${slaughterYears} years—only ${percentLived}% of their potential lifespan`;
    }
    
    bottomInfo.append("text")
        .attr("x", innerWidth / 2).attr("y", 0)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-style", "italic")
        .attr("fill", "#9E9E9E")
        .attr("opacity", 0.9)
        .text(contextText)
        .call(wrap, innerWidth - 40);
    
    bottomInfo.transition().duration(500).delay(2300).attr("opacity", 1);
}

function wrap(text, width) {
    text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word, line = [], lineNumber = 0;
        const lineHeight = 1.3, y = text.attr("y"), dy = 0;
        let tspan = text.text(null).append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", dy + "em");
        
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", text.attr("x")).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

// Draw the historical slaughter data chart
function drawTimeSeries(container) {
    const animalType = mapSpeciesToSlaughterData(selectedAnimal.species);
    if (!animalType || !slaughterTimeSeries[animalType]) {
        container.append("div").style("padding", "2rem").style("color", "#90A4AE").text("No historical data available for this species");
        return;
    }
    
    const timeData = slaughterTimeSeries[animalType];
    const dataPoints = Object.keys(timeData).map(year => ({ year: parseInt(year), value: timeData[year] })).sort((a, b) => a.year - b.year);
    
    const width = 650, height = 420;
    const margin = { top: 40, right: 40, bottom: 70, left: 90 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = container.append("svg").attr("width", width).attr("height", height);
    const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    const xScale = d3.scaleLinear().domain(d3.extent(dataPoints, d => d.year)).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, d3.max(dataPoints, d => d.value)]).range([innerHeight, 0]).nice();
    
    const area = d3.area().x(d => xScale(d.year)).y0(innerHeight).y1(d => yScale(d.value)).curve(d3.curveMonotoneX);
    const line = d3.line().x(d => xScale(d.year)).y(d => yScale(d.value)).curve(d3.curveMonotoneX);
    
    const areaPath = g.append("path").datum(dataPoints).attr("fill", "#EF5350").attr("opacity", 0.25).attr("d", area);
    const totalLength = areaPath.node().getTotalLength();
    areaPath.attr("stroke-dasharray", totalLength + " " + totalLength).attr("stroke-dashoffset", totalLength).attr("stroke", "none").transition().duration(1500).ease(d3.easeLinear).attr("stroke-dashoffset", 0);
    
    const linePath = g.append("path").datum(dataPoints).attr("fill", "none").attr("stroke", "#EF5350").attr("stroke-width", 3).attr("d", line);
    const lineLength = linePath.node().getTotalLength();
    linePath.attr("stroke-dasharray", lineLength + " " + lineLength).attr("stroke-dashoffset", lineLength).transition().duration(1500).ease(d3.easeLinear).attr("stroke-dashoffset", 0);
    
    const xAxis = d3.axisBottom(xScale).ticks(5).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d => {
        if (d >= 1e9) return (d / 1e9).toFixed(1) + 'B';
        if (d >= 1e6) return (d / 1e6).toFixed(0) + 'M';
        return d;
    });
    
    const xAxisGroup2 = g.append("g").attr("transform", `translate(0, ${innerHeight})`).call(xAxis).attr("opacity", 0);
    xAxisGroup2.selectAll("text").attr("fill", "#9E9E9E");
    xAxisGroup2.selectAll("line").attr("stroke", "#555");
    xAxisGroup2.select(".domain").attr("stroke", "#555");
    xAxisGroup2.transition().duration(400).delay(1500).attr("opacity", 1);
    
    const yAxisGroup = g.append("g").call(yAxis).attr("opacity", 0);
    yAxisGroup.selectAll("text").attr("fill", "#9E9E9E");
    yAxisGroup.selectAll("line").attr("stroke", "#555");
    yAxisGroup.select(".domain").attr("stroke", "#555");
    yAxisGroup.transition().duration(400).delay(1500).attr("opacity", 1);
    
    g.append("text").attr("x", innerWidth / 2).attr("y", innerHeight + 45).attr("text-anchor", "middle").attr("font-size", "12px").attr("fill", "#9E9E9E").text("Year");
    g.append("text").attr("transform", "rotate(-90)").attr("x", -innerHeight / 2).attr("y", -60).attr("text-anchor", "middle").attr("font-size", "12px").attr("fill", "#9E9E9E").text("Animals Slaughtered");
    
    const firstValue = dataPoints[0].value;
    const lastValue = dataPoints[dataPoints.length - 1].value;
    const percentIncrease = (((lastValue - firstValue) / firstValue) * 100).toFixed(0);
    
    const statsBox = container.append("div").attr("class", "stats-box").style("opacity", 0);
    statsBox.append("div").attr("class", "stat-large").style("color", "#EF5350").html(`&uarr; ${percentIncrease}%`);
    statsBox.append("div").attr("class", "stat-label").text("increase since 1961");
    statsBox.transition().duration(400).delay(2000).style("opacity", 1);
    
    // Add hover interaction
    const crosshairLine = g.append("line").attr("class", "crosshair-line").attr("y1", 0).attr("y2", innerHeight).attr("stroke", "#EF5350").attr("stroke-width", 1).attr("stroke-dasharray", "4,4").attr("opacity", 0).attr("pointer-events", "none");
    const hoverCircle = g.append("circle").attr("class", "hover-circle").attr("r", 5).attr("fill", "#EF5350").attr("stroke", "#000").attr("stroke-width", 2).attr("opacity", 0).attr("pointer-events", "none");
    const tooltip = d3.select("#tooltip");
    const overlay = g.append("rect").attr("class", "overlay").attr("width", innerWidth).attr("height", innerHeight).attr("fill", "none").attr("pointer-events", "all").style("cursor", "crosshair");
    
    const bisect = d3.bisector(d => d.year).left;
    
    overlay
        .on("mousemove", function(event) {
            const [mouseX] = d3.pointer(event);
            const year = xScale.invert(mouseX);
            const index = bisect(dataPoints, year);
            
            let closestPoint;
            if (index === 0) {
                closestPoint = dataPoints[0];
            } else if (index >= dataPoints.length) {
                closestPoint = dataPoints[dataPoints.length - 1];
            } else {
                const d0 = dataPoints[index - 1];
                const d1 = dataPoints[index];
                closestPoint = year - d0.year > d1.year - year ? d1 : d0;
            }
            
            const x = xScale(closestPoint.year);
            const y = yScale(closestPoint.value);
            crosshairLine.attr("x1", x).attr("x2", x).attr("opacity", 0.6);
            hoverCircle.attr("cx", x).attr("cy", y).attr("opacity", 1);
            
            const percentChange = (((closestPoint.value - firstValue) / firstValue) * 100).toFixed(1);
            const changeText = percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`;
            
            let formattedValue;
            if (closestPoint.value >= 1e9) {
                formattedValue = (closestPoint.value / 1e9).toFixed(2) + 'B';
            } else if (closestPoint.value >= 1e6) {
                formattedValue = (closestPoint.value / 1e6).toFixed(1) + 'M';
            } else {
                formattedValue = closestPoint.value.toLocaleString();
            }
            
            tooltip.style("opacity", 1).html(`
                <div style="font-weight: 600; font-size: 14px; margin-bottom: 6px; color: #EF5350;">
                    ${closestPoint.year}
                </div>
                <div style="font-size: 13px; margin-bottom: 4px; color: #fff;">
                    <strong>${formattedValue}</strong> animals
                </div>
                <div style="font-size: 12px; color: #9E9E9E;">
                    ${changeText} since 1961
                </div>
            `).style("left", (event.pageX + 15) + "px").style("top", (event.pageY - 15) + "px");
        })
        .on("mouseleave", function() {
            crosshairLine.attr("opacity", 0);
            hoverCircle.attr("opacity", 0);
            tooltip.style("opacity", 0);
        });
}

loadAllData();
