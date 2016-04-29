import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import * as _E from 'elemental'
import { Link, browserHistory } from 'react-router'

import TsvActions from '../actions/TsvActions'
import {
	startGeneralIdleTimer,
} from '../utils/TsvUtils'

class AdminSettings extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'AdminSettings');
    this.state = {
      supportLanguages: RootscopeStore.getConfig('supportLanguages'),

      defaultLanguage: RootscopeStore.getCache('machineSettings.defaultLanguage'),
      CCProcessorMode: RootscopeStore.getCache('machineSettings.CCProcessorMode'),
      MachineSerialNumber: RootscopeStore.getCache('machineSettings.MachineSerialNumber'),
      CCMerchantKey: RootscopeStore.getCache('machineSettings.CCMerchantKey'),
      CCMerchantID: RootscopeStore.getCache('machineSettings.CCMerchantID'),
      DropSensorAttached: RootscopeStore.getCache('machineSettings.DropSensorAttached'),
      CCReaderType: RootscopeStore.getCache('machineSettings.CCReaderType'),
      VMCPlatform: RootscopeStore.getCache('machineSettings.VMCPlatform'),
      MachineCount: RootscopeStore.getCache('machineSettings.MachineCount'),
      VMCControlCOMPort: RootscopeStore.getCache('machineSettings.VMCControlCOMPort'),
      SalesTaxRate: RootscopeStore.getCache('machineSettings.SalesTaxRate'),
      ShoppingCartMaxItemCount: RootscopeStore.getCache('machineSettings.ShoppingCartMaxItemCount'),

      bHasShoppingCart: RootscopeStore.getCache('custommachinesettings.bHasShoppingCart'),
      singleProductDonation: RootscopeStore.getCache('custommachinesettings.singleProductDonation'),
      minimumDonationAmount: RootscopeStore.getCache('custommachinesettings.minimumDonationAmount'),
    };
    
    this._onRootscopeChange = this._onRootscopeChange.bind(this);
  }

  save(e) {

  	if (e) { e.preventDefault(); }

  	var machineSettingsProps = [
  		'defaultLanguage', 'CCProcessorMode', 'MachineSerialNumber', 'CCMerchantKey', 'CCMerchantID', 'DropSensorAttached', 'CCReaderType', 'VMCPlatform', 'MachineCount', 'VMCControlCOMPort', 'SalesTaxRate', 'ShoppingCartMaxItemCount'
  	];

  	var customMachineSettingsProps = [
  		'bHasShoppingCart', 'singleProductDonation', 'minimumDonationAmount',
  	];

  	machineSettingsProps.forEach( PROP => {
  		var val = this.state[PROP];
  		if (val !== RootscopeStore.getCache('machineSettings.'+PROP)) {
  			TsvActions.apiCall('setMachineSetting', PROP, val);
  		}
  	});

  	customMachineSettingsProps.forEach( PROP => {
  		var val = this.state[PROP];
  		if (val !== RootscopeStore.getCache('custommachinesettings.'+PROP)) {
  			TsvActions.apiCall('setCustomMachineSetting', PROP, val);
  		}
  	});

  	var languageSupported = RootscopeStore.getCache('custommachinesettings.languageSupported');
  	if (languageSupported !== this.state.supportLanguages) {
  		TsvActions.apiCall('setCustomMachineSetting', "languageSupported", this.state.supportLanguages);
  		RootscopeActions.setConfig('supportLanguages', this.state.supportLanguages);
  	}

	var MS = RootscopeStore.getCache('machineSettings');
	machineSettingsProps.forEach( PROP => {
		MS[PROP] = this.state[PROP];
	});

	var CMS = RootscopeStore.getCache('custommachinesettings');
	customMachineSettingsProps.forEach( PROP => {
		CMS[PROP] = this.state[PROP];
	});

	RootscopeActions.setCache({
		custommachinesettings: CMS,
		machineSettings: MS
	});

  }

  // Add change listeners to stores
  componentDidMount() {
  	RootscopeStore.addChangeListener(this._onRootscopeChange);
	startGeneralIdleTimer(this.props.location.pathname);
  }

  // Remove change listers from stores
  componentWillUnmount() {
  	RootscopeStore.removeChangeListener(this._onRootscopeChange);
  }
  
  _onRootscopeChange() {
    this.setState({
      supportLanguages: RootscopeStore.getConfig('supportLanguages'),

      defaultLanguage: RootscopeStore.getCache('machineSettings.defaultLanguage'),
      CCProcessorMode: RootscopeStore.getCache('machineSettings.CCProcessorMode'),
      MachineSerialNumber: RootscopeStore.getCache('machineSettings.MachineSerialNumber'),
      CCMerchantKey: RootscopeStore.getCache('machineSettings.CCMerchantKey'),
      CCMerchantID: RootscopeStore.getCache('machineSettings.CCMerchantID'),
      DropSensorAttached: RootscopeStore.getCache('machineSettings.DropSensorAttached'),
      CCReaderType: RootscopeStore.getCache('machineSettings.CCReaderType'),
      VMCPlatform: RootscopeStore.getCache('machineSettings.VMCPlatform'),
      MachineCount: RootscopeStore.getCache('machineSettings.MachineCount'),
      VMCControlCOMPort: RootscopeStore.getCache('machineSettings.VMCControlCOMPort'),
      SalesTaxRate: RootscopeStore.getCache('machineSettings.SalesTaxRate'),
      ShoppingCartMaxItemCount: RootscopeStore.getCache('machineSettings.ShoppingCartMaxItemCount'),

      bHasShoppingCart: RootscopeStore.getCache('custommachinesettings.bHasShoppingCart'),
      singleProductDonation: RootscopeStore.getCache('custommachinesettings.singleProductDonation'),
      minimumDonationAmount: RootscopeStore.getCache('custommachinesettings.minimumDonationAmount'),
    });
  }
  
  textChange(e) {
  	let state = {};
  	state[e.target.name] = e.target.value;
  	this.setState(state);
  }
  
  selectChange(what, e) {
  	let state = {};
  	state[what] = e;
  	this.setState(state);
  }

  render() {
    return (
      <_E.Row className="AdminSettings" style={{maxWidth:'50%',margin: '0 auto'}}>
        <_E.Col>
        	<h1 style={{fontWeight:300}}>Machine Settings</h1>
        </_E.Col>
          <_E.Row id="machineSettings">
			<_E.Form type="horizontal">
				<_E.FormSelect label={Translate.translate('AdminSettings','LabelCardProcessorMode')}
				  onChange={this.selectChange.bind(this, 'CCProcessorMode')}
				  name="CCProcessorMode" value={this.state.CCProcessorMode}
				  options={[{ label: 'Production', value: 'Production' }, { label: 'Certification', value: 'Certification'}]} />

				<_E.FormField label={Translate.translate('AdminSettings','LabelMerchantID')} >
					<_E.FormInput value={this.state.CCMerchantID} name='CCMerchantID' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelMerchantKey')} >
					<_E.FormInput value={this.state.CCMerchantKey} name='CCMerchantKey' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelMachineSerialNumber')} >
					<_E.FormInput value={this.state.MachineSerialNumber} name='MachineSerialNumber' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormSelect label={Translate.translate('AdminSettings','LabelDefaultLanguage')}
				  onChange={this.selectChange.bind(this, 'defaultLanguage')}
				  name="defaultLanguage" value={this.state.defaultLanguage}
				  options={[{ label: 'English', value: 'En' }, { label: 'French', value: 'Fr'}]} />

				<_E.FormField label={Translate.translate('AdminSettings','LabelSupportLanguages')} >
					<_E.FormInput value={this.state.supportLanguages} name='supportLanguages' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelDropSensorAttached')} >
					<_E.FormInput value={this.state.DropSensorAttached} name='DropSensorAttached' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelCardReaderType')} >
					<_E.FormInput value={this.state.CCReaderType} name='CCReaderType' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelVMCPlatform')} >
					<_E.FormInput value={this.state.VMCPlatform} name='VMCPlatform' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelMachineCount')} >
					<_E.FormInput value={this.state.MachineCount} name='MachineCount' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelCOMPort')} >
					<_E.FormInput value={this.state.VMCControlCOMPort} name='VMCControlCOMPort' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelSalesTaxRate')} >
					<_E.FormInput value={this.state.SalesTaxRate} name='SalesTaxRate' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelShoppingCartMaxItemCount')} >
					<_E.FormInput value={this.state.ShoppingCartMaxItemCount} name='ShoppingCartMaxItemCount' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelHasShoppingCart')} >
					<_E.FormInput value={this.state.bHasShoppingCart} name='bHasShoppingCart' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelSingleProductDonation')} >
					<_E.FormInput value={this.state.singleProductDonation} name='singleProductDonation' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelMinimumDonationAmount')} >
					<_E.FormInput value={this.state.minimumDonationAmount} name='minimumDonationAmount' onChange={this.textChange.bind(this)} />
				</_E.FormField>
			</_E.Form>
          </_E.Row>

          <_E.Row>
          	<_E.Col sm="50%" md="50%" lg="50%" style={{textAlign:'center'}}>
    	        <_E.Button size="lg" type="primary" onClick={this.save.bind(this)} >Save Changes</_E.Button>
    	    </_E.Col>

          	<_E.Col sm="50%" md="50%" lg="50%" style={{textAlign:'center'}}>
	            <_E.Button size="lg" type="primary" component={(<Link to="/Admin/Home">{Translate.translate('AdminHome','Home')}</Link>)} />
    	    </_E.Col>

          </_E.Row>
      </_E.Row>

    );
  }

}

export default AdminSettings
