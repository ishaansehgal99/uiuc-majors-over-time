


// Using jQuery, read our data and call visualize(...) only once the page is ready:
$(function() {
  d3.csv("uiuc-cleaned.csv").then(function(data) {
    // Write the data to the console for debugging:
    console.log(data);

    // Call our visualize function:
    visualize(data, "Engineering", "#chart-engineering", 1980, 2018);
    visualize(data, "LAS", "#chart-las", 1980, 2018);
    visualize(data, "ACES", "#chart-aces", 1980, 2018);
    visualize(data, "Applied Health Sciences", "#chart-ahs", 1980, 2018);
    sliders(data);
  });
});

var remove = function(){
    console.log("Remove")


}

var visualize = function(data, college, id, startDate, endDate, replace = false) {
  // Boilerplate:

  var margin = { top: 50, right: 50, bottom: 50, left: 50 },
     width = 280 - margin.left - margin.right,
     height = 600 - margin.top - margin.bottom;


  var svg = d3.select(id)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("width", width + margin.left + margin.right)
    .style("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // if(replace == true){
    //   d3.select("#chart-engineering").remove();
    //   d3.select("#chart-las").remove();
    //   d3.select("#chart-aces").remove();
    //   d3.select("#chart-ahs").remove();
    // }


  // Visualization Code:
  // var startDate = 1980;
  // var endDate = 2018;

  var xScale = d3.scaleLinear().domain([startDate, endDate]).range([0, width]);

  var yScale = d3.scaleLinear().domain([0, 1700]).range([height, 50]);

  var yAxisLeftVariable = d3.axisLeft().scale(yScale);
  var yAxisRightVariable = d3.axisRight().scale(yScale);

  // Major label
  var label = svg.append("text");
  label.attr("x", 50).attr("y", 50).attr("text-anchor", "middle").attr("font-size","14px");

  // College label
  svg.append("text")
     .attr("x", xScale((startDate + endDate) / 2))
     .attr("y", 0)
     .attr("text-anchor", "middle")
     .attr("font-size", "18px")
     .text(college);

  svg.append("text")
     .attr("x", xScale(startDate))
     .attr("y", 25)
     .attr("text-anchor", "middle")
     .attr("font-size", "14px")
     .text(startDate);

  svg.append("text")
     .attr("x", xScale(endDate))
     .attr("y", 25)
     .attr("text-anchor", "middle")
     .attr("font-size", "14px")
     .text(endDate);

  var labelLine = svg.append("line");
  labelLine.attr("opacity", 0)
           .attr("stroke", "black")
           .attr("stroke-width", 1);

  // {Key: Major name, Value: [startDateTotal, endDateTotal]}
  var majorToCounts = new Map();
  data.forEach(function (d, i) {
    if (d["College"] == college) {
      if (d["Fall"] == startDate) {
        majorToCounts.set(d["Major Name"], [d["Total"]]);
      } else if (majorToCounts.has(d["Major Name"]) && d["Fall"] == endDate) {
        majorToCounts.get(d["Major Name"]).push(d["Total"]);
      }
    }
  });

  majorToCounts.forEach((value, key, map)=>
  {
    if (majorToCounts.get(key).length == 1 || majorToCounts.get(key).length == 0) {
      majorToCounts.delete(key);
    }
  });

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxisLeftVariable);

  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate( " + (width) + ", 0 )")
    .call(yAxisRightVariable);

  majorToCounts.forEach((value,key,map)=>
  {
    svg.append("line") // TODO: Work out how to filter line selection
        .attr("x1", function (d, i) {
           return xScale( startDate );
         })
         .attr("y1", function (d, i) {
           return yScale( majorToCounts.get(key)[0] );
         })
         .attr("x2", function (d, i) {
           return xScale( endDate );
         })
         .attr("y2", function (d, i) {
           return yScale( majorToCounts.get(key)[1] );
         })
         .attr("stroke-width", 2)
         .attr("stroke", "black")
         .attr("opacity", 0.3)
         .on("mouseover", function(d) {
            /*d3.selectAll("line")
              .transition()
              .attr("duration", 200)
              .attr("opacity", 0.2);*/
            d3.select(this)
              .transition()
              .attr("duration", 200)
              .attr("opacity", 0.8)
              .attr("stroke-width", 3);

            var xCenter = xScale((startDate + endDate) / 2);
            var yCenter = (yScale( majorToCounts.get(key)[0] ) + yScale( majorToCounts.get(key)[1] )) / 2;

            label.text(key);
            label.attr("x", xCenter)
                 .attr("y", yCenter - 65);

            labelLine.attr("opacity", 0.8)
                     .attr("x1", xCenter)
                     .attr("x2", xCenter)
                     .attr("y1", yCenter)
                     .attr("y2", yCenter - 55);

            labelLine.transition()
              .attr("duration", 200)
              .attr("opacity", 0.8)
              .attr("stroke-width", 1);
         })
         .on("mouseout", function(d) {
            /*d3.selectAll("line")
              .transition()
              .attr("duration", 200)
              .attr("opacity", 0.8)
              .attr("stroke-width", 2);*/

            d3.select(this)
              .transition()
              .attr("duration", 200)
              .attr("opacity", 0.3)
              .attr("stroke-width", 2);

            label.text("");

            labelLine.transition()
              .attr("duration", 200)
              .attr("opacity", 0)
              .attr("stroke-width", 1);
         });
  });

};



