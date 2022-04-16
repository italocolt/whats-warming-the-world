import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import dataset from '../data/anomalies.js';


export default class BigFlower extends Component {
  componentDidMount() {
    BigFlowerD3.create(this.el, this.props);
  }

  componentWillUnmount() {
    BigFlowerD3.destroy(this.el);
  }

  componentDidUpdate() {
    BigFlowerD3.update(this.el, this.props);
  }

  render() {
    return (
      <div ref={el => this.el = el} className="bFlwr-wrapper">
      </div>
    );
  }
}

const BigFlowerD3 = {};

BigFlowerD3.maxF = d3.max(dataset, d => d3.max(Object.values(d).slice(1)));
BigFlowerD3.minF = d3.min(dataset, d => d3.min(Object.values(d).slice(1)));
BigFlowerD3.maxAbsF = d3.max(dataset, d => (
  d3.max([BigFlowerD3.maxF, BigFlowerD3.minF].map(d => Math.abs(d)))
));

BigFlowerD3.getTempConverter = (tempUnit) => (tempUnit === 'f'
  ? (d => d * 1)
  : (d => d * (5/9))
);

BigFlowerD3.getRadii = (tempUnit, converter) => {

  const maxAbs = converter(BigFlowerD3.maxAbsF);

  // Get radii for current flower
  const scaleRadiiTemps = {
    f: [0, .5, 1, 1.5, 2],
    c: [0, .5, .75, 1],
  }

  let scaleRadii = [];
  scaleRadiiTemps[tempUnit].forEach(d => {
    if (d <= maxAbs + d*.25) {
      scaleRadii.push(d)
    }
  });

  return d3.extent(scaleRadii);
}

BigFlowerD3.getColorScale = (minValue, maxValue) => {
  const posColorScale = d3.scalePow().exponent(1/2)
    .interpolate(d3.interpolateHsl)
    .domain([0, maxValue])
    .range(["#F2C12E", "#F24738"]);

  const negColorScale = d3.scalePow().exponent(1/2)
    .interpolate(d3.interpolateHsl)
    .domain([minValue, 0])
    .range(["#C1C7D6", "#8199D6"]);

  return (d) => d < 0 ? negColorScale(d) : posColorScale(d);
}



BigFlowerD3.create = (el, props) => {

  const wrapper = d3.select(el);

  // --- SVG --- //
  const svg = wrapper.append('svg').attr('class', 'bFlwrSVG');

  const flwrG = svg.append('g').attr('class', 'bFlwrG');

  flwrG.append('g').attr('class', 'scalesG');
  flwrG.append('g').attr('class', 'petalsG');
  flwrG.append('g').attr('class', 'yearsG');

  // --- Title Div --- //
  wrapper
    .append('div').attr('class', 'bFlwr-title-wrapper')
    .append('div').attr('class', 'bFlwr-title-container');

  // --- Update --- //
  BigFlowerD3.update(el, props);

};

BigFlowerD3.getShape = (el) => {
  const wrapper = d3.select(el);

  const width = wrapper.select('svg').style('width').replace('px', '');
  const height = wrapper.select('svg').style('height').replace('px', '');

  const size = d3.min([width, height]);

  const shape = {
    size: size,
    center: size / 2,
    width: width,
    height: height,
  }

  console.log(shape);

  return shape;

}


