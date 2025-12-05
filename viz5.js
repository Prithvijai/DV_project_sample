// Prithvi Jai Ramesh
(function () {
    'use strict';
    Promise.all([
        d3.csv('prithvijai_data/ghg-per-kg-poore.csv'),
        d3.csv('prithvijai_data/ghg-kcal-poore.csv'),
        d3.csv('prithvijai_data/ghg-per-protein-poore.csv')
    ]).then(function ([perKgData, perKcalData, perProteinData]) {

        const foodItems = [
            'Beef (beef herd)',
            'Lamb & Mutton',
            'Pig Meat',
            'Poultry Meat',
            'Tofu',
            'Potatoes'
        ];

        const displayNames = {
            'Beef (beef herd)': 'Beef',
            'Lamb & Mutton': 'Lamb',
            'Pig Meat': 'Pork',
            'Poultry Meat': 'Poultry',
            'Tofu': 'Tofu',
            'Potatoes': 'Potatoes'
        };

        const combinedData = foodItems.map(entity => {
            const perKg = perKgData.find(d => d.Entity === entity);
            const perKcal = perKcalData.find(d => d.Entity === entity);
            const perProtein = perProteinData.find(d => d.Entity === entity);

            return {
                entity: entity,
                displayName: displayNames[entity],
                per_kg: perKg ? +perKg['GHG emissions per kilogram (Poore & Nemecek, 2018)'] : 0,
                per_kcal: perKcal ? +perKcal['GHG emissions per 1000kcal (Poore & Nemecek, 2018)'] : 0,
                per_protein: perProtein ? +perProtein['GHG emissions per 100g protein (Poore & Nemecek, 2018)'] : 0
            };
        });

        const margin = { top: 40, right: 150, bottom: 60, left: 60 };
        const svg = d3.select('#viz5_svg');
        const svgNode = svg.node();
        const width = svgNode.clientWidth - margin.left - margin.right;
        const height = svgNode.clientHeight - margin.top - margin.bottom;
        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        const metrics = ['per_kg', 'per_kcal', 'per_protein'];
        const metricLabels = {
            'per_kg': 'per kg',
            'per_kcal': 'per 1000 kcal',
            'per_protein': 'per 100g protein'
        };

        const x0Scale = d3.scaleBand().domain(combinedData.map(d => d.displayName))
            .range([0, width])
            .padding(0.2);

        const x1Scale = d3.scaleBand().domain(metrics).range([0, x0Scale.bandwidth()])
            .padding(0.05);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(combinedData, d => Math.max(d.per_kg, d.per_kcal, d.per_protein))])
            .nice().range([height, 0])

        const colorScale = d3.scaleOrdinal()
            .domain(metrics)
            .range(['#5B2C6F', '#E91E8C', '#2DBCBC']);


        const xAxis = d3.axisBottom(x0Scale);
        const yAxis = d3.axisLeft(yScale).ticks(8);

        g.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .selectAll('text')
            .style('font-size', '12px');

        g.append('g')
            .attr('class', 'axis y-axis')
            .call(yAxis);

        g.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -height / 2)
            .attr('y', -45)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('kg CO₂eq');

        const foodGroups = g.selectAll('.food-group')
            .data(combinedData)
            .enter()
            .append('g')
            .attr('class', 'food-group')
            .attr('transform', d => `translate(${x0Scale(d.displayName)},0)`);

        foodGroups.selectAll('rect')
            .data(d => metrics.map(metric => ({
                entity: d.entity,
                displayName: d.displayName,
                metric: metric,
                value: d[metric]
            })))
            .enter()
            .append('rect')
            .attr('class', 'bar hoverable')
            .attr('x', d => x1Scale(d.metric))
            .attr('width', x1Scale.bandwidth())
            .attr('fill', d => colorScale(d.metric))
            .attr('opacity', 0.9)
            .attr('y', height) // Start at bottom
            .attr('height', 0); // Start with 0 height

        // Animation triggers only when visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    foodGroups.selectAll('rect')
                        .transition()
                        .duration(1000)
                        .delay((d, i) => i * 100) // Stagger by bar index
                        .ease(d3.easeCubicOut)
                        .attr('y', d => yScale(d.value))
                        .attr('height', d => height - yScale(d.value))
                        .on("end", function () {
                            d3.select(this)
                                .on('mouseover', function (event, d) {
                                    d3.select(this)
                                        .attr('opacity', 1)
                                        .attr('stroke', '#000')
                                        .attr('stroke-width', 2);

                                    const tooltip = d3.select('#tooltip');
                                    tooltip.style('display', 'block')
                                        .html(`<strong>${d.displayName}</strong><br/>
                                           ${metricLabels[d.metric]}<br/>
                                           <strong>${d.value.toFixed(2)} kg CO₂eq</strong>`)
                                        .style('left', (event.pageX + 10) + 'px')
                                        .style('top', (event.pageY - 10) + 'px');
                                })
                                .on('mouseout', function () {
                                    d3.select(this)
                                        .attr('opacity', 0.9)
                                        .attr('stroke', 'none');

                                    d3.select('#tooltip').style('display', 'none');
                                });
                        });
                    observer.disconnect();
                }
            });
        }, { threshold: 0.3 });

        const chartElement = document.getElementById('viz5_svg');
        if (chartElement) observer.observe(chartElement);

        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${width + margin.left + 20}, ${margin.top})`);

        const legendItems = legend.selectAll('.legend-item')
            .data(metrics)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * 25})`);

        legendItems.append('rect')
            .attr('width', 18)
            .attr('height', 18)
            .attr('fill', d => colorScale(d))
            .attr('opacity', 0.9);

        legendItems.append('text')
            .attr('x', 24)
            .attr('y', 9)
            .attr('dy', '0.35em')
            .style('font-size', '12px')
            .text(d => metricLabels[d]);

        svg.append('text')
            .attr('x', width / 2 + margin.left)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .style('fill', '#e0e0e0')
            .text('Greenhouse Gas Emissions by Food Type');

    }).catch(error => {
        console.error('Error loading data:', error);
        d3.select('#viz5_svg')
            .append('text')
            .attr('x', 300)
            .attr('y', 200)
            .attr('text-anchor', 'middle')
            .style('fill', 'red')
            .text('Error loading data. Please check the data folder.');
    });

})();