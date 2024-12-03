import React, { Component } from 'react';
import * as d3 from 'd3';

class BarChartGender extends Component {
  componentDidUpdate() {
    this.getModel();
  }

  getModel() {
    const data = this.props.data;
    const gender = ['Male', 'Female']

    // Setup SVG Environment
    const margin = { top: 50, bottom: 50, right: 80, left: 60 }
    const width = 470;
    const height = 350;
    const innerWidth = width - margin.right - margin.left;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select('#barchart-gender')
      .attr('width', width)
      .attr('height', height)
      .select('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(['2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020'])
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(gender)
      .range(['#7EC8E3', '#F5A3C7']);

    // Axis
    svg.selectAll('.x-axis')
      .data([0])
      .join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .attr('font-size', 12);

    svg.selectAll('.y-axis')
      .data([0])
      .join('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .attr('font-size', 12);

    // Generators
    const stackGen = d3.stack()
      .keys(gender)
      .offset(d3.stackOffsetExpand);

    const stackedSeries = stackGen(data);

    // Create Bars
    svg.selectAll('.bars')
      .data(stackedSeries)
      .join('g')
      .attr('class', 'bars')
      .attr('fill', (d) => {
        console.log(`Color for ${d.key}: `, colorScale(d.key));
        return colorScale(d.key);
      })
      .selectAll('rect')
      .data((d) => d)
      .join(
        enter => enter.append('rect')
          .attr('x', (d) => xScale(d.data.Year))
          .attr('y', yScale(0))
          .attr('height', 0)
          .attr('width', xScale.bandwidth())
          .transition()
          .duration(1000)
          .attr('y', (d) => yScale(d[1]))
          .attr('height', (d) => yScale(d[0]) - yScale(d[1])),
        update => update.transition()
          .duration(1000)
          .attr('x', (d) => xScale(d.data.Year))
          .attr('y', (d) => yScale(d[1]))
          .attr('height', (d) => yScale(d[0]) - yScale(d[1])),
        exit => exit.transition()
          .duration(1000)
          .attr('height', 0)
          .remove()
      )

    svg.selectAll('.x-label')
      .data([null])
      .join('text')
      .attr('class', 'x-label')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .text('Year')
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold');

    svg.selectAll('.y-label')
      .data([null])
      .join('text')
      .attr('class', 'y-label')
      .attr('transform', `translate(-40, ${innerHeight / 2}), rotate(-90)`)
      .text(this.props.ylabel)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold');

    const legend = svg.selectAll('.legend')
      .data([null])
      .join('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${innerWidth - 100}, 10)`)

    const legendItem = legend.selectAll('.legend-item')
      .data(gender.reverse())
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(100, ${i * 40})`)

    legendItem.selectAll('rect')
      .data(d => [d])
      .join('rect')
      .attr('width', 25)
      .attr('height', 25)
      .attr('fill', d => colorScale(d))

    legendItem.selectAll('text')
      .data(d => [d])
      .join('text')
      .attr('transform', `translate(30, 18)`)
      .text(d => d)
      .attr('font-size', 14)
  }

  render() {
    return (
      <div>
        <svg id='barchart-gender'>
          <g></g>
        </svg>
      </div>
    );
  }
}

export default BarChartGender;