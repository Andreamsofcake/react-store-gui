import React from 'react'
import TsvService from '../lib/TsvService'
import * as Translate from '../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../store/RootscopeStore'
import browserHistory from 'react-router'

class Category_Search extends Component {

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
      <div className="Category_Search">
          { if (this.state.adminBtn) { this.renderAdminButton() } }


          <h2>{Translate.translate('Select_Category', 'SelectCategory')}</h2>

          <img className="arrow next" src="Images/next.png" alt="next" ng-click="showNext()">-->

          {/*slider container*/}
          <div className="container_slider">

              <ul className="nav">

                  <li className = "gallery" ng-repeat="category in categories">

                      <figure ng-click="setPrdSelected({{product.productID}});">

                          <figcaption ng-if="bShowCgryTitle">{{category.categoryName}}</figcaption>

                          <img id="img{{$index}}" ng-src="{{category.imagePath}}" alt="{{category.description}}" title="{{category.description}}" ng-click="fetchCategory({{category.categoryID}});" />

                      </figure>

                  </li>

              </ul>

          </div>

          <img className="regularBtn" id="backImg" ng-show="bSubCgry" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="back()">

      </div>
    );
  }

renderAdminButton() {
  return (
    <button id="adminBtn" noClick={this.admin()}></button>
  )
}

}


export default Category_Search
