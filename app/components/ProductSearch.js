import React from 'react'
import RootscopeActions from '../actions/RootscopeActions'
import TsvService from '../lib/TsvService'
import Translate from '../lib/Translate'
import RootscopeStore from '../store/RootscopeStore'

class Product_Search extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
    this.bShowBackBtn = false;

    this.setOpacity = function setOpacity(stockCount) {
      if (stockCount == 0) {
          var style = "opacity:0.4";
      } else {
          var style = "opacity:1";
      }
      return style;
    };
    
    RootscopeStore.setStore('bDisplayCgry', false);
    RootscopeActions.setConfig('updateCredit', RootscopeStore.getCache('credit') && true);

    // this might be as simple as RootscopeActions.setConfig('bAbleToLogin', false)
    TSVService.disableLoginDevices();
  }

  getInitialState() {
    return {};
  }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="Product_Search" onClick={this.idleClicked}>
      	<img id="idleImg" src={Translate.localizedImage('idle.png')} alt="IdlePage" />
      </div>
    );
  }

  idleClicked(e) {
  	e.preventDefault();
  	// probably triggers a route change, according to the current TSVService func
  	TSVService.idleClicked();
  }

}

export default Product_Search
