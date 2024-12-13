import React, { Component } from 'react';
import * as d3 from 'd3';
import { FormControl, MenuItem, Select, InputLabel } from '@mui/material';

class Treemap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      processedData: null,
      selectedMetric: '',
      selectedYear: '2011'
    };
  }

  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data ||
      prevProps.selectedMetric !== this.state.selectedMetric ||
      prevProps.selectedYear !== this.state.selectedYear) {
      this.renderTreeMap();
    }
  }

  processData = () => {
    const { data } = this.props;
    const { selectedMetric, selectedYear } = this.state;

    if (!data || !selectedMetric || !selectedYear) return null;

    const filteredData = data.filter(d => {
      const yearMatch = d.Year === selectedYear.toString();
      const metricMatch = selectedMetric === 'Prevalence'
        ? !d.Question.toLowerCase().includes('mortality')
        : d.Question.toLowerCase().includes('mortality');
      return yearMatch && metricMatch;
    });

    if (!filteredData || filteredData.length === 0) {
      console.warn('Filtered data is empty.');
      return { name: "root", children: [] };
    }

    const groupedData = d3.group(filteredData, d => d.Topic);
    console.log('groupedData', groupedData);

    if (!groupedData || groupedData.size === 0) {
      console.warn('Grouped data is empty.');
      return { name: "root", children: [] };
    }


    const topics = Array.from(groupedData, ([topic, topicData]) => {
      console.log('topic', topic);
      console.log('topicData', topicData);
      console.log(`topicData for ${topic} grouped by Region`, d3.group(topicData, d => d.Region));
      const regions = Array.from(
        d3.group(topicData, d => d.Region),
        ([region, regionData]) => ({
          name: region,
          value: d3.mean(regionData, d => d.Value) || 0
        })
      )

      console.log(`regions for ${topic}`, regions);

      return {
        name: topic,
        children: regions
      };
    })

    return {
      name: "root",
      children: topics
    };
  }

  handleMetricChange = (event) => {
    this.setState({ selectedMetric: event.target.value }, () => {
      this.renderTreeMap();
    });
  }

  handleYearChange = (event) => {
    this.setState({ selectedYear: event.target.value }, () => {
      this.renderTreeMap();
    });
  }

  renderTreeMap = () => {
    const svg = d3.select('#treemap-container');
    const g = d3.select('#treemap-group');

    g.selectAll('*').remove();

    const hierarchicalData = this.processData();
    if (!hierarchicalData) return;

    const width = 580;
    const height = 400;

    const rootNode = d3.hierarchy(hierarchicalData)
      .sum(d => d.value)
      .sort((a, b) => b.value - a.value);

    const treemapLayout = d3.treemap()
      .size([width, height])
      .paddingInner(1)
      .paddingOuter(2)
      .paddingTop(10)
      .tile(d3.treemapSquarify.ratio(1));

    treemapLayout(rootNode);

    const regionColorScale = d3.scaleOrdinal()
      .domain(['Northeast', 'West', 'Midwest', 'South'])
      .range(['#F28E2B', '#76B7B2', '#4E79A7', '#E15759']);

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (e) => {
        g.attr('transform', e.transform);
      });

    svg.call(zoom);

    console.log('root.leaves()', rootNode.leaves());

    g.selectAll('rect')
    .data(rootNode.leaves())
    .join(
      enter => enter.append('rect')
        .attr('x', d => d.x0 + (d.x1 - d.x0) / 2)
        .attr('y', d => d.y0 + (d.y1 - d.y0) / 2)
        .attr('width', 0)
        .attr('height', 0)
        .style('fill', d => regionColorScale(d.data.name))
        .style('stroke', 'white')
        .transition().duration(1000)
        .ease(d3.easeQuadOut) 
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0),
      update => update.transition().duration(1000)
        .ease(d3.easeQuadIn)
        .attr('x', d => d.x0)
        .attr('y', d => d.y0)
        .attr('width', d => d.x1 - d.x0)
        .attr('height', d => d.y1 - d.y0),
      exit => exit.transition().duration(1000)
        .attr('width', 0)
        .attr('height', 0)
        .remove()
    );

    g.selectAll('.region-label')
      .data(rootNode.leaves())
      .join('text')
      .attr('class', 'region-label')
      .attr('y', d => d.y0 + (d.y1 - d.y0) * .35)
      .transition().duration(1000)
      .attr('x', d => d.x0 + (d.x1 - d.x0) * .50)
      .attr('text-anchor', 'middle')
      .attr('font-size', d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        return Math.max(Math.min(width / 5, height / 2, Math.sqrt((width * width + height * height)) / 12), 12) + "px";
      })
      .text(d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        const area = width * height;
        if (area < 2000) {
          switch (d.data.name) {
            case 'Northeast': return 'N';
            case 'West': return 'W';
            case 'Midwest': return 'MW';
            case 'South': return 'S';
            default: return d.data.name;
          }
        }
        return d.data.name;
      });

    g.selectAll(".value-label")
      .data(rootNode.leaves())
      .join("text")
      .attr("class", "value-label")
      .attr("y", d => d.y0 + (d.y1 - d.y0) * .65)
      .transition().duration(1000)
      .attr("x", d => d.x0 + (d.x1 - d.x0) / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        return Math.max(Math.min(width / 5, height / 2, Math.sqrt((width * width + height * height)) / 12), 10) + "px";
      })
      .text(d => this.state.selectedMetric === 'Mortality Rate'
        ? `${d.value.toFixed(1)}`
        : `${d.value.toFixed(1)}%`);

    console.log('rootNode.children', rootNode.children);

    g.selectAll('.topic-title')
      .data(rootNode.children)
      .join('text')
      .attr('class', 'topic-title')
      .attr('x', d => d.x0 + (d.x1 - d.x0) / 2)
      .transition().duration(1000)
      .attr('y', d => d.y0 + 10)
      .text(d => d.data.name
        .replace('Chronic Kidney Disease', 'CKD')
        .replace('Chronic Obstructive Pulmonary Disease', 'COPD')
        .replace('Nutrition, Physical Activity, and Weight Status', 'Nutrition & PA')
        .replace('Cardiovascular Disease', 'CVD')
      )
      .attr('text-anchor', 'middle')
      .attr("font-size", d => {
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;
        return Math.max(Math.min(width / 5, height / 2, Math.sqrt((width * width + height * height)) / 20), 12) + "px";
      })
      .attr('font-weight', 'bold')

  }

  render() {
    return (
      <div>
        <div className='dropdown-row'>
          <FormControl id='dropdown-metric-treemap' sx={{ width: '200px' }}>
            <InputLabel>Select a Metric</InputLabel>
            <Select
              label="Select a Metric"
              onChange={this.handleMetricChange}
              value={this.state.selectedMetric}
            >
              <MenuItem value={'Prevalence'}>Prevalence</MenuItem>
              <MenuItem value={'Mortality Rate'}>Mortality Rate</MenuItem>
            </Select>
          </FormControl>
          <FormControl id='dropdown-year-treemap' className='right-dropdown' sx={{ width: '200px' }}>
            <InputLabel>Select a Year</InputLabel>
            <Select
              label="Select a Year"
              onChange={this.handleYearChange}
              value={this.state.selectedYear}
            >
              {this.props.data && Array.from(new Set(this.props.data.map(d => d.Year)))
                .sort()
                .map(year => (
                  <MenuItem key={year} value={year}>
                    {year}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </div>
        <svg id="treemap-container" width="580" height="400">
          <g id="treemap-group"></g>
        </svg>
      </div>
    );
  }
}

export default Treemap;