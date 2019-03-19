var choroplethMap;
var promises = [
  d3.json(
    "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json"
  ),
  d3.json("data/education.json")
];

Promise.all(promises)
  .then(function(data) {
    choroplethMap = new ChoroplethMap();

    data[1].forEach((d, i) => {
      choroplethMap.unemployment.set(d.fips, {
        countyName: d.area_name,
        state: d.state,
        rate: d.bachelorsOrHigher
      });
    });

    choroplethMap.ready(data[0]);
  })
  .catch(function(error) {
    console.log(error);
  });
