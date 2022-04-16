import { Component, useRef, useEffect } from "react";
import PropTypes from 'prop-types';
import * as d3 from "d3";
import dataset from '../data/anomalies.js';
import './style/AnomalyFlower.css';

const maxF = d3.max(dataset, d => d3.max(Object.values(d).slice(1)));
const minF = d3.min(dataset, d => d3.min(Object.values(d).slice(1)));

const scaleRadiiTemps = {
  f: {values: [0, 1, 2], step: 1},
  c: {values: [0, .5, 1], step: .5}
};

function getConverter(temp)  {
  return temp === 'f' ? (d => d * 1) : (d => d * (5/9))
}

function getRadii(temp, maxAbsValue) {
  let scaleRadii = [];

  scaleRadiiTemps[temp].values.forEach(d => {
    if (d <= maxAbsValue + scaleRadiiTemps[temp].step) scaleRadii.push(d);
  });

  return scaleRadii;
};


function AnomalyFlower(props) {
  const lang = props.lang;
  const temp = lang === 'en' ? 'f' : 'c';
  const convertTemp = getConverter(temp);

  const maxValue = convertTemp(maxF);
  const minValue = convertTemp(minF);

  // Static Scale
  const posFill = d3.scalePow().exponent(1/2).interpolate(d3.interpolateHsl)
    .domain([0, maxValue])
    .range(["#F2C12E", "#F24738"]);

  const negFill = d3.scalePow().exponent(1/2).interpolate(d3.interpolateHsl)
    .domain([minValue, 0])
    .range(["#C1C7D6", "#8199D6"]);

  function colorScale(d) {
    return d < 0 ? negFill(d) : posFill(d)
  }

  // Static Layouts
  const pieLayout = d3.pie()
    .startAngle(15 * Math.PI/180)
    .endAngle(-15 * Math.PI/180 + 2*Math.PI)
    .sort(d => d.year);

  const divRef = useRef();
  const wrapper = d3.select(divRef.current);

  const svgRef = useRef();
  const svg = d3.select(svgRef.current);

  const title = props.title[lang];
  const description = props.description[lang];
  const flag = props.flag;
  const multiplier = flag === "main" ? 2 : 1;

  const colName = props.column;

  const data = dataset.map(d => ({
    year: d.year,
    value: convertTemp(d[colName])
  }));

  // Get Statistics
  const maxAbsValue = d3.max(data, d => Math.abs(d.value));

  // Cricle Grid Radii
  const scaleRadii = getRadii(temp, maxAbsValue);

  // Scales
  const innerRadius = 50 * multiplier;
  const radiusThickness = 80 * multiplier;

  const radiusScale = d3.scalePow().exponent(1/2)
    .domain([0, d3.max(scaleRadii)])
    .range([innerRadius, innerRadius + radiusThickness]);

  // Generators
  const scaleArcGenerator = d3.arc()
    .innerRadius(d => radiusScale(d))
    .outerRadius((d, i) => radiusScale(d) + ((1 + i) * Math.sqrt(multiplier)))
    .startAngle(d => 5 * Math.PI/180)
    .endAngle(d => -5 * Math.PI/180 + 2*Math.PI);

  const petalArcGenerator = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(d => radiusScale(Math.abs(d.data.value)))
    .padAngle(0)
    .cornerRadius(1);

  const yearArcGenerator = d3.arc()
    .innerRadius(radiusScale(d3.max(scaleRadii)) + 10)
    .outerRadius(radiusScale(d3.max(scaleRadii)) + 10 + (1 * multiplier))
    .padAngle(.05);


  const idFlwr = `flwr-${colName.replace(/_/g, '-')}`;
  const center = props.size/2;

  // Group
  useEffect(() => {
    svg.select('#' + idFlwr).remove();
    const flwrG = svg.append('g')
        .attr('id', idFlwr)
        .attr('transform', `translate(${center}, ${center})`);

    drawScales();
    drawPetals();
    drawLegends();
    drawYears();
  })


  // Scales ----------------------------------------------------------
  function drawScales() {
    const scalesG = d3.select('#' + idFlwr).append('g').classed('scalesG', true);

    // Line
    scalesG.append('line')
        .classed('scalesG-line', true)
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', -radiusScale(d3.min(scaleRadii)))
        .attr('y2', -radiusScale(d3.max(scaleRadii)))
        .attr('stroke-width', 2 * Math.sqrt(multiplier));

    scalesG.selectAll('.scalesG-scale')
      .data(scaleRadii)
      .enter()
      .each(function(d, i) {
        const scaleG = d3.select(this).append('g');
        // Halos
        scaleG.append('path')
            .classed('scalesG-scale', true)
            .classed('origin', d === 0)
            .attr('d', scaleArcGenerator(d, i));

        scaleG.append('circle')
            .classed('scalesG-dot', true)
            .classed('origin', d === 0)
            .attr('r', Math.sqrt(multiplier) * (d === 0 ? 2.5 : 2 + (d * .5)))
            .attr('cx', 0)
            .attr('cy', -radiusScale(d));

        if (i === 0 || i === scaleRadii.length - 1) {
          // Text
          scaleG.append('text')
              .classed('scalesG-text', true)
              .text(i === 0 ? d : `${d}º${temp.toUpperCase()}`)
              .attr('r', 5)
              .attr('x', 0)
              .attr('y', -radiusScale(d) + (Math.sqrt(multiplier) * (i === 0 ? 15: -10)))
              .style('font-size', 14 * Math.sqrt(multiplier));
        }
      });

    // Flag
    if (flag !== 'main') {
      scalesG.append('g')
        .attr('transform', `translate(0, ${radiusScale(d3.max(scaleRadii)) - 4})`)
        .append('rect')
          .classed(`scalesG-flag ${flag}`, true)
          .attr('width', 8 * Math.sqrt(multiplier))
          .attr('height', 8 * Math.sqrt(multiplier));
    }
  }

  // Petals ----------------------------------------------------------
  function drawPetals() {
    d3.select('#' + idFlwr).append("g")
        .classed('petalsG', true)
      .selectAll(".flowerArc")
      .data(pieLayout.value(d => 1)(data), d => d.data.year)
      .enter()
      .append("path")
        .classed('petalsG-arc', true)
        .attr("d", petalArcGenerator)
        .attr('stroke', d => colorScale(d.data.value))
        .attr("fill", d => colorScale(d.data.value));
  }

  // Legends ---------------------------------------------------------
  function drawLegends() {
    const idDiv = `flwr-title-wrapper-${colName}`;
    wrapper.select('#' + idDiv).remove();
    wrapper.append('div')
        .attr('id', idDiv)
        .classed('flower-title-container avoid-clicks', true)
        .classed('main', flag === 'main')
        .style('transform', `translate(${center}px, ${center}px)`)
      .append('div')
      .selectAll('p.flower-name')
      .data(title)
      .enter()
      .append('p')
        .classed('flower-name', true)
        .html(d => d);
  }

  // Years -----------------------------------------------------------
  function drawYears() {
    const step = 10;
    const years = d3.range(1880, 2010, step).map((d, i) => {
      return d !== 2000 ? {year: d, value: step} : {year: d, value: 5};
    });

    const yearsG = d3.select('#' + idFlwr).append('g')
        .classed('yearsG', true);

    yearsG.selectAll('path')
      .data(pieLayout.value(d => d.value)(years))
      .enter()
      .append('path')
        .classed('yearsG-arc', true)
        .attr('d', yearArcGenerator)
      .each(function(d, i) {
        // Create hidden arc to create textPath on.
        // Regex patter to get everything in 'd' attribute before L
        const firstArcSection = /(^.+?)L/;

        // Execute regex and get element in index [1], which is the element between ()
        let newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];

        // Replace commas with spaces
        newArc = newArc.replace(/,/g, " ");

        d3.select(this)
          .append('path')
            .attr('id', d => `yearsG-arc__${colName}--${d.data.year}`)
            .attr('d', newArc)
            .style('fill', 'none');
      });

    yearsG.selectAll('.yearLabel')
      .data(years.slice(0, years.length - 1))
      .enter()
      .append("text")
        .classed('yearsG-label', true)   //Move the text from the start angle of the arc
        .attr('text-anchor', 'left')
        .attr("dy", -5) //Move the text down
      .append("textPath")
        .attr("startOffset", "10%")
        .attr("xlink:href", d => `#yearsG-arc__${colName}--${d.year}`)
        .text(d => d.year );
  }



  return (
    <div className="flower-wrapper">
      <svg
        ref={svgRef}
        width={props.size}
        height={props.size}  style={{border: '1px solid black'}}>
      </svg>
        <div ref={divRef} style={{width: props.size, height: props.size, position: 'absolute'}}>
        </div>
    </div>
  )


}

export default AnomalyFlower;
