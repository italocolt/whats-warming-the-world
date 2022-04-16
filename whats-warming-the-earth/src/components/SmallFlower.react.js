import React, {Component} from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import dataset from '../data/anomalies.js';


export default class SmallFlower extends Component {
  componentDidMount() {
    SmallFlowerD3.create(this.el, this.props);
  }

  componentWillUnmount() {
    SmallFlowerD3.destroy(this.el);
  }

  componentDidUpdate() {
    SmallFlowerD3.update(this.el, this.props);
  }

  render() {
    return (
      <div>
        <button
          ref={el => this.el = el}
          className="sFlwr-btn"
          onClick={this.props.onClickHandler}> </button>
      </div>
    );
  }
}

const SmallFlowerD3 = {};

SmallFlowerD3.maxF = d3.max(dataset, d => d3.max(Object.values(d).slice(1)));
SmallFlowerD3.minF = d3.min(dataset, d => d3.min(Object.values(d).slice(1)));

SmallFlowerD3.create = (el, props) => {

  const wrapper = d3.select(el);

  const svg = wrapper.append('svg');

  const flwrG = svg.append('g').attr('class', 'sFlwrG');

  flwrG.append('g').attr('class', 'scalesG');
  flwrG.append('g').attr('class', 'petalsG');

  SmallFlowerD3.update(el, props);
};

SmallFlowerD3.getColorScale = () => {
  const posColorScale = d3.scalePow().exponent(1/2)
    .interpolate(d3.interpolateHsl)
    .domain([0, SmallFlowerD3.maxF])
    .range(["#F2C12E", "#F24738"]);

  const negColorScale = d3.scalePow().exponent(1/2)
    .interpolate(d3.interpolateHsl)
    .domain([SmallFlowerD3.minF, 0])
    .range(["#C1C7D6", "#8199D6"]);

  return (d) => d < 0 ? negColorScale(d) : posColorScale(d);
}


SmallFlowerD3.resizeAndGetSize = (el) => {
  const size = 90;
  const wrapper = d3.select(el);

  wrapper
    .style('width', size + 'px')
    .style('height', size + 'px');

  wrapper.select('svg')
    .attr('width', 90)
    .attr('height', 90);

  const shape = {
    size: size,
    center: size / 2,
  }

  return shape;
}


SmallFlowerD3.update = (el, props) => {

  // ----- Format Containers ----- //
  const shape = SmallFlowerD3.resizeAndGetSize(el);

  const data = dataset.map(d => ({
    year: d.year,
    value: d[props.factor]
  }));

  // Static Scale
  const colorScale = SmallFlowerD3.getColorScale();

  // Scales
  const innerRadius = 12.5;
  const radiusThickness = 30;

  const radiusScale = d3.scalePow().exponent(1/4)
    .domain([0, SmallFlowerD3.maxF])
    .range([innerRadius, innerRadius + radiusThickness]);

  // Static Layouts
  const pieLayout = d3.pie()
    .startAngle(2 * Math.PI/180)
    .endAngle(-2 * Math.PI/180 + 2*Math.PI)
    .sort(d => d.year);

  // ----- Flower Group ----- //
  const svg = d3.select(el).select('svg');

  svg.select('.sFlwrG')
    .attr('transform', `translate(${shape.center}, ${shape.center})`);

  // ----- Scales Group ----- //
  const scalesG = svg.select('.scalesG');

  const scaleRadiiData = scalesG.selectAll('.sScaleG-scale')
    .data([SmallFlowerD3.maxF * 1.1]);

  scaleRadiiData.exit().remove();

  scaleRadiiData.enter()
    .append('g')
      .attr('class', 'sScaleG-scale')
    .append('circle')
      .attr('class', 'sScaleG-halo')
      .attr('r', d => radiusScale(d))
      .attr('stroke', '#E3BA22')
      .attr('stroke-width', 1)
      .attr('fill', 'rgba(227, 186, 34, 0)')
      .on('mouseenter', function(e, d) {
        d3.select(this)
          .transition()
          .duration(250)
          .attr('stroke-width', 2)
          .attr('fill', 'rgba(227, 186, 34, 0.075)');
      })
      .on('mouseleave', function(e, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('stroke-width', 1)
          .attr('fill', 'rgba(227, 186, 34, 0)');
      });


  // ----- Petals Group ----- //
  const petalArcGenerator = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(d => radiusScale(Math.abs(d.data.value)))
    .padAngle(0)
    .cornerRadius(1);

  const petalsData = svg.select('.petalsG')
    .selectAll('.petalsG-arc')
    .data(pieLayout.value(d => 1)(data), d => d.data.year + ' ' + d.data.value);

  petalsData.exit().remove();

  const petals = petalsData.enter()
    .append('g')
      .attr('class', 'petalsG-arc');

  // --- Petals --- //
  petals.append('g')
      .attr('class', d => `petal-arc year-${d.data.year}`)
    .append('path')
      .attr('d', d => petalArcGenerator(d))
      .attr('stroke', d => colorScale(d.data.value))
      .attr('fill', d => colorScale(d.data.value));
};

SmallFlowerD3.destroy = (el) => {
};


SmallFlower.defaultProps = {
  className: '',
};

SmallFlower.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  figure: PropTypes.object,
  setProps: PropTypes.func,
};
