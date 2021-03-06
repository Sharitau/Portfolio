//First line of main.js...wrap everything in a self-executing anonymous function to move to local scope
(function(){


  //pseudo-global variables
var attrArray = ["oPos","aPos","bPos","abPos","oNeg","aNeg","bNeg","abNeg"];//list of attributes
  var expressed = attrArray[0];

  //chart frame dimensions
  var chartWidth = window.innerWidth * 0.425,
  chartHeight = 460;
  leftPadding = 25,
  rightPadding = 2,
  topBottomPadding = 5,
  chartInnerWidth = chartWidth - leftPadding - rightPadding,
  chartInnerHeight = chartHeight - topBottomPadding * 2,
  translate = "translate(" + leftPadding + "," + topBottomPadding + ")";


  //create a scale to size bars proportionally to frame
var yScale = d3.scaleLinear()
    .range([chartHeight, 0])
    .domain([0, 105]);


//begin script when window loads
window.onload = setMap();

//Example 1.4 line 1...set up choropleth map
function setMap(){

  //map frame dimensions
  var width = window.innerWidth * 0.5,
       height = 460;


   //create new svg container for the map
   var map = d3.select("body")
       .append("svg")
       .attr("class", "map")
       .attr("width", width)
       .attr("height", height);

   //create Albers equal area conic projection centered on France
   var projection = d3.geoMercator()
   .center([20, 13 ])
       .scale(240)
       .rotate([350,0.01]);

  //Setting path
    var path = d3.geoPath()
        .projection(projection);
  //Example 1.4 line 3...use d3.queue to parallelize asynchronous data loading
    d3.queue()
        .defer(d3.csv, "data/BloodType.csv") //load attributes from csv
        .defer(d3.json, "data/Countries2.topojson") //load background spatial data
        .defer(d3.json, "data/Countries.topojson")
        .await(callback);


      function callback(error, csvData, europe, france){
          setGraticule(map,path);

        //translate europe TopoJSON
         var basemapCountries = topojson.feature(europe, europe.objects.ne_10m_admin_0_countries),
             choroplethCountries = topojson.feature(france, france.objects.ne_10m_admin_0_countries).features;

         //add Europe countries to map
         var countries = map.append("path")
             .datum(basemapCountries)
             .attr("class", "countries")
             .attr("d", path);

        //joins CSV data to GEOJSON
        choroplethCountries = joinData(choroplethCountries, csvData);

        //create the color scale
        var colorScale = makeColorScale(csvData);

        //Add Enumeration units to the setMap
        setEnumerationUnits(choroplethCountries, map, path, colorScale);
        setChart(csvData, colorScale);
        createDropdown(csvData);
        changeAttribute();


      };

      //function to create a dropdown menu for attribute selection
      function createDropdown(csvData){
    //add select element
    var dropdown = d3.select("body")
        .append("select")
        .attr("class", "dropdown")
        .on("change", function(){ changeAttribute(this.value, csvData) });;


      var titleOption = dropdown.append("option")
        .attr("class", "titleOption")
        .attr("disabled", "true")
        .text("Select Blood Type");

      //create each option element within the dropdown
      var attrOptions = dropdown.selectAll("attrOptions")
        .data(attrArray)
        .enter()
        .append("option")
        .attr("value", function(d){ return d })
        .text(function(d) { return d });
};

//dropdown change listener handler
//dropdown change listener handler
function changeAttribute(attribute, csvData){
    //change the expressed attribute
    expressed = attribute;

    //recreate the color scale
    var colorScale = makeColorScale(csvData);

    //recolor enumeration units
    var regions = d3.selectAll(".regions")
        .transition()
        .duration(1000)
        .style("fill", function(d){
            return choropleth(d.properties, colorScale)
        });


//re-sort, resize, and recolor bars
var bars = d3.selectAll(".bar")
    //re-sort bars
    .sort(function(a, b){
        return b[expressed] - a[expressed];
    })
    .transition() //add animation
    .delay(function(d, i){
        return i * 20
    })
    .duration(500);

    updateChart(bars, csvData.length, colorScale);

    };

    function updateChart(bars, n, colorScale){
    //position bars
    bars.attr("x", function(d, i){
            return i * (chartInnerWidth / n) + leftPadding;
        })
        //size/resize bars
        .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
        })
        .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
        })
        //color/recolor bars
        .style("fill", function(d){
            return choropleth(d, colorScale);
        });

        var chartTitle = d3.select(".chartTitle")
        .text("Percentage of bloodtype " + expressed + " in each country");
};














    //function to create coordinated bar chart
    function setChart(csvData, colorScale){


        //create a second svg element to hold the bar chart
        var chart = d3.select("body")
            .append("svg")
            .attr("width", chartWidth)
            .attr("height", chartHeight)
            .attr("class", "chart");


            //create a rectangle for chart background fill
        var chartBackground = chart.append("rect")
          .attr("class", "chartBackground")
          .attr("width", chartInnerWidth)
          .attr("height", chartInnerHeight)
          .attr("transform", translate);



            //set bars for each province
          var bars = chart.selectAll(".bar")
          .data(csvData)
          .enter()
          .append("rect")
          .sort(function(a, b){
              return b[expressed]-a[expressed]
          })
          .attr("class", function(d){
              return "bar " + d.ADMIN;
          })
          .attr("width", chartInnerWidth / csvData.length - 1)
          .on("mouseover", highlight)
          .on("mouseout", dehighlight)
          .on("mousemove", moveLabel);

          var desc = bars.append("desc")
      .text('{"stroke": "none", "stroke-width": "0px"}')


          .attr("x", function(d, i){
              return i * (chartInnerWidth / csvData.length) + leftPadding;
          })
          .attr("height", function(d, i){
            return 463 - yScale(parseFloat(d[expressed]));
          })
          .attr("y", function(d, i){
            return yScale(parseFloat(d[expressed])) + topBottomPadding;
          })
          .style("fill", function(d){
            return choropleth(d, colorScale);
          });

          var chartTitle = chart.append("text")
          .attr("x", 40)
          .attr("y", 40)
          .attr("class", "chartTitle")
          .text("Percentage of Blood Type " + expressed[3] + " in each Country");

      //create vertical axis generator
      var yAxis = d3.axisLeft()
          .scale(yScale)


      //place axis
      var axis = chart.append("g")
          .attr("class", "axis")
          .attr("transform", translate)
          .call(yAxis);

      //create frame for chart border
      var chartFrame = chart.append("rect")
          .attr("class", "chartFrame")
          .attr("width", chartInnerWidth)
          .attr("height", chartInnerHeight)
          .attr("transform", translate);

      updateChart(bars, csvData.length, colorScale);
  };

    };//setmap ender








  //function to create color scale generator
  //function to create color scale generator
  function makeColorScale(data){

var colorScale = d3.scaleQuantile()
    .range([


        "#F06969",
        "#D75050",
        "#BD3636",
        "#A41D1D",
        "#8A0303"
      ]);

      //create color scale generator



//THIS BLOCK WON"T READ LENGTH
      var domainArray = [];
      for (var i in data){
        domainArray.push(Number(data[i][expressed]));
      };
      //assign array of expressed values as scale domain
      colorScale.domain(domainArray);

      return colorScale;
  };



