// Standard variable
var maxMigration = 51000000;
var maxPopulation = 350000000;

let colorRange = ['#ffe586','#ffd125','#ff9d67','#ff813c','#ff5e82','#ff305f','#d52c76','#ac225e','#a74eca','#8432a5'];
var years; 

var btnText = "Hide Population";
                
async function init() {
  // Init variables
  var migrationDataset;
  var populationDataset;
  var countries;

  // Fetch migration database
  await d3
    .csv(
      'https://raw.githubusercontent.com/jastinelaksmono/dumps/main/DVfolder/destination.csv'
    )
    .then(function (rows) {
        
        rows.sort(function (a,b) {
            return d3.descending(a[2020]/10, b[2020]/10);
        });
        

        //console.log(rows);
        // Fetch full dataset
        migrationDataset = rows;

        // Fetch countries
        countries = rows.map((data) => data.name);
    });

    // Fetch Population database
    await d3.csv(
    'https://raw.githubusercontent.com/jastinelaksmono/dumps/main/DVfolder/world-population.csv'
    )
    .then(function (rows) {

        // Fetch years
        years = rows.columns.slice(1, 8);

        // Fetch full dataset
        rows.sort(function (a,b) {
            return d3.descending(a[2020]/10, b[2020]/10);
        });
        populationDataset = rows;
    });

    // SVG
    const margin = {top: 15, right: 20, bottom: 0, left: 60},
    width = 700,
    height = 250;

    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    //var margin.left = 70;
    //var margin.top = 15;

    var svg = d3.select('#chartContainer')
                .append('svg')
                    .style('margin-left', "3vw")
                    .attr("viewBox", `0 0 ${w} ${h}`);


    d3.selectAll('.display-year')
        .append('text')
        .style('opacity', 0)
        .text("1990");

    d3.select("#chartContainer")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltipBox2")
        .style("width", 27+"%");

    // Scales - Divide x axis into countries
    var xCountryScale = d3.scaleBand()
                            .domain(countries)
                            .rangeRound([margin.left, w - margin.left])
                            .padding(0.2);

    // Scales - Divide each country into years
    var xYearScale = d3.scaleLinear()
                    .domain([years[0], years[years.length - 1]])
                    .range([0, xCountryScale.bandwidth()]);

    // Scales - data values
    var yScale = d3.scaleLinear()
                .domain([0, maxPopulation])
                .range([h - margin.top, margin.top]);

    // Create X-axis
    var xAxis = d3.axisBottom().ticks(10).scale(xCountryScale);
    svg.append('g')
        .attr('transform', `translate(0, ${h - margin.top})`)
        .attr("class", "axis")
        .call(xAxis)
        .call(g => g.select(".domain").remove());

    // Create Y-axis
    var yAxis = d3.axisLeft().ticks(10).scale(yScale);
    svg.append('g')
        .attr('id', 'yAxis')
        .attr('transform', `translate(${margin.left}, 0)`)
        .attr("class", "axis")
        .call(yAxis);

    // Set up area
    var area = d3.area()
                .curve(d3.curveBasis)
                .x(function (d) {
                return xCountryScale(d[0]) + xYearScale(d[1]);
                })
                .y0(function () {
                return yScale.range()[0];
                })
                .y1(function (d) {
                return yScale(d[2]);
                });

    //set up area top line
    var line = d3.line()
                .curve(d3.curveBasis)
                .x(d => xCountryScale(d[0]) + xYearScale(d[1]))
                .y(function(d){
                    return yScale(d[2]);
                });


 // Create show population button
    const button = d3.select('#populationButton').text(btnText);
    /*
    button.onclick = () => {
        updateYScale(yScale, yAxis, area, line,  button);
    };
    */
    button.on("click", function(){
        updateYScale(yScale, yAxis, area, line,  button);
    });

    createLineGraph(svg, populationDataset,'p', yScale, xCountryScale, xYearScale, area, line);
    createLineGraph(svg, migrationDataset, 'm', yScale, xCountryScale, xYearScale, area, line);

    //console.log(populationDataset);
    // Create migration graph
}

