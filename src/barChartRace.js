import React, { Component } from 'react';
import * as d3 from 'd3';

class BarChartRace extends Component {
  componentDidUpdate() {
    this.getModel();
  }

  getModel() {
    const data = this.props.data;

    const races = ['Black, non-Hispanic', 'White, non-Hispanic', 'Hispanic', 'Other, non-Hispanic'];

    const normalizedData = data.map(d => {
      const total = races.reduce((sum, raceKey) => sum + d[raceKey], 0);
      return {
        Year: d.Year,
        ...races.reduce((acc, raceKey) => {
          acc[raceKey] = d[raceKey] / total; 
          return acc;
        }, {})
      };
    });

    const margin = { top: 50, bottom: 50, right: 135, left: 60 };
    const width = 520;
    const height = 350;
    const innerWidth = width - margin.right - margin.left;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select('#barchart-race')
      .attr('width', width)
      .attr('height', height)
      .select('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()

      .domain(normalizedData.map(d => d.Year))
      .range([0, innerWidth])
      .padding(0.2);

    const yScale = d3.scaleLinear()

      .domain([0, 1]) 
      .range([innerHeight, 0]);

    const colorScale = d3.scaleOrdinal()
      .domain(races)

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
      .keys(races)
      .offset(d3.stackOffsetNone);

    const stackedSeries = stackGen(normalizedData);

    // Create Bars
    const tooltip = d3.select('.tooltip').style('display', 'none');

    const bars = svg.selectAll('.bars')
      .data(stackedSeries)
      .join('g')
      .attr('class', 'bars')
      .attr('fill', (d) => colorScale(d.key));

    const rects = bars.selectAll('rect')
      .data(d => d)
      .join(
        enter => enter.append('rect')
          .attr('x', d => xScale(d.data.Year))
          .attr('y', yScale(0)) 
          .attr('height', 0) 
          .attr('width', xScale.bandwidth())
          .transition()
          .duration(1000)
          .attr('y', d => yScale(d[1])) 
          .attr('height', d => yScale(d[0]) - yScale(d[1])),

        update => update
          .transition()
          .duration(1000)
          .attr('x', d => xScale(d.data.Year))
          .attr('y', d => yScale(d[1]))
          .attr('height', d => yScale(d[0]) - yScale(d[1])),

        exit => exit.transition()
          .duration(1000)
          .attr('height', 0)
          .remove()

      );

    rects.on('mouseover', (event, d) => {
      const year = d.data.Year;

      const raceRates = races.slice().reverse().map(raceKey => {
        const normalizedValue = d.data[raceKey] || 0; 
        return `<strong>${raceKey}:</strong> ${(normalizedValue).toFixed(2)}`; 
      }).join('<br>');

      tooltip.style('display', 'block')
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 30) + 'px')
        .html(`<strong>Year:</strong> ${year}<br>${raceRates}`);
    })
    .on('mousemove', (event) => {
      tooltip.style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 30) + 'px');
    })
    .on('mouseout', () => {
      tooltip.style('display', 'none');
    });

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


    const legend = svg.selectAll('.legend')
      .data([null])
      .join('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${innerWidth - 100}, 10}`);

    const legendItem = legend.selectAll('.legend-item')
      .data([...races].reverse())
      .join('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(325, ${i * 40})`);


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
      .attr('font-size', 12);
  }

  render() {
    return (
      <div>
        <svg id='barchart-race'>
          <g></g>
        </svg>
        <div className="tooltip" 
             style={{ display: "none", position: "absolute", background: "#fff", border: "1px solid #ccc", padding: "5px", borderRadius: "5px", pointerEvents: "none", zIndex: 10 }}>
        </div>
      </div>
    );
  }
}

export default BarChartRace;