//function to test for data value and return color
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);
    } else {
        return "#CCC";
    };
};

    function setGraticule(map,path){
              //Example 2.5 line 3...create graticule generator
                   var graticule = d3.geoGraticule()
                       .step([5, 5]); //place graticule lines every 5 degrees of longitude and latitude



                       //create graticule background
              var gratBackground = map.append("path")
                  .datum(graticule.outline()) //bind graticule background
                  .attr("class", "gratBackground") //assign class for styling
                  .attr("d", path) //project graticule

                   //create graticule lines
                   var gratLines = map.selectAll(".gratLines") //select graticule elements that will be created
                       .data(graticule.lines()) //bind graticule lines to each element to be created
                       .enter() //create an element for each datum
                       .append("path") //append each element to the svg as a path element
                       .attr("class", "gratLines") //assign class for styling
                       .attr("d", path); //project graticule lines
    };

    function joinData(choroplethCountries, csvData){
      //loop through csv to assign each set of csv attribute values to geojson region
for (var i=0; i<csvData.length; i++){
    var csvRegion = csvData[i]; //the current region
    var csvKey = csvRegion.ADMIN; //the CSV primary key

    //loop through geojson regions to find correct region
    for (var a=0; a<choroplethCountries.length; a++){

        var geojsonProps = choroplethCountries[a].properties; //the current region geojson properties
        var geojsonKey = geojsonProps.ADMIN; //the geojson primary key

        //where primary keys match, transfer csv data to geojson properties object
        if (geojsonKey == csvKey){

            //assign all attributes and values
            attrArray.forEach(function(attr){
                var val = parseFloat(csvRegion[attr]); //get csv attribute value
                geojsonProps[attr] = val; //assign attribute and value to geojson properties
            });
        };
    };
};
console.log(choroplethCountries);
console.log(csvData);
return choroplethCountries;
};


