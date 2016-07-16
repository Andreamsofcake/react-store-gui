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
			//machineID: 0,
			inventoryGuiState: 'selectSlot',
			slotProductCount: "0",
			slotMap: [],
			maxInSlot: 50 // guess here
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
		Big.log('_onAdminStoreChange');	
		Big.log(event);
		if (event.type === appConstants.INVENTORY_SLOTMAP_RECEVIED) {
			Big.log('ok, set the state now, we have the inventory');
			this.setState({
				inventorySlotMap: AdminStore.getInventorySlotmap()
			});
		} else {
			Big.error('why you no get '+appConstants.INVENTORY_SLOTMAP_RECEVIED);
		}
	}

	manageSlot(slot) {
		Big.log('manageSlot');
		Big.log(slot);

		let data = StorefrontStore.decorateProducts(slot);
		this.setState({
			verifiedProductData: data,
			productImages: StorefrontStore.getImagesForProduct(data),
			coilNumber: slot.slot,
			inventoryGuiState: 'stock',
			slotProductCount: '0'
		});
	}
	
	cancelSlot() {
      	startGeneralIdleTimer(this.props.location.pathname);
        this.setState({
			inventoryGuiState: 'selectSlot',
			slotProductCount: "0",
			verifiedProductData: null,
			coilNumber: null
        });
	}

	addStock() {
		startGeneralIdleTimer(this.props.location.pathname);
		if (this.state.coilNumber != "" && this.state.slotProductCount != ""){
			this.setState({
				instructionMessage: 'Adding '+this.state.slotProductCount+' '+(this.state.verifiedProductData.name || this.state.verifiedProductData.productName)+' from stock count, one moment please.',
				inventoryGuiState: 'processing'
			});
			TsvActions.apiCall('addStock', this.state.coilNumber, this.state.slotProductCount, (err, data) => {
				TsvActions.apiCall('adminValidateProductByCoil', this.state.coilNumber, (err, data) => {

					// FIXME: blindly assuming that we get good product data after a successful coil select

					/*
					var data2 = StorefrontStore.decorateProducts(data);
					this.setState({
						verifiedProductData: data2,
						productImages: StorefrontStore.getImagesForProduct(data2),
						slotProductCount: ""
					});
					*/

					setTimeout( () => {
						this.setState({
							instructionMessage: '',
							inventoryGuiState: 'selectSlot',
							slotProductCount: "0"
						});
					}, 2000);
				});
			});
		} else {
			Big.warn('tried to addStock, but did not have both "coilNumber" and "slotProductCount" in state');
		}
	}

	removeStock() {
		startGeneralIdleTimer(this.props.location.pathname);
		if (this.state.coilNumber != "" && this.state.slotProductCount != ""){
			this.setState({
			  instructionMessage: 'Removing '+this.state.slotProductCount+' '+(this.state.verifiedProductData.name || this.state.verifiedProductData.productName)+' from stock count, one moment please.',
			  inventoryGuiState: 'processing'
			});
			TsvActions.apiCall('removeStock', this.state.coilNumber, this.state.slotProductCount, (err, data) => {
				TsvActions.apiCall('adminValidateProductByCoil', this.state.coilNumber, (err, data) => {

					// FIXME: blindly assuming that we get good product data after a successful coil select

					/*
					var data2 = StorefrontStore.decorateProducts(data);
					this.setState({
					  verifiedProductData: data2,
					  productImages: StorefrontStore.getImagesForProduct(data2),
					  // just reference it direct if you need... verifiedProductData.inventoryCount
					  //stockCount: "Stock Count: " + data.inventoryCount,
					  slotProductCount: ""
					});
					*/

					setTimeout( () => {
						this.setState({
						  instructionMessage: '',
						  inventoryGuiState: 'selectSlot',
						  slotProductCount: "0"
						});
					}, 2000);
				  });
			  });
		} else {
			Big.warn('tried to removeStock, but did not have both "coilNumber" and "slotProductCount" in state');
		}
	}

	render() {

		let ISM = this.state.inventorySlotMap;
		if (!ISM || !ISM.map.length || !ISM.map) {
			return (
				<_E.Row className="inventory" style={{maxWidth:'80%',margin: '1em auto'}}>
					<_E.Col>
						<h3>Loading inventory map, one moment please...</h3>
					</_E.Col>
				</_E.Row>
			);
		}

		return (

			<_E.Row className="inventory" style={{maxWidth:'80%',margin: '1em auto'}}>

				<_E.Col>
					<h1 style={{fontWeight:300}}>Inventory Manager</h1>
					{this.state.instructionMessage ? (
						<h2>{this.state.instructionMessage}</h2>
					) : null }
				</_E.Col>
				<_E.Col>

					{this.renderSlotMap()}
					{this.renderManageStockForSlot()}

				</_E.Col>
			</_E.Row>
		);
	}
  
	parseSlotMap(map) {
		Big.log('parseSlotMap');
		Big.log(map);
		if (map && map.length) {
			var products = {};
			map.forEach( M => {
				if (['OUT_OF_STOCK', 'AVAILABLE'].indexOf(M.result) > -1) {
					if (!products.hasOwnProperty(M.productName)) {
						Big.log('found a new product: ' + M.productName);
						products[M.productName] = [];
					}
					products[M.productName].push(M);
				}
			});
			Big.log('parseSlotMap RETURN');
			return products;
		}
		Big.log('parseSlotMap RETURN NULL????');
		return null;
	}

	renderSlotMap() {
		if (this.state.inventoryGuiState !== 'selectSlot') {
			return null;
		}

		Big.log('renderSlotMap');
		let ISM = this.parseSlotMap(this.state.inventorySlotMap.map)
			, components = Object.keys(ISM).map( (M, idx) => {
				Big.log('component ' + (idx + 1));
				let pData = StorefrontStore.decorateProducts({ productName: M })
					, pImages = StorefrontStore.getImagesForProduct(pData)
					;
				return (
					<_E.Col key={idx}>{/* sm="1" md="1/2" lg="1/2"*/}
					<div className="admin-inventory-product-node">
						<_E.Row>
							<_E.Col sm="1" md="1/3" lg="1/3">
								<h3 style={{textAlign:'center'}}>{(pData.name || pData.productName)}</h3>
								<p style={{textAlign:'center', fontWeight: 'bold'}}>Total in machine: {( () => { var i = 0; ISM[M].map( foo => { i += foo.inventoryCount }); return i; } )()}</p>
								{this.renderProductImage(pImages)}
							</_E.Col>
							<_E.Col sm="1" md="2/3" lg="2/3">
						
								{this.renderProductSlots(ISM[M])}

							</_E.Col>
						</_E.Row>
					</div>
					</_E.Col>
				);
			});
		
		return (
			<_E.Row>
				<_E.Col>
					<div style={{float: 'right', marginBottom: '2em'}}><_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} /></div>
					<p style={{fontSize: '1.5em'}}>Click a slot button to manage the inventory level for that slot.</p>
				</_E.Col>
				{components}
				{/*<pre>{JSON.stringify(ISM, null, 4)}</pre>*/}
			</_E.Row>
		);
	}
	
	renderProductSlots(slots) {
		if (slots && slots.length) {
			Big.log('renderProductSlots');
			Big.log(slots);
			return (
				<_E.Row style={{marginTop: '1em'}}>
					{slots.map( (S, idx) => {
							/*
							<_E.Col key={idx} sm="1/3" md="1/3" lg="1/3">
								<p className="text-center">slot: {S.slot}, current quantity: {S.inventoryCount}</p>
							</_E.Col>
							*/
						return (
							<_E.Col key={idx} sm="1/3" md="1/3" lg="1/3">
								<p style={{textAlign: 'center', marginBottom: '2em'}}>
									<_E.Button style={{margin:'0 auto',display:'block'}} size="lg" type="primary" onClick={this.manageSlot.bind(this, S)}>Manage Slot {S.slot}</_E.Button>
									<strong><em>current count: {S.inventoryCount}</em></strong>
								</p>
							</_E.Col>
							
						);
					})}
				</_E.Row>
			)
		}
		return (
			<p>No slot data found, please contact your rep as this is an error.</p>
		);
	}
	
	renderManageStockForSlot() {
		if (this.state.inventoryGuiState !== 'stock') {
			return null;
		}

		return (
		  <div style={{maxWidth: '60%', margin: '1em auto'}}>


			<_E.Row><p>{' '}</p></_E.Row>
			<_E.Row>
			  <_E.Col sm="1" md="1/3" lg="1/3">
				  {this.renderProductImage()}
			  </_E.Col>
			  <_E.Col sm="1" md="2/3" lg="2/3">
				  <h2 style={{marginTop: 0}}>{(this.state.verifiedProductData.name || this.state.verifiedProductData.productName)}</h2>
				  <p style={{fontSize:'1.5em'}}>Slot: <strong>{this.state.coilNumber}</strong><br />Current Stock Count: <strong>{this.state.verifiedProductData.inventoryCount}</strong></p>
			  </_E.Col>
			</_E.Row>

			<div style={{maxWidth:'60%', margin: '0 auto 1em', padding: '1em 1em 2em', border: '1px solid #dfdfdf', borderRadius: '6px', backgroundColor: '#fff'}}>
			{this.renderKeypad()}
			</div>

			<_E.Row><p>{' '}</p></_E.Row>
			<_E.Row>
				<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg" type="warning" onClick={this.clear.bind(this)}>Clear</_E.Button></_E.Col>
				<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}>&nbsp;</_E.Col>
				<_E.Col sm="1/3" md="1/3" lg="1/3" style={{textAlign:'center'}}><_E.Button size="lg" type="primary" onClick={this.cancelSlot.bind(this)}><_E.Glyph icon="circle-slash" />Cancel</_E.Button></_E.Col>
			</_E.Row>

			<_E.Row><p>{' '}</p></_E.Row>
			<_E.Row>
			  <_E.Col><div style={{textAlign:'center', border:'1px solid #dfdfdf',backgroundColor:'#fff',borderRadius:'4px',margin: '20px auto'}}><h2>change quantity: {this.state.slotProductCount}</h2></div></_E.Col>
			</_E.Row>

			<_E.Row><p>{' '}</p></_E.Row>
			<_E.Row>
				<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'center'}}><_E.Button size="lg" style={{float:'left'}} type="danger" onClick={this.removeStock.bind(this)}><_E.Glyph icon="dash" />Remove {this.state.slotProductCount} Items</_E.Button></_E.Col>
				<_E.Col sm="1/2" md="1/2" lg="1/2" style={{textAlign:'center'}}><_E.Button size="lg" style={{float:'right'}} type="success" onClick={this.addStock.bind(this)}><_E.Glyph icon="plus" />Add {this.state.slotProductCount} Items</_E.Button></_E.Col>
			</_E.Row>

			{/*<_E.Row><p>{' '}</p></_E.Row>
			<_E.Row>
				<_E.Col sm="1/4" md="1/4" lg="1/4" style={{textAlign:'center'}}></_E.Col>
				<_E.Col sm="1/2" md="1/2" lg="1/2"><_E.Button size="lg" type="primary" onClick={this.fillCoil.bind(this)} style={{margin:'0 auto',display:'block'}}>Fill Slot To Par</_E.Button></_E.Col>
				<_E.Col sm="1/4" md="1/4" lg="1/4" style={{textAlign:'center'}}></_E.Col>
			</_E.Row>

			<_E.Row>
				<_E.Col>
				<p style={{textAlign:'center'}}><em>filling slot to par means adding enough stock to fill the row,<br />whatever amount that is.</em></p>
				</_E.Col>
			</_E.Row>*/}


		  </div>
		);
	}
  
	renderProductImage(images) {
		/*
		  {this.state.verifiedProductData.imagePath ? 
			(<p style={{textAlign:'center'}}><img src={this.state.verifiedProductData.imagePath} className="boxShadowed" style={{maxHeight:'10em'}} /></p>)
			: (<p style={{textTransform:'uppercase',textAlign:'center'}}>no<br />product<br />image<br />found</p>)
			}
		*/
		images = images || this.state.productImages;
		if (images && images.length) {
			return (<p style={{textAlign:'center'}}><img src={images[0].fileData} className="boxShadowed" style={{maxHeight:'10em'}} /></p>)
		}
		return (<p className="boxShadowed" style={{textTransform:'uppercase',textAlign:'center'}}>no<br />product<br />image<br />found</p>);
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

	clear() {
		startGeneralIdleTimer(this.props.location.pathname);
		this.setState({
			slotProductCount: "0"
		})
	}

	press(digit) {
		startGeneralIdleTimer(this.props.location.pathname);
		let slotProductCount = this.state.slotProductCount;
		slotProductCount = parseInt(slotProductCount + digit);
		if (slotProductCount > this.state.maxInSlot) {
			slotProductCount = this.state.maxInSlot;
		}
		
		this.setState({
			slotProductCount: slotProductCount.toString()
		});
	}


}

export default AdminInventory2
