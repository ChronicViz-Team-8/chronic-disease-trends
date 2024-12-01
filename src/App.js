import React, { Component } from 'react';
import './App.css';
import * as d3 from 'd3';
import chronic from './cleaned_chronic_disease_indicators.csv'
import LineChart from './lineChart';
import StackedChart from './stackedChart';
import BarChart from './barChart';

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
        <div id='models'>
          <LineChart data={this.state.data}></LineChart>
          <StackedChart data={this.state.data}></StackedChart>
          <BarChart data={this.state.data}></BarChart>
        </div>
      </div>
    )
  }
}

export default App;
