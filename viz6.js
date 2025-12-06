(function () {
    'use strict';
    d3.csv('prithvijai_data/food-emissions-supply-chain.csv').then(function (data) {

        const ma = { top: 20, right: 150, bottom: 20, left: 150 };
        const sv = d3.select('#viz6_svg');
        const sv_no = sv.node();
        const wi = sv_no.clientWidth - ma.left - ma.right;
        const he = sv_no.clientHeight - ma.top - ma.bottom;

        const gr = sv.append('g')
            .attr('transform', `translate(${ma.left},${ma.top})`);

        const se = d3.select('#food-selector');
        se.selectAll('option').remove();

        se.selectAll('option')
            .data(data)
            .enter()
            .append('option')
            .attr('value', d => d.Entity)
            .text(d => d.Entity);
        se.property('value', 'Beef (beef herd)');

        const st = [
            { key: 'food_emissions_land_use', label: 'Land Use' },
            { key: 'food_emissions_farm', label: 'Farm' },
            { key: 'food_emissions_animal_feed', label: 'Animal Feed' },
            { key: 'food_emissions_processing', label: 'Processing' },
            { key: 'food_emissions_transport', label: 'Transport' },
            { key: 'food_emissions_retail', label: 'Retail' },
            { key: 'food_emissions_packaging', label: 'Packaging' },
            { key: 'food_emissions_losses', label: 'Losses' }
        ];

        const co_sc = d3.scaleOrdinal()
            .domain(st.map(s => s.label))
            .range(['#ff9f43', '#2ecc71', '#ff6b6b', '#54a0ff', '#feca57', '#a55eea', '#48dbfb', '#ff4757']);

        function pr_da(se_fo) {
            const fo_da = data.find(d => d.Entity === se_fo);
            if (!fo_da) return { nodes: [], links: [] };

            const no = [];
            const li = [];


            st.forEach(st_i => {
                no.push({ name: st_i.label, nodeId: no.length });
            });


            const mi_po_in = no.length;
            no.push({ name: 'Supply Chain', nodeId: mi_po_in });

            const fi_in = no.length;
            no.push({ name: se_fo, nodeId: fi_in });


            st.forEach((st_i, i) => {
                const va = +fo_da[st_i.key];
                if (va > 0) {
                    li.push({
                        source: i,
                        target: mi_po_in,
                        value: va
                    });
                }
            });


            const to_em = st.reduce((sum, st_i) => {
                return sum + (+fo_da[st_i.key] || 0);
            }, 0);


            if (to_em > 0) {
                li.push({
                    source: mi_po_in,
                    target: fi_in,
                    value: to_em
                });
            }

            return { nodes: no, links: li };
        }
        function up_sa(se_fo) {
            gr.selectAll('*').remove();
            const { nodes: no, links: li } = pr_da(se_fo);

            if (li.length === 0) {
                gr.append('text')
                    .attr('x', wi / 2)
                    .attr('y', he / 2)
                    .attr('text-anchor', 'middle')
                    .style('font-size', '16px')
                    .text('No emission data available for this food item');
                return;
            }

            const sa = d3.sankey()
                .nodeId(d => d.nodeId)
                .nodeWidth(15)
                .nodePadding(10)
                .extent([[0, 0], [wi, he]]);

            const { nodes: sa_no, links: sa_li } = sa({
                nodes: no.map(d => Object.assign({}, d)),
                links: li.map(d => Object.assign({}, d))
            });
            gr.append('g')
                .attr('class', 'links')
                .selectAll('path')
                .data(sa_li)
                .enter()
                .append('path')
                .attr('d', d3.sankeyLinkHorizontal())
                .attr('stroke', d => {
                    const so_no = sa_no[d.source.index];
                    return co_sc(so_no.name);
                })
                .attr('stroke-width', d => Math.max(1, d.width))
                .attr('fill', 'none')
                .attr('opacity', 0.5)
                .attr("stroke-dasharray", function () { return this.getTotalLength(); })
                .attr("stroke-dashoffset", function () { return this.getTotalLength(); })
                .on('mouseover', function (event, d) {
                    d3.select(this).attr('opacity', 0.8);

                    const so_no = sa_no[d.source.index];
                    const tooltip = d3.select('#tooltip');
                    tooltip.style('display', 'block')
                        .html(`<strong>${so_no.name}</strong><br/>
                               Emissions: ${d.value.toFixed(3)} kg CO₂eq<br/>
                               ${((d.value / d.target.value) * 100).toFixed(1)}% of total`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 10) + 'px');
                })
                .on('mouseout', function () {
                    d3.select(this).attr('opacity', 0.5);
                    d3.select('#tooltip').style('display', 'none');
                })
                .transition()
                .duration(1500)
                .delay((d, i) => i * 50)
                .ease(d3.easeCubicOut)
                .attr("stroke-dashoffset", 0);

            const no_gr = gr.append('g')
                .attr('class', 'nodes')
                .selectAll('g')
                .data(sa_no)
                .enter()
                .append('g');

            no_gr.append('rect')
                .attr('x', d => d.x0)
                .attr('y', d => d.y0)
                .attr('height', d => d.y1 - d.y0)
                .attr('width', d => d.x1 - d.x0)
                .attr('fill', d => {
                    if (d.name === 'Supply Chain') return '#666';
                    if (st.some(s => s.label === d.name)) return co_sc(d.name);
                    return '#2d5a3d';
                })
                .attr('stroke', '#000')
                .attr('stroke-width', 1)
                .style('opacity', 0)
                .style('transform', 'scale(0.8)')
                .style('transform-origin', 'center')
                .transition()
                .duration(800)
                .delay((d, i) => 1000 + i * 50)
                .ease(d3.easeBackOut)
                .style('opacity', 1)
                .style('transform', 'scale(1)');

            d3.selectAll('.nodes rect')
                .on('mouseover', function (event, d) {
                    d3.select(this).attr('opacity', 0.8);

                    const tooltip = d3.select('#tooltip');
                    tooltip.style('display', 'block')
                        .html(`<strong>${d.name}</strong><br/>
                               Total: ${d.value ? d.value.toFixed(3) : 0} kg CO₂eq`)
                        .style('left', (event.pageX + 10) + 'px')
                        .style('top', (event.pageY - 10) + 'px');
                })
                .on('mouseout', function () {
                    d3.select(this).attr('opacity', 1);
                    d3.select('#tooltip').style('display', 'none');
                });

            no_gr.append('text')
                .attr('x', d => {
                    if (d.x0 < wi / 3) return d.x1 + 6;
                    if (d.x0 > wi * 2 / 3) return d.x0 - 6;
                    return d.x0 + (d.x1 - d.x0) / 2;
                })
                .attr('y', d => (d.y1 + d.y0) / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', d => {
                    if (d.x0 < wi / 3) return 'start';
                    if (d.x0 > wi * 2 / 3) return 'end';
                    return 'middle';
                })
                .text(d => d.name)
                .style('font-size', '12px')
                .style('font-weight', d => !st.some(s => s.label === d.name) ? 'bold' : 'normal');

            no_gr.append('text')
                .attr('x', d => {
                    if (d.x0 < wi / 3) return d.x1 + 6;
                    if (d.x0 > wi * 2 / 3) return d.x0 - 6;
                    return d.x0 + (d.x1 - d.x0) / 2;
                })
                .attr('y', d => (d.y1 + d.y0) / 2 + 12)
                .attr('dy', '0.35em')
                .attr('text-anchor', d => {
                    if (d.x0 < wi / 3) return 'start';
                    if (d.x0 > wi * 2 / 3) return 'end';
                    return 'middle';
                })
                .text(d => d.value ? `${d.value.toFixed(2)} kg` : '')
                .style('font-size', '10px')
                .style('fill', '#e0e0e0');
        }

        up_sa(se.property('value'));


        se.on('change', function () {
            up_sa(this.value);
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