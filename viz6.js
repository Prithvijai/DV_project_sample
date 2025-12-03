(function() {
    'use strict';
    d3.csv('prithvijai_data/food-emissions-supply-chain.csv').then(function(data) {
        
        const margin = { top: 20, right: 150, bottom: 20, left: 150 };
        const svg = d3.select('#viz6_svg');
        const svgNode = svg.node();
        const width = svgNode.clientWidth - margin.left - margin.right;
        const height = svgNode.clientHeight - margin.top - margin.bottom;
        
        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        const selector = d3.select('#food-selector');
        selector.selectAll('option').remove();
        
        selector.selectAll('option')
            .data(data)
            .enter()
            .append('option')
            .attr('value', d => d.Entity)
            .text(d => d.Entity);
        selector.property('value', 'Beef (beef herd)');
        
        const stages = [
            { key: 'food_emissions_land_use', label: 'Land Use' },
            { key: 'food_emissions_farm', label: 'Farm' },
            { key: 'food_emissions_animal_feed', label: 'Animal Feed' },
            { key: 'food_emissions_processing', label: 'Processing' },
            { key: 'food_emissions_transport', label: 'Transport' },
            { key: 'food_emissions_retail', label: 'Retail' },
            { key: 'food_emissions_packaging', label: 'Packaging' },
            { key: 'food_emissions_losses', label: 'Losses' }
        ];
        
        const colorScale = d3.scaleOrdinal()
            .domain(stages.map(s => s.label))
            .range(['#8B4513', '#228B22', '#FF6347', '#4682B4', '#FFD700', '#9370DB', '#FF8C00', '#DC143C']);
        
        function prepareData(selectedFood) {
            const foodData = data.find(d => d.Entity === selectedFood);
            if (!foodData) return { nodes: [], links: [] };
            
            const nodes = [];
            const links = [];
            
            // Create nodes for each stage
            stages.forEach(stage => {
                nodes.push({ name: stage.label, nodeId: nodes.length });
            });
            
            // Add intermediate nodes to create a better flow
            const midPointIndex = nodes.length;
            nodes.push({ name: 'Supply Chain', nodeId: midPointIndex });
            
            const finalIndex = nodes.length;
            nodes.push({ name: selectedFood, nodeId: finalIndex });
            
            // Create links from stages to intermediate node
            stages.forEach((stage, i) => {
                const value = +foodData[stage.key];
                if (value > 0) {
                    links.push({
                        source: i,
                        target: midPointIndex,
                        value: value
                    });
                }
            });
            
            // Calculate total emissions
            const totalEmissions = stages.reduce((sum, stage) => {
                return sum + (+foodData[stage.key] || 0);
            }, 0);
            
            // Link from intermediate to final
            if (totalEmissions > 0) {
                links.push({
                    source: midPointIndex,
                    target: finalIndex,
                    value: totalEmissions
                });
            }
            
            return { nodes, links };
        }
        function updateSankey(selectedFood) {
            g.selectAll('*').remove();
            const { nodes, links } = prepareData(selectedFood);
            
            if (links.length === 0) {
                g.append('text')
                    .attr('x', width / 2)
                    .attr('y', height / 2)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '16px')
                    .text('No emission data available for this food item');
                return;
            }
            
            const sankey = d3.sankey()
                .nodeId(d => d.nodeId)
                .nodeWidth(15)
                .nodePadding(10)
                .extent([[0, 0], [width, height]]);
            
            const { nodes: sankeyNodes, links: sankeyLinks } = sankey({
                nodes: nodes.map(d => Object.assign({}, d)),
                links: links.map(d => Object.assign({}, d))
            });
            g.append('g')
                .attr('class', 'links')
                .selectAll('path')
                .data(sankeyLinks)
                .enter()
                .append('path')
                .attr('d', d3.sankeyLinkHorizontal())
                .attr('stroke', d => {
                    const sourceNode = sankeyNodes[d.source.index];
                    return colorScale(sourceNode.name);
                })
                .attr('stroke-width', d => Math.max(1, d.width))
                .attr('fill', 'none')
                .attr('opacity', 0.5)
                .on('mouseover', function(event, d) {
                    d3.select(this).attr('opacity', 0.8);
                    
                    const sourceNode = sankeyNodes[d.source.index];
                    const tooltip = d3.select('#tooltip');
                    tooltip.style('display', 'block')
                        .html(`<strong>${sourceNode.name}</strong><br/>
                               Emissions: ${d.value.toFixed(3)} kg CO₂eq<br/>
                               ${((d.value / d.target.value) * 100).toFixed(1)}% of total`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 10) + 'px');
                })
                .on('mouseout', function() {
                    d3.select(this).attr('opacity', 0.5);
                    d3.select('#tooltip').style('display', 'none');
                });
            
            const node = g.append('g')
                .attr('class', 'nodes')
                .selectAll('g')
                .data(sankeyNodes)
                .enter()
                .append('g');

            node.append('rect')
                .attr('x', d => d.x0)
                .attr('y', d => d.y0)
                .attr('height', d => d.y1 - d.y0)
                .attr('width', d => d.x1 - d.x0)
                .attr('fill', d => {
                    if (d.name === 'Supply Chain') return '#666';
                    if (stages.some(s => s.label === d.name)) return colorScale(d.name);
                    return '#2d5a3d'; // Final food node
                })
                .attr('stroke', '#000')
                .attr('stroke-width', 1)
                .on('mouseover', function(event, d) {
                    d3.select(this).attr('opacity', 0.8);
                    
                    const tooltip = d3.select('#tooltip');
                    tooltip.style('display', 'block')
                        .html(`<strong>${d.name}</strong><br/>
                               Total: ${d.value ? d.value.toFixed(3) : 0} kg CO₂eq`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 10) + 'px');
                })
                .on('mouseout', function() {
                    d3.select(this).attr('opacity', 1);
                    d3.select('#tooltip').style('display', 'none');
                });
            
            node.append('text')
                .attr('x', d => {
                    if (d.x0 < width / 3) return d.x1 + 6;
                    if (d.x0 > width * 2 / 3) return d.x0 - 6;
                    return d.x0 + (d.x1 - d.x0) / 2;
                })
                .attr('y', d => (d.y1 + d.y0) / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', d => {
                    if (d.x0 < width / 3) return 'start';
                    if (d.x0 > width * 2 / 3) return 'end';
                    return 'middle';
                })
                .text(d => d.name)
                .style('font-size', '12px')
                .style('font-weight', d => !stages.some(s => s.label === d.name) ? 'bold' : 'normal');
            
            node.append('text')
                .attr('x', d => {
                    if (d.x0 < width / 3) return d.x1 + 6;
                    if (d.x0 > width * 2 / 3) return d.x0 - 6;
                    return d.x0 + (d.x1 - d.x0) / 2;
                })
                .attr('y', d => (d.y1 + d.y0) / 2 + 12)
                .attr('dy', '0.35em')
                .attr('text-anchor', d => {
                    if (d.x0 < width / 3) return 'start';
                    if (d.x0 > width * 2 / 3) return 'end';
                    return 'middle';
                })
                .text(d => d.value ? `${d.value.toFixed(2)} kg` : '')
                .style('font-size', '10px')
                .style('fill', '#666');
        }

        updateSankey(selector.property('value'));
        
        // Update on selection change
        selector.on('change', function() {
            updateSankey(this.value);
        });
        
    }).catch(error => {
        console.error('Error loading supply chain data:', error);
        d3.select('#viz6_svg')
            .append('text')
            .attr('x', 300)
            .attr('y', 200)
            .attr('text-anchor', 'middle')
            .style('fill', 'red')
            .text('Error loading supply chain data. Please check the data folder.');
    });
    
})();