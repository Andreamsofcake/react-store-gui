import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class View2 extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'View2');
    TsvService.enablePaymentDevice("PAYMENT_TYPE_CREDIT_CARD");
    TsvService.enablePaymentDevice("PAYMENT_TYPE_CASH");
    TsvService.fetchShoppingCart2(null, function(err, cart) {
    	if (err) throw err;
    	RootscopeActions.setCache('shoppingCart', cart);
    })

    RootscopeActions.updateCredit();
    var item = RootscopeStore.getConfig('pvr');

    // moved up here, closer to the actual declaration
    //if (!RootscopeStore.getConfig('pvr')) {
    if (!item) {
        TsvService.gotoDefaultIdlePage();
        //return;
    }

    this.state = {
      item: item,
      path: RootscopeStore.getCache('currentLocation'),
      bShowCouponBtn: false,
      imagePath: item.imagePath,
      imagePath2: item.imagePath, // yes, same var being set in two locations. meh
      summary: RootscopeStore.getCache('shoppingCart.summary'),
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

    if (RootscopeStore.getCache('custommachinesettings.bDisplayPrdGalleryOnDetailPage')) {
        this.state.bDisplayPrdGalleryOnDetailPage = true;
    }

    if (RootscopeStore.getCache('custommachinesettings.bHasShoppingCart')) {
    	this.state.checkoutOrAddToCartUrl = Translate.localizedImage('addToCart.png');
    } else {
        this.state.checkoutOrAddToCartUrl = Translate.localizedImage('checkout.png');
        if (RootscopeStore.getCache('custommachinesettings.bHasCouponCodes' )) {
          this.state.bShowCouponBtn = true;
        }
    }

    if ((this.state.item.Attributes) && (this.state.item.Attributes.AltLangImageGroup != null)) {
      for (var i=0; i < this.state.item.Attributes.AltLangImageGroup.length; i++) {
        if (this.state.item.Attributes.AltLangImageGroup[i]
          	.toLowerCase()
          	.indexOf(RootscopeStore.getCache('selectLanguage').toLowerCase()) > -1) {
            this.state.imagePath = "../Images/Products/ " + this.state.item.productID + " " + this.state.item.Attributes.AltLangImageGroup[i];
            this.state.imagePath2 = this.state.imagePath;
            break;
        }
      }
    }

  }

  back() {
      if (RootscopeStore.getCache('custommachinesettings.bHasShoppingCart')) {
          TsvService.emptyCart();
          RootscopeActions.setConfig('itemsInCart', 0);
      }
      TsvService.gotoDefaultIdlePage();
  }

  cardTransactionHandler(level) {

      // call to close any open fancybox's in the interface, we don't have fancyboxes so ok to comment out.
      /*what? $.fancybox.close();*/

      if (RootscopeStore.getCache('currentLocation') != RootscopeStore.getCache('currentLocation')) {
          console.log("Path doesn't match. Not for view2, ignoring")
          return;
      }

      TsvService.cardTransaction(level);

      if (!RootscopeStore.getSession('bVendingInProcess')) {
          switch(level){
              case "CARD_INVALID_READ":
              case "CARD_DECLINED":
              case "CARD_CONNECTION_FAILURE":
              case "CARD_UNKNOWN_ERROR":
                  //Do nothing, don't go to card_vending page
                  break;
              default:
                  if(RootscopeStore.getCache('currentLocation') != "/Card_Vending"){
                      browserHistory.push("/Card_Vending");
                  }
                  break;
          }
      } else {
          console.log("Ignoring credit card event, from view2, vend is in progress?");
      }
  }

  // Add change listeners to stores
  componentDidMount() {
    TsvService.subscribe("cardTransactionResponse", this.cardTransactionHandler.bind(this), "app.view2");
  }

  // Remove change listers from stores
  componentWillUnmount() {
    TsvService.subscribe("cardTransactionResponse", "app.view2");
  }

  render() {
    return (
          <_E.Row className="prdDetail">
    		<h3>Dev warning: this may be a broken component, old code had disconnections in it</h3>
            <_E.Col>
              <img className="regularBtn" id="backImg" src={Translate.localizedImage('back.png')} ng-click="back()" />

              <img className="regularBtn" ng-if="bShowCheckout" id="checkoutImg" src={ checkoutOrAddToCartUrl } ng-click="checkout()" />

              { this.state.bShowCouponBtn ? this.renderCouponButton() : null }
               <_E.Row id="view2Title">

                    <h1>{Translate.translate('View2', 'instructionMessage')}</h1> {/*what are these: data-fittext="1" data-fittext-min="20" data-fittext-max="36" */}

               </_E.Row>

               <_E.Row id="prdWrapper">

                      <_E.Row className="detail">

                        <_E.Col lg="50%" className="detail">
                            <img id="prdDetailImage" src={ this.imagePath } />
                        </_E.Col>

                        <_E.Col lg="50%" className="detail">

                                 <_E.Row className="detail">
                                     <p>{ TsvService.currencyFilter(item.price)}</p>
                                 </_E.Row>

                        </_E.Col>

                      </_E.Row>

               </_E.Row>

               <p id="prdName">{ this.productName }</p>

               { this.bDisplayPrdGalleryOnDetailPage ? this.renderPrdGalleryOnDetailPage() : null }

          </_E.Col>
        </_E.Row>

    );

    /*
    <h3>Dev warning: this may be a broken component, old code had disconnections in it</h3>
        <div className="prdDetail">

            <img className="regularBtn" id="backImg" src={Translate.localizedImage('back.png')} ng-click="back()">

            <img className="regularBtn" ng-if="bShowCheckout" id="checkoutImg" src={ checkoutOrAddToCartUrl } ng-click="checkout()">

            { if (this.state.bShowCouponBtn) { this.renderCouponButton() } }

             <div id="view2Title">

                  <h1>{Translate.translate('View2', 'instructionMessage')}</h1> {/*what are these: data-fittext="1" data-fittext-min="20" data-fittext-max="36" }

             </div>

             <div id="prdWrapper">

                 <table className="detail">

                    <tr className="detail">

                    <td className="detail">
                        <img id="prdDetailImage" src={ this.imagePath } />
                    </td>

                    <td className="detail">

                         <table className="detail">

                             <tr className="detail">
                                 <p>{ TsvService.currencyFilter(item.price)}</p>
                             </tr>
                             </table>

                        </td>

                    </tr>

                </table>

             </div>

             <p id="prdName">{ this.productName }</p>

             {if (this.bDisplayPrdGalleryOnDetailPage){ this.renderPrdGalleryOnDetailPage()}}

         </div>

      </div>


    */
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

                        <p className="prdPrice"> {TsvService.currencyFilter(product.price) }</p>

                    </figure>

                </_E.Col>
              )
            })}

          </_E.Row >

      </_E.Row>
    );


    /*
      <div className="navGallery">

          <p id="navCgryTitle">{this.state.navCgryTitle || 'No navCgryTitle'}</p>

          <div className="container_slider">

          <ul className="flex-container">

            {products.map( (product, $index) => {
              return (
                <li key={$index} className={'flex-item' + (this.isActive($index) ? ' active' : '' )} >

                    <figure id={"prdImg" + $index} onClick={this.setPrdSelected.bind(this, product)}>

                        <figcaption>{product.productName}</figcaption>

                        <img src={product.imagePath} alt={product.description} title={product.description} />

                        <p className="prdPrice"> {TsvService.currencyFilter(product.price) }</p>

                    </figure>

                </li>
              )
            })}

          </ul>

	      </div>
      </div>
    */
  }
  
  renderCouponButton() {
	return (
	  <img className="regularBtn" id="couponImg" src={Translate.localizedImage('coupon.png')} onClick={this.coupon} alt="Coupon" />
	)
  }

}

export default View2
