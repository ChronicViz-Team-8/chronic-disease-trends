import React, { Component } from 'react';
import * as d3 from 'd3';

class LineChart extends Component {
  componentDidUpdate() {
    this.getModel();
  }

  getModel() {
    const { data } = this.props;
    
    if (!data || data.length === 0) return;

    // Setup SVG Environment
    const margin = { top: 50, bottom: 50, right: 130, left: 60 }
    const width = 750;
    const height = 400;
    const innerWidth = width - margin.right - margin.left;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select('#linechart')
      .attr('width', width)
      .attr('height', height)
      .select('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const parseYear = d3.timeParse('%Y');
    const years = data.map(d => parseYear(d.Year));

    // Create Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => parseYear(d.Year)))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data,  d => d3.max(Object.keys(d).filter(k => k !== 'Year'), key => d[key]))])
      .range([innerHeight, 0]);
    
    const colorScale = d3.scaleOrdinal()
      .domain(['Black, non-Hispanic', 'White, non-Hispanic', 'Hispanic', 'Other, non-Hispanic', 'Male', 'Female'])
      .range(['#4472c4', '#f1b7a3', '#c5e0b4', '#c8a7ed', '#7EC8E3', '#F5A3C7']);
    
    // Create Axis
    svg.selectAll('.x-axis')
      .data([0])
      .join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale));

    svg.selectAll('.y-axis')
      .data([0])
      .join('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));

    // Create line generator
    const lineGen = d3.line()
      .x(d => xScale(parseYear(d.Year)))
      .y(d => yScale(d.value));
    
    const lineType = Object.keys(data[0]).filter(key => key !== 'Year');
    const lineData = lineType.map(type => ({
      name: type,
      values: data.map(d => ({ Year: d.Year, value: d[type]}))
    }));

    // Draw the lines
    svg.selectAll('.line')
      .data(lineData)
      .join('path')
      .attr('class', 'line')
      .attr('d', d => lineGen(d.values))
      .attr('fill', 'none')
      .attr('stroke', d => colorScale(d.name))
      .attr('stroke-width', 4);
  }

  render() {
    return(
      <div>
        <svg id='linechart'>
          <g></g>
        </svg>
      </div>
    )
  }
}

export default LineChart;
