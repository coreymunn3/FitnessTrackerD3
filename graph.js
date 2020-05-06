const margin = {
  top: 0, 
  right: 20,
  bottom: 50,
  left: 80
};

const graphWidth = 560 - margin.left - margin.right;
const graphHeight = 400- margin.top - margin.bottom;

const svg = d3.select('.canvas').append('svg')
  .attr('width', graphWidth + margin.left + margin.right)
  .attr('height', graphHeight + margin.top + margin.bottom)

const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left},${margin.top})`)

// scales (set range here, domain in update)
const x = d3.scaleTime().range([0, graphWidth]);
const y = d3.scaleLinear().range([graphHeight, 0]);

// axes groups
const xAxisGroup = graph.append('g')
  .attr('class', 'x-axis')
  // have to move the axis - at the top by default
  .attr('transform', `translate(0,${graphHeight})`);
const yAxisGroup = graph.append('g')
  .attr('class', 'y-axis');

// create axes
const xAxis = d3.axisBottom(x)
.ticks(5)
.tickSize(0)
.tickFormat(d3.timeFormat('%b %d %I%p'))
const yAxis = d3.axisLeft(y)
.ticks(5)
.tickSize(0)
.tickFormat(d => d + ' meters')

// D3 line path generator
const line = d3.line()
  .x(d => {
    return x(new Date(d.date))
  })
  .y(d => {
    return y(d.distance)
  })

// main line graph path element
const path = graph.append('path');
// ref line path elements (x and y lines)
const refLineGroup = graph.append('g')
  .attr('class','refLines')

// tooltip
const tip = d3.tip()
  .attr('class','tip card')
  .attr('id', 'tooltip')
  .offset([-15,0])
  .html(d => {
    let content = `
      <div>Distance: ${d.distance}</div>
    `
    return content;
  })

graph.call(tip);

// UPDATE FUNCTION ========================================

const update = function(data) {
  // console.log(data)
  // console.log(data.map(d => d.distance))

  // filter the data
  data = data.filter(item => item.activity == ui.getActivity()) // return true when activities are equal

  // sort data based on date object
  // so that the line connects points in correct order
  data.sort((a,b) => new Date(a.date) - new Date(b.date))

  // set domain of axes
  y.domain([0, (d3.max(data, d => d.distance))*1.1])
  x.domain([d3.min(data, d => new Date(d.date)), d3.max(data, d => new Date(d.date))])

  // update path data for line
  path.data([data])
    .attr('fill', 'none')
    .attr('stroke', '#80cbc4')
    .attr('stroke-width',2)
    .attr('d', line)

  // create circles for objects
  const circles = graph.selectAll('circle')
    .data(data)
  // add new points
  circles.enter()
    .append('circle')
      .attr('r',4)
      .attr('cx',d => x(new Date(d.date)))
      .attr('cy', d => y(d.distance))
      .attr('fill', '#80cbc4')

  // update current points in the data
  circles
  .attr('r',4)
  .attr('cx',d => x(new Date(d.date)))
  .attr('cy', d => y(d.distance))

  // exit selection
  circles.exit()
    .remove()

  // call the axes
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  // rotate x-axis text
  xAxisGroup.selectAll('text')
  .attr('transform', 'rotate(-45)')
  .attr('text-anchor', 'end')

  // mouse events
  graph.selectAll('circle')
    .on('mouseover', (d,i,n) => {
      highlightCircles(d,i,n);
      drawRefLines(d);
      tip.show(d, n[i]);
    })
    .on('mouseleave', (d,i,n) => {
      unhighlightCircles(d,i,n);
      eraseRefLines();
      tip.hide(d, n[i]);
    })
}
// ========================================================

// data and firestore
let data = [];
db.collection('activities').onSnapshot(res => {
  res.docChanges().forEach(change => {

    const doc = {
      ...change.doc.data(), 
      id: change.doc.id
    };
    //console.log( change, doc);

    // handle the change
    switch (change.type){
      case 'added':
        data.push(doc);
        break;
      case 'modified':
        const index = data.findIndex(item => 
          item.id === doc.id);
        data[index] = doc ;
        break;
      case 'removed':
        data = data.filter(item => 
          item.id !== doc.id);
        break;
      default:
        break;
    }
  })
  update(data);
})

const highlightCircles = function (d,i,n) {
  let currentCircle = d3.select(n[i]);
  currentCircle
    .transition().duration(100)
      .attr('r',6)
      .attr('fill', 'white')
}
const unhighlightCircles = function (d,i,n) {
  let activeCircle = d3.select(n[i]);
  activeCircle
    .transition().duration(100)
      .attr('r',4)
      .attr('fill', '#80cbc4')
}
const drawRefLines = function(d) { 
  const refLineX = refLineGroup.append('line')
    .attr('id','refLineX')
    .attr('stroke', '#9e9e9e')
    .attr('stroke-width',1)
    .style('stroke-dasharray',4)
    .attr('x1', 0)
    .attr('x2', x(new Date(d.date)))
    .attr('y1', y(d.distance))
    .attr('y2', y(d.distance))
  const refLineY = refLineGroup.append('line')
    .attr('id','refLineY')
    .attr('stroke', '#9e9e9e')
    .attr('stroke-width',1)
    .style('stroke-dasharray',4)
    .attr('x1', x(new Date(d.date)))
    .attr('x2', x(new Date(d.date)))
    .attr('y1', graphHeight)
    .attr('y2', y(d.distance))
}
const eraseRefLines = function() {
  d3.select('#refLineX').remove();
  d3.select('#refLineY').remove();
}