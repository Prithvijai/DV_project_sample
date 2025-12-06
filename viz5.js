
(function () {
    'use strict';
    Promise.all([
        d3.csv('prithvijai_data/ghg-per-kg-poore.csv'),
        d3.csv('prithvijai_data/ghg-kcal-poore.csv'),
        d3.csv('prithvijai_data/ghg-per-protein-poore.csv')
    ]).then(function ([pe_kg_da, pe_kc_da, pe_pr_da]) {

        const fo_it = [
            'Beef (beef herd)',
            'Lamb & Mutton',
            'Pig Meat',
            'Poultry Meat',
            'Tofu',
            'Potatoes'
        ];

        const di_na = {
            'Beef (beef herd)': 'Beef',
            'Lamb & Mutton': 'Lamb',
            'Pig Meat': 'Pork',
            'Poultry Meat': 'Poultry',
            'Tofu': 'Tofu',
            'Potatoes': 'Potatoes'
        };

        const co_da = fo_it.map(en => {
            const pe_kg = pe_kg_da.find(d => d.Entity === en);
            const pe_kc = pe_kc_da.find(d => d.Entity === en);
            const pe_pr = pe_pr_da.find(d => d.Entity === en);

            return {
                en: en,
                di_na: di_na[en],
                pe_kg: pe_kg ? +pe_kg['GHG emissions per kilogram (Poore & Nemecek, 2018)'] : 0,
                pe_kc: pe_kc ? +pe_kc['GHG emissions per 1000kcal (Poore & Nemecek, 2018)'] : 0,
                pe_pr: pe_pr ? +pe_pr['GHG emissions per 100g protein (Poore & Nemecek, 2018)'] : 0
            };
        });

        const ma = { top: 40, right: 150, bottom: 60, left: 60 };
        const sv = d3.select('#viz5_svg');
        const sv_no = sv.node();
        const wi = sv_no.clientWidth - ma.left - ma.right;
        const he = sv_no.clientHeight - ma.top - ma.bottom;
        const gr = sv.append('g').attr('transform', `translate(${ma.left},${ma.top})`);

        const me = ['pe_kg', 'pe_kc', 'pe_pr'];
        const me_la = {
            'pe_kg': 'per kg',
            'pe_kc': 'per 1000 kcal',
            'pe_pr': 'per 100g protein'
        };

        const x0_sc = d3.scaleBand().domain(co_da.map(d => d.di_na))
            .range([0, wi])
            .padding(0.2);

        const x1_sc = d3.scaleBand().domain(me).range([0, x0_sc.bandwidth()])
            .padding(0.05);

        const y_sc = d3.scaleLinear()
            .domain([0, d3.max(co_da, d => Math.max(d.pe_kg, d.pe_kc, d.pe_pr))])
            .nice().range([he, 0])

        const co_sc = d3.scaleOrdinal()
            .domain(me)
            .range(['#5B2C6F', '#E91E8C', '#2DBCBC']);


        const x_ax = d3.axisBottom(x0_sc);
        const y_ax = d3.axisLeft(y_sc).ticks(8);

        gr.append('g')
            .attr('class', 'axis x-axis')
            .attr('transform', `translate(0,${he})`)
            .call(x_ax)
            .selectAll('text')
            .style('font-size', '12px');

        gr.append('g')
            .attr('class', 'axis y-axis')
            .call(y_ax);

        gr.append('text')
            .attr('class', 'axis-label')
            .attr('transform', 'rotate(-90)')
            .attr('x', -he / 2)
            .attr('y', -45)
            .attr('text-anchor', 'middle')
            .style('font-size', '14px')
            .text('kg CO₂eq');

        const fo_gr = gr.selectAll('.food-group')
            .data(co_da)
            .enter()
            .append('g')
            .attr('class', 'food-group')
            .attr('transform', d => `translate(${x0_sc(d.di_na)},0)`);

        fo_gr.selectAll('rect')
            .data(d => me.map(me_i => ({
                en: d.en,
                di_na: d.di_na,
                me: me_i,
                va: d[me_i]
            })))
            .enter()
            .append('rect')
            .attr('class', 'bar hoverable')
            .attr('x', d => x1_sc(d.me))
            .attr('width', x1_sc.bandwidth())
            .attr('fill', d => co_sc(d.me))
            .attr('opacity', 0.9)
            .attr('y', he)
            .attr('height', 0);


        const ob = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    fo_gr.selectAll('rect')
                        .transition()
                        .duration(1000)
                        .delay((d, i) => i * 100)
                        .ease(d3.easeCubicOut)
                        .attr('y', d => y_sc(d.va))
                        .attr('height', d => he - y_sc(d.va))
                        .on("end", function () {
                            d3.select(this)
                                .on('mouseover', function (event, d) {
                                    d3.select(this)
                                        .attr('opacity', 1)
                                        .attr('stroke', '#000')
                                        .attr('stroke-width', 2);

                                    const tooltip = d3.select('#tooltip');
                                    tooltip.style('display', 'block')
                                        .html(`<strong>${d.di_na}</strong><br/>
                                           ${me_la[d.me]}<br/>
                                           <strong>${d.va.toFixed(2)} kg CO₂eq</strong>`)
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
                    ob.disconnect();
                }
            });
        }, { threshold: 0.3 });

        const ch_el = document.getElementById('viz5_svg');
        if (ch_el) ob.observe(ch_el);

        const le = sv.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${wi + ma.left + 20}, ${ma.top})`);

        const le_it = le.selectAll('.legend-item')
            .data(me)
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * 25})`);

        le_it.append('rect')
            .attr('width', 18)
            .attr('height', 18)
            .attr('fill', d => co_sc(d))
            .attr('opacity', 0.9);

        le_it.append('text')
            .attr('x', 24)
            .attr('y', 9)
            .attr('dy', '0.35em')
            .style('font-size', '12px')
            .text(d => me_la[d]);

        sv.append('text')
            .attr('x', wi / 2 + ma.left)
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