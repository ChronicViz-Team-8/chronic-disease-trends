import React, { Component } from 'react';
import './App.css';
import * as d3 from 'd3';
import { Box, FormControl, MenuItem, Select, InputLabel } from '@mui/material';
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
      data:[],
      stackedAreaData: [],
      stackedAreaQuestions: [],
      selectedStackMetric: ''
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

  handleStackAreaChange = (event) => {
    const filteredData = this.state.data.filter(d => {
      if(event.target.value === 'Mortality Rate'){
        return d.Question.toLowerCase().includes('mortality')
      }else if(event.target.value === 'Prevalence'){
        return !d.Question.toLowerCase().includes('mortality')
      }
    });
    // console.log('mortalityData: ', mortalityData); // Delete

    const groupByQuestion = d3.group(filteredData, d => d.Question);
    // console.log('Grouped by Question Data: ', groupByQuestion); // Delete

    // Data Prep for Stacking
    const years = Array.from(new Set(filteredData.map(d => d.Year))).sort();
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

    this.setState({ stackedAreaData: stackData });
    this.setState({ selectedStackMetric:  event.target.value})
    this.setState({ stackedAreaQuestions: Array.from(groupByQuestion.keys())})
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
            <StackedAreaChart data={this.state.stackedAreaData} questions={this.state.stackedAreaQuestions}></StackedAreaChart>
            <FormControl id='dropdown-stacked-area' sx={{ width: '200px' }}>
              <InputLabel>Select a Metric</InputLabel>
              <Select label="Select a Metric" onChange={this.handleStackAreaChange} value={this.state.selectedStackMetric}>
                <MenuItem value={'Prevalence'}>Prevalence</MenuItem>
                <MenuItem value={'Mortality Rate'}>Mortality Rate</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </div>
        <div className='row-model'>
          <Box className='model-box' id='stacked-barchart-box' sx={{ boxShadow: 3 }}>
            <FormControl id='dropdown-stacked-bar' sx={{ width: '250px' }}>
              <InputLabel>Select Chronic Disease</InputLabel>
              <Select
                label="Select Chronic Disease"
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      overflow: 'auto',
                    },
                  },
                }}
              >
                <MenuItem value={'Arthritis (Prevalence)'}>Arthritis (Prevalence)</MenuItem>
                <MenuItem value={'Asthma (Mortality Rate)'}>Asthma (Mortality Rate)</MenuItem>
                <MenuItem value={'Asthma (Prevalence)'}>Asthma (Prevalence)</MenuItem>
                <MenuItem value={'COPD (Prevalence)'}>COPD (Prevalence)</MenuItem>
                <MenuItem value={'Cardiovascular Disease (Mortality Rate)'}>Cardiovascular Disease (Mortality Rate)</MenuItem>
                <MenuItem value={'Chronic Liver Disease (Mortality Rate)'}>Chronic Liver Disease (Mortality Rate)</MenuItem>
                <MenuItem value={'Diabetes (Mortality Rate)'}>Diabetes (Mortality Rate)</MenuItem>
                <MenuItem value={'Diabetes (Prevalence)'}>Diabetes (Prevalence)</MenuItem>
                <MenuItem value={'End-Stage Renal Disease (Mortality Rate)'}>End-Stage Renal Disease (Mortality Rate)</MenuItem>
                <MenuItem value={'Kidney Disease (Prevalence)'}>Kidney Disease (Prevalence)</MenuItem>
                <MenuItem value={'Obesity (Prevalence)'}>Obesity (Prevalence)</MenuItem>
                <MenuItem value={'Stroke (Mortality Rate)'}>Stroke (Mortality Rate)</MenuItem>
              </Select>
            </FormControl>
            <div id='barchart-row'>
              {/* <BarChartRace data={this.state.data}></BarChartRace> */}
              {/* <BarChartGender data={this.state.data}></BarChartGender> */}
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