import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'

class CC_VENDING extends Component {

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

          <table className="cart">

              <tr>

                  <td data-ng-repeat="prd in cart">

                      <img id="prdImg" ng-src="{{ prd.imagePath }}" err-src="../Images/ProductImageNotFound.png" alt="productImage">

                  </td>

              </tr>

          </table>

          <p ng-if="summary.TotalPrice >= 1">{{ translate('TotalPriceLabel') }}{{ currencyFilter(summary.TotalPrice) }}</p>

          <p id = "cardResponse">{{ cardTransactionResponse }}</p>

          <img id="creditCards" src="../Images/creditcards.png" alt="creditcards">

          <p><img className="regularBtn" id="cancelImg" ng-src="{{localizedImage('cancel.png')}}" err-src="../Images/cancel.png" ng-show="showCancelBtn" ng-click="cancel()"></p>

          <canvas id="spinner"></canvas>

      </div>

    );
  }


}

export default CC_VENDING
