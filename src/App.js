import React, { Component } from 'react';
import './App.css';
import * as d3 from 'd3';
import { Box, FormControl, MenuItem, Select, InputLabel } from '@mui/material';
import LineSelection from './LineChartLinesSelection';
import chronic from './cleaned_chronic_disease_indicators.csv'
import LineChart from './lineChart';
import StackedAreaChart from './stackedAreaChart';
import BarChartRace from './barChartRace';
import BarChartGender from './barChartGender';
import Treemap from './treemap';

const chronicDiseaseOpt = [
  'Arthritis (Prevalence)',
  'Asthma (Mortality Rate)',
  'Asthma (Prevalence)',
  'COPD (Prevalence)',
  'Cardiovascular Disease (Mortality Rate)',
  'Chronic Liver Disease (Mortality Rate)',
  'Diabetes (Mortality Rate)',
  'Diabetes (Prevalence)',
  'End-Stage Renal Disease (Mortality Rate)',
  'Kidney Disease (Prevalence)',
  'Obesity (Prevalence)',
  'Stroke (Mortality Rate)'
]

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selectedLineChartDisease: '',
      selectedLineChartLines: [],
      barChartGenderData: [],
      barChartRaceData: [],
      selectedBarOption: '',
      stackedAreaData: [],
      stackedAreaQuestions: [],
      selectedStackMetric: '',
      yAxisLabel: 'Rate',
    };
  }

  componentDidMount() {
    const self = this;

    d3.csv(chronic).then(data => {
      const processedData = data.map(d => ({
        Year: d.YearStart,
        Location: d.LocationDesc,
        Region: d.Region,
        Question: d.Question,
        Stratification: d.Stratification1,
        Value: +d.DataValue,
        DataType: d.DataValueType
      }))

      self.setState({ data: processedData })
    });
  }

  getDiseaseQuestion = (selection) => {
    switch (selection) {
      case 'Arthritis (Prevalence)':
        return 'Arthritis among adults aged >= 18 years';
      case 'Asthma (Mortality Rate)':
        return 'Asthma mortality rate';
      case 'Asthma (Prevalence)':
        return 'Current asthma prevalence among adults aged >= 18 years';
      case 'COPD (Prevalence)':
        return 'Prevalence of chronic obstructive pulmonary disease among adults >= 18';
      case 'Cardiovascular Disease (Mortality Rate)':
        return 'Mortality from total cardiovascular diseases';
      case 'Chronic Liver Disease (Mortality Rate)':
        return 'Chronic liver disease mortality';
      case 'Diabetes (Mortality Rate)':
        return 'Mortality due to diabetes reported as any listed cause of death';
      case 'Diabetes (Prevalence)':
        return 'Prevalence of diagnosed diabetes among adults aged >= 18 years';
      case 'End-Stage Renal Disease (Mortality Rate)':
        return 'Mortality with end-stage renal disease';
      case 'Kidney Disease (Prevalence)':
        return 'Prevalence of chronic kidney disease among adults aged >= 18 years';
      case 'Obesity (Prevalence)':
        return 'Obesity among adults aged >= 18 years';
      case 'Stroke (Mortality Rate)':
        return 'Mortality from cerebrovascular disease (stroke)';
      default:
        break;
    };
  }

  handleStackAreaChange = (event) => {
    const filteredData = this.state.data.filter(d => {
      if (event.target.value === 'Mortality Rate') {
        return d.Question.toLowerCase().includes('mortality')
      } else if (event.target.value === 'Prevalence') {
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
    this.setState({ selectedStackMetric: event.target.value })
    this.setState({ stackedAreaQuestions: Array.from(groupByQuestion.keys()) })
  }

  handleStackBarChange = (event) => {
    const selection = event.target.value;
    const race = ['Black, non-Hispanic', 'White, non-Hispanic', 'Hispanic', 'Other, non-Hispanic'];
    const gender = ['Male', 'Female'];

    const question = this.getDiseaseQuestion(selection);

    // Dynamically adjust the y-axis labels for the bar charts
    if (selection.includes('Prevalence')) {
      this.setState({ yAxisLabel: 'Prevalence Rate' })
    } else if (selection.includes('Mortality')) {
      this.setState({ yAxisLabel: 'Mortality Rate' })
    }

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
    this.setState({ selectedBarOption: event.target.value })
  }

  render() {
    return (
      <div id='container'>
        <div id='header'>
          <h1>Chronic Disease Trends</h1>
        </div>
        <div className='row-model'>
          <Box className='model-box' id='line-chart-box' sx={{ boxShadow: 3 }}>
            <div className='dropdown-row' id='line-chart-options'>
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
                  {chronicDiseaseOpt.map((disease) => (
                    <MenuItem value={disease}>{disease}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <LineSelection></LineSelection>
            </div>
            <LineChart data={this.state.data}></LineChart>
          </Box>
          <Box className='model-box' id='treemap-box' sx={{ boxShadow: 3 }}> { }
            <div className='dropdown-row'>
              <FormControl id='dropdown-metric-treemap' sx={{ width: '200px' }}>
                <InputLabel>Select a Metric</InputLabel>
                <Select label="Select a Metric">
                  <MenuItem value={'Prevalence'}>Prevalence</MenuItem>
                  <MenuItem value={'Mortality Rate'}>Mortality Rate</MenuItem>
                </Select>
              </FormControl>
              <FormControl id='dropdown-year-treemap' className='right-dropdown' sx={{ width: '200px' }}>
                <InputLabel>Select a Year</InputLabel>
                <Select label="Select a Year">
                  {[...Array(10)].map((_, index) => {
                    const year = 2011 + index;
                    return (
                      <MenuItem value={year}>{year}</MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </div>
            <Treemap data={this.state.data}></Treemap>
          </Box>
        </div>
        <div className='row-model'>
          <Box className='model-box' id='stacked-barchart-box' sx={{ boxShadow: 3 }}>
            <div className='dropdown-single'>
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
                  {chronicDiseaseOpt.map((disease) => (
                    <MenuItem value={disease}>{disease}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div id='barchart-row'>
              <BarChartRace data={this.state.barChartRaceData} ylabel={this.state.yAxisLabel}></BarChartRace>
              <BarChartGender data={this.state.barChartGenderData} ylabel={this.state.yAxisLabel}></BarChartGender>
            </div>
          </Box>
          <Box className='model-box' id='stacked-area-chart-box' sx={{ boxShadow: 3 }}>
            <div className='dropdown-single'>
              <FormControl id='dropdown-stacked-area' sx={{ width: '200px' }}>
                <InputLabel>Select a Metric</InputLabel>
                <Select label="Select a Metric" onChange={this.handleStackAreaChange} value={this.state.selectedStackMetric}>
                  <MenuItem value={'Prevalence'}>Prevalence</MenuItem>
                  <MenuItem value={'Mortality Rate'}>Mortality Rate</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div id='stacked-area-container'>
              <StackedAreaChart data={this.state.stackedAreaData} questions={this.state.stackedAreaQuestions}></StackedAreaChart>
            </div>
          </Box>
        </div>
      </div>
    )
  }
}

export default App;