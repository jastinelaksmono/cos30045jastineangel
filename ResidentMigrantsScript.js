// set the dimensions and margins of the graph
const margin = {top: 20, right: 30, bottom: 20, left: 70},
width = 600
height = 250

const w = width + margin.left + margin.right;
const h = height + margin.top + margin.bottom;

let svg;
let xScale;
let yScale;
let stackedData;
let color;
            
let getGender = "";
let getYear = "";
//let getOrigin = "None";
let getSortType = "";
let currentKey = "";
let colorRange = ['#ffe586','#ffd125','#ff9d67','#ff813c','#ff5e82','#ff305f','#d52c76','#ac225e','#a74eca','#8432a5'];
var getOrigin = ""; 

/** Get the origin countries according to the country hovered (available only for year 2020) */
function findOriginCountries(country){
    d3.csv("https://raw.githubusercontent.com/jastinelaksmono/cos30045jastineangel/main/csvData/top3origin-countries.csv")
    .then(function(data){
        var originData = {};
        data.forEach(destination => {
            if(destination.name == country){
                originData = destination;
            }
        });

        getOrigin = "<div class='tooltipTitle'>Top 3 Migrants' Origin</div>" + 
                    "<div class='tooltipDesc2'>" + originData.origin1 + ": " + (+originData.value1).toLocaleString('en-US') +"</div>" +
                    "<div class='tooltipDesc2'>" + originData.origin2 + ": " + (+originData.value2).toLocaleString('en-US') +"</div>" +
                    "<div class='tooltipDesc2'>" + originData.origin3 + ": " + (+originData.value3).toLocaleString('en-US') +"</div>" ;
    });
}

