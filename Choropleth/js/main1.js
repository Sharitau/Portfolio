(function(){

  //psuedo-global variables
  //variables for data join
        var attrArray = ["oPos","aPos","bPos","abPos","oNeg","aNeg","bNeg","abNeg"];
        var expressed = attrArray[0];

function setMap(){

  var widths = 960,
  heights = 1000;


  //Sets projection for the map
  var projection = d3.geoMercator()
      .center([100, 30 ])
      .scale(98)
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
 
    //use d3.queue to parallelize asynchronous data loading
        d3.queue()
          .defer(d3.csv, "data/BloodType.csv") //load attributes from csv
          .defer(d3.json, "data/Countries.topojson") //load background spatial data
          .await( callback);

    //place graticule on the smap


  //changes topojson to geojson
    function callback(error, csvData, world) {

      //place graticole on the map
      setGraticule(g, path);

      //translate world to topojson
      var worldCountries = topojson.feature(world, world.objects.ne_10m_admin_0_countries).features;

      //join data
      worldCountries =  joinData(worldCountries, csvData);




  //set enumerationUnits
  setEnumerationUnits(worldCounty, g, path);
};
};


function setGraticule(g, path){

  //create graticule generator
  var graticule  = d3.geoGraticule()
    .step([5,5]);

  //creates background for gratiucle and appends it to map(g)
  var gratBackground = g.append("path")
    .datum(graticule.outline())
    .attr("class", "gratBackground")
    .attr("d", path)


  //adds gratlines to map
  var gratLines = g.selectAll(".gratLines")
  .data(graticule.lines())
  .enter()
  .append("path")
  .attr("class", "gratLines")
  .attr("d", path);

};


function joinData (worldCountries, csvData){
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

     return worldCountries;
 };
};



      //  function makeColorScale(data){
        //    var colorClasses = [
          //      "#D4B9DA",
            //    "#C994C7",
              //  "#DF65B0",
                //"#DD1C77",
                //"#980043"
            //];

            //create color scale generator
            //var colorScale = d3.scaleThreshold()
              //  .range(colorClasses);

            //build array of all values of the expressed attribute
            //var domainArray = [];
            //for (var i=0; i<data.length; i++){
              //  var val = parseFloat(data[i][expressed]);
              //  domainArray.push(val);
            //};

            //cluster data using ckmeans clustering algorithm to create natural breaks
            //var clusters = ss.ckmeans(domainArray, 5);
            //reset domain array to cluster minimums
            //domainArray = clusters.g(function(d){
              //  return d3.min(d);
            //});
            //remove first value from domain array to create class breakpoints
            //domainArray.shift();

            //assign array of last 4 cluster minimums as domain
            //colorScale.domain(domainArray);

            //return colorScale;




function setEnumerationUnits(worldCountries,g,path){
//adds countrys to our map (g)
    var country = g.selectAll(".country")
      .data(worldCountries)
      .enter()
        .append("path")
        .attr("class", function(d){
        return "country " + d.properties.ADMIN;
                })
        .attr("d", path)
        //.style("fill", function(d){
          //  return colorScale(d.properties[exxpressed]);
        //});


        //Example 1.4 line 11...function to create color scale generator
        //function to create color scale generator


        //container.selectAll(".country")
          //.data(worldCountries)
          //.enter()
          //.append("path")
          //.attr("class", "country")
          //.attr("d", path);






          //worldRegions = topojson.feature(world, world.objects.worldRegions).features;


          console.log(worldCountries);
          console.log(csvData);

      };

    });
