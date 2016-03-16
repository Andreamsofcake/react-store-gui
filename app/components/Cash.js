import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../store/RootscopeStore'
import browserHistory from 'react-router'

class Cash extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

  }
  function loadingSpinner(){ console.warn(‘spinner called for, but we need elemental’) }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="Cash" >

        <img id="prdImg" src={ item.imagePath} alt="productImage" />

        <div id = "cashMsg">
            <p>Total: { summary.TotalPrice }</p>

            <p>Inserted: {this.insertedAmount }</p>
        </div>

        <p id="hint">{ this.hintMsg }</p>


        { if (this.state.showCancelBtnCash) { this.renderCancelBtnCash()} }

        <canvas id="spinner"></canvas>

      </div>
    );
  }

  renderCancelBtnCash(){
    return(
      <img id="cancelImg" src="../Images/cancel.png" onClick={this.cancel()} />
    )
  }

}

export default Cash
