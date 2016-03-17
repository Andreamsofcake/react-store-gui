import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'

class CcVending extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

  }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="ccVending">

        <img id="prdImg" src={ item.imagePath } alt="productImage" />

        <p>Total Price: { summary.TotalPrice | currency }</p>

        <p>{ this.state.cardTransactionResponse }</p>

        <img src="../Images/creditcards.png" alt="creditcards" width="461" height="73"/>

        <img id="creditCards" src="../Images/creditcards.png" alt="creditcards" />

        { if (this.state.showCancelBtn) { this.renderCancelBtn()} }

        { if (this.state.showSpinner) { this.renderSpinner()} }
      </div>
    );
  }

  renderCancelBtn(){
    return(
      <img id="cancelImg" src="../Images/cancel.png" onClick={this.cancel()} />
    )
  }

  renderSpinner(){
    return(
      <_E.Spinner size="md" type="inverted" />
    )
  }


}

export default CcVending
