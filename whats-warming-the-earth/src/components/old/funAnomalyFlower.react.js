import { Component, useRef, useEffect } from "react";
import PropTypes from 'prop-types';
import * as d3 from "d3";
import './style/AnomalyFlower.css';

const getConverter = (temp) => temp === 'f' ? 1 : (5/9);

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

export default function AnomalyFlower(props) {
  // Properties ------------------------------------------------
  const svgId = props.svgId;
  const centerX = props.center.x;
  const centerY = props.center.y;
  const dataset = props.dataset;
  const column = props.column;
  const multiplier = props.multiplier ? props.multiplier : 1;
  const divId = 'flowerDiv__' + column;
  const flowerId = 'flowerG__' + column;

  const lang = props.lang;
  const title = props.title[lang];
  const desc = props.description[lang];
  const temp = props.lang === 'en' ? 'f' : 'c';

  // Calculation ------------------------------------------
  const tempConverter = getConverter(temp);

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
  const pieLayout = d3.pie()
    .startAngle(15 * Math.PI/180)
    .endAngle(-15 * Math.PI/180 + 2*Math.PI)
    .sort(d => d.year);

  // Generators
  const scaleArcGenerator = d3.arc()
    .innerRadius(d => radiusScale(d))
    .outerRadius((d, i) => radiusScale(d) + (1 + i) * Math.sqrt(multiplier))
    .startAngle(d => 5 * Math.PI/180)
    .endAngle(d => -5 * Math.PI/180 + 2*Math.PI);

  const petalArcGenerator = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(d => radiusScale(Math.abs(d.data[column] * tempConverter)))
    .padAngle(0)
    .cornerRadius(1);

  const yearArcGenerator = d3.arc()
    .innerRadius(radiusScale(d3.max(scaleRadii)) + 10)
    .outerRadius(radiusScale(d3.max(scaleRadii)) + 10 + (1 * multiplier))
    .padAngle(.05);

  // Color Scale
  const posFill = d3.scalePow().exponent(1/2)
    .interpolate(d3.interpolateHsl)
    .domain([0, stats.maxAll])
    .range(["#F2C12E", "#F24738"]);

  const negFill = d3.scalePow().exponent(1/2)
    .interpolate(d3.interpolateHsl)
    .domain([stats.minAll, 0])
    .range(["#C1C7D6", "#8199D6"]);

  const colorFill = d => d < 0 ? negFill(d * tempConverter) : posFill(d * tempConverter);

  // Drawings ------------------------------
  d3.select(`#svg-section`)
    .append('div')
      .classed('flower-name-wrapper avoid-clicks', true)
      .style('position', 'absolute')
      .style('top', centerY + 'px')
      .style('left', centerX + 'px')
    .selectAll('p.flower-name')
    .data(title.split(' '))
    .enter()
    .append('p')
      .classed('flower-name', true)
      .html(d => d);


  const g = d3.select(`#${svgId}`)
    .append('g')
      .attr('id', flowerId)
      .attr('transform', `translate(${centerX}, ${centerY})`);

  // Scales -------------------------
  const scalesG = g.append('g')
    .classed('scalesG', true);

  scaleRadii.forEach((d, i) => {

    // Scale Halos
    scalesG.append('path')
      .classed('scalesG-scale', true)
      .classed('origin', d === 0)
      .attr('d', scaleArcGenerator(d, i));

    // Scale Dots
    scalesG.append('circle')
      .classed('scalesG-dot', true)
      .classed('origin', d === 0)
      .attr('r', Math.sqrt(multiplier) * (d === 0 ? 2.5 : 2 + (d * .5)))
      .attr('cx', 0)
      .attr('cy', -radiusScale(d));

  });

  // Scale Line
  scalesG.append('line')
      .classed('scalesG-line', true)
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', -radiusScale(d3.min(scaleRadii)))
      .attr('y2', -radiusScale(d3.max(scaleRadii)))
      .attr('stroke-width', 2 * Math.sqrt(multiplier));

  d3.extent(scaleRadii).forEach((d, i) => {
    // Text
    scalesG.append('text')
        .classed('scalesG-text', true)
        .text(i === 0 ? d : `${d}º${temp.toUpperCase()}`)
        .attr('r', 5)
        .attr('x', 0)
        .attr('y', -radiusScale(d) + Math.sqrt(multiplier) * (i === 0 ? 15: -10));
  });


  // Petals -------------------------
  const petalsG = g.append("g")
      .classed('petalsG', true);

  petalsG.selectAll(".flowerArc")
    .data(pieLayout.value(d => 1)(dataset), d => d.data.year)
    .enter()
    .append("path")
      .classed('petalsG-arc', true)
      .attr("d", petalArcGenerator)
      .attr('stroke', d => colorFill(d.data[column]))
      .attr("fill", d => colorFill(d.data[column]));

  // Years -------------------------
  const step = 10;
  const years = d3.range(1880, 2010, step).map((d, i) => {
    return d !== 2000 ? {year: d, value: step} : {year: d, value: 5};
  });

  const yearsG = g.append('g')
      .classed('yearsG', true);

  // yearsG.selectAll('path')
  //   .data(pieLayout.value(d => d.value)(years))
  //   .enter()
  //   .append('path')
  //     .classed('yearsG-arc', true)
  //     .attr('d', yearArcGenerator)
  //   .each(function(d, i) {
  //     // Create hidden arc to create textPath on.
  //     // Regex patter to get everything in 'd' attribute before L
  //     const firstArcSection = /(^.+?)L/;
  //
  //     // Execute regex and get element in index [1], which is the element between ()
  //     let newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
  //
  //     // Replace commas with spaces
  //     newArc = newArc.replace(/,/g, " ");
  //
  //     d3.select(this)
  //       .append('path')
  //         .attr('id', d => `yearsG-arc__${column}--${d.data.year}`)
  //         .attr('d', newArc)
  //         .style('fill', 'none');
  //   });
  //
  // yearsG.selectAll('.yearLabel')
  //   .data(years.slice(0, years.length - 1))
  //   .enter()
  //   .append("text")
  //     .classed('yearsG-label', true)   //Move the text from the start angle of the arc
  //     .attr('text-anchor', 'left')
  //     .attr("dy", -5) //Move the text down
  //   .append("textPath")
  //     .attr("startOffset", "10%")
  //     .attr("xlink:href", d => `#yearsG-arc__${column}--${d.year}`)
  //     .text(d => d.year);

  // Title  -------------------------

}
















