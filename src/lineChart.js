import React, { Component } from 'react';
import * as d3 from 'd3';

class LineChart extends Component {
  componentDidUpdate() {
    this.getModel();
  }

  getModel() {
    const { data } = this.props;
    
    // Setup SVG Environment
    const margin = { top: 50, bottom: 50, right: 130, left: 60 }
    const width = 540;
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
      .domain(d3.extent(years))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data,  d => d3.max(Object.keys(d).filter(k => k !== 'Year'), key => d[key]))])
      .range([innerHeight, 0]);
    
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
