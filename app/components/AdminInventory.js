import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import { Link, browserHistory } from 'react-router'
import * as _E from 'elemental'

import TsvActions from '../actions/TsvActions'

class AdminInventory extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'AdminInventory');
    TsvActions.apiCall('fetchMachineIds', (err, ids) => {
        RootscopeActions.setCache('machineList', ids);
      });

    this.state = {
      instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
      machineID: 0,
      num: "",
      maxChars: RootscopeStore.getConfig('bDualMachine') ? 3 : 2,
      bEnterCoil: true,
      showKeypad: false
    }

    if(RootscopeStore.getCache('machineList').length > 1){
        this.state.bShowDropDownForMachines = true;
    }
  }

  fillMachine(){
      TsvActions.apiCall('fillMachine', this.state.machineID.toString());
  }

  fillCoil(){
    if(this.state.num != "") {
		TsvActions.apiCall('adminValidateProductByCoil', this.state.num, ( err, data) => {
			let state = { vpbc: data };

			switch (state.vpbc.result) {
				case "UNKNOWN":
					state.instructionMessage = Translate.translate('AdminInventory', 'UnknownProduct')
					setTimeout( () => {
						this.setState({
						  instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
						  bEnterCoil: true,
						  num: ""
						});
					}, 3000);
					break;

				case "INVALID_PRODUCT":
					state.instructionMessage = Translate.translate('AdminInventory', 'InvalidProduct')
					setTimeout( () => {
						this.setState({
						  instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
						  bEnterCoil: true,
						  num: ""
						});
					}, 3000);
					break;

				default:
					state.instructionMessage = Translate.translate('AdminInventory', 'EnterStockAmount');
					state.coilNumber = this.state.num;
					state.num = '';
					state.bEnterCoil = false;
					TsvActions.apiCall('fillCoil', state.coilNumber);
					break;
			}
			this.setState(state);

		});
    }
  }

  backToAdminHome() {
    this.setState({
      num: ""
    });
      if(this.state.bEnterCoil){
          browserHistory.push("/Admin/Home");
      }else{
        this.setState({
          bEnterCoil: true
        })
      }
  }

  addStock(){
      if(this.state.num != ""){
          TsvActions.apiCall('addStock', this.state.coilNumber, this.state.num, (err, data) => {
			  TsvActions.apiCall('adminValidateProductByCoil', this.state.coilNumber, (err, data) => {
				  this.setState({
					vpbc: data,
					num: ""
				  });

				  setTimeout( () => {
					  this.setState({
						instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
						bEnterCoil: true,
						num: ""
					  });
				  }, 2000);
			  });
          });
      }
  }

  removeStock(){
      if(this.state.num != ""){
          TsvActions.apiCall('removeStock', this.state.coilNumber, this.state.num, (err, data) => {
	          TsvActions.apiCall('adminValidateProductByCoil', this.state.coilNumber, (err, data) => {
				  this.setState({
					vpbc: data,
					stockCount: "Stock Count: " + data.inventoryCount,
					num: ""
				  });

				  setTimeout( () => {
					  this.setState({
						instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
						bEnterCoil: true,
						num: ""
					  });
				  }, 2000);
				});
			});
      }
  }

  clear() {
    this.setState({
      num: ""
    })
  }

  enter() {
  	TsvActions.apiCall('adminValidateProductByCoil', this.state.num, (err, data) => {
		let state = { vpbc: data };

		switch (data.result) {
			case "UNKNOWN":
				state.instructionMessage = Translate.translate('AdminInventory', 'UnknownProduct');
				setTimeout( () => {
					this.setState({
					  instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
					  bEnterCoil: true,
					  num: ""
					});
				}, 3000);
				break;

			case "INVALID_PRODUCT":
				state.instructionMessage = Translate.translate('AdminInventory', 'InvalidProduct');
				setTimeout( () => {
					this.setState({
					  instructionMessage: Translate.translate('AdminInventory', 'EnterCoil'),
					  bEnterCoil: true,
					  num: ""
					});
				}, 3000);
				break;

			default:
				state.instructionMessage = Translate.translate('AdminInventory', 'EnterStockAmount');
				state.coilNumber = this.state.num;
				state.num = '';
				state.bEnterCoil = false;
				break;
		}
		this.setState(state);
	});

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
    RootscopeStore.getCache('machineList').forEach( MACHINE => {
      options.push({ label: 'Machine ' + MACHINE, value: MACHINE });
    })
    return options;
  }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (

      <_E.Row className="inventory" style={{maxWidth:'50%',margin: '1em auto'}}>

        	<h1 style={{fontWeight:300}}>Inventory</h1>
          <_E.Col>

            <h2 id="instruction">{ this.instructionMessage }</h2>

            <_E.Row>
                <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 1)}>1</_E.Button></_E.Col>
                <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 2)}>2</_E.Button></_E.Col>
                <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 3)}>3</_E.Button></_E.Col>
            </_E.Row>
            <_E.Row>
                <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 4)}>4</_E.Button></_E.Col>
                <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 5)}>5</_E.Button></_E.Col>
                <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 6)}>6</_E.Button></_E.Col>
            </_E.Row>
            <_E.Row>
                <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 7)}>7</_E.Button></_E.Col>
                <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 8)}>8</_E.Button></_E.Col>
                <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 9)}>9</_E.Button></_E.Col>
            </_E.Row>
            <_E.Row>
                <_E.Col basis="1/3"><_E.Button  onClick={this.press.bind(this, 0)}>0</_E.Button></_E.Col>
                <_E.Col basis="1/3"><_E.Button type="warning" onClick={this.clear}>Clear</_E.Button></_E.Col>
            </_E.Row>
                { !this.state.bEnterCoil ? this.renderEnterCoilAmount() : null }
                { this.state.bEnterCoil ? this.renderEnterButton() : null }
            <_E.Row>
              <_E.Col><_E.Demobox>{this.state.num}</_E.Demobox></_E.Col>
            </_E.Row>


            { this.state.bEnterCoil ? this.renderFillMachine() : null }

          </_E.Col>

            { !this.state.bEnterCoil ? this.renderProductInfo() : null }


         <_E.Button type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} />

          { this.state.bEnterCoil ? this.renderFillCoilButton() : null }

      </_E.Row>

    );
  }

  renderEnterCoilAmount(){
    return(
      <_E.Row>
          <_E.Col basis="1/4"><_E.Button type="success" onClick={this.addStock}><Glyph icon="plus" /></_E.Button></_E.Col>
          <_E.Col basis="1/4"><_E.Button type="danger" onClick={this.removeStock}><Glyph icon="dash" /></_E.Button></_E.Col>
      </_E.Row>
    )
  }

  renderEnterButton() {
    return(
      <_E.Row>
        <_E.Col basis="1/3"><_E.Button type="primary" onClick={this.enter}>Enter</_E.Button></_E.Col>
      </_E.Row>
    )
  }

  renderFillMachine(){
    return(
      <_E.Col>
        <_E.Row>
            { RootscopeStore.getCache('machineList').length > 1 ? (<_E.FormSelect name="selectMachine" value={this.state.machineID} options={this.getMachineSelectOptions()} />) : null }
            <_E.Button id="fillMachine" onClick={this.fillMachine}>{Translate.translate('AdminInventory', 'FillMachine')}</_E.Button>
            <p id="displayMachine">{Translate.translate('AdminInventory','FillAllCoilsForMachine')} { this.state.machineID + 1 }</p>
        </_E.Row>
      </_E.Col>
    )
  }

  renderProductInfo() {
    return(
      <_E.Col>
          <img src={this.state.vpbc.imagePath} />
          <p>{this.state.vpbc.productName}</p>
          <p>Coil: {this.state.coilNumber} Stock Count: {this.state.vpbc.inventoryCount}</p>
      </_E.Col>
    )
  }

  renderFillCoilButton() {
    return(
        <img className="regularBtn" id="fillImg" src={Translate.localizedImage('Button_Fill.png')} onClick={this.fillCoil} />
    )
  }

}

export default AdminInventory