/** Search all year data and draw the grapgh of resident migrants in stacked area chart */
function findDataAllYear()
{
    d3.csv("https://raw.githubusercontent.com/jastinelaksmono/cos30045jastineangel/main/csvData/destinationAllYear.csv")
    .then(function(data){
        
        d3.select("#chartDesc")
            .selectAll("g")
            .data(colorRange)
            .join('g')
                .style("display", "flex")
                .style("flex-direction", "row")
                .style("opacity", 1)
                .html(function(d, i){
                    return "<div class='colorBox' style='margin-left: 2.5vw; background-color:"+ d +";'></div><div class='attrText'>" + (colorRange.length-i) + 
                            (i == 0 ? " = Lowest" : "") + (i == colorRange.length-1 ? " = Highest" : "") +
                            "</div>";            
                })
        
        data.sort(function (a,b) {                    
            return d3.descending(a.year,b.year);
        });
        
        //console.log(data);
        
        //get the list of countries
        const keys = data.columns.slice(1)

        //set color
        color = d3.scaleOrdinal()
                .domain(keys)
                .range(colorRange);

        //put the data in stack
        stackedData = d3.stack()
                        .keys(keys)
                        (data)

        xScale = d3.scaleLinear()
                    //data input range
                    .domain([d3.min(data, function(d){ 
                        return d.year;
                    }),d3.max(data, function(d){ 
                        return d.year;
                    })])
                    .range([0, width]);

        // create a tooltip
        const tooltip = svg.append("text")
                            .attr("x", 50)
                            .attr("y", 50)
                            .style("opacity", 0)
                            .style("font-family", "OpenSansBold")
                            .style("font-size", "5vw");
        
        const datapoint = svg.append("g");  // the cirlce dot point
        const linepoint = svg;              // the line for the range of the migrants number

        //hover on the area of a country in stacked area chart
        const mouseover = function(event,d) {
            tooltip.style("opacity", 1);

            //areas unhovered
            d3.selectAll("path").style("opacity", .2);

            //current hovered area
            d3.select(this)
                .style("stroke", color(d.key))
                .style("opacity", 1);

            //circle point
            svg.append("g")
                .selectAll("circle")
                .data(d)
                .join("circle")
                .style("stroke", color(d.key))
                .attr("fill", "white")
                .attr("cx", function(d){
                    return xScale(d.data.year);
                })
                .attr("cy", function(d){
                    return yScale(d[1]);
                })
                .attr("r", 3);
            
            //data text on each year
            datapoint
                .selectAll("text")
                .data(d)
                .join("text")
                .attr("fill", "black")
                .attr("x", function(d, i){
                    if(i == 6){
                        return xScale(d.data.year)+5;
                    }else{
                        return xScale(d.data.year)-20;
                    }
                })
                .attr("y", function(d){
                    return yScale(d[1])-10;
                })
                .text(function(d){
                    return (d[1]-d[0]).toLocaleString('en-US');
                })
                .attr("class", "axis");
            
            //make the circke dot point visible
            datapoint.style("opacity", 1);
            
            linepoint.append("g")
                .selectAll("line")
                .data(d)
                .join("line")
                .attr("x1", function(d) { return xScale(d.data.year); })
                .attr("x2", function(d) { return xScale(d.data.year); })
                .attr("y1", function(d) { return yScale(d[0]); })
                .attr("y2", function(d) { return yScale(d[1]); })
                .attr("class", "lineStroke");
            linepoint.style("opacity", 1);
        
        }

        //change the tooltip color of country's name on mouse move
        const mousemove = function(event,d,i) {
            var grp = d.key
            tooltip.text(grp)
                    .attr("fill", color(d.key))
        }

        // fade the unhovered country's stacked area
        const mouseleave = function(event,d) {
            tooltip.style("opacity", 0);
            d3.selectAll("path").style("opacity", 1);
            svg.selectAll("circle")
                .remove();
            linepoint.selectAll(".lineStroke")
                .remove();
            datapoint.style("opacity", 0);
        }
        
        yScale.domain([0,150000000]);

         //draw x axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).tickSizeOuter(0).ticks(7));

        //draw y axis
        svg.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScale));

        
        //generate the area, positioning the x and y scaled position
        var area = function(boolean) {
            return d3.area()
            .y0(function(d) { return yScale(d[0]); })
            .y1(function (d) { return boolean ? yScale(d[1]): 0; })
            .x(function (d) { return boolean ? xScale(d.data.year) : 0; });
        }

        //draw area based on stacked data
        svg.selectAll("draw")
            .data(stackedData)
            .join("path")
                .attr("fill", function(d){
                    return color(d.key);
                })
                .attr("d", area(false))
                .on("mouseover", mouseover)
                .on("mousemove", mousemove)
                .on("mouseleave", mouseleave)
                .transition() 
                .duration(1500)
                .delay(function(d, i){
                    return i/d.length*100;    //Scale the length of a transition to be 
                })  
                .attr("d", area(true));                
    });
}

/** search data on a certain year, gender, origin, and sort type for bar/stacked bar chart*/
function findDataOnYear()
{
    var dataset = [];       //get the filtered dataset of selected attributs
    var subgroups = [];
    var colors = [];

    d3.csv("https://raw.githubusercontent.com/jastinelaksmono/cos30045jastineangel/main/csvData/destinationFull.csv")
    .then(function(data){
        
        //filter gender attributes to the retieved data
        switch(getGender)
        {
            case "male":
                data.map(function(d){
                    dataset.push({countries:d.nickname,male:d["m"+getYear]});
                });
                yScale.domain([0,dataset[0].male]);
                subgroups=["male"];
                colors = ['#08CCD4'];
                break;

            case "female":
                data.map(function(d){
                    dataset.push({countries:d.nickname,female:d["f"+getYear]});
                });
                yScale.domain([0,dataset[0].female]);
                subgroups=["female"];
                colors = ['#FFAE94'];
                break;

            case "combined":
                data.map(function(d){
                    dataset.push({countries:d.nickname,male:d["m"+getYear],female:d["f"+getYear]});
                });
                yScale.domain([0,(+dataset[0].male) + (+dataset[0].female)]);
                subgroups=["male","female"];
                colors = ['#08CCD4','#FFAE94'];
                break;

            case "total":
                data.map(function(d){
                    dataset.push({countries:d.nickname,total:d["b"+getYear]});
                });
                yScale.domain([0,dataset[0].total]);
                subgroups=["total"];
                colors = ['#FFC453'];
                break;
        }
        

        //apply sort to the dataset filtered
        if(getSortType == "asc"){
            if(getGender=="combined"){
                dataset.sort(function (a,b) {                    
                    return d3.ascending((a.male/10)+(a.female/10), (b.male/10)+(b.female/10));
                });
            }else{
                dataset.sort(function (a,b) {
                    return d3.ascending(a[getGender]/10, b[getGender]/10);
                });
            }
            
        }else if(getSortType == "dsc"){
            if(getGender == "combined"){
                dataset.sort(function (a,b) {
                    return d3.descending((a.male/10)+(a.female/10), (b.male/10)+(b.female/10));
                });
            }else{
                dataset.sort(function (a,b) {
                    return d3.descending(a[getGender]/10, b[getGender]/10);
                });
            }
        }

        //re-scale the x width range
        xScale = d3.scaleBand()
        //.range([0, width*1.5]) //larger bar width
        .domain(getCountries(dataset))
        .range([0, width])
        .padding(0.2);
        
        drawChart(subgroups, dataset, colors);
        
    });
    
}

