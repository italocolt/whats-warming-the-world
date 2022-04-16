import React, {Component} from 'react';
import PropTypes from 'prop-types';
import SmallFlower from './SmallFlower.react';
import flowersData from '../data/flowers.js';


export default class SmallFlowersGroup extends Component {
  groups = {
    observed: {
      title: {en: 'Observed', br: 'Observado'},
      factors: ['observed'],
    },

    natural: {
      title: {en: 'Natural Forcings', br: 'Fatores Naturais'},
      factors: ["orbital_changes", "solar", "volcanic"],
    },

    human: {
      title: {en: 'Human Forcings', br: 'Fatores Humanos'},
      factors: ["greenhouse_gases", "land_use", "anthropogenic_tropospheric_aerosol", "ozone"],
    },

    all: {
      title: {en: '', br: ''},
      factors: ['observed', "orbital_changes", "solar", "volcanic", "greenhouse_gases", "land_use", "anthropogenic_tropospheric_aerosol", "ozone"]
    }
  }

  constructor(props) {
    super(props);

    this.groupTitle = this.groups[props.group].title[props.lang];
    this.factors = this.groups[props.group].factors;

    this.state = {
      title: this.groupTitle,
      hover: false,
    };

    this.changeTitle = this.changeTitle.bind(this);
  }

  changeTitle(d) {
    this.setState({
      hover: d,
    })
  }

  render() {

    const isMobile = ['xs', 'sm'].includes(this.props.windowSize);

    return (
      <div className="small-flowers-group">

        {!isMobile && (
          <div className={`small-flowers-group__title ${this.props.group} ${this.props.windowSize}`}>
            <span>{this.groups[this.props.group].title[this.props.lang]}</span>


              {(this.state.hover && this.factors.length > 1) && (
                <span>{this.state.hover}</span>
              )}

          </div>
        )}


          <div className="small-flowers-group__flowers">
            {this.factors.map(d => (
              <div className="small-flowers-wrapper"
                key={d}
                onMouseOver={() => this.changeTitle(flowersData[d].sTitle[this.props.lang])}
                onMouseLeave={() => this.changeTitle(false)}>

                <SmallFlower
                  key={d}
                  factor={d}
                  onClickHandler={() => this.props.changeFactor(d)}/>

                {isMobile && (
                <span>{flowersData[d].sTitle[this.props.lang]}</span>
                )}

              </div>

              ))
            }
        </div>
      </div>
    );
  }
}



SmallFlowersGroup.defaultProps = {
  className: '',
};

SmallFlowersGroup.propTypes = {
  id: PropTypes.string,
  className: PropTypes.string,
  figure: PropTypes.object,
  setProps: PropTypes.func,
  loading_state: PropTypes.shape({
    is_loading: PropTypes.bool,
    prop_name: PropTypes.string,
    component_name: PropTypes.string,
  }),
  persistence: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.string,
    PropTypes.number,
  ]),
  persisted_props: PropTypes.arrayOf(PropTypes.oneOf(['value'])),
  persistence_type: PropTypes.oneOf(['local', 'session', 'memory']),
};
