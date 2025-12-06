
(function () {
    'use strict';

    const nm24 = {
        "United States of America": "United States",
        "Dem. Rep. Congo": "Congo"
    };

    const width2 = 1100;
    const height2 = 600;

    const viz2Container = d3.select("#viz2")
        .append("div")
        .style("position", "relative")
        .style("width", "100%")
        .style("max-width", "1100px")
        .style("height", "600px")
        .style("background", "transparent")
        .style("border-radius", "12px")
        .style("box-shadow", "0 10px 30px rgba(0, 0, 0, 0.5)")
        .style("overflow", "hidden")
        .style("margin", "0 auto");

    const svg2 = viz2Container.append("svg")
        .attr("viewBox", `0 0 ${width2} ${height2}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("width", "100%")
        .style("height", "100%")
        .style("display", "block");


    const legend = viz2Container.append("div")
        .attr("class", "lg22")
        .style("position", "absolute")
        .style("bottom", "30px")
        .style("right", "30px");

    legend.append("div")
        .attr("class", "lg22-gradient");

    const legendLabels = legend.append("div")
        .attr("class", "lg22-labels");

    legendLabels.append("span").text("0%");
    legendLabels.append("span").text("5%");
    legendLabels.append("span").text("9%+");

    const projection = d3.geoMercator()
        .scale(150)
        .translate([width2 / 2, height2 / 1.5]);

    const path2 = d3.geoPath().projection(projection);

    const cs834 = d3.scaleLinear()
        .domain([0, 1, 5, 9])
        .range(["#232323", "#004d35", "#00b34d", "#39ff14"]);

    const ftnm = new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format;

    viz2Container.append("div")
        .attr("class", "ldg2")
        .style("position", "absolute")
        .style("top", "50%")
        .style("left", "50%")
        .style("transform", "translate(-50%, -50%)")
        .style("color", "#c9d1d9")
        .text("Loading Map Data...");

    Promise.all([
        d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),


        d3.csv("prithvijai_data/veganism-by-country-2025.csv")
    ]).then(([worldData, csvData]) => {

        viz2Container.select(".ldg2").remove();

        const dlu384 = {};

        csvData.forEach(row => {
            const countriesnm233 = row.country;


            const shrw33 = row.VeganismShareOfPop;
            const ttrw344 = row.VegansByCountry;


            if (shrw33 && shrw33.trim() !== "" && ttrw344 && ttrw344.trim() !== "") {
                dlu384[countriesnm233] = {
                    country: countriesnm233,
                    share: +shrw33,
                    total: +ttrw344,
                    reason: row.Reason && row.Reason.trim() !== "" ? row.Reason : "Data available in report."
                };
            }

        });

        const countries = topojson.feature(worldData, worldData.objects.countries).features;
        const ttp44 = d3.select("body").append("div").attr("class", "ttp44 ttp44-viz2");



        svg2.selectAll("path")
            .data(countries)

            .enter()
            .append("path")
            .attr("d", path2)


            .attr("class", "country")

            .attr("fill", d => {
                let name = d.properties.name;
                if (nm24[name]) name = nm24[name];



                const st24 = dlu384[name];


                return st24 ? cs834(st24.share) : "#232323";
            })


            .on("mouseover", function (event, d) {

                let name = d.properties.name;
                if (nm24[name]) name = nm24[name];



                const st24 = dlu384[name];


                let html33 = `<h3>${name}</h3>`;


                if (st24) {
                    html33 += `
                        <div   class =   "row">  <span   class   =    "label">   Share: </span>   <span    class    = "value">${st24.share}%</span>     </div>
                           <div   class =   "row">  <span   class   =    "label">   Total: </span>   <span    class    = "value">${ftnm(st24.total)}</span>         </div>
                    `;


                    if (st24.reason) {
                        html33 += `
                                <div       class   =       "rnbx22">
                            <span      class=       "rntt22">Why Veganism?</span  >


                            <div       class=       "rntxt24">${st24.reason}</div  >


                        </div>
                        `;
                    }
                } else {


                    html33 += `<div   style   =   "color: #8b949e; font-size: 0.85rem;">No data available.</div>`;


                }


                ttp44.html(html33)


                    .style("opacity", 1);


                d3.select(this).attr("stroke", "#ffffff").attr("stroke-width", 1.5);
            })
            .on("mousemove", function (event) {
                const ttp44 = d3.select(".ttp44-viz2");
                ttp44.style("left", (event.pageX + 15) + "px")


                    .style("top", (event.pageY - 10) + "px");


            })
            .on("mouseout", function (event, d) {

                ttp44.style("opacity", 0);
                d3.select(this).attr("stroke", "#30363d").attr("stroke-width", 0.5);

                let name = d.properties.name;
                if (nm24[name]) name = nm24[name];

                const st24 = dlu384[name];

                d3.select(this).attr("fill", st24 ? cs834(st24.share) : "#232323");
            });


    }).catch(error => {
        console.error("Error loading files:", error);

        viz2Container.select(".ldg2").remove();
        viz2Container.append("div")
            .attr("class", "ldg2")
            .style("position", "absolute")
            .style("top", "50%")
            .style("left", "50%")
            .style("transform", "translate(-50%, -50%)")
            .style("color", "#ff6b6b")
            .text("Error loading data: " + error.message);
    });

})();