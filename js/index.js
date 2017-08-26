var margin = 50,
    width = parseInt(d3.select('.chart').style("width")) - margin*2,
    height = 600 - margin*2;

var parseTime = d3.timeParse("%M:%S");

var tip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-5,25])
    .html(function(d) { return "<span>" + d.Name + "</span>" + "<span>: " + d.Nationality + "</span>"
                              + "<br/><span>Year: " + d.Year + ", </span>" + "<span>Time: " + d.Time + "</span>"
                              + "<br/><br/><span>" + d.Doping + "</span>"; })
        
var x = d3.scaleTime()
    .range([0, width-margin]);

var y = d3.scaleLinear()
    .range([height, 0]);

var color = d3.scaleOrdinal(d3.schemeCategory10);

var xAxis = d3.axisBottom(x)
               .tickFormat(d3.timeFormat("%M:%S"))
               .ticks(Math.max(width/200, 3));

var yAxis = d3.axisLeft(y);

var svg = d3.select(".chart")
    .attr("width", width + margin*2 )
    .attr("height", height + margin*2 )
    .attr("class", "chart")
  .append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")")
   .call(tip);


d3.json("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json", function(error, data) {
  if (error) throw error;
 
  var fastest = d3.min(data, function(d) { return parseTime(d.Time); });
  var slowest = d3.max(data, function(d) { return parseTime(d.Time); });

  x.domain([slowest-fastest + moment.duration(5000), moment.duration(0)]);
  y.domain([d3.max(data, function(d) { return d.Place; }) +1, 1]);

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("class", "x label")
      .attr("x", width/2)
      .attr("y", 36)
      .attr("fill", "black")
      .style("text-anchor", "middle")
      .text("Minutes behind fastest");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("class", "y label")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "-1.8em")
      .attr("fill", "black")
      .style("text-anchor", "end")
      .text("Ranking")


  svg.selectAll(".dot")
      .data(data)
    .enter().append("circle")
      .attr("class", "dot")
      .attr("r", 4)
      .attr("cx", function(d) { return x(parseTime(d.Time)-fastest); })
      .attr("cy", function(d) { return y(d.Place); })
      .style("fill", function(d) { return color(!!d.Doping); })
    .on("mouseover", function(d, i) {
      tip.show(d, svg)
      })
    .on("mouseout", tip.hide);
  
  
  svg.selectAll(".rider-label")
      .data(data)
    .enter().append("text")
      .attr("class", "rider-label")
      .attr("x", function(d) { return x(parseTime(d.Time)-fastest) + 10; })
      .attr("y", function(d) { return y(d.Place) +3; })
      .text(function(d) { return d.Name; });

  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("circle")
      .attr("cx", width - 24)
      .attr("cy", height/2)
      .attr("r", 3.5)
      .attr("class", "legend-dot")
      .style("fill", color);

  legend.append("text")
      .attr("class", "legend-label")
      .attr("x", width - 34)
      .attr("y", height/2)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d ? "Riders with doping allegations" : "No doping allegations"; });
  
  svg.append("text")
    .attr("class", "chart-title")
    .style("text-anchor", "middle")  // this makes it easy to centre the text as the transform is applied to the anchor
    .attr("transform", "translate(" + width/2 + ","+ -margin*0.3 +")")  // centre in top margin
    .text("35 Fastest times up Alpe d'Huez (normalized to 13.8km distance)");

  resize();
  
  d3.select(window).on('resize', resize);

  function resize() {
    var newWidth = parseInt(d3.select(".chart").style("width")) - margin*2,
    newHeight = parseInt(d3.select(".chart").style("height")) - margin*2;
    
    /* Update the range of the scale with new width/height */
    x.range([0, newWidth-margin]);
    y.range([newHeight, 0]);
     
    /* Update the axis with the new scale */
    svg.select('.x.axis')
      .attr("transform", "translate(0," + newHeight + ")")
      .call(xAxis);

    svg.select('.y.axis')
      .call(yAxis);
       
    if( newWidth < 330 ) {
      svg.select('.x.label').style("display", "none");
      legend.select('.legend-label').style("display", "none");
      legend.select('.legend-dot').style("display", "none");
      svg.select('.chart-title')
        .attr("transform", "translate(" + newWidth/2 + ","+ -margin*0.3 +")")  // centre in top margin
        .text("35 Fastest times up Alpe d'Huez");
    }
    else {
      svg.select('.x.label').style("display", "initial");
      legend.select('.legend-label').style("display", "initial");
      legend.select('.legend-dot').style("display", "initial");
      svg.select('.x.label').attr("x", newWidth/2);
      legend.select('.legend-label')
        .attr("x", newWidth - 34)
        .attr("y", newHeight/2);
      legend.select('.legend-dot')
        .attr("cx", newWidth - 24)
        .attr("cy", newHeight/2);
      svg.select('.chart-title')
        .attr("transform", "translate(" + newWidth/2 + ","+ -margin*0.3 +")")  // centre in top margin
        .text("35 Fastest times up Alpe d'Huez (normalized to 13.8km distance)");
    }
    
    if( newWidth < 200 ) {
      svg.select('.x.axis').style("display", "none");
      svg.selectAll('.dot')
        .attr("cx", 0)
        .attr("cy", function(d) { return y(d.Place); });
      svg.selectAll('.rider-label')
        .attr("x", 10)
        .attr("y", function(d) { return y(d.Place) +3; });   
      svg.select('.chart-title').style("display", "none");
    }
    else {
      svg.select('.x.axis').style("display", "initial");
      svg.selectAll('.dot')
        .attr("cx", function(d) { return x(parseTime(d.Time)-fastest); })
        .attr("cy", function(d) { return y(d.Place); });
      svg.selectAll('.rider-label')
        .attr("x", function(d) { return x(parseTime(d.Time)-fastest) + 10; })
        .attr("y", function(d) { return y(d.Place) +3; });  
      svg.select('.chart-title').style("display", "initial");
    }
  }
});