// const AnomalyFlower = (props) => {
//
//   const drawLegends = () => {
//     d3.select(`#${divId}`)
//       .append('div')
//         .classed('flower-name-wrapper avoid-clicks', true)
//         .style('width', svgSize)
//       .selectAll('p.flower-name')
//       .data(anomalyTitle.split(' '))
//       .enter()
//       .append('p')
//         .classed('flower-name', true)
//         .html(d => d);
//   }
//
//   const drawYears = () => {
//     const step = 10;
//     const years = d3.range(1880, 2010, step).map((d, i) => {
//       return d !== 2000 ? {year: d, value: step} : {year: d, value: 5};
//     });
//
//     const yearsG = d3.select(`#${flowerId}`)
//       .append('g')
//         .classed('yearsG', true);
//
//     yearsG.selectAll('path')
//       .data(pieLayout.value(d => d.value)(years))
//       .enter()
//       .append('path')
//         .classed('yearsG-arc', true)
//         .attr('d', yearArcGenerator)
//       .each(function(d, i) {
//         // Create hidden arc to create textPath on.
//         // Regex patter to get everything in 'd' attribute before L
//         const firstArcSection = /(^.+?)L/;
//
//         // Execute regex and get element in index [1], which is the element between ()
//         let newArc = firstArcSection.exec(d3.select(this).attr("d"))[1];
//
//         // Replace commas with spaces
//         newArc = newArc.replace(/,/g, " ");
//
//         d3.select(this)
//           .append('path')
//             .attr('id', d => `yearsG-arc__${column}--${d.data.year}`)
//             .attr('d', newArc)
//             .style('fill', 'none');
//       });
//
//     yearsG.selectAll('.yearLabel')
//       .data(years.slice(0, years.length - 1))
//       .enter()
//       .append("text")
//         .classed('yearsG-label', true)   //Move the text from the start angle of the arc
//         .attr('text-anchor', 'left')
//         .attr("dy", -5) //Move the text down
//       .append("textPath")
//         .attr("startOffset", "10%")
//         .attr("xlink:href", d => `#yearsG-arc__${column}--${d.year}`)
//         .text(d => d.year );
//   }
//
//   const makeInteractive = () => {
//     const tooltip = d3.select('#tooltip');
//
//     const onMouseEnter = (datum) => {
//       tooltip.classed('active', true);
//       tooltip.style('opacity', 1);
//       tooltip.select('#tooltip-header').text(anomalyTitle);
//       tooltip.select('#tooltip-body')
//       .selectAll('p')
//         .data(description_en)
//         .enter()
//         .append('p')
//           .text(d => d);
//     }
//
//     const onMouseMove = (datum) => {
//       tooltip.style('transform', `translate(${datum.x}px, ${datum.y}px)`);
//     }
//
//     const onMouseLeave = (datum) => {
//       tooltip.classed('active', false);
//       tooltip.select('#tooltip-header').text('');
//       tooltip.select('#tooltip-body').text('');
//     }
//
//     d3.select(svgRef.current)
//       .append('rect')
//         .attr('fill', 'transparent')
//         .attr('width', svgSize)
//         .attr('height', svgSize)
//         .on("mouseenter", onMouseEnter)
//         .on("mousemove", onMouseMove)
//         .on("mouseleave", onMouseLeave);
//
//   }
//
//   useEffect(() => {
//     drawFrame();
//     drawScales();
//     drawPetals();
//     drawLegends();
//     // drawYears();
//     makeInteractive();
//   });
//
//
//   return (
//     <div id={divId} className={"flower-wrapper" + (props.main ? ' main' : '')}>
//       <svg
//         ref={svgRef}
//         width={svgSize}
//         height={svgSize}>
//       </svg>
//     </div>
//   )
//
// }
//
// export default AnomalyFlower;
