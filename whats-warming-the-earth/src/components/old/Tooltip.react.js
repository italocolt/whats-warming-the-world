import { Component, useRef, useEffect } from "react";
import './style/Tooltip.css';

const Tooltip = (props) => {
  return (
    <div id="tooltip" className="tooltip">
      <div className="tooltip-header" id="tooltip-header"></div>
      <div className="tooltip-body" id="tooltip-body"></div>
      <div className="tooltip-footer" id="tooltip-footer"></div>
    </div>
  )
}

export default Tooltip;
