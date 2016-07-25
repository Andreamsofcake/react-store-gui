import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { browserHistory } from 'react-router'
import * as _E from 'elemental'

import { currencyFilter } from '../utils/TsvUtils'

import TsvStore from '../stores/TsvStore'
import TsvActions from '../actions/TsvActions'
import {
	startGeneralIdleTimer,
	gotoDefaultIdlePage,
	emptyCart,
	cardTransaction,
	updateCredit
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('View2');

class View2 extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //TsvSettingsStore.setSession('currentView', 'View2');
    //TsvSettingsStore.setCache('currentLocation', '/View2');
    TsvActions.apiCall('enablePaymentDevice', "PAYMENT_TYPE_CREDIT_CARD");
    TsvActions.apiCall('enablePaymentDevice', "PAYMENT_TYPE_CASH");
    TsvActions.apiCall('fetchShoppingCart2', (err, cart) => {
    	if (err) Big.throw(err);
    	TsvSettingsStore.setCache('shoppingCart', cart);
    })

    updateCredit();
    var item = TsvSettingsStore.getConfig('pvr');

    // moved up here, closer to the actual declaration
    //if (!TsvSettingsStore.getConfig('pvr')) {
    if (!item) {
        return gotoDefaultIdlePage();
        //return;
    }

    this.state = {
      item: item,
      path: TsvSettingsStore.getCache('currentLocation'),
      bShowCouponBtn: false,
      imagePath: item.imagePath,
      imagePath2: item.imagePath, // yes, same var being set in two locations. meh
      summary: TsvSettingsStore.getCache('shoppingCart.summary'),
      nutritionFactsUrl: "",
      bShowNutritionFactsBtn: false,
      bShowCalories: false,
      calories: "0 Cal",
      bShowDesc: false,
      productName: item.productName,//default
      productDescription: item.description,
      bDisplayNavCgry: true

    };

    if (this.item.description == "") {
        this.state.bShowDesc = false;
    }

    if (TsvSettingsStore.getCache('custommachinesettings.bDisplayPrdGalleryOnDetailPage')) {
        this.state.bDisplayPrdGalleryOnDetailPage = true;
    }

    if (TsvSettingsStore.getCache('custommachinesettings.bHasShoppingCart')) {
    	this.state.checkoutOrAddToCartUrl = Translate.localizedImage('addToCart.png');
    } else {
        this.state.checkoutOrAddToCartUrl = Translate.localizedImage('checkout.png');
        if (TsvSettingsStore.getCache('custommachinesettings.bHasCouponCodes' )) {
          this.state.bShowCouponBtn = true;
        }
    }

    if ((this.state.item.Attributes) && (this.state.item.Attributes.AltLangImageGroup != null)) {
      for (var i=0; i < this.state.item.Attributes.AltLangImageGroup.length; i++) {
        if (this.state.item.Attributes.AltLangImageGroup[i]
          	.toLowerCase()
          	.indexOf(TsvSettingsStore.getCache('selectLanguage').toLowerCase()) > -1) {
            this.state.imagePath = "../Images/Products/ " + this.state.item.productID + " " + this.state.item.Attributes.AltLangImageGroup[i];
            this.state.imagePath2 = this.state.imagePath;
            break;
        }
      }
    }

  }

  back() {
      if (TsvSettingsStore.getCache('custommachinesettings.bHasShoppingCart')) {
          emptyCart();
          TsvSettingsStore.setConfig('itemsInCart', 0);
      }
      gotoDefaultIdlePage();
  }

  cardTransactionHandler(level) {

      // call to close any open fancybox's in the interface, we don't have fancyboxes so ok to comment out.
      /*what? $.fancybox.close();*/

      if (TsvSettingsStore.getCache('currentLocation') != TsvSettingsStore.getCache('currentLocation')) {
          Big.log("Path doesn't match. Not for View2, ignoring")
          return;
      }

      cardTransaction(event.data[0]);

      if (!TsvSettingsStore.getSession('bVendingInProcess')) {
          switch(level){
              case "CARD_INVALID_READ":
              case "CARD_DECLINED":
              case "CARD_CONNECTION_FAILURE":
              case "CARD_UNKNOWN_ERROR":
                  //Do nothing, don't go to card_vending page
                  break;
              default:
				  /*
				  // no longer using "currentLocation" global...
                  if(TsvSettingsStore.getCache('currentLocation') != "/CardVending"){
                      browserHistory.push("/CardVending");
                  }
                  */
                  break;
          }
      } else {
          Big.log("Ignoring credit card event, from View2, vend is in progress?");
      }
  }

  // Add change listeners to stores
	componentDidMount() {
		TsvStore.addChangeListener(this._onTsvChange);
	}
	
	componentWillUnmount() {
		TsvStore.removeChangeListener(this._onTsvChange);
	}
	
	_onTsvChange(event) {
		if (event && event.method === 'cardTransactionResponse') {
			let level = event.data[0];
			cardTransaction(level);
			if (!TsvSettingsStore.getSession('bVendingInProcess')) {
			  switch(level){
				  case "CARD_INVALID_READ":
				  case "CARD_DECLINED":
				  case "CARD_CONNECTION_FAILURE":
				  case "CARD_UNKNOWN_ERROR":
					  //Do nothing, don't go to card_vending page
					  break;

				  default:
					  /*
					  // no longer using "currentLocation" global...
					  if(TsvSettingsStore.getCache('currentLocation') != "/CardVending"){
						  browserHistory.push("/CardVending");
					  }
					  */
					  break;
			  }
			} else {
			  Big.log("Ignoring credit card event, from View2, vend is in progress?");
			}
		}
	}

  render() {
    return (
          <_E.Row className="prdDetail">
    		<h3>Dev warning: this may be a broken component, old code had disconnections in it</h3>
            <_E.Col>
              <img className="regularBtn" id="backImg" src={Translate.localizedImage('back.png')} onClick={this.back} />

              { this.state.bShowCheckout ? this.renderShowCheckout() : null }

              { this.state.bShowCouponBtn ? this.renderCouponButton() : null }
               <_E.Row id="View2Title">

                    <h1 className="mainHeaderText">{Translate.translate('View2', 'instructionMessage')}</h1> {/*what are these: data-fittext="1" data-fittext-min="20" data-fittext-max="36" */}

               </_E.Row>

               <_E.Row id="prdWrapper">

                      <_E.Row className="detail">

                        <_E.Col lg="50%" className="detail">
                            <img id="prdDetailImage" src={ this.state.imagePath } />
                        </_E.Col>

                        <_E.Col lg="50%" className="detail">

                                 <_E.Row className="detail">
                                     <p>{ currencyFilter( this.state.item.price )}</p>
                                 </_E.Row>

                        </_E.Col>

                      </_E.Row>

               </_E.Row>

               <p id="prdName">{ this.productName }</p>

               { this.bDisplayPrdGalleryOnDetailPage ? this.renderPrdGalleryOnDetailPage() : null }

          </_E.Col>
        </_E.Row>

    );

  }

  renderPrdGalleryOnDetailPage() {
    return (
      <_E.Row className="navGallery">

          <p id="navCgryTitle">{{ navCgryTitle }}</p>

          <_E.Row className="flex-container">

            { this.state.products.map((product, $index) => {
              return (
                <_E.Col key={$index} className={'flex-item' + (this.isActive($index) ? ' active' : '' )} >

                    <figure id={"prdImg" + $index} onClick={this.setPrdSelected.bind(this, product)}>

                        <figcaption>{product.productName}</figcaption>

                        <img src={product.imagePath} alt={product.description} title={product.description} />

                        <p className="prdPrice"> {currencyFilter(product.price) }</p>

                    </figure>

                </_E.Col>
              )
            })}

          </_E.Row >

      </_E.Row>
    );

  }

  renderCouponButton() {
	return (
	  <img className="regularBtn" id="couponImg" src={Translate.localizedImage('coupon.png')} onClick={this.coupon} alt="Coupon" />
	)
  }

  renderShowCheckout() {
    return (
      <img className="regularBtn" id="checkoutImg" src={ this.checkoutOrAddToCartUrl } onClick={this.checkout} />
    )
  }

}

export default View2
