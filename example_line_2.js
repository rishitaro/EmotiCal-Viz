var margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var parseDate = d3.timeParse("%Y-%m-%dT%H:%M:%S.%fZ");

var formatDate = d3.timeFormat("%B %d");

var bisectDate = d3.bisector(function(d) { return d.date; }).left;
// 2017-05-06T04:31:22.350928Z

// Set time scale for entry timestamp data
var x = d3.scaleTime()
    .range([0, width]);

// Set linear scale for mood data
var y = d3.scaleLinear()
    .range([height, 0]);

// Create xAxis for timestamps 
var xAxis = d3.axisBottom(x);

// Create yAxis for mood levels and set to draw for ever
var yAxis = d3.axisLeft(y)
    .ticks(5);

var line = d3.line()
    .curve(d3.curveLinear)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.mood); });

var svg = d3.select("#two")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// gridlines in x axis function
function make_x_gridlines() {		
    return d3.axisBottom(x)
        .ticks(20)
}

// gridlines in y axis function
function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(5)
}


d3.json("example_data.json", function(error, data) {
    if (error) throw error;
       
    var parsed_data = data.participants[0].entries;
    

    
    for(var j = 0; j < parsed_data.length; j++) {          
        
        
        
        var parsed_date = parseDate(parsed_data[j].datetime);
        console.log(parsed_date);
        console.log(formatDate(parsed_date));
        
        parsed_data[j].date = parseDate(parsed_data[j].datetime) ;
        parsed_data[j].mood = + parsed_data[j].mood;    
        

    }


    x.domain([parsed_data[0].date, parsed_data[parsed_data.length - 1].date]);
    y.domain([-3,3]);
    
    //d3.extent(parsed_data, function(d) { return d.mood; })
    
    svg.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat("")
      );

  // add the Y gridlines
    svg.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
    );

    svg.append("linearGradient")
      .attr("id", "temperature-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", y(-3))
      .attr("x2", 0).attr("y2", y(3))
      .selectAll("stop")
      .data([
        {offset: "0%", color: "#9EABCF"},
        {offset: "25%", color: "#C6DFE6"},
        {offset: "50%", color: "#CDD0D0"},
        {offset: "75%", color: "#FAF5B1"},
        {offset: "100%", color: "#F5E091"}
      ])
    .enter().append("stop")
      .attr("offset", function(d) { return d.offset; })
      .attr("stop-color", function(d) { return d.color; });

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(xAxis);
    

    svg.append("path")
      .datum(parsed_data)
      .attr("class", "line")
      .attr("d", line);
    
    svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text");
    
    
    var focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");
    
    
    focus.append("line")
        .attr("class", "x-hover-line hover-line")
        .attr("y1", 0)
        .attr("y2", height);

    focus.append("line")
        .attr("class", "y-hover-line hover-line")
        .attr("x1", width)
        .attr("x2", width);

    focus.append("circle")
        .attr("r", 7);

    focus.append("text")
        .attr("x", 15)
      	.attr("dy", ".31em");

    svg.append("rect")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
      var x0 = x.invert(d3.mouse(this)[0]),
          i = bisectDate(parsed_data, x0, 1),
          d0 = parsed_data[i - 1],
          d1 = parsed_data[i],
          d = x0 - d0.date > d1.date - x0 ? d1 : d0;
      focus.attr("transform", "translate(" + x(d.date) + "," + y(d.mood) + ")");
      focus.select("text").text(function() { return d.mood; });
      focus.select(".x-hover-line").attr("y2", height - y(d.mood));
      focus.select(".y-hover-line").attr("x2", width + width);
    }
});