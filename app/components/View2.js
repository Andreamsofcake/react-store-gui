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
    TsvService.enablePaymentDevice("PAYMENT_TYPE_CREDIT_CARD");
    TsvService.enablePaymentDevice("PAYMENT_TYPE_CASH");
    RootscopeActions.setCache('shoppingCart', TsvService.fetchShoppingCart2());
    RootscopeActions.updateCredit();

    this.state = {
      item: RootscopeStore.getConfig('pvr'),
      path: RootscopeStore.getCache('currentLocation'),
      bShowCouponBtn: false,
      imagePath: item.imagePath,
      imagePath2: this.imagePath,
      summary: RootscopeStore.getCache('shoppingCart.summary'),
      nutritionFactsUrl: "",
      bShowNutritionFactsBtn: false
      bShowCalories: false,
      calories: "0 Cal",
      bShowDesc: false,
      productName: item.productName,//default
      productDescription: item.description,
      bDisplayNavCgry: true

    };

    if(this.item.description == ""){
        this.state.bShowDesc = false;
    }

    if((RootscopeStore.getCache('custommachinesettings.bDisplayPrdGalleryOnDetailPage'))
    {
        this.state.bDisplayPrdGalleryOnDetailPage = true;
    }

    if (!RootscopeStore.getConfig('pvr')) {
        TsvService.gotoDefaultIdlePage();
        return;
    }

    if(RootscopeStore.getCache('custommachinesettings.bHasShoppingCart')){
      this.setState({
				checkoutOrAddToCartUrl: Translate.localizedImage('addToCart.png')
      })
    }else{
      this.setState({
        checkoutOrAddToCartUrl: Translate.localizedImage('checkout.png')
      })
        if((RootscopeStore.getCache('custommachinesettings.bHasCouponCodes' )){
          this.state.bShowCouponBtn = true;
        }
    }

    if(this.item.Attributes) && (this.item.Attributes.AltLangImageGroup != null){
      for (var i=0; i<Object.keys(this.item.Attributes.AltLangImageGroup).length; i++){
        if(this.item.Attributes.AltLangImageGroup[i]
          .toLowerCase()
          .indexOf(RootscopeActions.getCache('selectLanguage').toLowerCase()) > -1) {
            this.state.imagePath = "../Images/Products/ " + this.item.productID + " " + this.item.Attributes.AltLangImageGroup[i];
            this.state.imagePath2 = this.imagePath;
            break;
        }
      }
    }

  };

  back() {
      if(RootscopeStore.getCache('custommachinesettings.bHasShoppingCart'){
          TsvService.emptyCart();
          RootscopeActions.setConfig('itemsInCart', 0);
      }
      TsvService.gotoDefaultIdlePage();
  }

  cardTransactionHandler(level) {

      {/*what? $.fancybox.close();*/}

      if (RootscopeStore.getCache('currentLocation') != this.path) {
          console.log("Path doesn't match. Not for view2, ignoring")
          return;
      }

      TsvService.cardTransaction(level);

      if(!RootscopeStore.getSession('bVendingInProcess')) {
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
    TSVService.subscribe("cardTransactionResponse", this.cardTransactionHandler.bind(this), "app.view2");
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <div className="view0">

          <div className="prdDetail">

              <img className="regularBtn" id="backImg" src={Translate.localizedImage('back.png')} ng-click="back()">

              <img className="regularBtn" ng-if="bShowCheckout" id="checkoutImg" src={ checkoutOrAddToCartUrl } ng-click="checkout()">

              { if (this.state.bShowCouponBtn) { this.renderCouponButton() } }

               <div id="view2Title">

                    <h1>{Translate.translate('View2', 'instructionMessage')}</h1> {/*what are these: data-fittext="1" data-fittext-min="20" data-fittext-max="36" */}

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

      </div>

    );
  }

  renderPrdGalleryOnDetailPage() {
    return (
      <div className="navGallery">

          <p id="navCgryTitle">{{ navCgryTitle }}</p>

          <div className="container_slider">

          <ul className="flex-container">

            {products.map((product, $index) => {
              return (
                <li key={$index} className={'flex-item' + this.isActive($index) ? ' active'} >

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
    )
  }

  renderCouponButton() {
    return (
      <img className="regularBtn" id="couponImg" src={Tanslate.localizedImage('coupon.png')} onClick={this.coupon()} alt="Coupon">
    )
  }

}

export default View2
