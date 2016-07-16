import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import TsvSettingsStore from '../stores/TsvSettingsStore'
import { Link, browserHistory } from 'react-router'
import * as _E from 'elemental'

import appConstants from '../constants/appConstants'

import AdminActions from '../actions/AdminActions'
import AdminStore from '../stores/AdminStore'
import StorefrontStore from '../stores/StorefrontStore'

import TsvActions from '../actions/TsvActions'
import {
	startGeneralIdleTimer,
} from '../utils/TsvUtils'

import Log from '../utils/BigLogger'
var Big = new Log('AdminInventory2');

class AdminInventory2 extends Component {

	constructor(props, context) {
		super(props, context);

		this.state = {
			//instructionMessage: Translate.translate('AdminInventory2', 'EnterCoil'),
			//machineID: 0,
			//num: "",
			//maxChars: TsvSettingsStore.getConfig('bDualMachine') ? 3 : 2,
			//inventoryGuiState: 'selectSlot',
			//showKeypad: false
			slotMap: []
		}

		if (TsvSettingsStore.getCache('machineList').length > 1){
			this.state.bShowDropDownForMachines = true;
		}
		
		this._onAdminStoreChange = this._onAdminStoreChange.bind(this);
	}

	// Add change listeners to stores
	componentDidMount() {
		
		// clear, then listen:
		AdminActions.clearInventorySlotmap();
		AdminStore.addChangeListener(this._onAdminStoreChange);
		AdminActions.getInventorySlotmap();
		
		/*
		TsvActions.apiCall('fetchMachineIds', (err, ids) => {
			TsvSettingsStore.setCache('machineList', ids);
			if (ids && ids.length > 1) {
				this.setState({
					bShowDropDownForMachines: true
				});
			}
		});
		*/

		startGeneralIdleTimer(this.props.location.pathname);
	}

	// Remove change listers from stores
	componentWillUnmount() {
		AdminStore.removeChangeListener(this._onAdminStoreChange);
	}
	
	_onAdminStoreChange(event) {
		Big.log('_onAdminStoreChange')
			.log(event);
		if (event.type === appConstants.INVENTORY_SLOTMAP_RECEVIED) {
			this.setState({
				slotMap: AdminStore.getInventorySlotmap()
			});
		}
	}

	addStock() {
		startGeneralIdleTimer(this.props.location.pathname);
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
							instructionMessage: Translate.translate('AdminInventory2', 'EnterCoil'),
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

	removeStock() {
		startGeneralIdleTimer(this.props.location.pathname);
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
						  instructionMessage: Translate.translate('AdminInventory2', 'EnterCoil'),
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

	render() {

		if (!this.state.slotMap || !this.state.slotMap.length) {
			return (
				<h3>Loading inventory map, one moment please...</h3>
			);
		}

		return (

			<_E.Row className="inventory" style={{maxWidth:'50%',margin: '1em auto'}}>

				<h1 style={{fontWeight:300}}>Inventory Snapshot View</h1>
				<_E.Col>

					<p>Shows all inventory and allows quantity settings for every available slot</p>
					{this.renderSlotMap()}
					{/*this.renderSelectSlot()}
					{this.renderManageStockForSlot()*/}

				</_E.Col>
			</_E.Row>
		);
	}
  
	renderSlotMap() {
		return (
			<div>
			<p>SLOT MAP!</p>
			<pre>{JSON.stringify(this.state.slotMap, null, 4)}</pre>
			</div>
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
						<p><_E.Button size="lg" id="fillMachine" onClick={this.fillMachine.bind(this)}>{Translate.translate('AdminInventory2', 'FillMachine')}</_E.Button></p>
						<h4 id="displayMachine">{Translate.translate('AdminInventory2','FillAllCoilsForMachine')} { this.state.machineID + 1 }</h4>
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

export default AdminInventory2