/** Draw the chart for the bar/stacked bar chart using the passed dataset that has been filtered */
function drawChart(subgroups, dataset, colors)
{    
    //draw x axis
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0))
        .call(g => g.select(".domain").remove())

    //draw y axis
    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale));
    
    // color palette = one color per subgroup
    color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(colors)

    //stack the data --> stack per subgroup
    stackedData = d3.stack()
    .keys(subgroups)
    (dataset)

    //console.log(stackedData);

    var isOriginChecked = d3.select('#checkboxContainer').property('checked');

    // create a tooltip
    const tooltip = d3.select("#chartContainer")
                        .append("div")
                        .style("opacity", 0)
                        .attr("class", "tooltipBox");

    //make the tooltip visible on mouse over
    const mouseover = function(event,d) {
        tooltip.style("opacity", 1)
        d3.select(this)
            .style("stroke", "#4A1BAB")
            .style("opacity", 1);
    }

    //make the tooltip displaying decriptions of related data one mouse move
    const mousemove = function(event,d) {
        var value = 0;
        //Display number of male or female migrants (if gender applied)
        if(getGender == "combined")
        {
            value = +d[1] - +d[0];
            if(+d[0] == 0)
            {
                tooltip.html("<img src='images/male_icon.png' class='tooltipSign'>" +
                            "<div class='tooltipDesc'>Male Migrants: " + value.toLocaleString('en-US') + "</div>");
            }else{
                tooltip.html("<img src='images/female_icon.png' class='tooltipSign'>" + 
                            "<div class='tooltipDesc'>Female Migrants: " + value.toLocaleString('en-US') + "</div>");
            }
            
        }else{
            value = +d.data[getGender];

            //Display top 3 origin countries of hovered destination country
            if(isOriginChecked && getYear == "2020"){
                findOriginCountries(d.data.countries);
                tooltip.html("<img src='images/" + getGender + "_icon.png' class='tooltipSign' style='height: 10%;'>"+
                            "<div class='tooltipDesc'>" + getGender.charAt(0).toUpperCase() + getGender.slice(1) + 
                            " Migrants: " + value.toLocaleString('en-US')  + getOrigin + 
                            "</div>");
            }else{
                tooltip.html("<img src='images/" + getGender + "_icon.png' class='tooltipSign'>"+
                            "<div class='tooltipDesc'>" + getGender.charAt(0).toUpperCase() + getGender.slice(1) + 
                            " Migrants: " + value.toLocaleString('en-US')  + 
                            "</div>");

            }
        }

        //Position the tooltip based on mouse event
        tooltip.style("left", (event.x)/1.3 + "px")
                .style("top", (event.y)/2 + "px")
      }

    //hide the tooltip
    const mouseleave = function(event,d) {
        tooltip.style("opacity", 0)
        d3.select(this)
            .style("stroke", "none")
            .style("opacity", 0.8)
    }

    // Show the bars
    svg.append("g")
    .selectAll("g")
    //enter the stacked data to be looped (per group)
    .data(stackedData)
    .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        // enter second loop (per subgroup)
        .data(d => d)
        .join("rect")
        .attr("rx", function(){
            if(getGender!="combined"){
                return 5;
            }
        })
        .attr("x", d => xScale(d.data.countries))
        .attr("y", d => yScale(d[0]))
        .attr("height", d => yScale(d))
        .attr("width",xScale.bandwidth)
        .attr("fill", function(d, i){
            if(getSortType != "" && getGender == "total"){
                return matchColors(i);
            }
        })
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

    //bar animation
    svg.selectAll("rect")
        .transition()
        .duration(500)
        .attr("y", d => yScale(d[1]))
        .attr("height", d => yScale(d[0]) - yScale(d[1]))
        .delay(function(d, i){
            return i/stackedData.length*300;    //Scale the length of a transition to be 
        })                                       //1000 ms no matter how many data there is
        .ease(d3.easeCircleIn);
}


