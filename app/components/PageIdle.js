import React from 'react'
import RootscopeActions from '../actions/RootscopeActions'
import TsvService from '../lib/TsvService'
import Translate from '../lib/Translate'
import RootscopeStore from '../store/RootscopeStore'

class Page_Idle extends Component {

  constructor(props, context) {
  	// MUST call super() before any this.*
  	super(props, context);
    
    RootscopeActions.setConfig('bDisplayCgryNavigation', false);
    RootscopeActions.setConfig('bShowCredit', RootscopeStore.getCache('credit') && true);
    
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
      <div className="Page_Idle" onClick={this.idleClicked}>
      	<img id="idleImg" src={Translate.localizedImage('idle.png')} alt="IdlePage" />
      </div>
    );
  }
  
  idleClicked(e) {
  	e.preventDefault();
  	// probably triggers a route change, according to the current TSVService func
  	TSVService.idleClicked();
  }

});

export default Page_Idle
