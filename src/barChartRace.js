import React, { Component } from 'react';
import * as d3 from 'd3';

class BarChartRace extends Component {
  componentDidUpdate() {
    this.getModel();
  }

  shouldComponentUpdate(nextProps) {
    return JSON.stringify(this.props.data) !== JSON.stringify(nextProps.data) ||
      this.props.ylabel !== nextProps.ylabel;
  }

  getModel() {
    const data = this.props.data;

    const race = ['Black, non-Hispanic', 'White, non-Hispanic', 'Hispanic', 'Other, non-Hispanic'];

    // Setup SVG Environment
    const margin = { top: 50, bottom: 50, right: 5, left: 60 }
    const width = 410;
    const height = 400;
    const innerWidth = width - margin.right - margin.left;
    const innerHeight = height - margin.top - margin.bottom;

    // Remove any existing tooltip
    d3.select('.tooltip').remove();

    const tooltip = d3.select('body').selectAll('.tooltip')
      .data([null])
      .join('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'white')
      .style('padding', '5px')
      .style('border-radius', '10px')
      .style('border', '1px solid gray')
      .style('visibility', 'hidden');

    const svg = d3.select('#barchart-race')
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
      .domain(race)
      .range(['#4472c4', '#f1b7a3', '#c5e0b4', '#c8a7ed']);

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
      .keys(race)
      .offset(d3.stackOffsetExpand);

    const stackedSeries = stackGen(data);

    // Create Bars
    const barsGroups = svg.selectAll('.bars')
      .data(stackedSeries)
      .join(
        enter => enter.append('g')
          .attr('class', 'bars')
          .attr('fill', d => colorScale(d.key)),
        update => update.attr('fill', d => colorScale(d.key)),
        exit => exit.remove()
      );

    barsGroups.selectAll('rect')
      .data(d => d)
      .join(
        enter => enter.append('rect')
          .attr('x', d => xScale(d.data.Year))
          .attr('width', xScale.bandwidth())
          .attr('y', yScale(0))
          .attr('height', 0),
        update => update,
        exit => exit.transition()
          .duration(1000)
          .attr('height', 0)
          .attr('y', yScale(0))
          .remove()
      )
      .on('mousemove', (event, d) => {
        if (!d.data) return;
        const tooltipContent = `<strong>Year</strong>: ${d.data.Year}<br>` +
          [...race].map(raceName => {
            // Calculate total for this year to get percentages
            const total = race.reduce((sum, r) => sum + d.data[r], 0);
            const value = d.data[raceName];
            const percentage = (value / total) * 100;
            return `<strong>${raceName}</strong>: ${percentage.toFixed(2)}%`;
          }).reverse().join('<br>');

        tooltip
          .style('visibility', 'visible')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY + 10) + 'px')
          .html(tooltipContent);
      })
      .on('mouseout', () => {
        tooltip.style('visibility', 'hidden');
      })
      .transition()
      .duration(1000)
      .attr('x', d => xScale(d.data.Year))
      .attr('width', xScale.bandwidth())
      .attr('y', d => yScale(d[1]))
      .attr('height', d => yScale(d[0]) - yScale(d[1]));

    svg.selectAll('.x-label')
      .data([null])
      .join('text')
      .attr('class', 'x-label')
      .attr('transform', `translate(${innerWidth / 2}, ${innerHeight + 40})`)
      .text('Year')
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')

    svg.selectAll('.y-label')
      .data([null])
      .join('text')
      .attr('class', 'y-label')
      .attr('transform', `translate(-40, ${innerHeight / 2}), rotate(-90)`)
      .text(this.props.ylabel)
      .attr('text-anchor', 'middle')
      .style('font-weight', 'bold')
  }

  render() {
    return (
      <div>
        <svg id='barchart-race'>
          <g></g>
        </svg>
      </div>
    );
  }
}

export default BarChartRace;