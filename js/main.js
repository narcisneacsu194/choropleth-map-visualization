var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

let margin = { left:80, right:20, top:150, bottom:100 };

    // Graph title
  // svg.append('text')
  // .attr('x', (svg.attr('width') / 2))
  // .attr('y', 50)
  // .attr('font-size', '30px')
  // .attr('text-anchor', 'middle')
  // .text('United States Educational Attainment');

// Graph sub-title
// svg.append('text')
//   .attr('x', (svg.attr('width') / 2))
//   .attr('y', 80)
//   .attr('font-size', '20px')
//   .attr('text-anchor', 'middle')
//   .text('Percentage of adults age 25 and older with a bachelor\'s degree or higher (2010-2014)');

    var unemployment = d3.map();

    var path = d3.geoPath();

    var x = d3.scaleLinear()
        .domain([0, 75])
        .rangeRound([600, 860]);

    var color = d3.scaleThreshold()
        .domain([3, 12, 21, 30, 39, 48, 57, 66])
        .range(d3.schemeGreens[9]);

    var g = svg.append("g")
        .attr("class", "key")
        .attr("transform", "translate(0,40)");

    g.selectAll("rect")
        .data(color.range().map(function(d) {
            d = color.invertExtent(d);
            if (d[0] == null) d[0] = x.domain()[0];
            if (d[1] == null) d[1] = x.domain()[1];
            return d;
        }))
        .enter().append("rect")
            .attr("height", 8)
            .attr("x", function(d) { 
              return x(d[0]); 
            })
            .attr("width", function(d) { 
              return x(d[1]) - x(d[0]); 
            })
            .attr("fill", function(d) { 
              return color(d[0]); 
            });

    g.call(d3.axisBottom(x)
        .tickSize(13)
        .tickFormat(function(x) { return x + "%"; })
        .tickValues(color.domain()))
      .select(".domain")
        .remove();


    var promises = [
      d3.json("https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json"),
      d3.json("data/education.json")
    ]

    Promise.all(promises).then(function(data){
        data[1].forEach((d, i) => {
          unemployment.set(d.fips, {
            countyName: d.area_name,
            state: d.state,
            rate: d.bachelorsOrHigher,
          });
        });
        ready(data[0]);
    }).catch(function(error){
        console.log(error);
    });

    function ready(us) {
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
                .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
                .attr("fill", function(d) {
                  let county = unemployment.get(d.id);
                  d.countyName = county.countyName;
                  d.rate = county.rate;
                  d.state = county.state;

                  return color(d.rate);
                })
                .attr("d", path)
            .append("title")
                .text(function(d) { 
                  return d.countyName + ', ' + d.state + ': ' + d.rate + "%"; 
                });

        svg.append("path")
            .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
            .attr("class", "states")
            .attr("d", path);
    }