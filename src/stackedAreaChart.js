import React, { Component } from 'react';
import * as d3 from 'd3';

class StackedAreaChart extends Component {
  componentDidUpdate() {
    // console.log("Stream Chart Data: ", this.props.data);
    this.getModel();
  }

  getModel() {
    const data = this.props.data;
    const questions = this.props.questions;

    // SVG Setup
    const margin = { top: 5, bottom: 50, right: 400, left: 60 }
    const width = 850;
    const height = 350;
    const innerWidth = width - margin.right - margin.left;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select('#stream-chart')
      .attr('width', width)
      .attr('height', height)
      .select('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create Generators
    const stackGen = d3.stack()
      .keys(questions)

    const stackedSeries = stackGen(data);
    console.log('Stacked Series Data: ', stackedSeries)

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.Year))
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(stackedSeries, (layer) => d3.max(layer, (d) => d[1]))])
      .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(questions)
      .range(['#ea8d4e', '#e06153', '#916fdf', '#37b99c', '#e0b448', '#b8c148']);

    // Area Generator
    const areaGen = d3.area()
      .x(d => xScale(d.data.Year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]));

    // Axis
    svg.selectAll('.x-axis')
      .data([0])
      .join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))
      .attr('font-size', 12);

    svg.selectAll('.y-axis')
      .data([0])
      .join('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale))
      .attr('font-size', 12);

    // Create the stream chart
    svg.selectAll('.areas')
      .data(stackedSeries)
      .join('path')
      .attr('class', 'areas')
      .attr('d', d => areaGen(d))
      .attr('fill', d => {
        console.log(`Color for ${d.key}: ${colorScale(d.key)}`); // Delete this
        return colorScale(d.key)
      });

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
      .text('Rate')
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold');

    const legend = svg.selectAll('.legend')
      .data([null])
      .join('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${innerWidth - 90}, 10)`)

    const legendItem = legend.selectAll('.legend-item')
      .data(questions.reverse())
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(100, ${i * 40})`)

    legendItem.selectAll('rect')
      .data(d => [d])
      .join('rect')
      .attr('width', 25)
      .attr('height', 25)
      .attr('fill', d => colorScale(d));

    legendItem.selectAll('text')
      .data(d => [d])
      .join('text')
      .attr('transform', 'translate(30, 18)')
      .text(d => d)
      .attr('font-size', 12)
  }

  render() {
    return (
      <div>
        <svg id='stream-chart'>
          <g></g>
        </svg>
      </div>
    );
  }
}

export default StackedAreaChart;