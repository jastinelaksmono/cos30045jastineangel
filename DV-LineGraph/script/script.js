// Standard variable
var maxMigration = 55000000;
var maxPopulation = 350000000;

var years = ['1990', '1995', '2000', '2005', '2010', '2015', '2020'];

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
      console.log(rows);
      // Fetch full dataset
      migrationDataset = rows;

      // Fetch years
      years = rows.columns.slice(2, 9);

      // Fetch countries
      countries = rows.map((data) => data.name);
    });

  // Fetch Population database
  await d3
    .csv(
      'https://raw.githubusercontent.com/angelinarianti01/DataVisualisation/main/world-population.csv'
    )
    .then(function (rows) {
      // Fetch full dataset
      populationDataset = rows;
    });

  // SVG
  var w = 1400;
  var h = 500;
  var wPadding = 70;
  var hPadding = 25;

  var svg = d3
    .select('#diagram')
    .append('svg')
    .attr('width', w)
    .attr('height', h);

  // Create year display
  var yearDisplayX = w / 2;
  var yearDisplayY = hPadding + 100;

  svg
    .append('text')
    .attr('class', 'display-year')
    .attr('x', yearDisplayX)
    .attr('y', yearDisplayY)
    .text('1990');

  // Scales - Divide x axis into countries
  var xCountryScale = d3
    .scaleBand()
    .domain(countries)
    .rangeRound([wPadding, w - wPadding])
    .padding(0.2);

  // Scales - Divide each country into years
  var xYearScale = d3
    .scaleLinear()
    .domain([years[0], years[years.length - 1]])
    .range([0, xCountryScale.bandwidth()]);

  // Scales - data values
  var yScale = d3
    .scaleLinear()
    .domain([0, maxMigration])
    .range([h - hPadding, hPadding]);

  // Create X-axis
  var xAxis = d3.axisBottom().ticks(10).scale(xCountryScale);
  svg
    .append('g')
    .attr('transform', `translate(0, ${h - hPadding})`)
    .call(xAxis);

  // Create Y-axis
  var yAxis = d3.axisLeft().ticks(10).scale(yScale);
  svg
    .append('g')
    .attr('id', 'yAxis')
    .attr('transform', `translate(${wPadding}, 0)`)
    .call(yAxis);

  // Set up area
  var area = d3
    .area()
    .x(function (d) {
      return xCountryScale(d[0]) + xYearScale(d[1]);
    })
    .y0(function () {
      return yScale.range()[0];
    })
    .y1(function (d) {
      return yScale(d[2]);
    });

  console.log(populationDataset);
  // Create migration graph
  createLineGraph(
    svg,
    populationDataset,
    'p',
    yScale,
    xCountryScale,
    xYearScale,
    area
  );

  createLineGraph(
    svg,
    migrationDataset,
    'm',
    yScale,
    xCountryScale,
    xYearScale,
    area
  );

  // Create show population button
  const button = document.getElementById('populationButton');

  button.onclick = () => {
    updateYScale(yScale, yAxis, area, button);
  };
}

function createLineGraph(
  svg,
  dataset,
  classInitial,
  yScale,
  xCountryScale,
  xYearScale,
  area
) {
  // Create line graph
  dataset.forEach((countryJson) => {
    // Format data => [countryName, year, value]
    var countryData = [];

    years.forEach((y) => {
      var data = [countryJson.name, y, countryJson[y]];
      countryData.push(data);
    });

    // Set up groups
    var g = svg.append('g');

    // Path
    g.append('path')
      .datum(countryData) // singular data
      .attr('class', function () {
        return `${classInitial}-path ${countryData[0][0]}`;
      })
      .attr('d', area);

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
        const gap = 10;
        return yScale(d[2]) - gap;
      })
      .text((d) => {
        return `${d[2]}`;
      });
  });
}

function mouseover(canvas, event, data) {
  // Get line classname
  var className = event['srcElement'].getAttribute('class').split(' ')[1];
  console.log(className);

  // Make tooltip visible
  canvas.selectAll(`.${className}`).style('fill', 'rgba(0, 0, 255, 1)');

  // Make lines visible
  canvas.selectAll(`.${className}`).style('stroke', 'rgba(0, 0, 255, 0.75)');

  // Make label visible
  canvas.selectAll(`.${className}`).style('fill', 'rgba(0, 0, 255, 1)');

  // Change years
  canvas.selectAll('.display-year').text(data[1]);
}

function mouseout(canvas, event, data) {
  // Get line classname
  var className = event['srcElement'].getAttribute('class').split(' ')[1];

  // Make tooltip invisible
  canvas.selectAll(`.${className}`).style('fill', 'rgba(0,0,255,0)');

  // Make lines invisible
  canvas.selectAll(`.${className}`).style('stroke', 'rgba(35, 42, 48, 0)');

  // Make label invisible
  canvas.selectAll(`.${className}`).style('fill', 'rgba(0,0,255,0)');
}

function updateYScale(scale, axis, area, button) {
  // Update scale maximum
  if (button.innerText == 'Show Population') {
    scale.domain([0, maxPopulation]);
    button.innerText = 'Hide Population';
  } else {
    scale.domain([0, maxMigration]);
    button.innerText = 'Show Population';
  }

  // Update scale on axis
  axis.scale(scale);

  // Update axis on SVG
  d3.select('#yAxis').call(axis);

  // Update y scale on area
  area.y1(function (d) {
    return scale(d[2]);
  });

  // Update area on path
  d3.selectAll('.m-path,.p-path').attr('d', area);

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
    const gap = 10;
    return scale(d[2]) - gap;
  });
}

window.onload = init;