/** match the color according to the lowest to highest amount of migrants and vice versa */
function matchColors(i)
{   
    if (getSortType == "asc")
    {
        return colorRange[i];
    }else{
        return colorRange[colorRange.length-1-i];
    }
}

/** Apply selected attributes to filter the dataset, set up the svg canvas, 
 * and trigger functions to get the filtered dataset to draw and display chart
 */
function apply()
{
    //rotate the dropdown icon on hover
    dropdownSetting("");

    // append the svg object to the body of the page
    svg = d3.select("#chartContainer")
            .append("svg")
            .attr("viewBox", `0 0 ${w} ${h}`)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add X axis
    xScale = d3.scaleBand()
        //.range([0, width*1.5]) //larger bar width
        .range([0, width])
        .padding(0.2);

    // Add Y axis
    yScale = d3.scaleLinear()
    .domain([0, 55000000])
    .range([ height, 0 ]);

    //apply button
    var apply = d3.select("#apply");

    // apply button on click to get the selected attributes 
    apply.on("click", function(){
        if((getYear != "" && getGender != "") || getYear == "All"){
            svg.selectAll("g")
                .remove();
            svg.selectAll("path")
                .remove();

            if(getYear == "All")
            {
                findDataAllYear();
            }else{
                if(getSortType!="" && getGender == "total"){
                    d3.selectAll("#chartDesc g").style("opacity", 1);
                }else{
                    d3.selectAll("#chartDesc g").style("opacity", 0);
                }
                findDataOnYear();
            }
        }
    })
}

/** Select the year that is clicked by the user */
function selectYear()
{
    //d3.select("#datapoints").style("visibility","hidden");
    let years = ["1990","1995","2000","2005","2010","2015","2020"];
    years.forEach(year =>{
        callYear(year);
    });

    d3.select("#All").on("click", function(){
        changeCurrentYear("All");
        hideSomeFilters(true);
        getYear = "All";    
    });  
}

/** apply click function to all year when selected to be activated
 * and set up the filtered that is needed / not needed to be displayed
 */
function callYear(year){
    d3.select("#y" + year).on("click", function(){
        getYear = year;
        changeCurrentYear(year);
        hideSomeFilters(false);
    }); 
}

/** Hide gender, sort, and origin attributes according to the selected year */
function hideSomeFilters(hide)
{
    var gender = d3.select("#gender");
    var sort = d3.select("#sort");
    //var origin = d3.select("#dpOrigin");

    if(hide == true)
    {
        gender.style("visibility","hidden");
        sort.style("visibility","hidden");
        d3.select('#checkboxContainer').property('checked', false);
        d3.select("#datapoints").style("visibility","hidden");
        //origin.style("visibility","hidden");

    }else{
        gender.style("visibility","visible");
        sort.style("visibility","visible");
    }
}

/** Get all the countries from the dataset */
function getCountries(dataset){
    var countries = [];
    for(i=0; i<dataset.length; i++){
        countries.push(dataset[i]['countries']);
    }
    return countries;
}