BigFlowerD3.update = (el, props) => {

  const flwrVar = {
    lang: props.lang,
    tempUnit: props.lang === 'en' ? 'f' : 'c',
    title: props.description.title[props.lang],
  }

  // ----- Convert Temperature ----- //
  const convertTemp = BigFlowerD3.getTempConverter(flwrVar.tempUnit);

  const data = dataset.map(d => ({
    year: d.year,
    value: convertTemp(d[props.factor])
  }));

  // Cricle Grid Radii
  const scaleRadii = BigFlowerD3.getRadii(flwrVar.tempUnit, convertTemp);

  // Static Scale
  const maxValue = convertTemp(BigFlowerD3.maxF);
  const minValue = convertTemp(BigFlowerD3.minF);
  const colorScale = BigFlowerD3.getColorScale(minValue, maxValue);

  // ----- Get Shape ----- //
  const shape = BigFlowerD3.getShape(el);

  // Scales
  const margin = 18
  const outerRadius = shape.center - (2*margin);
  const innerRadius = (1/3) * outerRadius;

  const radiusScale = d3.scalePow().exponent(1/1.15)
    .domain([0, d3.max(scaleRadii)])
    .range([innerRadius, outerRadius]);

  // Static Layouts
  const pieLayout = d3.pie()
    .startAngle(15 * Math.PI/180)
    .endAngle(-15 * Math.PI/180 + 2*Math.PI)
    .sort(d => d.year);

  // Generators
  const scaleArcGenerator = d3.arc()
    .innerRadius(d => radiusScale(d))
    .outerRadius((d, i) => radiusScale(d) + ((2 + (i * 0.25))))
    .startAngle(d => 5 * Math.PI/180)
    .endAngle(d => -5 * Math.PI/180 + 2*Math.PI);

  // const yearArcGenerator = d3.arc()
  //   .innerRadius(radiusScale(d3.max(scaleRadii)) + 10)
  //   .outerRadius(radiusScale(d3.max(scaleRadii)) + 12)
  //   .padAngle(.05);

  // ----- Flower Group ----- //
  const svg = d3.select(el).select('svg');

  svg.select('.bFlwrG')
    .attr('transform', `translate(${shape.width / 2}, ${shape.center})`);

  // ----- Scales Group ----- //
  const scalesG = svg.select('.scalesG');

  const scaleRadiiData = scalesG.selectAll('g.scalesG-scale')
    .data(scaleRadii.map((d, i) => ({
      temp: d,
      radius: radiusScale(d),
      arc: scaleArcGenerator(d, i)
    })), d => d.radius);

  scaleRadiiData.exit().remove();

  const scaleRadiiEnter = scaleRadiiData.enter()
    .append('g')
      .attr('class', 'scalesG-scale');

  scaleRadiiEnter.append('path')
    .classed('scalesG-halo', true)
    .classed('origin', d => d.temp === 0)
    .attr('d', d => d.arc);

  scaleRadiiEnter.append('circle')
    .classed('scalesG-dot', true)
    .classed('origin', d => d.temp === 0)
    .attr('r', d => d.temp === 0 ? 4 : 6)
    .attr('cx', 0)
    .attr('cy', d => d.radius * -1);

    //Line
    scalesG.select('.scalesG-thermometer').remove();
    const thermometer = scalesG.append('g')
      .attr('class', 'scalesG-thermometer');

    thermometer.append('line')
      .attr('class', 'scalesG-line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', -radiusScale(d3.min(scaleRadii)))
      .attr('y2', -radiusScale(d3.max(scaleRadii)))
      .attr('stroke-width', 3);

    thermometer.append('text')
      .attr('class', 'scalesG-text ' + props.windowSize)
      .text('0')
      .attr('r', 5)
      .attr('x', 0)
      .attr('y', -radiusScale(0) + 25);

    const maxRadii = d3.max(scaleRadii);
    thermometer.append('text')
      .attr('class', 'scalesG-text ' + props.windowSize)
      .text(`Δ ${maxRadii}°${flwrVar.tempUnit.toUpperCase()}`)
      .attr('r', 5)
      .attr('x', 0)
      .attr('y', -radiusScale(maxRadii) -15);

  // ----- Petals Group ----- //
  const petalArcGenerator = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(d => radiusScale(Math.abs(d.data.value)))
    .padAngle(0)
    .cornerRadius(1);

  const petalsData = pieLayout.value(d => 1)(data).map(d => ({
    radius: radiusScale(d.data.value), ...d
  }));

  const petalsDataSelection = svg.select('.petalsG')
    .selectAll('.petalsG-arc')
    .data(petalsData, d => `${d.data.year} ${d.data.value} ${d.radius}`);

  petalsDataSelection.exit().remove();

  const petals = petalsDataSelection.enter()
    .append('g')
      .attr('class', 'petalsG-arc');

  // --- Petals --- //
  petals.append('g')
      .attr('class', d => `petal-arc year-${d.data.year}`)
    .append('path')
      .attr('d', d => petalArcGenerator(d))
      .attr('stroke', d => colorScale(d.data.value))
      .attr('fill', d => colorScale(d.data.value));

  // --- Event Petals --- //
  function mouseEnterArc(e, d) {

    const year = d.data.year;
    const val = d.data.value;
    const highlightColor = val >= 0 ? '#F2481F' : '#5165F7';
    const textColor = val >= 0 ? '#F24738' : '#8199D6';
    const tempVariation = (val >= 0 ? '+' : '-') + Math.abs(val.toFixed(2)) + '°' + flwrVar.tempUnit.toUpperCase();

    d3.select(`.petal-arc.year-${year}`)
      .select('path')
      .transition()
        .duration(30)
        .attr('stroke', highlightColor)
        .attr('fill', highlightColor);

    d3.select(`.petal-arc.year-${year}`)
      .append('text')
      .text(year)
      .attr('class', 'bFlwrYearLabel')
      .attr('x', 0)
      .attr('y', innerRadius * .6)
      .attr('text-anchor', 'middle');

    d3.select(`.petal-arc.year-${year}`)
      .append('text')
      .text(tempVariation)
      .attr('class', 'bFlwrTempLabel')
      .attr('x', 0)
      .attr('y', innerRadius * .8)
      .attr('text-anchor', 'middle')
      .attr('fill', textColor);
  }

  function mouseLeaveArc(e, d) {
    d3.select(`.petal-arc.year-${d.data.year}`)
      .select('path')
      .transition()
        .duration(80)
        .attr('stroke', colorScale(d.data.value))
        .attr('fill', colorScale(d.data.value));

        d3.select(`.petal-arc.year-${d.data.year}`)
          .selectAll('text').remove()
  }

  petalArcGenerator
    .outerRadius(d => radiusScale(d3.max([Math.abs(d.data.value), maxRadii])));

  petals.append('g')
    .append('path')
      .attr('d', d => petalArcGenerator(d))
      .attr('stroke', d => 'rgba(0, 0, 0, 0)')
      .attr('fill', d => 'rgba(255, 0, 0, .0)')
      .on('mouseenter', mouseEnterArc)
      .on('mouseleave', mouseLeaveArc);

  // ----- Legends ----- //
  d3.select('.bFlwr-title-wrapper')
      .style('transform', `translate(${shape.width/2}px, ${shape.center}px)`);

  const legendsData = d3.select('.bFlwr-title-container')
    .selectAll('p.bFlwr-name')
    .data(flwrVar.title.map(d => ({
      html: d,
      className: 'bFlwr-name ' + props.windowSize
    })), d => d.html + ' ' + d.className);

  legendsData.exit().remove()
  legendsData.enter()
    .append('p')
      .attr('class', d => d.className)
      .html(d => d.html);

};

BigFlowerD3.destroy = (el) => {
};


BigFlower.defaultProps = {
  className: '',
};

BigFlower.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  figure: PropTypes.object,
  setProps: PropTypes.func,
};
