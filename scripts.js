const dataSourceUrl = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
const margin = {
    top: 100,
    right: 20,
    bottom: 30,
    left: 60
};
const width = 920 - margin.left - margin.right;
const height = 630 - margin.top - margin.bottom;

function d3ScatterPlotBuilder() {
    const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("text")
        .attr("id", "title")
        .attr("x", (width / 2))
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "30px")
        .text("Doping in Professional Bicycle Racing");


    fetch(dataSourceUrl)
        .then(response => response.json())
        .then(result => {
            const data = result;

            data.forEach(function (d) {
                d.Place = +d.Place;
                const parsedTime = d.Time.split(':');
                d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
            });

            const xScale = d3.scaleLinear()
                .range([0, width]);

            const yScale = d3.scaleTime()
                .range([0, height]);

            xScale.domain([d3.min(data, d => d.Year - 1),
                d3.max(data, (d) => d.Year + 1)]);
            yScale.domain(d3.extent(data, (d) => d.Time));

            const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
            const color = d3.scaleOrdinal(d3.schemeCategory10);
            const timeFormat = d3.timeFormat("%M:%S");
            const yAxis = d3.axisLeft(yScale).tickFormat(timeFormat);
            const toolTipDiv = d3.select("body").append("div")
                .attr("class", "tooltip")
                .attr("id", "tooltip")
                .style("opacity", 0);

            svg.append("g")
                .attr("class", "x axis")
                .attr("id", "x-axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis)
                .append("text")
                .attr("class", "x-axis-label")
                .attr("x", width)
                .attr("y", -6)
                .style("text-anchor", "end")
                .text("Year");

            svg.append("g")
                .attr("class", "y axis")
                .attr("id", "y-axis")
                .call(yAxis)
                .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Best Time (minutes)")


            svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "dot")
                .attr("cx", (d, i) => xScale(d.Year))
                .attr("cy", (d, i) => yScale(d.Time))
                .attr("r", 6)
                .attr("data-xvalue", (d) => d.Year)
                .attr("data-yvalue", (d) => d.Time.toISOString())
                .style("fill", (d) => color(d.Doping !== ""))
                .on("mouseover",(d) => {
                    toolTipDiv.style("opacity", .9);
                    toolTipDiv.attr("data-year", d.Year)
                    toolTipDiv.html(d.Name + ": " + d.Nationality + "<br/>"
                        + "Year: " + d.Year + ", Time: " + timeFormat(d.Time)
                        + (d.Doping ? "<br/><br/>" + d.Doping : ""))
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", (d) => toolTipDiv.style("opacity", 0));

            const legendContainer = svg.append("g")
                .attr("id", "legend");

            const legend = legendContainer.selectAll("#legend")
                .data(color.domain())
                .enter().append("g")
                .attr("class", "legend-label")
                .attr("transform", (d, i) => "translate(0," + (height / 2 - i * 20) + ")");

            legend.append("rect")
                .attr("x", width - 18)
                .attr("width", 18)
                .attr("height", 18)
                .style("fill", color);

            legend.append("text")
                .attr("x", width - 24)
                .attr("y", 9)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text((d) => {
                    if (d) return "Riders with doping allegations";
                    else {
                        return "No doping allegations";
                    }
                });
        });

}

document.addEventListener("DOMContentLoaded", () => d3ScatterPlotBuilder());