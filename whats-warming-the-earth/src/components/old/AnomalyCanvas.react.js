import { Component } from "react";
import AnomalyFlower from './funAnomalyFlower.react';
import * as d3 from "d3";
import Tooltip from './Tooltip.react';
import dataset from '../data/anomalies';

const getConverter = (temp) => temp === 'f' ? 1 : (5/9);

const formatArray = (column, temp) => {
  const converter = getConverter(temp);
  const array = dataset.map(d => ({
    year: d.year,
    value: d[column] * converter
  }))
};

const scaleRadiiTemps = {
  f: {values: [0, 1, 2], step: .5},
  c: {values: [0, .5, 1], step: .25}
}

const getRadii = (temp, maxAbsValue) => {
  let scaleRadii = [];
  const scaleTemp = scaleRadiiTemps[temp];
  scaleTemp.values.forEach(d => {
    if (d <= maxAbsValue + scaleTemp.step) scaleRadii.push(d);
  });

  return scaleRadii;
};

export default const AnomalyCanvas = (props) {
  const stats = {
    max: d3.max(dataset, d => d3.max(Object.values(d).slice(1))),
    min: d3.min(dataset, d => d3.min(Object.values(d).slice(1))),
    maxAbs: d3.max(dataset, d => Math.abs(d[column])),
  }


  // Get some data statistics
  const stats = {
    maxAll: d3.max(dataset, d => tempConverter * d3.max(Object.values(d).slice(1))),
    minAll: d3.min(dataset, d => tempConverter * d3.min(Object.values(d).slice(1))),
    maxAbsValue: d3.max(dataset, d => tempConverter * Math.abs(d[column])),
  }

  const scaleRadii = getRadii(temp, stats.maxAbsValue);

  // Define radius of scales
  const innerRadius = 50 * multiplier;
  const radiusRange = 80 * multiplier;
  const radiusScale = d3.scalePow().exponent(1/2)
    .domain([0, stats.maxAbsValue])
    .range([innerRadius, innerRadius + radiusRange]);

  // Layouts

  // Generators





  render() {
    const lang = this.props.lang;
    const temp = this.props.lang === 'br' ? 'c' : 'f';
    const converter = getConverter(temp);

    const maxValue = this.stats.max * converter;
    const minValue = this.stats.max * converter;
    const maxAbsValue = this.stats.maxAbs * converter;

    const pieLayout = d3.pie()
      .startAngle(15 * Math.PI/180)
      .endAngle(-15 * Math.PI/180 + 2*Math.PI)
      .sort(d => d.year);

    function colorScale(d) {
      const posFill = d3.scalePow().exponent(1/2)
        .interpolate(d3.interpolateHsl)
        .domain([0, maxValue])
        .range(["#F2C12E", "#F24738"]);

      const negFill = d3.scalePow().exponent(1/2)
        .interpolate(d3.interpolateHsl)
        .domain([minValue, 0])
        .range(["#C1C7D6", "#8199D6"]);

      return d < 0 ? negFill(d) : posFill(d);
    }

    function getRadiusScale(multiplier) {
      const innerRadius = 50 * multiplier;
      const radiusRange = 80 * multiplier;
      const radiusScale = d3.scalePow().exponent(1/2)
        .domain([0, maxAbsValue])
        .range([innerRadius, innerRadius + radiusRange]);

      return radiusScale;
    }

    function getScaleArcGenerator(radiusScale, multiplier) {
      const scaleArcGenerator = d3.arc()
        .innerRadius(d => radiusScale(d))
        .outerRadius((d, i) => radiusScale(d) + (1 + i) * Math.sqrt(multiplier))
        .startAngle(d => 5 * Math.PI/180)
        .endAngle(d => -5 * Math.PI/180 + 2*Math.PI);

      return scaleArcGenerator;
    }

    function getPetalArcGenerator(radiusScale) {
      const petalArcGenerator = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(d => radiusScale(Math.abs(d.data.value)))
        .padAngle(0)
        .cornerRadius(1);

      return petalArcGenerator;
    }

    function getYearArcGenerator(radiusScale, maxRadius, multiplier) {
      const yearArcGenerator = d3.arc()
        .innerRadius(radiusScale(maxRadius) + 10)
        .outerRadius(radiusScale(maxRadius) + 10 + (1 * multiplier))
        .padAngle(.05);
    }


    return (
      <svg id='anomaly-canvas' width={900} height={900}></svg>
    )
  }
}
