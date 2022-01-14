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
    .rotate([80, -36])
    .scale(5000)
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
    .defer(d3.json, "https://raw.githubusercontent.com/Sharitau/Portfolio/main/GovernanceFinal/data/world.topojson") //load background spatial data
    .defer(d3.json, "https://raw.githubusercontent.com/Sharitau/Portfolio/main/GovernanceFinal/data/AfricaCountries.TOPOJSON")
    .defer(d3.json, "https://raw.githubusercontent.com/Sharitau/Portfolio/main/CouncilDistricts/data/Council_Districts.topojson")
    .await(callback);



  function callback(error, world, africa, atlanta) {
    //translate europe TopoJSON
    var worldCountries = topojson.feature(world, world.objects.ne_10m_admin_0_countries),
      africanCountries = topojson.feature(africa, africa.objects.AfricaCountries).features;
      atlanta = topojson.feature(atlanta, atlanta.objects.Council_Districts).features;


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
      .attr("d", path)

      //add Atlanta to map
      var atlcouncildistricts = map.selectAll(".atlcouncildistricts")
        .data(atlanta)
        .enter()
        .append("path")

        .attr("class", "atlcouncildistricts")
        .attr("data-atlanta", function(d) {
          return d.properties.NAME;
        })
        .attr("d", path)


    var countryNames = africanCountries.map(function(d) {
      return d.properties.ADMIN;
    }).sort();


    createDropdown(countryNames, africanCountries);
  };

  function createDropdown(countryNames, africanCountries) {
    //add select element
    var dropdown = d3.select("body")
      .append("select")
      .attr("class", "dropdown")
      .on("change", function() {
        // The value is the name of the country
        var countryName = this.value;

        for (var i = 0; i < africanCountries.length; i++) {
              if (africanCountries[i].properties.ADMIN == countryName) {
                var politicalStability = africanCountries[i].properties.Political;
                var voiceAndAccountability = africanCountries[i].properties.Voice_and;
                var governmentEffec = africanCountries[i].properties.Government;
                var regualtoryQuality = africanCountries[i].properties.Regulatory;
                var ruleOfLaw = africanCountries[i].properties.Rule_of_La;
                var controlOfCorruption = africanCountries[i].properties.Control_of;
                var governanceTotal = africanCountries[i].properties.Governance;


              }

            }

      var text = document.getElementById("p1").innerHTML = "Country name: " + countryName+ "<br><br>" +  " Political Stability: "+ politicalStability + "<br><br>" + "Voice and Accountability: "+ politicalStability + "<br><br>" + "Government Effectiveness: "
     + governmentEffec + "<br><br>" + "Regulatory Quality: " + regualtoryQuality + "<br><br>" + "Rule of Law: " + ruleOfLaw + "<br><br>" + "Control of Corruption: " + controlOfCorruption + "<br><br>" + "Governance Sum: " + governanceTotal;


        var othercountries = countryNames.filter(function(x) { return x !== countryName; });
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
