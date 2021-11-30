var attrArray = ["oPos","aPos","bPos","abPos","oNeg","aNeg","bNeg","abNeg"];
var expressed = attrArray[0];


//chart frame dimensions
var chartWidth = window.innerWidth * 0.485,
    chartHeight = 485,
    leftPadding = 25,
    rightPadding = 0,
    topBottomPadding = 0,
    chartInnerWidth = chartWidth - leftPadding - rightPadding,
    chartInnerHeight = chartHeight - topBottomPadding * 2,
    translate = "translate(" + leftPadding + "," + topBottomPadding + ")";



//create a scale to size bars proportionally to frame and for axis
var yScale = d3.scaleLinear()
    .range([463, 0])
    .domain([0, 110]);

//Width and height parameters for SVG
window.onload = initialize(); //start script once HTML is loaded

function initialize(){ //the first function called once the html is loaded
	setMap();
};

function setMap(){





  var widths = window.innerWidth * 0.49,
  heights = 490;

//Sets projection for the map
var projection = d3.geoMercator()
.center([30, 15 ])
    .scale(240)
    .rotate([350,0.01])

//creates the svg and appends, appends it to the body and gives it the attributes widths and heights
    var svg = d3.select("body").append("svg")
      .attr("width", widths)
      .attr("height", heights);

//Creates SVG path for data string
        var path = d3.geoPath()
            .projection(projection);

//assigns the variable g to the appended svg
var g = svg.append("g");


var graticule  = d3.geoGraticule()
  .step([5,5]);

//creates background for gratiucle and appends it to map(g)
var gratBackground = g.append("path")
  .datum(graticule.outline())
  .attr("class", "gratBackground")
  .attr("d", path)


//adds gratlines to map
var gratLine = g.selectAll(".gratLines")
  .data(graticule.lines())
  .enter()
  .append("path")
  .attr("class", "gratLines")
  .attr("d", path);


//use d3.queue to parallelize asynchronous data loading
      d3.queue()
          .defer(d3.csv, "data/BloodType.csv") //load attributes from csv
          .defer(d3.json, "data/Countries.topojson") //load background spatial data
          .await( callback);


      //changes our topojson to a geojson
  function callback(error, csvData, world) {
        var recolorMap = colorScale(csvData);
        //variables for data join


        var worldCountries = topojson.feature(world, world.objects.ne_10m_admin_0_countries).features;


 //loop through csv to assign each set of csv attribute values to geojson region
        for (var i=0; i<csvData.length; i++){
          var csvRegion = csvData[i]; //the current region
          var csvKey = csvRegion.ADMIN; //the CSV primary key

     //loop through geojson regions to find correct region
        for (var a=0; a<worldCountries.length; a++){

          var geojsonProps = worldCountries[a].properties; //the current region geojson properties
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
 //adds countrys to our map (g)
     var country = g.selectAll(".country")
       .data(worldCountries)
       .enter()
         .append("path")
         .attr("class", function(d){
         return "country " + d.properties.ADMIN;
                 })
         .attr("d", path)
         .style("fill", function(d) {
           return choropleth(d, recolorMap);
         })
         .on("mouseover", highlight)
			    .on("mouseout", dehighlight)


         			.append("desc") //append the current color
         				.text(function(d) {
         					return choropleth(d, recolorMap);
         				});

                createDropdown(csvData);
                setChart(csvData, colorScale);

            	};
            };
						function createDropdown(csvData){
						//add a select element for the dropdown menu
						var dropdown = d3.select("body")
							.append("div")
							.attr("class","dropdown") //for positioning menu with css

							.append("select")
							.on("change", function(){ changeAttribute(this.value, csvData) }); //changes expressed attribute
							var titleOption = dropdown.append("option")
							        .attr("class", "titleOption")
							        .attr("disabled", "true")
							        .text("Select Attribute");

						//create each option element within the dropdown
						dropdown.selectAll("options")
							.data(attrArray)
							.enter()
							.append("option")
							.attr("value", function(d){ return d })
							.text(function(d) {
								d = d[0].toUpperCase() + d.substring(1,3) + "" + d.substring(3);
								return d
							});
					};
    function colorScale(csvData){

     //create quantile classes with color scale
      var color = d3.scaleQuantile()
        .range([//designate quantile scale generator

       "#F06969",
       "#D75050",
       "#BD3636",
       "#A41D1D",
       "#8A0303"
     ]);

     //build array of all currently expressed values for input domain
      var domainArray = [];
      for (var i in csvData){
        domainArray.push(Number(csvData[i][expressed]));
      };
      //pass array of expressed values as domain
      color.domain(domainArray);
      return color;	 //return the color scale generator
    };
    function choropleth(d, recolorMap){
      //get data value
      var value = d.properties[expressed];
      //if value exists, assign it a color; otherwise assign gray
      if (value) {
        return recolorMap(value);
      } else {
        return "#3A3B3C";
      };

    };


 //adds

         //function to create a dropdown menu for attribute selection
         //function to create a dropdown menu for attribute selection

         //function to create a dropdown menu for attribute selection







				               function setChart(csvData, colorScale){
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
				 										.attr("width", chartInnerWidth / csvData.length - 1);
				 										 updateChart(bars, csvData.length, colorScale);


				 									};


													function changeAttribute(attribute, csvData){
														//change the expressed attribute
														expressed = attribute;
														var bars = d3.selectAll(".bar")
         										//re-sort bars
         												.sort(function(a, b){
             												return b[expressed] - a[expressed];

         										});

														var chartTitle = chart.append("text")
			 												.attr("x", 40)
			 												.attr("y", 120)
			 												.attr("class", "chartTitle")
			 												.text("Percentage of selected blood type in each region");

															var yAxis = d3.axisLeft()
	         										.scale(yScale)

															var axis = chart.append("g")
        												.attr("class", "axis")
        												.attr("transform", translate)
        												.call(yAxis);

																var chartFrame = chart.append("body")
	        												.attr("class", "chartFrame")
	        												.attr("width", chartInnerWidth)
	        												.attr("height", chartInnerHeight)
	        												.attr("transform", translate);





														//recolor the map
														d3.selectAll(".country") //select every region
															.style("fill", function(d) { //color enumeration units
																return choropleth(d, colorScale(csvData)); //->
															})
															.select("desc") //replace the color text in each region's desc element
																.text(function(d) {
																	return choropleth(d, colorScale(csvData)); //->
																});
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
            										return choropleth(d, );
        									});
				 										};


				 									//create a second svg element to hold the bar chart
				                   var chart = d3.select("body")
				                       .append("svg")
				                       .attr("width", chartWidth)
				                       .attr("height", chartHeight)
				                       .attr("class", "chart");

											//set bars for each province


              function highlight(data){

              	var props = data.properties; //json properties

              	d3.selectAll("#"+props.ADMIN) //select the current region in the DOM
              		.style("fill", "#000"); //set the enumeration unit fill to black

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
              };

              function dehighlight(data){

              	var props = data.properties; //json properties
              	var region = d3.select("#"+props.ADMIN); //select the current region
              	var fillcolor = region.select("desc"); //access original color from desc
              	region.style("fill", fillcolor); //reset enumeration unit to orginal color

              	d3.select("#"+props.ADMIN+"label").remove(); //remove info label
              };

             //add select element










        //create graticule generator
























          //console.log(worldCountries);
          //console.log(csvData);
