import React, { Component } from 'react';
import './App.css';
import * as d3 from 'd3';
import { Box, FormControl, MenuItem, Select, InputLabel, Typography } from '@mui/material';
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
      lineChartData: [],
      selectedTreemapMetric: '',
      selectedTreemapYear: '',
      barChartGenderData: [],
      barChartRaceData: [],
      selectedBarOption: '',
      stackedAreaData: [],
      stackedAreaQuestions: [],
      selectedStackRegion: '',
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
        DataType: d.DataValueType,
        Topic: d.Topic
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

  handleLineChartDiseaseChange = (event) => {
    const selectedDisease = event.target.value;
    const question = this.getDiseaseQuestion(selectedDisease);
    this.setState({ selectedLineChartDisease: question }, this.processLineChartData);
  }

  handleLineChartLineChange = (selectedLines) => {
    this.setState({ selectedLineChartLines: selectedLines }, this.processLineChartData);
  }

  processLineChartData = () => {
    const question = this.state.selectedLineChartDisease;
    const linesSelected = this.state.selectedLineChartLines;

    if (!question || linesSelected.length === 0) {
      this.setState({ lineChartData: [] });
      return;
    }

    const filteredData = this.state.data.filter(d => d.Question === question);
    const regions = ['Midwest', 'Northeast', 'South', 'West']
    const years = Array.from(new Set(filteredData.map(d => d.Year))).sort();
    const chartData = years.map(year => {
      const row = { Year: year };

      if (linesSelected.includes('U.S. Regions')) {
        regions.forEach(region => {
          const regionValues = filteredData.filter(d => d.Year === year && d.Region === region && (d.Stratification !== 'Male' && d.Stratification !== 'Female'));
          const avg = regionValues.reduce((sum, d) => sum + d.Value, 0) / regionValues.length;

          row[region] = avg;
        })
      } else {
        linesSelected.forEach(stratification => {
          const stratValues = filteredData.filter(d => d.Year === year && d.Stratification === stratification);
          const avg = stratValues.reduce((sum, d) => sum + d.Value, 0) / stratValues.length;
          
          row[stratification] = avg;
        })
      }

      return row;
    });

    this.setState({ lineChartData: chartData });
  }

  handleStackAreaChange = (event) => {
    const selectedRegion = event.target.value;

    const filteredData = this.state.data.filter(d =>
      d.Region === selectedRegion &&
      d.Stratification !== 'Male' &&
      d.Stratification !== 'Female' &&
      d.Question.toLowerCase().includes('mortality')
    );

    const groupByQuestion = d3.group(filteredData, d => d.Question);

    // Data Prep for Stacking
    const years = Array.from(new Set(filteredData.map(d => d.Year))).sort();

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
    this.setState({ selectedStackRegion: event.target.value })
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
    this.setState({ selectedBarOption: question })
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
                  onChange={this.handleLineChartDiseaseChange}
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
              <LineSelection onSelectionChange={this.handleLineChartLineChange}></LineSelection>
            </div>
            <Typography sx={{ fontSize: 16, marginTop: 2, whiteSpace: 'pre-line', textAlign: 'center', fontWeight: 'bold' }}>
                {this.state.selectedLineChartDisease}
              </Typography>
            <div className='models'>
              <LineChart data={this.state.lineChartData}></LineChart>
            </div>
          </Box>
          <Box className='model-box' id='treemap-box' sx={{ boxShadow: 3 }}>
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
            <Typography sx={{ fontSize: 16, marginTop: 2, whiteSpace: 'pre-line', textAlign: 'center', fontWeight: 'bold' }}>
              {this.state.selectedBarOption}
            </Typography>
            <div className='models' id='barchart-row'>
              <BarChartRace data={this.state.barChartRaceData} ylabel={this.state.yAxisLabel}></BarChartRace>
              <BarChartGender data={this.state.barChartGenderData} ylabel={this.state.yAxisLabel}></BarChartGender>
            </div>
          </Box>
          <Box className='model-box' id='stacked-area-chart-box' sx={{ boxShadow: 3 }}>
            <div className='dropdown-single'>
              <FormControl id='dropdown-stacked-area' sx={{ width: '200px' }}>
                <InputLabel>Select a Metric</InputLabel>
                <Select label="Select a Region" onChange={this.handleStackAreaChange} value={this.state.selectedStackMetric}>
                  <MenuItem value={'Midwest'}>Midwest</MenuItem>
                  <MenuItem value={'Northeast'}>Northeast</MenuItem>
                  <MenuItem value={'South'}>South</MenuItem>
                  <MenuItem value={'West'}>West</MenuItem>
                </Select>
              </FormControl>
            </div>
            {this.state.selectedStackRegion && (
              <Typography sx={{ fontSize: 16, marginTop: 2, whiteSpace: 'pre-line', textAlign: 'center', fontWeight: 'bold' }}>
                Mortality Rates for Chronic Conditions in the {this.state.selectedStackRegion}
              </Typography>
            )}
            <div className='models' id='stacked-area-container'>
              <StackedAreaChart data={this.state.stackedAreaData} questions={this.state.stackedAreaQuestions}></StackedAreaChart>
            </div>
          </Box>
        </div>
      </div>
    )
  }
}

export default App;