/** Vustomise dropdown setting to be functioned to select
 * and display year
 */
function dropdownSetting(parent)
{
    d3.select(parent + ".dropbtn")
        .on("mouseover", function(){
            d3.select(parent + ".dropbtn #dropdownIcon")
                .style("rotate", "180deg"); 
        });
    d3.select(parent + ".dropdown-content")
        .on("mouseover", function(){
            d3.select(parent + ".dropbtn #dropdownIcon")
                .style("rotate", "180deg"); 
        })
        .on("mouseout", function(){
            d3.select(parent + ".dropbtn #dropdownIcon")
                .style("rotate", "0deg"); 
        });
}

/** Set the selected gender to be applied in the bar/stacked bar chart */
function setGender(gender)
{
    var button = d3.select("#" + gender);
    var options = ["male", "female","combined", "total"];

    button.classed("genderOptions", false);
    button.classed("genderSelected", true);

    getGender = gender;
    
    for(i=0; i<options.length; i++)
    {
        if(options[i] != gender)
        {
            button = d3.select("#" + options[i]);
            if(button.classed("genderSelected", true))
            {
                button.classed("genderSelected", false);
                button.classed("genderOptions", true);
            }
        }
    }

    setOrigin(); // set the origin checkbox to be displayed or not
}

/** Set the visibility of the orgigin filter attribute */
function setOrigin(){
    if(getYear=="2020" && getGender == "total"){
        d3.select("#datapoints").style("visibility","visible");
    }else{
        d3.select("#datapoints").style("visibility","hidden");
    }
}


/** Set the sort type based on selected button,
 * either ascending or descending
 */
function setSort(type)
{
    var button = d3.select("#" + type);
    var options = ["asc", "dsc"];

    if(button.classed("genderOptions"))
    {
        button.classed("genderOptions", false);
        button.classed("genderSelected", true);
        getSortType = type;
        
    }else if(button.classed("genderSelected"))
    {
        button.classed("genderSelected", false);
        button.classed("genderOptions", true);
        getSortType = "";
    }

    
    for(i=0; i<options.length; i++)
    {
        if(options[i] != type)
        {
            button = d3.select("#" + options[i]);
            if(button.classed("genderSelected", true))
            {
                button.classed("genderSelected", false);
                button.classed("genderOptions", true);
            }
        }
    }

    setOrigin(); // set the origin checkbox to be displayed or not
}

/** Change the selected year view in the dropdown year field*/
function changeCurrentYear(year){

    d3.select("#yearSelection")
        .text(year)
        .style("color", "#08CCD4");
    d3.select(".dropbtn")
        .style("border-color", "#08CCD4");

    setOrigin();
}

/** Expand the filter container to be sliding left (in) and right(out) */
function expandableFilter()
{
    var expandSign = d3.select("#expandSign");
    var signText = d3.select("#signText");
    var filterContainer = d3.select(".filterContainer");
    var filterSpace = d3.select(".filterSpace");
    let onExpand = false;

    expandSign.on("click", function()
    {
        if(onExpand == false)
        {
            filterContainer.style("width", "100%")
                            .style("padding-right", 1.2+"vw");
            filterSpace.style("z-index", "0");
            expandSign.style("width", "28%")
                        .style("z-index", "0");
            signText.text("X")
                    .style("text-align", "left");
            d3.select(".filterSpace").style("height", "100%");
            onExpand = true;
        }else{
            filterContainer.style("width", "0")
                            .style("padding-right", 0+"vw");
            filterSpace.style("z-index", "-1");
            expandSign.style("width", "10%")
                        .style("z-index", "1");
            signText.text("Click here")
                    .style("text-align", "right");
                    d3.select(".filterSpace").style("height", "100%");
            onExpand = false;
        }
    });
}

/** Onload window trigger functions,
 * showing the stacked bar chart on th first time 
 */
async function init() {
    changeCurrentYear("All");
    hideSomeFilters(true);
    getYear = "All";
    findDataAllYear();
}

window.onload = init;

