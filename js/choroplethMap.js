ChoroplethMap = function() {
  this.initVis();
};

ChoroplethMap.prototype.initVis = function() {
  let vis = this;

  vis.svg = d3.select("svg");
  vis.margin = { left: 80, right: 20, top: 150, bottom: 100 };
  vis.width = +vis.svg.attr("width");
  vis.width = vis.width - vis.margin.left - vis.margin.right;
  vis.height = +vis.svg.attr("height");
  vis.height = vis.height - vis.margin.top - vis.margin.bottom;

  vis.g = vis.svg
    .append("g")
    .attr(
      "transform",
      "translate(" + vis.margin.left + ", " + vis.margin.top + ")"
    );

  // Tooltip
  vis.tip = d3
    .tip()
    .attr("class", "d3-tip")
    .html(function(d) {
      let text =
        "<span style='color:white'>" +
        d.countyName +
        ", " +
        d.state +
        ": " +
        d.rate +
        "%" +
        "</span><br>";

      return text;
    });

  vis.g.call(vis.tip);

  // Graph title
  vis.svg
    .append("text")
    .attr("x", vis.svg.attr("width") / 2)
    .attr("y", 50)
    .attr("font-size", "30px")
    .attr("text-anchor", "middle")
    .text("United States Educational Attainment");

  // Graph sub-title
  vis.svg
    .append("text")
    .attr("x", vis.svg.attr("width") / 2)
    .attr("y", 80)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text(
      "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
    );

  vis.unemployment = d3.map();

  vis.path = d3.geoPath();

  vis.x = d3
    .scaleLinear()
    .domain([0, 75])
    .rangeRound([600, 860]);

  vis.color = d3
    .scaleThreshold()
    .domain([3, 12, 21, 30, 39, 48, 57, 66])
    .range(d3.schemeGreens[9]);

  vis.renderVis();
};

ChoroplethMap.prototype.renderVis = function() {
  let vis = this;

  vis.g
    .selectAll("rect")
    .data(
      vis.color.range().map(function(d) {
        d = vis.color.invertExtent(d);
        if (d[0] == null) d[0] = vis.x.domain()[0];
        if (d[1] == null) d[1] = vis.x.domain()[1];
        return d;
      })
    )
    .enter()
    .append("rect")
    .attr("height", 8)
    .attr("x", function(d) {
      return vis.x(d[0]);
    })
    .attr("width", function(d) {
      return vis.x(d[1]) - vis.x(d[0]);
    })
    .attr("fill", function(d) {
      return vis.color(d[0]);
    });

  vis.g
    .call(
      d3
        .axisBottom(vis.x)
        .tickSize(13)
        .tickFormat(function(x) {
          return x + "%";
        })
        .tickValues(vis.color.domain())
    )
    .select(".domain")
    .remove();
};

ChoroplethMap.prototype.ready = function(us) {
  let vis = this;

  vis.g
    .append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append("path")
    .attr("fill", function(d) {
      let county = vis.unemployment.get(d.id);
      d.countyName = county.countyName;
      d.rate = county.rate;
      d.state = county.state;

      return vis.color(d.rate);
    })
    .attr("d", vis.path)
    .on("mouseover", vis.tip.show)
    .on("mouseout", vis.tip.hide);

  vis.g
    .append("path")
    .datum(
      topojson.mesh(us, us.objects.states, function(a, b) {
        return a !== b;
      })
    )
    .attr("class", "states")
    .attr("d", vis.path);
};
