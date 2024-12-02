import React, { Component } from 'react';
import './App.css';
import * as d3 from 'd3';
import { Box, MenuItem, Select } from '@mui/material';
import chronic from './cleaned_chronic_disease_indicators.csv'
import LineChart from './lineChart';
import StackedAreaChart from './stackedAreaChart';
import BarChartRace from './barChartRace';
import BarChartGender from './barChartGender';
import Treemap from './treemap';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data:[]
    };
  }

  componentDidMount() {
    const self = this;

    d3.csv(chronic).then(data => {
      const processedData = data.map(d => ({
        Year: d.YearStart,
        Location: d.LocationDesc,
        Question: d.Question,
        Stratification: d.Stratification1,
        Value: +d.DataValue,
        DataType: d.DataValueType
      }))
      
      self.setState({ data: processedData })
    });
  }

  render() {
    return (
      <div>
        <div id='header'>
          <h1>Chronic Disease Trends</h1>
        </div>
        <div className='row-model'>
          <Box className='model-box' id='line-chart-box' sx={{ boxShadow: 3 }}>
            <LineChart data={this.state.data}></LineChart>
          </Box>
          <Box className='model-box' id='stacked-area-chart-box' sx={{ boxShadow: 3 }}>
            <StackedAreaChart data={this.state.data}></StackedAreaChart>
          </Box>
        </div>
        <div className='row-model'>
          <Box className='model-box' id='stacked-barchart-box' sx={{ boxShadow: 3 }}>
            <div id='barchart-row'>
              <BarChartRace data={this.state.data}></BarChartRace>
              <BarChartGender data={this.state.data}></BarChartGender>
            </div>
          </Box>
          <Box className='model-box' id='treemap-box' sx={{ boxShadow: 3 }}>
            <Treemap data={this.state.data}></Treemap>
          </Box>
        </div>
      </div>
    )
  }
}

export default App;
