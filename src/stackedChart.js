import React, { Component } from 'react';
import * as d3 from 'd3';

class StackedChart extends Component {
  componentDidUpdate() {
    // console.log("Stream Chart Data: ", this.props.data);
    this.getModel();
  }

  getModel() {
    // Data Prep (may remove and handle this within App.js)
    const data = this.props.data;
    const mortalityData = data.filter(d => 
      d.Question.toLowerCase().includes('mortality')
    );
    // console.log('mortalityData: ', mortalityData); // Delete

    const groupByQuestion = d3.group(mortalityData, d => d.Question);
    // console.log('Grouped by Question Data: ', groupByQuestion); // Delete

    // Data Prep for Stacking
    const years = Array.from(new Set(mortalityData.map(d => d.Year))).sort();
    // console.log('Years: ', years); // Delete

    const stackData = years.map(year => {
      const row = { Year: year };
      groupByQuestion.forEach((values, question) => {
        const curYearVal = values.filter(v => v.Year === year);
        const average = curYearVal.reduce((sum, v) => sum + v.Value, 0) / curYearVal.length;
        row[question] = average;
      })
      return row;
    });

    console.log('Stack Data: ', stackData);

    // SVG Setup
    const margin = { top: 50, bottom: 50, right: 50, left: 50 }
    const width = 700;
    const height = 600;
    const innerWidth = width - margin.right - margin.left;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select('#stream-chart')
      .attr('width', width)
      .attr('height', height)
      .select('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Create Generators
    const stackGen = d3.stack()
      .keys(Array.from(groupByQuestion.keys()))

    const stackedSeries = stackGen(stackData);
    console.log('Stacked Series Data: ', stackedSeries)

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(stackData, d => d.Year))
      .range([0, innerWidth]);
  
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(stackedSeries, (layer) => d3.max(layer, (d) => d[1]))])
      .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(Array.from(groupByQuestion.keys()))
      .range(d3.schemeCategory10);

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
      .call(d3.axisBottom(xScale));

    svg.selectAll('.y-axis')
      .data([0])
      .join('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale));
    
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
  }

  render() {
    return(
      <div>
        <svg id='stream-chart'>
          <g></g>
        </svg>
      </div>
    );
  }
}

export default StackedChart;