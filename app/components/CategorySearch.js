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

          <img className="arrow next" src="Images/next.png" alt="next" onClick={this.showNext()}/>

          {/*slider container*/}
          <div className="container_slider">

              <ul className="nav">

              {categories.map((category, $index) => {
                return (
                  <li key={$index} className = "gallery" >

                      <figure onClick={this.setPrdSelected.bind(this, product.productID)} />

                          { if (this.state.bShowCgryTitle) { this.renderCategoryName() } }

                          <img id={$index} src={category.imagePath} alt={category.description} title={category.description} onClick={this.fetchCategory.bind(this, category.categoryID) />

                      </figure>

                  </li>
                )
              })

              </ul>

          </div>

          { if (this.state.bSubCgry) { this.renderSubCgry()} }

      </div>
    );
  }

  renderSubCgry() {
    return (
      <img className="regularBtn" id="backImg" ng-show="bSubCgry" src={Translate.localizedImage('back.png')} noClick={this.back()} /> {/*err-src="../Images/back.png" */}
    )
  }

  renderAdminButton() {
    return (
      <button id="adminBtn" noClick={this.admin()}></button>
    )
  }

  renderCategoryName() {
    return (
        <figcaption>{{category.categoryName}}</figcaption>
    )
  }



}


export default Category_Search
