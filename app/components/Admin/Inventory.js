import React, { Component } from 'react'
import * as Translate from '../../../lib/Translate'

import TsvSettingsStore from '../../stores/TsvSettingsStore'
import { Link, browserHistory } from 'react-router'
import * as _E from 'elemental'

import StorefrontStore from '../../stores/StorefrontStore'

import TsvActions from '../../actions/TsvActions'
import {
	KillGuiTimer,
} from '../../utils/TsvUtils'

import Log from '../../utils/BigLogger'
var Big = new Log('AdminInventory');

class AdminInventory extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //TsvSettingsStore.setSession('currentView', 'AdminInventory');
    this.state = {
      instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
      machineID: 0,
      num: "",
      maxChars: TsvSettingsStore.getConfig('bDualMachine') ? 3 : 2,
      inventoryGuiState: 'selectSlot',
      showKeypad: false
    }

    if(TsvSettingsStore.getCache('machineList').length > 1){
        this.state.bShowDropDownForMachines = true;
    }
  }

  // Add change listeners to stores
  componentDidMount() {
    TsvActions.apiCall('fetchMachineIds', (err, ids) => {
        TsvSettingsStore.setCache('machineList', ids);
        if (ids && ids.length > 1) {
        	this.setState({
        		bShowDropDownForMachines: true
        	});
        }
      });

  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  fillMachine(){
		if (this.state.machineID) {
		  TsvActions.apiCall('fillMachine', this.state.machineID.toString());
		} else {
			alert('error, cannot fill the machine as there is no machineID');
		}
  }

  fillCoil(){
    if (this.state.coilNumber != "") {
		TsvActions.apiCall('adminValidateProductByCoil', this.state.coilNumber, (err, data) => {
			if (err) {
				Big.throw(err);
				return;
			}
			let state = { verifiedProductData: data };

			switch (state.verifiedProductData.result) {
				case "UNKNOWN":
					state.instructionMessage = Translate.translate('AdminInventory', 'UnknownProduct')
					setTimeout( () => {
						this.setState({
						  instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
						  inventoryGuiState: 'selectSlot',
						  num: ""
						});
					}, 3000);
					break;

				case "INVALID_PRODUCT":
					state.instructionMessage = Translate.translate('AdminInventory', 'InvalidProduct')
					setTimeout( () => {
						this.setState({
						  instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
						  inventoryGuiState: 'selectSlot',
						  num: ""
						});
					}, 3000);
					break;

				default:
					state.instructionMessage = 'Filling slot for '+(this.state.verifiedProductData.name || this.state.verifiedProductData.productName)+', one moment please...'; //Translate.translate('AdminInventory', 'EnterStockAmount');
					state.coilNumber = this.state.num;
					state.num = '';
					state.inventoryGuiState = 'processing';
					TsvActions.apiCall('fillCoil', state.coilNumber, () => {
						// artificial delay for GUI flow:
						setTimeout( () => {
							this.setState({
							  instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
							  inventoryGuiState: 'selectSlot',
							  num: "",
							  coilNumber: null
							});
						}, 3000);
					});
					break;
			}
			this.setState(state);

		});
    }
  }

  selectSlot() {
  	let num = parseInt(this.state.num);
  	if (num) {
		TsvActions.apiCall('adminValidateProductByCoil', this.state.num, (err, data) => {
			if (err) {
				Big.throw(err);
				return;
			}
			let state;
			if (data) {
				var data2 = StorefrontStore.decorateProducts(data);
				state = {
					verifiedProductData: data2,
					productImages: StorefrontStore.getImagesForProduct(data2)
				};
			} else {
				state = {
					verifiedProductData: data
				};
			}
			Big.log('verifiedProductData');
			Big.log(state);

			switch (data.result) {
				case "UNKNOWN":
					state.instructionMessage = Translate.translate('AdminInventory', 'UnknownProduct');
					setTimeout( () => {
						this.setState({
						  instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
						  inventoryGuiState: 'selectSlot',
						  num: ""
						});
					}, 3000);
					break;

				case "INVALID_PRODUCT":
					state.instructionMessage = Translate.translate('AdminInventory', 'InvalidProduct');
					setTimeout( () => {
						this.setState({
						  instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
						  inventoryGuiState: 'selectSlot',
						  num: ""
						});
					}, 3000);
					break;

				default:
					state.instructionMessage = Translate.translate('AdminInventory', 'EnterStockAmount');
					state.coilNumber = this.state.num;
					state.num = '';
					state.inventoryGuiState = 'stock';
					break;
			}
			this.setState(state);
		});
	}

  }
  
  cancelSlot() {
        this.setState({
          inventoryGuiState: 'selectSlot',
          num: "",
          verifiedProductData: null,
          coilNumber: null
        })
  }

  addStock(){
      if (this.state.coilNumber != "" && this.state.num != ""){
		  this.setState({
		  	instructionMessage: 'Adding '+this.state.num+' '+(this.state.verifiedProductData.name || this.state.verifiedProductData.productName)+' from stock count, one moment please.',
		  	inventoryGuiState: 'processing'
		  });
          TsvActions.apiCall('addStock', this.state.coilNumber, this.state.num, (err, data) => {
			  TsvActions.apiCall('adminValidateProductByCoil', this.state.coilNumber, (err, data) => {

	          	  // FIXME: blindly assuming that we get good product data after a successful coil select

	          	  var data2 = StorefrontStore.decorateProducts(data);
				  this.setState({
					verifiedProductData: data2,
					productImages: StorefrontStore.getImagesForProduct(data2),
					num: ""
				  });

				  setTimeout( () => {
					  this.setState({
						instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
						inventoryGuiState: 'selectSlot',
						num: ""
					  });
				  }, 2000);
			  });
          });
      } else {
		  Big.warn('tried to addStock, but did not have both "coilNumber" and "num" in state');
      }
  }

  removeStock(){
      if (this.state.coilNumber != "" && this.state.num != ""){
		  this.setState({
		  	instructionMessage: 'Removing '+this.state.num+' '+(this.state.verifiedProductData.name || this.state.verifiedProductData.productName)+' from stock count, one moment please.',
		  	inventoryGuiState: 'processing'
		  });
          TsvActions.apiCall('removeStock', this.state.coilNumber, this.state.num, (err, data) => {
	          TsvActions.apiCall('adminValidateProductByCoil', this.state.coilNumber, (err, data) => {

	          	  // FIXME: blindly assuming that we get good product data after a successful coil select

	          	  var data2 = StorefrontStore.decorateProducts(data);
				  this.setState({
					verifiedProductData: data2,
					productImages: StorefrontStore.getImagesForProduct(data2),
					// just reference it direct if you need... verifiedProductData.inventoryCount
					//stockCount: "Stock Count: " + data.inventoryCount,
					num: ""
				  });

				  setTimeout( () => {
					  this.setState({
						instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
						inventoryGuiState: 'selectSlot',
						num: ""
					  });
				  }, 2000);
				});
			});
      } else {
		  Big.warn('tried to removeStock, but did not have both "coilNumber" and "num" in state');
      }
  }

  clear() {
    this.setState({
      num: ""
    })
  }

  press(digit) {
  	let num = this.state.num;
    if(num.length < this.state.maxChars){
    	num += digit;
    }
    this.setState({
      num: parseInt(num).toString()
    });
  }

  getMachineSelectOptions() {
    var options = [];
    TsvSettingsStore.getCache('machineList').forEach( MACHINE => {
      options.push({ label: 'Machine ' + MACHINE, value: MACHINE });
    })
    return options;
  }

  render() {
    return (

      <_E.Row className="inventory" style={{maxWidth:'50%',margin: '1em auto'}}>

        	<h1 style={{fontWeight:300}}>Inventory</h1>
          <_E.Col>

            <h2 id="instruction">{ this.state.instructionMessage }</h2>
            
			{this.renderSelectSlot()}
			{this.renderManageStockForSlot()}

          </_E.Col>


      </_E.Row>

    );
  }
  
  renderSelectSlot() {
  	if (this.state.inventoryGuiState === 'selectSlot') {
		return (
		  <div>

            {this.renderKeypad()}

			<_E.Row><p>{' '}</p></_E.Row>
            <_E.Row>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg" type="warning" onClick={this.clear.bind(this)}>Clear</_E.Button></_E.Col>
				<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}>&nbsp;</_E.Col>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} /></_E.Col>
            </_E.Row>
            <_E.Row>
                <_E.Col sm="1/4" md="1/4" lg="1/4" style={{textAlign:'center'}}></_E.Col>
				<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'center'}}><_E.Button style={{margin:'0 auto',display:'block'}} size="lg" type="primary" onClick={this.selectSlot.bind(this)}>Select Slot {this.state.num}</_E.Button></_E.Col>
                <_E.Col sm="1/4" md="1/4" lg="1/4" style={{textAlign:'center'}}></_E.Col>
            </_E.Row>

			<_E.Row><p>{' '}</p></_E.Row>
            <_E.Row>
              <_E.Col><div style={{textAlign:'center', border:'1px solid #dfdfdf',backgroundColor:'#fff',borderRadius:'4px',margin: '20px auto'}}><h2>Slot number: {this.state.num}</h2></div></_E.Col>
            </_E.Row>

			<_E.Row><p>{' '}</p></_E.Row>
			<_E.Row>
				<_E.Col sm="1/4" md="1/4" lg="1/4" style={{textAlign:'center'}}></_E.Col>
				<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'center'}}>
					{ TsvSettingsStore.getCache('machineList').length > 1 ? (<_E.FormSelect name="selectMachine" value={this.state.machineID} options={this.getMachineSelectOptions()} />) : null }
					{/*
					<p><_E.Button size="lg" id="fillMachine" onClick={this.fillMachine.bind(this)}>{Translate.translate('AdminInventory', 'FillMachine')}</_E.Button></p>
					<h4 id="displayMachine">{Translate.translate('AdminInventory','FillAllCoilsForMachine')} { this.state.machineID + 1 }</h4>
					*/}
				</_E.Col>
				<_E.Col sm="1/4" md="1/4" lg="1/4" style={{textAlign:'center'}}></_E.Col>
			</_E.Row>

		  </div>
		);
	}
	return null;
  }

  renderManageStockForSlot() {
  	if (this.state.inventoryGuiState === 'stock') {
		return (
		  <div>

            {this.renderKeypad()}

			<_E.Row><p>{' '}</p></_E.Row>
            <_E.Row>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg" type="warning" onClick={this.clear.bind(this)}>Clear</_E.Button></_E.Col>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}>&nbsp;</_E.Col>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg" type="primary" onClick={this.cancelSlot.bind(this)}><_E.Glyph icon="circle-slash" />Cancel</_E.Button></_E.Col>
            </_E.Row>

			<_E.Row><p>{' '}</p></_E.Row>
            <_E.Row>
              <_E.Col><div style={{textAlign:'center', border:'1px solid #dfdfdf',backgroundColor:'#fff',borderRadius:'4px',margin: '20px auto'}}><h2>stock amount: {this.state.num}</h2></div></_E.Col>
            </_E.Row>

			<_E.Row><p>{' '}</p></_E.Row>
			<_E.Row>
				<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'center'}}><_E.Button size="lg" style={{float:'left'}} type="danger" onClick={this.removeStock.bind(this)}><_E.Glyph icon="dash" />Remove {this.state.num} Items</_E.Button></_E.Col>
				<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'center'}}><_E.Button size="lg" style={{float:'right'}} type="success" onClick={this.addStock.bind(this)}><_E.Glyph icon="plus" />Add {this.state.num} Items</_E.Button></_E.Col>
			</_E.Row>

			<_E.Row><p>{' '}</p></_E.Row>
			<_E.Row>
				<_E.Col sm="1/4" md="1/4" lg="1/4" style={{textAlign:'center'}}></_E.Col>
				<_E.Col sm="1/2" md="1/2" lg="1/2"><_E.Button size="lg" type="primary" onClick={this.fillCoil.bind(this)} style={{margin:'0 auto',display:'block'}}>Fill Slot To Par</_E.Button></_E.Col>
				<_E.Col sm="1/4" md="1/4" lg="1/4" style={{textAlign:'center'}}></_E.Col>
			</_E.Row>

			{/*<_E.Row>
				<_E.Col>
				<p style={{textAlign:'center'}}><em>filling slot to par means adding enough stock to fill the row,<br />whatever amount that is.</em></p>
				</_E.Col>
			</_E.Row>*/}

			<_E.Row><p>{' '}</p></_E.Row>
			<_E.Row>
			  <_E.Col sm="100%" md="100%" lg="100%">
				  <p style={{textAlign:'center'}}>Coil: <strong>{this.state.coilNumber}</strong> Current Stock Count: <strong>{this.state.verifiedProductData.inventoryCount}</strong></p>
				  <h3 style={{textAlign:'center'}}>{(this.state.verifiedProductData.name || this.state.verifiedProductData.productName)}</h3>
				  {this.renderProductImage()}
			  </_E.Col>
			</_E.Row>


		  </div>
		);
	}
	return null;
  }
  
  renderProductImage() {
  	/*
	  {this.state.verifiedProductData.imagePath ? 
		(<p style={{textAlign:'center'}}><img src={this.state.verifiedProductData.imagePath} className="boxShadowed" style={{maxHeight:'10em'}} /></p>)
		: (<p style={{textTransform:'uppercase',textAlign:'center'}}>no<br />product<br />image<br />found</p>)
		}
	*/
	if (this.state.productImages && this.state.productImages.length) {
		return (<p style={{textAlign:'center'}}><img src={this.state.productImages[0].fileData} className="boxShadowed" style={{maxHeight:'10em'}} /></p>)
	}
	return (<p style={{textTransform:'uppercase',textAlign:'center'}}>no<br />product<br />image<br />found</p>);
  }

  renderKeypad() {
  	return (
  		<div>
			<_E.Row><p>{' '}</p></_E.Row>
			<_E.Row>
				<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 1)}>1</_E.Button></_E.Col>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 2)}>2</_E.Button></_E.Col>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 3)}>3</_E.Button></_E.Col>
            </_E.Row>

			<_E.Row><p>{' '}</p></_E.Row>
            <_E.Row>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 4)}>4</_E.Button></_E.Col>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 5)}>5</_E.Button></_E.Col>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 6)}>6</_E.Button></_E.Col>
            </_E.Row>

			<_E.Row><p>{' '}</p></_E.Row>
            <_E.Row>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 7)}>7</_E.Button></_E.Col>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 8)}>8</_E.Button></_E.Col>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 9)}>9</_E.Button></_E.Col>
            </_E.Row>

			<_E.Row><p>{' '}</p></_E.Row>
            <_E.Row>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}>&nbsp;</_E.Col>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg"  onClick={this.press.bind(this, 0)}>0</_E.Button></_E.Col>
                <_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}>&nbsp;</_E.Col>
            </_E.Row>
		</div>
  	);
  }

}

export default AdminInventory
