
//begin script when window loads
window.onload = setMap();

var attrArray = ["Algeria","Angola","Benin","Botswana","Burkina Faso","Burundi","Cabo Verde","Cameroon","Central African Republic","Chad","Comoros","Congo","Côte d'Ivoire","Djibouti","DR Congo","Egypt","Equatorial Guinea","Eritrea","Eswatini",
"Ethiopia","Gabon","Gambia","Ghana","Guinea","Guinea-Bissau","Kenya","Lesotho","Liberia","Libya","Madagascar","Malawi","Mali","Mauritania","Mauritius","Morocco","Mozambique","Namibia","Niger","Nigeria","Rwanda","Sao Tome & Principe","Senegal",
"Seychelles","Sierra Leone","Somalia","South Africa","South Sudan","Sudan","Tanzania","Togo","Tunisia","Uganda","Zambia","Zimbabwe"];

  var expressed = attrArray[0];



//set up choropleth map
function setMap(){
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


    //use queue to parallelize asynchronous data loading
    d3.queue()
      .defer(d3.csv, "data/AfricaCountries.csv") //load attributes from csv
      .defer(d3.json, "data/world.topojson") //load background spatial data
      .defer(d3.json, "data/Africa.topojson")
      .await(callback);

function callback(error, csvData, world, africa){
  //translate europe TopoJSON
        var basemapCountries = topojson.feature(world, world.objects.ne_10m_admin_0_countries),
              choroplethCountries= topojson.feature(africa, africa.objects.ne_10m_admin_0_countries).features;


         //select graticule elements that will be created
        //add Europe countries to map
        var countries = map.append("path")
          .datum(basemapCountries)
          .attr("class", "countries")
          .attr("d", path);

  //add France regions to map
            var regions = map.selectAll(".regions")
              .data(choroplethCountries)
              .enter()
              .append("path")
              .attr("class", function(d){
                return "regions " + d.properties.ADMIN;
              })
              .attr("d", path)

              console.log(countries);
              console.log(regions)



        createDropdown(csvData);





    };

    function createDropdown(csvData){
        //add select element
        var dropdown = d3.select("body")
            .append("select")
            .attr("class", "dropdown")
            .attr("d", path)
            .on("change", function(){
              highlight(d.properties);
            });


        //add initial option
        var titleOption = dropdown.append("option")
            .attr("class", "titleOption")
            .attr("disabled", "true")
            .text("Select Country");

        //add attribute name options
        var attrOptions = dropdown.selectAll("attrOptions")
            .data(attrArray)
            .enter()
            .append("option")
            .attr("value", function(d){ return d })
            .text(function(d){ return d });
    };

    //function to highlight enumeration units and bars
 function highlight(props){
     //change stroke
     var selected = d3.selectAll("." + props.ADMIN)
         .style("stroke", "blue")
         .style("stroke-width", "2")
         console.log(props.ADMIN);
 };


};
