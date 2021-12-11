//begin script when window loads
window.onload = setMap();


//set up choropleth map
function setMap(){


//map frame dimensions
//map frame dimensions
  var width = 1200,
    height = 1000;

  //create new svg container for the map
  var map = d3.select("body")
    .append("svg")
    .attr("class", "map")
    .attr("width", width)
    .attr("height", height);

  //create Albers equal area conic projection centered on France
  var projection = d3.geoOrthographic()
    .scale(600)
    .translate([width / 2, height / 2.7])
    .clipAngle(85)
    .precision(.1);

  var path = d3.geoPath()
    .projection(projection)

  var graticule = d3.geoGraticule()
    .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude

  //create graticule background
  var gratBackground = map.append("path")
    .datum(graticule.outline()) //bind graticule background
    .attr("class", "gratBackground") //assign class for styling
    .attr("d", path) //project graticule

  //Example 2.6 line 5...create graticule lines
  var gratLines = map.selectAll(".gratLines")
    .data(graticule.lines()) //bind graticule lines to each element to be created
    .enter() //create an element for each datum
    .append("path") //append each element to the svg as a path element
    .attr("class", "gratLines") //assign class for styling
    .attr("d", path); //project graticule lines

  //Accordion open
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
      acc[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    }

  //use queue to parallelize asynchronous data loading
  d3.queue()
    .defer(d3.json, "https://raw.githubusercontent.com/Sharitau/website/main/Portfolio/GovernanceFinal/data/world.topojson") //load background spatial data
    .defer(d3.json, "https://raw.githubusercontent.com/Sharitau/website/main/Portfolio/GovernanceFinal/data/Africa.TOPOJSON")
    .await(callback);



  function callback(error, world, africa) {
    //translate europe TopoJSON
    var worldCountries = topojson.feature(world, world.objects.ne_10m_admin_0_countries),
      africanCountries = topojson.feature(africa, africa.objects.ne_10m_admin_0_countries).features;


    //add rest of world countries to map
    var countries = map.append("path")
      .datum(worldCountries)
      .attr("class", "countries")
      .attr("d", path);

    //add Africa regions to map
    var regions = map.selectAll(".regions")
      .data(africanCountries)
      .enter()
      .append("path")
      .attr("class", "regions")
      .attr("data-country", function(d) {
        return d.properties.ADMIN;
      })
      .attr("d", path);

    var countryNames = africanCountries.map(function(d) {
      return d.properties.ADMIN;
    }).sort();


    createDropdown(countryNames);
  };

  function createDropdown(countryNames) {
    //add select element
    var dropdown = d3.select("body")
      .append("select")
      .attr("class", "dropdown")
      .on("change", function() {
        // The value is the name of the country
        var countryName = this.value;
        var othercountries = countryNames.filter(function(x) { return x !== countryName; });
        //console.log(othercountries);
        //var othercountriesLength = othercountries.length;

        for (var i = 0; i < othercountries.length; i++) {
          if (countryNames.includes(othercountries[i])) {
                otherCountriesI = othercountries[i];
                //console.log(otherCountriesI);
                  dehighlight(otherCountriesI);
                };
                };

      //console.log(othercountries);
        highlight(countryName);



      });

    //add initial option
    var titleOption = dropdown.append("option")
      .attr("class", "titleOption")
      .attr("disabled", "true")
      .text("Select Country");

    //add attribute name options
    var attrOptions = dropdown.selectAll("attrOptions")
      .data(countryNames)
      .enter()
      .append("option")
      .attr("value", function(d) {
        return d;
      })
      .text(function(d) {
        return d;
      });
  };

  //function to highlight countries
  function highlight(countryName) {
    //change stroke
    var selected = d3.selectAll("[data-country='" + countryName + "']")
      .style("stroke", "blue")
      .style("stroke-width", "2")
    //console.log(countryName);


  };
  //function to dehighlight counties
  function dehighlight(otherCountriesI) {
    var notselected = d3.selectAll("[data-country='" + otherCountriesI + "']")
      .style("stroke", "none")
}




}
