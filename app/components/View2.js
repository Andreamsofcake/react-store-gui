import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'

class View2 extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'View2');
    TsvService.startGeneralIdleTimer();
    console.error('<<<<        FIXME: need to attach events to click and mouseover globally to TsvService.resetGeneralIdleTimer()        >>>>');
  };

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="view0">

          <div class="prdDetail">

              <!--<img class="logo" id="smallLogo" ng-src='Images/logo.png' ng-click="logoClicked()">-->

              <img class="regularBtn" id="backImg" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="back()">

              <img class="regularBtn" ng-if="bShowCheckout" id="checkoutImg" ng-src="{{ checkoutOrAddToCartUrl }}" err-src="../Images/checkout.png" ng-click="checkout()">

              <img ng-if="bShowCouponBtn" class="regularBtn" id="couponImg" ng-src="{{localizedImage('coupon.png')}}" err-src="../Images/coupon.png" ng-click="coupon()" alt="Coupon">


               <div id="view2Title">

                    <h1 data-fittext="1" data-fittext-min="20" data-fittext-max="36">{{translate(instructionMessage)}}</h1>

               </div>

               <div id="prdWrapper">

                   <table class="detail">

                      <tr class="detail">

                      <td class="detail"><!-- id="tdImg"-->
                          <img id="prdDetailImage" ng-src="{{ imagePath }}" err-src="../Images/ProductImageNotFound.png" />
                      </td>

                      <td class="detail">

                           <table class="detail">

                               <tr class="detail">
                                   <p>{{ currencyFilter(item.price)}}</p>
                               </tr>
                               </table>

                          </td>

                      </tr>

                  </table>

               </div>

               <p id="prdName">{{ productName }}</p>

               <div class="navGallery" ng-if="bDisplayPrdGalleryOnDetailPage">

                   <p id="navCgryTitle">{{ navCgryTitle }}</p>

                   <div class="container_slider">

                   <ul class="flex-container">

                       <li class = "flex-item" ng-repeat="product in products" ng-class="{'active':isActive($index)}">

                           <figure ng-click="setPrdSelected({{product.productID}});">

                               <figcaption>{{product.productName}}</figcaption>

                               <img ng-src="{{product.imagePath}}" alt="{{product.description}}" title="{{product.description}}" />

                               <p>{{ currencyFilter(product.price) }}</p>

                           </figure>

                       </li>

                   </ul>

               </div>

           </div>

        </div>

      </div>

    );
  }

}

export default View2
