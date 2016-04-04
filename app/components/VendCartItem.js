import React, { Component } from 'react'
import * as _E from 'elemental'

class CardVendCartItem extends Component {

  clickHandler(e){
      this.props.onClick(this.props.data)
  }


  render() {
    var category = this.props.data
    return (
      <_E.Col basic="33%" key={$index}>
        <img id={"prdImg"+$index} src={ prd.imagePath} alt="productImage" />
      </_E.Col>
    );
  }

}


export default CategoryListItem