function createLineGraph(
  svg,
  dataset,
  classInitial,
  yScale,
  xCountryScale,
  xYearScale,
  area,
  line
) {
  // Create line graph
  dataset.forEach((countryJson) => {
    // Format data population => [countryName, year, value]
    // Format data population => [countryName, year, value, mValue]

    var countryData = [];

    for(let i=0; i<years.length; i++){
        if(classInitial == 'm'){
            var data = [countryJson.name, years[i], countryJson[years[i]]];
        }else{
            var data = [countryJson.name, years[i], countryJson[years[i]], countryJson["m"+years[i]]];
        }
        countryData.push(data);
    }

    // Set up groups
    var g = svg.append('g');

    // Path
    g.append('path')
      .datum(countryData) // singular data
      .attr('class', function () {
        return `${classInitial}-path ${countryData[0][0]}`;
      })
      .attr('d', area);

    //Top Line
    g.append('path')
      .datum(countryData) // singular data
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round") 
      .attr("class", function(d){
        if(classInitial == 'p'){
            return `${classInitial}-line`;
        }
      })
      .attr("d", line);

    // Selectable vertical line
    g.selectAll('line')
        .data(countryData)
        .enter()
        .append('line')
        .attr('class', (d) => {
            return `${classInitial}-vertical-line year-${d[1]}`;
        })
        .attr('y1', (d) => {
            return yScale.range()[0];
        })
        .attr('y2', (d) => {
            return yScale(d[2]);
        })
        .attr('x1', (d) => {
            return xCountryScale(d[0]) + xYearScale(d[1]);
        })
        .attr('x2', (d) => {
            return xCountryScale(d[0]) + xYearScale(d[1]);
        })
        .on('mouseover', (e, d) => mouseover(svg, e, d))
        .on('mousemove', (e, d) => mousemove(svg, e, d))
        .on('mouseout', (e, d) => mouseout(svg, e, d));

    // Tooltip
    g.selectAll('circle')
        .data(countryData)
        .enter()
        .append('circle')
        .attr('class', (d) => {
            return `${classInitial}-tooltip year-${d[1]}`;
        })
        .attr('cx', (d) => {
            return xCountryScale(d[0]) + xYearScale(d[1]);
        })
        .attr('cy', (d) => {
            return yScale(d[2]);
        })
        .attr('r', 2.5);

    // Text
    g.selectAll('text')
        .data(countryData)
        .enter()
        .append('text')
        .attr('class', (d) => {
            return `${classInitial}-label year-${d[1]}`;
        })
        .attr('x', (d) => {
            const gap = 5;
            return xCountryScale(d[0]) + xYearScale(d[1]) - gap;
        })
        .attr('y', (d) => {
            const gap = 5;
            return yScale(d[2]) - gap;
        })
        .text((d) => {
            if(classInitial == 'p'){
                return `${(d[2]-d[3]).toLocaleString('en-US')}`;
            }else{
                return `${(+d[2]).toLocaleString('en-US')}`;
            }
        });
  });
}

function mouseover(canvas, event, data) {
    
    // Get line classname
    var className = event['srcElement'].getAttribute('class').split(' ')[1];
    //console.log(data);

    // Make tooltip visible
    canvas.selectAll(`.${className}`).style('opacity',1);

    if(btnText == "Show Population"){
        canvas.selectAll('.p-label, .p-vertical-line').style('opacity',0);
    }else{
        canvas.selectAll('.m-vertical-line').style('opacity',0);
        canvas.selectAll('.m-label').style('opacity',0);
        d3.selectAll('.tooltipBox2').style('opacity', 1)
    }

    d3.selectAll('.display-year').style("opacity", 1);
    // Change years
    d3.selectAll('.display-year').text(data[1]);
}

function mousemove(canvas, event, data){
    var value = [+data[2],+data[3]];
    d3.selectAll('.tooltipBox2').html("<div class='tooltipTitle'>"+ data[0]+ " " + data[1] + "</div>"+
                                    "<div class='tooltipDesc2'>"+
                                        "<div class='colorBox clearMargin' style='opacity: 0.5;'></div>"+
                                        "<div class='colorBox clearMargin'></div>"+
                                        "Total Population : "+ value[0].toLocaleString('en-US') +
                                    "</div>" +
                                    "<div class='tooltipDesc2'> "+
                                        "<div class='colorBox clearMargin'></div>"+
                                        "Total Migration : "+ value[1].toLocaleString('en-US') +
                                    "</div>"+
                                    "<div class='tooltipDesc2'> "+
                                        "<div class='colorBox clearMargin' style='opacity: 0.5;'></div>"+
                                        "Original Residents : "+ (value[0]-value[1]).toLocaleString('en-US') +
                                    " </div>" );
}

function mouseout(canvas, event, data) {
  // Get line classname
  var className = event['srcElement'].getAttribute('class').split(' ')[1];

  // Make tooltip invisible
  canvas.selectAll(`.${className}`).style("opacity", 0);

  d3.selectAll('.display-year').style("opacity", 0);

  d3.selectAll('.tooltipBox2').style('opacity', 0)
  
}

function updateYScale(scale, axis, area, line, button) {
  // Update scale maximum
    if (btnText == 'Show Population') {
        btnText = 'Hide Population';
        scale.domain([0, maxPopulation]);
    } else {
        btnText = 'Show Population';
        scale.domain([0, maxMigration]);
    }
    button.text(btnText);

  // Update scale on axis
  axis.scale(scale);

  // Update axis on SVG
  d3.select('#yAxis').call(axis);

  // Update y scale on area
  area.y1(function (d) {
    return scale(d[2]);
  });

  line.y(function (d) {
    return scale(d[2]);
  });

  // Update area on path
  d3.selectAll('.m-path,.p-path').attr('d', area);
  d3.selectAll('.m-line,.p-line').attr('d', line);

  // Update vertical line
  d3.selectAll('.m-vertical-line,.p-vertical-line').attr('y2', (d) => {
    return scale(d[2]);
  });

  // Update tooltip
  d3.selectAll('.m-tooltip,.p-tooltip').attr('cy', (d) => {
    return scale(d[2]);
  });

  // Update label
  d3.selectAll('.m-label,.p-label').attr('y', (d) => {
    const gap = 5;
    return scale(d[2]) - gap;
  });
}

window.onload = init;