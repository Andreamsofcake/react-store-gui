import React, { Component } from 'react'
import * as _E from 'elemental'

class CategoryListItem extends Component {

  clickHandler(e){
      this.props.onClick(this.props.data)
  }


  render() {
    var category = this.props.data
    return (
      <_E.Col basis="33%" className = "gallery" >

          <div className="product">

              <h4>{category.categoryName}</h4>)

              <img src={category.imagePath} alt={category.description} title={category.description} onClick={this.clickHandler.bind(this)} />

          </div>

      </_E.Col>

    );
  }

}


export default CategoryListItem
