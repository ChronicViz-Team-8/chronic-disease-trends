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
      selectedStackMetric: '',
      barChartGenderData: [],
      barChartRaceData: [],
      selectedBarOption: '',
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

  handleStackBarChange = (event) => {
    var question;
    const selection = event.target.value;
    const race = ['Black, non-Hispanic', 'White, non-Hispanic', 'Hispanic', 'Other, non-Hispanic'];
    const gender = ['Male', 'Female'];

    switch(selection) {
      case 'Arthritis (Prevalence)':
        question = 'Arthritis among adults aged >= 18 years';
        break;
      case 'Asthma (Mortality Rate)':
        question = 'Asthma mortality rate';
        break;
      case 'Asthma (Prevalence)':
        question = 'Current asthma prevalence among adults aged >= 18 years';
        break;
      case 'COPD (Prevalence)':
        question = 'Prevalence of chronic obstructive pulmonary disease among adults >= 18';
        break;
      case 'Cardiovascular Disease (Mortality Rate)':
        question = 'Mortality from total cardiovascular diseases';
        break;
      case 'Chronic Liver Disease (Mortality Rate)':
        question = 'Chronic liver disease mortality';
        break;
      case 'Diabetes (Mortality Rate)':
        question = 'Mortality due to diabetes reported as any listed cause of death';
        break;
      case 'Diabetes (Prevalence)':
        question = 'Prevalence of diagnosed diabetes among adults aged >= 18 years';
        break;
      case 'End-Stage Renal Disease (Mortality Rate)':
        question = 'Mortality with end-stage renal disease';
        break;
      case 'Kidney Disease (Prevalence)':
        question = 'Prevalence of chronic kidney disease among adults aged >= 18 years';
        break;
      case 'Obesity (Prevalence)':
        question = 'Obesity among adults aged >= 18 years';
        break;
      case 'Stroke (Mortality Rate)':
        question = 'Mortality from cerebrovascular disease (stroke)';
        break;
      default:
        break;
    };

    const filteredData = this.state.data.filter(d => d.Question === question);
    const years = Array.from(new Set(filteredData.map(d => d.Year))).sort();

    const barRaceData = years.map(year => {
      const row = { Year: year };

      race.forEach(stratification => {
        const stratValues = filteredData.filter(d => d.Year === year && d.Stratification === stratification);
        const avg = stratValues.reduce((sum, d) => sum + d.Value, 0) / stratValues.length;

        row[stratification] = avg;
      })

      return row;
    });
    console.log('Bar Race Data: ', barRaceData);

    const barGenderData = years.map(year => {
      const row = { Year: year };

      gender.forEach(stratification => {
        const stratValues = filteredData.filter(d => d.Year === year && d.Stratification === stratification);
        const avg = stratValues.reduce((sum, d) => sum + d.Value, 0) / stratValues.length;

        row[stratification] = avg;
      })

      return row;
    });
    console.log('Bar Gender Data: ', barGenderData);

    this.setState({ barChartGenderData: barGenderData });
    this.setState({ barChartRaceData: barRaceData });
    this.setState({ selectedBarOption:  event.target.value})
  }

  render() {
    return (
      <div id='container'>
        <div id='header'>
          <h1>Chronic Disease Trends</h1>
        </div>
        <div className='row-model'>
          <Box className='model-box' id='line-chart-box' sx={{ boxShadow: 3 }}>
            <div className='dropdown-row'>
              <FormControl id='dropdown-chronic-selection-linechart' sx={{ width: '250px' }}>
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
              <FormControl id='dropdown-line-selection-linechart' sx={{ width: '200px' }}>
                <InputLabel>Add a Line</InputLabel>
                <Select label="Add a Line">
                  <MenuItem value={'Male'}>Male</MenuItem>
                  <MenuItem value={'Female'}>Female</MenuItem>
                  <MenuItem value={'White, non-Hispanic'}>White, non-Hispanic</MenuItem>
                  <MenuItem value={'Black, non-Hispanic'}>Black, non-Hispanic</MenuItem>
                  <MenuItem value={'Hispanic'}>Hispanic</MenuItem>
                  <MenuItem value={'Other, non-Hispanic'}>Other, non-Hispanic</MenuItem>
                  <MenuItem value={'U.S. Regions'}>U.S. Regions</MenuItem>
                </Select>
              </FormControl>
            </div>
            <LineChart data={this.state.data}></LineChart>
          </Box>
          <Box className='model-box' id='treemap-box' sx={{ boxShadow: 3 }}> {}
          <div className='dropdown-row'>
              <FormControl id='dropdown-metric-treemap' sx={{ width: '200px' }}>
                <InputLabel>Select a Metric</InputLabel>
                <Select label="Select a Metric">
                  <MenuItem value={'Prevalence'}>Prevalence</MenuItem>
                  <MenuItem value={'Mortality Rate'}>Mortality Rate</MenuItem>
                </Select>
              </FormControl>
              <FormControl id='dropdown-metric-treemap' sx={{ width: '200px' }}>
                <InputLabel>Select a Year</InputLabel>
                <Select label="Select a Year">
                  <MenuItem value={2011}>2011</MenuItem>
                  <MenuItem value={2012}>2012</MenuItem>
                  <MenuItem value={2013}>2013</MenuItem>
                  <MenuItem value={2014}>2014</MenuItem>
                  <MenuItem value={2015}>2015</MenuItem>
                  <MenuItem value={2016}>2016</MenuItem>
                  <MenuItem value={2017}>2017</MenuItem>
                  <MenuItem value={2018}>2018</MenuItem>
                  <MenuItem value={2019}>2019</MenuItem>
                  <MenuItem value={2020}>2020</MenuItem>
                </Select>
              </FormControl>
            </div>
            <Treemap data={this.state.data}></Treemap>
          </Box>
        </div>
        <div className='row-model'>
          <Box className='model-box' id='stacked-barchart-box' sx={{ boxShadow: 3 }}>
            <FormControl id='dropdown-stacked-bar' sx={{ width: '250px' }}>
              <InputLabel>Select Chronic Disease</InputLabel>
              <Select
                label="Select Chronic Disease"
                onChange={this.handleStackBarChange}
                value={this.stateBarOption}
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
              <BarChartRace data={this.state.barChartRaceData}></BarChartRace>
              <BarChartGender data={this.state.barChartGenderData}></BarChartGender>
            </div>
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
      </div>
    )
  }
}

export default App;