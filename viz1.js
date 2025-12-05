
(function () {
    'use strict';

    let xScale, yScale, xAxis, lineGene7tor, areaGene7tor;


    let svg, contentGroup, linePath, areaPath, mrk22Group, focusGroup;

    let data;


    let czt244 = d3.zoomIdentity;
    let activeStoryPoint = null;

    let zoom;




    const margin = { top: 40, right: 30, bottom: 40, left: 40 };

    const width = 1000 - margin.left - margin.right;



    const height = 500 - margin.top - margin.bottom;







    const stpt42 = [


        { date: "2011-05", title: "Forks Over Knives", tag: "Documentary", icon: "\uecf0", value: 0, desc: "A scientific argument for plant-based diets triggers the first noticeable uptick in consistent search volume." },
        { date: "2014-06", title: "Cowspiracy", tag: "Environmental", icon: "\uecf0", value: 0, desc: "Netflix release shifts the narrative from animal rights to climate change, bringing a new demographic." },


        { date: "2017-06", title: "What the Health", tag: "Viral Hit", icon: "\uef3e", value: 0, desc: "A massive spike caused by the viral, shock-factor documentary linking meat to cancer." },
        { date: "2019-11", title: "The Game Changers", tag: "Fitness", icon: "\uef3e", value: 0, desc: "Veganism enters the gym. Elite athletes prove plants build muscle, dismantling the 'weak' stereotype." },

        { date: "2020-01", title: "Peak Veganuary", tag: "All-Time High", icon: "\uefb0", value: 0, desc: "The absolute historical peak. Pre-pandemic health resolutions meet peak cultural saturation." },


        { date: "2024-01", title: "Stabilization", tag: "New Normal", icon: "\uec7e", value: 0, desc: "Interest cools. The hype cycle ends, and plant-based eating becomes a standard lifestyle option." }

    ];


    stpt42.forEach(d => d.dateObj = d3.timeParse("%Y-%m")(d.date));




    const e2 = [

        { start: "2004-01", end: "2013-12" },

        { start: "2014-01", end: "2019-12" },

        { start: "2020-01", end: "2024-05" }


    ];



    d3.text("prithvijai_data/Raise_of_Veganism_Data.csv").then(function (rawText) {



        d3.select("#viz1-chart-wrapper .ldg2").remove();


        const ccd19 = rawText.split('\n').slice(3).join('\n');


        const hdr3 = "Month,value";


        const cc24 = hdr3 + "\n" + ccd19;



        data = d3.csvParse(cc24, d => ({

            date: d3.timeParse("%Y-%m")(d.Month),
            value: +d.value


        })).filter(d => d.date !== null && !isNaN(d.value));

        stpt42.forEach(pt => {

            const mt98 = data.find(d => d.date.getTime() === pt.dateObj.getTime());


            if (mt98) {

                pt.value = mt98.value;


            } else {

                pt.value = 50;

            }


        });



        initChart();


    }).catch(function (error) {

        console.error("Error ldg2 CSV:", error);



        d3.select("#viz1-chart-wrapper").append("div").attr("class", "ldg2").text("Error loading data.");

    });



    function initChart() {

        svg = d3.select("#viz1-chart-wrapper")

            .append("svg")


            .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)

            .attr("preserveAspectRatio", "xMidYMid meet")


            .append("g")

            .attr("transform", `translate(${margin.left},${margin.top})`);



        const defs = svg.append("defs");



        const filter = defs.append("filter").attr("id", "glow-viz1");


        filter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "coloredBlur");

        const feMerge = filter.append("feMerge");


        feMerge.append("feMergeNode").attr("in", "coloredBlur");


        feMerge.append("feMergeNode").attr("in", "SourceGraphic");



        const gradient = defs.append("linearGradient")

            .attr("id", "heat-gradient-viz1")


            .attr("x1", "0%").attr("y1", "100%").attr("x2", "0%").attr("y2", "0%");


        gradient.append("stop").attr("offset", "0%").attr("stop-color", "#74b9ff");

        gradient.append("stop").attr("offset", "40%").attr("stop-color", "#ffeaa7");

        gradient.append("stop").attr("offset", "100%").attr("stop-color", "#00b894");




        const ag22 = defs.append("linearGradient")

            .attr("id", "area-gradient-viz1")

            .attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");

        ag22.append("stop").attr("offset", "0%").attr("stop-color", "#00b894").attr("stop-opacity", 0.2);


        ag22.append("stop").attr("offset", "100%").attr("stop-color", "#ffffff").attr("stop-opacity", 0);



        defs.append("clipPath")

            .attr("id", "clip-viz1")

            .append("rect")

            .attr("width", width + 20)

            .attr("height", height + 50)

            .attr("x", -10).attr("y", -30);


        xScale = d3.scaleTime()

            .domain(d3.extent(data, d => d.date))

            .range([0, width]);


        const maxY = Math.max(100, d3.max(data, d => d.value));

        yScale = d3.scaleLinear()

            .domain([0, maxY])

            .range([height, 0]);


        zoom = d3.zoom()

            .scaleExtent([1, 8])

            .extent([[0, 0], [width, height]])

            .translateExtent([[0, 0], [width, height]])

            .on("zoom", zoomed);



        const hoverRect = svg.append("rect")

            .attr("class", "zmlyr")

            .attr("width", width).attr("height", height)

            .style("fill", "none")

            .style("pointer-events", "all")
            .style("cursor", "default")

            .call(zoom);

        hoverRect
            .on("mousemove.hover", handleHover)
            .on("mouseleave.hover", handleHoverEnd);


        const yAxis = d3.axisLeft(yScale).tickSize(-width).tickFormat("").ticks(5);

        svg.append("g").attr("class", "gd2").call(yAxis).call(g => g.select(".domain").remove());


        contentGroup = svg.append("g")
            .attr("clip-path", "url(#clip-viz1)")
            .attr("class", "viz-pulse-effect");


        areaGene7tor = d3.area()

            .x(d => xScale(d.date))

            .y0(height)

            .y1(d => yScale(d.value))

            .curve(d3.curveMonotoneX);


        lineGene7tor = d3.line()

            .x(d => xScale(d.date))

            .y(d => yScale(d.value))

            .curve(d3.curveMonotoneX);


        areaPath = contentGroup.append("path")

            .datum(data)

            .attr("class", "apth")

            .attr("fill", "url(#area-gradient-viz1)")

            .attr("d", areaGene7tor);


        linePath = contentGroup.append("path")

            .datum(data)

            .attr("class", "lnpth")

            .attr("stroke", "url(#heat-gradient-viz1)")

            .attr("filter", "url(#glow-viz1)")

            .attr("d", lineGene7tor);


        mrk22Group = contentGroup.append("g").attr("class", "mrk22-group");
        focusGroup = contentGroup.append("g")
            .attr("class", "focus-marker")
            .style("pointer-events", "none")
            .style("opacity", 0);

        focusGroup.append("circle")
            .attr("r", 12)
            .attr("fill", "rgba(255,255,255,0.1)")
            .attr("stroke", "rgba(0,184,148,0.4)")
            .attr("stroke-width", 2);

        focusGroup.append("circle")
            .attr("r", 5)
            .attr("fill", "#00b894")
            .attr("stroke", "#fff")
            .attr("stroke-width", 1.5);

        drawmrk22(xScale);


        xAxis = svg.append("g")

            .attr("transform", `translate(0,${height})`)

            .call(d3.axisBottom(xScale).ticks(6).tickSize(0).tickPadding(15))

            .style("font-family", "Outfit")

            .style("font-size", "12px")

            .style("color", "#b2bec3");




        const pathNode = linePath.node();

        const tL22 = pathNode.getTotalLength();



        const slt22 = tL22 * 1.5;





        linePath
            .attr("stroke-dasharray", slt22 + " " + slt22)
            .attr("stroke-dashoffset", slt22)
            .transition()
            .duration(2500)
            .ease(d3.easeCubicOut)
            .attr("stroke-dashoffset", 0)
            .on("end", function () {
                d3.select(this).attr("stroke-dasharray", null);
            });

        areaPath.style("opacity", 0)
            .transition().delay(1000).duration(2000).style("opacity", 0.6);

    }





    function zoomed(event) {

        czt244 = event.transform;

        const newXScale = event.transform.rescaleX(xScale);



        xAxis.call(d3.axisBottom(newXScale).ticks(6).tickSize(0).tickPadding(15));

        xAxis.select(".domain").remove();



        linePath.attr("d", lineGene7tor.x(d => newXScale(d.date)));



        areaPath.attr("d", areaGene7tor.x(d => newXScale(d.date)));

        drawmrk22(newXScale);
        hidetp6();

    }


    function drawmrk22(currentXScale) {

        const mrk22 = mrk22Group.selectAll(".stmkr")
            .data(stpt42, d => d.date);

        const mrk22Enter = mrk22.enter()
            .append("g")
            .attr("class", "stmkr")
            .style("pointer-events", "none");

        mrk22Enter.append("circle")
            .attr("class", "stmkr-ring")
            .attr("r", 12)
            .attr("fill", "#fff")
            .attr("opacity", 0.45);

        mrk22Enter.append("circle")
            .attr("class", "stmkr-core")
            .attr("r", 6)
            .attr("fill", "#fff")
            .attr("stroke", "#00b894")
            .attr("stroke-width", 2);

        mrk22Enter.merge(mrk22)
            .attr("transform", d => `translate(${currentXScale(d.dateObj)}, ${yScale(d.value)})`);

        mrk22.exit().remove();

    }

    function getCurrentXScale() {
        return czt244 ? czt244.rescaleX(xScale) : xScale;
    }

    function handleHover(event) {
        if (!focusGroup || event.buttons > 0) return;
        const currentScale = getCurrentXScale();
        const [mx] = d3.pointer(event);

        let closest = null;
        let minDist = Infinity;
        stpt42.forEach(pt => {
            const px = currentScale(pt.dateObj);
            const dist = Math.abs(px - mx);
            if (dist < minDist) {
                minDist = dist;
                closest = pt;
            }
        });

        const threshold = 18;
        if (!closest || minDist > threshold) {
            handleHoverEnd();
            return;
        }

        const px = currentScale(closest.dateObj);
        const py = yScale(closest.value);
        focusGroup
            .style("opacity", 1)
            .attr("transform", `translate(${px}, ${py})`);

        activeStoryPoint = closest;
        showtp6(event, closest);
    }

    function handleHoverEnd() {
        if (focusGroup) focusGroup.style("opacity", 0);
        activeStoryPoint = null;
        hidetp6();
    }


    const tp6 = d3.select("body").append("div").attr("class", "gt6 gt6-viz1");


    function showtp6(event, d, isStoryMode = false) {


        const dateStr = d3.timeFormat("%B %Y")(d.dateObj);

        tp6.html(`

                    <div class="th6328">

                <div class="tb22">${d.tag}</div>

                       <div class="tb22" style="background:rgba(255,255,255,0.1); color:#e0e0e0">Index: ${d.value}</div>

                   </div>

        
                   <h3 class="ttil22">${d.title}</h3>

            <div class="td22">${dateStr}</div>

        
                   <div class="tb23y">${d.desc}</div>

        `);

        tp6.style("opacity", 1);


        if (event) {
            let left = event.pageX + 18;
            let top = event.pageY - 18;
            const tooltipWidth = 320;
            const tooltipHeight = 200;
            if (left + tooltipWidth > window.scrollX + window.innerWidth) {
                left = event.pageX - tooltipWidth - 18;
            }
            if (top < window.scrollY + 20) {
                top = event.pageY + 24;
            }
            tp6.style("left", `${left}px`).style("top", `${top}px`);
            return;
        }

        const chartRect = document.querySelector('#viz1-chart-wrapper svg').getBoundingClientRect();
        const plotX = czt244.applyX(xScale(d.dateObj));
        const plotY = yScale(d.value);
        const anchorX = (chartRect.left + window.scrollX) + margin.left + plotX - 140;
        const anchorY = (chartRect.top + window.scrollY) + margin.top + plotY - 170;
        tp6.style("left", `${anchorX}px`).style("top", `${anchorY}px`);

    }



    function hidetp6() { tp6.style("opacity", 0); }



    function zoomToe7(index) {


        document.querySelectorAll('.e7cd').forEach((el, i) => el.classList.toggle('active', i === index));
        const e7 = e2[index];


        const stD3 = d3.timeParse("%Y-%m")(e7.start);
        const eD5 = d3.timeParse("%Y-%m")(e7.end);


        const stx2 = xScale(stD3);
        const eD4 = xScale(eD5);


        const dx = eD4 - stx2;

        const k = width / dx;

        const t = d3.zoomIdentity.translate(width / 2, 0).scale(k).translate(-(stx2 + dx / 2), 0);
        svg.transition().duration(1500).call(zoom.transform, t);
    }


    function resetZoom() {
        document.querySelectorAll('.e7cd').forEach(el => el.classList.remove('active'));

        svg.transition().duration(1200).call(zoom.transform, d3.zoomIdentity);
    }

    let sT48;

    let stin34 = 0;
    let iP77 = false;


    function togglePlay() {
        const btn = document.getElementById('playBtn');


        if (iP77) {
            iP77 = false;
            clearTimeout(sT48);


            btn.innerHTML = '▶ Resume';
        } else {
            iP77 = true;

            btn.innerHTML = '⏸ Pause';
            if (stin34 >= stpt42.length) stin34 = 0;
            playStep();

        }
    }

    function playStep() {

        if (!iP77) return;
        if (stin34 >= stpt42.length) {
            iP77 = false;

            document.getElementById('playBtn').innerHTML = '▶ Replay';
            stin34 = 0;

            resetZoom();
            return;
        }

        const pt = stpt42[stin34];
        const tx34 = xScale(pt.dateObj);

        const k = 3;
        const t = d3.zoomIdentity.translate(width / 2, 0).scale(k).translate(-tx34, 0);



        svg.transition().duration(2000).call(zoom.transform, t).on("end", () => {
            if (!iP77) return;

            showtp6(null, pt, true);

            sT48 = setTimeout(() => {

                if (!iP77) return;

                hidetp6();

                stin34++;
                playStep();

            }, 3000);
        });

    }

    window.viz1ResetZoom = resetZoom;
    window.viz1ZoomToEra = zoomToe7;
    window.viz1TogglePlay = togglePlay;

})();