var sliders = function(data){
  var startDate = new Date(1980, 1, 1);
  var endDate = new Date(2018, 1, 1);

  var yearRange = d3.range(0, 39).map(function(d) {
      if((1980 + d) % 5 == 0 || (1980 + d) == 2018){
        return new Date(1980 + d, 1, 1);
      }
  });

  var sliderStart = d3
    .sliderHorizontal()
    .min(d3.min(yearRange))
    .max(d3.max(yearRange))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(500)
    .displayValue(true)
    .tickFormat(d3.timeFormat('%Y'))
    .on('onchange', val => {

      startDate = val;
      console.log(startDate.getFullYear());

      visualize(data, "Engineering", "#chart-engineering", startDate.getFullYear(), endDate.getFullYear(), true);
      visualize(data, "LAS", "#chart-las", startDate.getFullYear(), endDate.getFullYear(), false);
      visualize(data, "ACES", "#chart-aces", startDate.getFullYear(), endDate.getFullYear(), false);
      visualize(data, "Applied Health Sciences", "#chart-ahs", startDate.getFullYear(), endDate.getFullYear(), false);
    })
    .default(new Date(1980, 1, 1));

  var sliderEnd = d3
    .sliderHorizontal()
    .min(d3.min(yearRange))
    .max(d3.max(yearRange))
    .step(1000 * 60 * 60 * 24 * 365)
    .width(500)
    .displayValue(true)
    .tickFormat(d3.timeFormat('%Y'))
    .on('onchange', val => {

      endDate = val;
      console.log(endDate.getFullYear());

      visualize(data, "Engineering", "#chart-engineering", startDate.getFullYear(), endDate.getFullYear(), true);
      visualize(data, "LAS", "#chart-las", startDate.getFullYear(), endDate.getFullYear());
      visualize(data, "ACES", "#chart-aces", startDate.getFullYear(), endDate.getFullYear());
      visualize(data, "Applied Health Sciences", "#chart-ahs", startDate.getFullYear(), endDate.getFullYear());


    })
      .default(new Date(2018, 1, 1));

    d3.select('#slider')
       .append('svg')
       .attr('width', 700)
       .attr('height', 100)
       .append('g')
       .attr('transform', 'translate(100,50)')
       .call(sliderStart);

    d3.select('#slider')
        .append('svg')
        .attr('width', 700)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(100,50)')
        .call(sliderEnd);
}
/*
  svg.selectAll("Fall")
     .data(data)
     .enter()
     .append("line")
     .attr("x1", function (d, i) {
       return xScale( startDate );
     })
     .attr("y1", function (d, i) {
       return yScale( 500 );
     })
     .attr("x2", function (d, i) {
       return xScale( endDate );
     })
     .attr("y2", function (d, i) {
       return yScale( 1500 );
     })
     .attr("stroke-width", 1)
     .attr("stroke", "black");

  svg.selectAll("Fall")
     .data(data)
     .enter()
     .append("circle")
     .attr("r", 3)
     .attr("fill", "black")
     .attr("cx", function (d, i) {
       return xScale( startDate );
     })
     .attr("cy", function (d, i) {
       return yScale( 500 );
     });

  svg.selectAll("Fall")
     .data(data)
     .enter()
     .append("circle")
     .attr("r", 3)
     .attr("fill", "black")
     .attr("cx", function (d, i) {
       return xScale( endDate );
     })
     .attr("cy", function (d, i) {
       return yScale( 1500 );
     });
*/
