import React, { Component } from 'react';
import * as d3 from 'd3';

class LineChart extends Component {
  componentDidUpdate() {
    this.getModel();
  }

  getModel() {
    const { data } = this.props;
    const { yAxisLabel } = this.props;
    
    // Setup SVG Environment
    const margin = { top: 50, bottom: 50, right: 130, left: 50 }
    const width = 850;
    const height = 400;
    const innerWidth = width - margin.right - margin.left;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select('#linechart')
      .attr('width', width)
      .attr('height', height)
      .select('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    if (!data.some(d => Object.keys(d).length > 1)) {
      svg.selectAll('*').remove();
      return;
    }

    if (!data || data.length === 0) return;

    const parseYear = d3.timeParse('%Y');

    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => parseYear(d.Year)))
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data,  d => d3.max(Object.keys(d).filter(k => k !== 'Year'), key => d[key]))])
      .range([innerHeight, 0]);
    
    const colorScale = d3.scaleOrdinal()
      .domain(['Black, non-Hispanic', 'White, non-Hispanic', 'Hispanic', 'Other, non-Hispanic', 'Male', 'Female', 'Midwest', 'South', 'Northeast', 'West'])
      .range(['#4472c4', '#f1b7a3', '#c5e0b4', '#c8a7ed', '#7EC8E3', '#F5A3C7', '#5979a4', '#d15c5b', '#e48e38', '#82b5b0']);
    
    svg.selectAll('.x-axis')
      .data([0])
      .join('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(10)) 
      .attr('font-size', 12);

    svg.selectAll('.y-axis')
      .data([0])
      .join('g')
      .attr('class', 'y-axis')
      .call(d3.axisLeft(yScale)
        .tickSize(10)) 
      .attr('font-size', 12);
  
    svg.selectAll('.y-axis-label')
      .data([0])
      .join('text')
      .attr('class', 'y-axis-label')
      .attr('x', -innerHeight / 2)
      .attr('y', -margin.left + 15)
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text(yAxisLabel); // dynamic label

    // Create line generator
    const lineGen = d3.line()
      .x(d => xScale(parseYear(d.Year)))
      .y(d => yScale(d.value));
    
    const lineType = Object.keys(data[0]).filter(key => key !== 'Year');
    const lineData = lineType.map(type => ({
      name: type,
      values: data.map(d => ({ Year: d.Year, value: d[type]}))
    }));

    svg.selectAll('.line')
      .data(lineData)
      .join(
        enter => enter.append('path')
          .attr('class', 'line')
          .attr('d', d => lineGen(d.values))
          .attr('fill', 'none')
          .attr('stroke', d => colorScale(d.name))
          .attr('stroke-width', 3)
          .attr('opacity', 0)
          .transition()
          .duration(1000)
          .attr('opacity', 1),
        update => update.transition()
          .duration(1000)
          .attr('d', d => lineGen(d.values))
          .attr('stroke', d => colorScale(d.name)),
        exit => exit.transition()
          .duration(1000)
          .attr('opacity', 0)
          .remove()
      )
      
      svg.selectAll('.x-axis-label')
        .data([0])
        .join('text')
        .attr('class', 'x-axis-label')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Year');


    const points = lineData.flatMap(line => line.values.map(value => ({...value, name: line.name})));
    console.log('Line Data: ', lineData);
    console.log('Points: ', points);

    // tooltip 
    const tooltip = d3
      .select('#tooltip')
      .style('position', 'absolute')
      .style('background-color', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0);
    
    svg
      .selectAll('circle')
      .data(points)
      .join(
        (enter) =>
          enter
            .append('circle')
            .attr('cx', (d) => xScale(parseYear(d.Year)))
            .attr('cy', (d) => yScale(d.value))
            .attr('r', 4)
            .attr('fill', (d) => colorScale(d.name))
            .attr('opacity', 0)
            .on('mouseover', (event, d) => {
              tooltip
                .style('opacity', 1)
                .html(
                  `<strong>Year:</strong> ${d.Year}<br><strong>${d.name}:</strong> ${d.value.toFixed(1)}`
                )
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`);
            })
            .on('mousemove', (event) => {
              tooltip
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY + 10}px`);
            })
            .on('mouseout', () => {
              tooltip.style('opacity', 0);
            })
            .transition()
            .duration(1000)
            .attr('opacity', 1),
        (update) =>
          update
            .transition()
            .duration(1000)
            .attr('cx', (d) => xScale(parseYear(d.Year)))
            .attr('cy', (d) => yScale(d.value))
            .attr('r', 4)
            .attr('fill', (d) => colorScale(d.name)),
        (exit) =>
          exit
            .transition()
            .duration(1000)
            .attr('opacity', 0)
            .remove()
      );
      
    const legend = svg.selectAll('.legend')
      .data([null])
      .join('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${innerWidth + 30}, 10)`);
  
    const legendItems = legend.selectAll('.legend-item')
      .data(lineData)
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 25})`);
  
    legendItems.selectAll('rect')
      .data(d => [d])
      .join('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', d => colorScale(d.name));
  
    legendItems.selectAll('text')
      .data(d => [d])
      .join('text')
      .attr('transform', 'translate(25, 15)')
      .text(d => d.name.replace(', non-Hispanic', ''))
      .attr('font-size', 12);
  } 

  render() {
    return (
      <div>
        <svg id="linechart">
          <g></g>
        </svg>
        <div id="tooltip"></div>
      </div>
    );
  }
}

export default LineChart;
