function validate(){
    var origin = d3.select("#orgBtn");
    var destination = d3.select("#dstBtn");

    destination.on("click", function(){
        if(destination.classed("destination")){
            destination.classed("destination", false);
            destination.classed("destinationClicked", true);
            origin.classed("originClicked", false)
                    .classed("origin", true);
        }
    });

    origin.on("click", function(){
        if(origin.classed("origin")){
            origin.classed("origin", false);
            origin.classed("originClicked", true);
            destination.classed("destinationClicked", false)
                        .classed("destination", true);
        }
    });

}


function findDataOnYear(total, male, female, svg, width, height, xScale, yScale)
{
    var dataset = [];

    d3.csv("https://raw.githubusercontent.com/jastinelaksmono/dumps/main/DVfolder/destinationFull.csv")
    .then(function(data){

        //var years = data.columns.slice(0);
        /*
        for(i=0; i<data.length; i++)
        {
            dataset.push({countries:data[i].name,male:data[i][male],female:data[i][female]});
        }
        */
        data.map(function(d){
            dataset.push({countries:d.name,male:d[male],female:d[female]});
        })

        var subgroups=["male","female"];

        xScale.domain(getCountries(dataset));
        yScale.domain([0,data[0][total]]);
        //console.log(d3.format(".1r")(data[0][total]));
        
        drawChart(svg, width, height, subgroups, xScale, yScale, dataset);
        
    });
    
}

function drawChart(svg, width, height, subgroups, xScale, yScale, dataset)
{
    //draw x axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0));

    //draw y axis
    svg.append("g")
        .call(d3.axisLeft(yScale));

    // color palette = one color per subgroup
    const color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#08CCD4','#FFAE94','#4daf4a'])

    //stack the data? --> stack per subgroup
    const stackedData = d3.stack()
    .keys(subgroups)
    (dataset)

    // Show the bars
    svg.append("g")
    .selectAll("g")
    // Enter in the stack data = loop key per key = group per group
    .data(stackedData)
    .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(d => d)
        .join("rect")
        .attr("x", d => xScale(d.data.countries))
        .attr("y", d => yScale(d[0]))
        .attr("height", d => yScale(d))
        .attr("width",xScale.bandwidth());
    
        
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

function execute(year, svg, width, height)
{   
    // Add X axis
    const xScale = d3.scaleBand()
                        //.range([0, width*2]) //larger bar width
                        .range([0, width])
                        .padding([0.2]);


    // Add Y axis
    const yScale = d3.scaleLinear()
                        .domain([0, 55000000])
                        .range([ height, 0 ]);

    findDataOnYear("b"+year, "m"+year, "f"+year, svg, width, height, xScale, yScale);
}

function selectYear()
{
    dropdownSetting();

    // set the dimensions and margins of the graph
    const margin = {top: 30, right: 30, bottom: 20, left: 70},
    width = 600 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

    const w = width + margin.left + margin.right;
    const h = height + margin.top + margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#chartContainer")
                    .append("svg")
                    .attr("viewBox", `0 0 ${w} ${h}`)
                    .append("g")
                    .attr("transform", `translate(${margin.left},${margin.top})`);
    

    d3.select("#y1990").on("click", function(){
        svg.selectAll("g")
                .remove();
        changeCurrentYear("1990");
        execute("1990", svg, width, height);
    });  
    d3.select("#y1995").on("click", function(){
        svg.selectAll("g")
                .remove();
        changeCurrentYear("1995");
        execute("1995", svg, width, height);
    }); 
    d3.select("#y2000").on("click", function(){
        
        changeCurrentYear("2000");
        execute("2000");
    }); 
    d3.select("#y2005").on("click", function(){
        svg.selectAll("g")
                .remove();
        changeCurrentYear("2005");
        execute("2005");
    }); 
    d3.select("#y2010").on("click", function(){
        svg.selectAll("g")
                .remove();
        changeCurrentYear("2010");
        execute("2010");
    }); 
    d3.select("#y2015").on("click", function(){
        svg.selectAll("g")
                .remove();
        changeCurrentYear("2015");
        execute("2015");
    }); 
    d3.select("#y2020").on("click", function(){
        svg.selectAll("g")
                .remove();
        changeCurrentYear("2020");
        execute("2020");
    }); 
}


function getCountries(dataset){
    var countries = [];
    for(i=0; i<dataset.length; i++){
        countries.push(dataset[i]['countries']);
    }
    return countries;
}

function dropdownSetting()
{
    d3.select(".dropbtn")
        .on("mouseover", function(){
            d3.select("#dropdownIcon")
                .style("rotate", "180deg"); 
        });
    d3.select(".dropdown-content")
        .on("mouseover", function(){
            d3.select("#dropdownIcon")
                .style("rotate", "180deg"); 
        })
        .on("mouseout", function(){
            d3.select("#dropdownIcon")
                .style("rotate", "0deg"); 
        });
}

function setGender(gender)
{
    var button = d3.select(gender);
    var male = d3.select("#male");
    var female = d3.select("#female");
    var combined = d3.select("#combined");
    var total = d3.select("#total");

    button.classed("genderOptions", false);
    button.classed("genderSelected", true);

    switch(gender)
    {
        case "#male": 

            break;
    }
    /*
    male.on("click", function(){
        if(male.classed("genderOptions")){
            console.log(true);
            male.classed("genderOptions", false);
            male.classed("genderSelected", true);
        }
    });
    */
}

function changeCurrentYear(year){
    d3.select("#yearSelection")
        .text(year)
        .style("color", "#08CCD4");
    d3.select(".dropbtn")
        .style("border-color", "#08CCD4");
}