function setEnumerationUnits(choroplethCountries, map, path, colorScale){
  //add France regions to map
  var regions = map.selectAll(".regions")
      .data(choroplethCountries)
      .enter()
      .append("path")
      .attr("class", function(d){
          return "regions " + d.properties.ADMIN;
      })
      .attr("d", path)

       .style("fill", function(d){
           return choropleth(d.properties, colorScale);
       })

       .on("mouseover", function(d){
            highlight(d.properties);
        })

        .on("mouseout", function(d){
            dehighlight(d.properties);

        })

        .on("mousemove", moveLabel);

        var desc = regions.append("desc")
       .text('{"stroke": "#000", "stroke-width": "0.5px"}');

};

//function to test for data value and return color
function choropleth(props, colorScale){
    //make sure attribute value is a number
    var val = parseFloat(props[expressed]);
    //if attribute value exists, assign a color; otherwise assign gray
    if (typeof val == 'number' && !isNaN(val)){
        return colorScale(val);
    } else {
        return "#CCC";
    };
};


//function to highlight enumeration units and bars
function highlight(props){
   //change stroke
   var selected = d3.selectAll("." + props.ADMIN)
       .style("stroke", "blue")
       .style("stroke-width", "2");
    setLabel(props);
};

function dehighlight(props){
    var selected = d3.selectAll("." + props.ADMIN)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    };

    d3.select(".infolabel")
          .remove();
};

//function to create dynamic label
function setLabel(props){
    //label content
    var labelAttribute = "<b>"+props.ADMIN+"</b><br><br><b>"+expressed+
      "</b><br>"+props[expressed] + "%"; //label content
    var labelName = props.name //html string for name to go in child div

    //create info label div
    var infolabel = d3.select("body")
      .append("text") //create the label div
      .attr("class", "infolabel")
      .attr("id", props.ADMIN+"label") //for styling label
      .html(labelAttribute) //add text
      .append("") //add child div for feature name
      .attr("class", "labelname") //for styling name
      .html(labelName); //add feature name to label



    var regionName = infolabel.append("div")
        .attr("class", "labelname")
        .html(props[expressed]);
};

//Example 2.8 line 1...function to move info label with mouse
function moveLabel(){
    //get width of label
    var labelWidth = d3.select(".infolabel")
        .node()
        .getBoundingClientRect()
        .width;

    //use coordinates of mousemove event to set label coordinates
    var x1 = d3.event.clientX + 10,
        y1 = d3.event.clientY - 75,
        x2 = d3.event.clientX - labelWidth - 10,
        y2 = d3.event.clientY + 25;

    //horizontal label coordinate, testing for overflow
    var x = d3.event.clientX > window.innerWidth - labelWidth - 20 ? x2 : x1;
    //vertical label coordinate, testing for overflow
    var y = d3.event.clientY < 75 ? y2 : y1;

    d3.select(".infolabel")
        .style("left", x + "px")
        .style("top", y + "px");
};



             //variables for data join


   //loop through csv to assign each set of csv attribute values to geojson region
 //load choropleth spatial data




})();
