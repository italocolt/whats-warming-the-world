import { Component } from "react";

import BigFlower from './components/BigFlower.react';
import SmallFlowersGroup from './components/SmallFlowersGroup.react';

import './App.css';
import './components/style/BigFlower.css';
import './components/style/SmallFlower.css';
import './components/style/SmallFlowersGroup.css';


import flowersData from './data/flowers.js';


export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lang: new Date().getTimezoneOffset() === 180 ? 'br' : 'en',
      factor: 'observed',
      windowSize: this.getWindowSize(window.innerWidth),
    }

    this.changeLanguage = this.changeLanguage.bind(this);
    this.changeFactor = this.changeFactor.bind(this);

    this.changeWindowSize = this.changeWindowSize.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this.changeWindowSize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.changeWindowSize);
  }

  getWindowSize(width) {
      if (width >= 1200) {
        return 'lg';
      }
      else if (width >= 992) {
        return 'md';
      }
      else if (width >= 768) {
        return 'sm';
      }
      else {
        return 'xs';
      }
  }

  changeWindowSize() {
    const windowSize = this.getWindowSize(window.innerWidth);
    this.setState({windowSize});
  }

  changeLanguage() {
    this.setState({
      lang: this.state.lang === 'en' ? 'br' : 'en',
    });
  }

  changeFactor(d) {
    this.setState({
      factor: d,
    })
  }


  render() {

    const pageData = {
      title: {
        main: {
          en: "What's Really Warming the World?",
          br: "O que está Realmente Aquecendo a Terra?",
        },

        sub: {
          en: "An analysis of factors that influence in the climate.",
          br: "Uma análise dos fatores que influenciam no clima.",
        }
      }
    }

    const description = flowersData[this.state.factor].description;

    const bigFlowerDesc = flowersData[this.state.factor];

    if (this.state.windowSize === 'lg' | this.state.windowSize === 'md') {

      // Desktop Layout
      return (
        <div className={"app " + this.state.windowSize}>
          <div className={"main-container " + this.state.windowSize}>


            <div className="main-container__column">


              <div className={"title-container " + this.state.windowSize}>

                <h1 className={"title-container__main-title " + this.state.windowSize}>
                  {pageData.title.main[this.state.lang]}
                </h1>

                <h2 className={"title-container__sub-title " + this.state.windowSize}>
                  {pageData.title.sub[this.state.lang]}
                </h2>

              </div>


              <div className={"big-flower-container " + this.state.windowSize}>

                <BigFlower
                  lang={this.state.lang}
                  factor={this.state.factor}
                  description={bigFlowerDesc}
                  windowSize={this.state.windowSize}/>

              </div>
            </div>


            <div className={"main-container__column right " + this.state.windowSize}>

              <div className="right-container-up">

                <div className={"small-flowers-container " + this.state.windowSize}>
                  <div>

                    <SmallFlowersGroup
                      group='observed'
                      lang={this.state.lang}
                      changeFactor={this.changeFactor}
                      windowSize={this.state.windowSize}/>

                    <SmallFlowersGroup
                      group='natural'
                      lang={this.state.lang}
                      changeFactor={this.changeFactor}
                      windowSize={this.state.windowSize}/>

                  </div>
                  <div>

                    <SmallFlowersGroup
                      group='human'
                      lang={this.state.lang}
                      changeFactor={this.changeFactor}
                      windowSize={this.state.windowSize}/>

                  </div>

                </div>


                <div className="legend-container">
                  <div className="legend-container__title">Lorem ipsum dolor</div>
                  <div className="legend-container__text">
                    Nullam ut eros quis nunc ullamcorper dignissim convallis ut diam. Suspendisse in auctor ipsum. Fusce et diam ac sapien eleifend ultrices elementum id dui. Vestibulum sit amet dictum massa, ut lacinia nibh. Etiam at lorem venenatis, lobortis nunc ut, porta justo. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.
                  </div>
                </div>

              </div>


              <div className={"text-wrapper " + this.state.windowSize}>

                <h1 className={"text-wrapper__title " + this.state.windowSize}>
                  {description.title[this.state.lang]}
                </h1>

                <div className={"text-wrapper__text " + this.state.windowSize}>
                  {description.body[this.state.lang].map((d, i) => (
                    <p key={i}>{d}</p>
                  ))}
                </div>

              </div>




            </div>

          </div>

          <div className={"language-container " + this.state.windowSize}>
            <button
              className={"language-container__button " + this.state.windowSize}
              onClick={this.changeLanguage}>

              <span>
                {this.state.lang === 'en'
                  ? "EN-US"
                  : "PT-BR"}
              </span>

            </button>
          </div>

          <div className={"credit-container " + this.state.windowSize}>
            <div className="made-by">
              Made By
            </div>
            <div className="me-link">
              <a href="https://www.linkedin.com/in/icoliveira/" target="_blank">
                <span>Italo</span> <span>Oliveira</span>
              </a>
            </div>
          </div>
        </div>
      )
    }

    else {

      // Mobile Layout
      return (
        <div className={"app " + this.state.windowSize}>
          <div className={"main-container "  + this.state.windowSize}>

          <div className={"title-container " + this.state.windowSize}>

            <h1 className={"title-container__main-title " + this.state.windowSize}>
              {pageData.title.main[this.state.lang]}
            </h1>

            <h2 className={"title-container__sub-title " + this.state.windowSize}>
              {pageData.title.sub[this.state.lang]}
            </h2>

          </div>


          <div className={"main-container__row " + this.state.windowSize}>

            <h1 className={"text-wrapper__title " + this.state.windowSize}>
              {description.title[this.state.lang]}
            </h1>


            <div className={"big-flower-container " + this.state.windowSize}>

              <BigFlower
                lang={this.state.lang}
                factor={this.state.factor}
                description={bigFlowerDesc}
                windowSize={this.state.windowSize}/>

            </div>

            <div className={"credit-container " + this.state.windowSize}>
              <div className="made-by">
                Made By
              </div>
              <div className="me-link">
                <a href="https://www.linkedin.com/in/icoliveira/" target="_blank">
                  <span>Italo</span> <span>Oliveira</span>
                </a>
              </div>
            </div>

          </div>



          <div className={"text-wrapper__text " + this.state.windowSize}>
            {description.body[this.state.lang].map((d, i) => (
              <p key={i}>{d}</p>
            ))}
          </div>


          <div className={"small-flowers-container " + this.state.windowSize}>
            <div>

              <SmallFlowersGroup
                group='all'
                lang={this.state.lang}
                changeFactor={this.changeFactor}
                windowSize={this.state.windowSize}/>

            </div>

          </div>

          <div className={"language-container " + this.state.windowSize}>
            <button
              className={"language-container__button " + this.state.windowSize}
              onClick={this.changeLanguage}>

              <span>
                {this.state.lang === 'en'
                  ? "EN-US"
                  : "PT-BR"}
              </span>

            </button>
          </div>




          </div>
        </div>
      )
    }
  }
}
