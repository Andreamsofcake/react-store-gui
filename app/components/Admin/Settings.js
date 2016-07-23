import React, { Component } from 'react'
import * as Translate from '../../../lib/Translate'

import TsvSettingsStore from '../../stores/TsvSettingsStore'
import * as _E from 'elemental'
import { Link, browserHistory } from 'react-router'

import TsvActions from '../../actions/TsvActions'
import {
	KillGuiTimer,
} from '../../utils/TsvUtils'

import Log from '../../utils/BigLogger'
var Big = new Log('AdminSettings');

class AdminSettings extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //TsvSettingsStore.setSession('currentView', 'AdminSettings');
    this.state = this.getStateSettings();
    this._onTsvSettingsChange = this._onTsvSettingsChange.bind(this);
  }
  
  getStateSettings() {
  	/*return*/var state = {
      supportLanguages: TsvSettingsStore.getConfig('supportLanguages'),

      defaultLanguage: TsvSettingsStore.getCache('machineSettings.defaultLanguage'),
      CCProcessorMode: TsvSettingsStore.getCache('machineSettings.CCProcessorMode'),
      MachineSerialNumber: TsvSettingsStore.getCache('machineSettings.MachineSerialNumber'),
      CCMerchantKey: TsvSettingsStore.getCache('machineSettings.CCMerchantKey'),
      CCMerchantID: TsvSettingsStore.getCache('machineSettings.CCMerchantID'),
      DropSensorAttached: TsvSettingsStore.getCache('machineSettings.DropSensorAttached'),
      CCReaderType: TsvSettingsStore.getCache('machineSettings.CCReaderType'),
      VMCPlatform: TsvSettingsStore.getCache('machineSettings.VMCPlatform'),
      MachineCount: TsvSettingsStore.getCache('machineSettings.MachineCount'),
      VMCControlCOMPort: TsvSettingsStore.getCache('machineSettings.VMCControlCOMPort'),
      SalesTaxRate: TsvSettingsStore.getCache('machineSettings.SalesTaxRate'),
      ShoppingCartMaxItemCount: TsvSettingsStore.getCache('machineSettings.ShoppingCartMaxItemCount'),

      bHasShoppingCart: TsvSettingsStore.getCache('custommachinesettings.bHasShoppingCart'),
      singleProductDonation: TsvSettingsStore.getCache('custommachinesettings.singleProductDonation'),
      minimumDonationAmount: TsvSettingsStore.getCache('custommachinesettings.minimumDonationAmount'),
    }
    Big.log('getStateSettings()');
    Big.log(state);
    return state;
  }

  save(e) {
  	
  	if (e) { e.preventDefault(); }

  	let machineSettingsProps = [
  		'defaultLanguage', 'CCProcessorMode', 'MachineSerialNumber', 'CCMerchantKey', 'CCMerchantID', 'DropSensorAttached', 'CCReaderType', 'VMCPlatform', 'MachineCount', 'VMCControlCOMPort', 'SalesTaxRate', 'ShoppingCartMaxItemCount'
  	];

  	let customMachineSettingsProps = [
  		'bHasShoppingCart', 'singleProductDonation', 'minimumDonationAmount',
  	];

  	machineSettingsProps.forEach( PROP => {
  		let val = this.state[PROP];
  		if (val !== TsvSettingsStore.getCache('machineSettings.'+PROP)) {
  			TsvActions.apiCall('setMachineSetting', PROP, val);
  		}
  	});

  	customMachineSettingsProps.forEach( PROP => {
  		let val = this.state[PROP];
  		if (val !== TsvSettingsStore.getCache('custommachinesettings.'+PROP)) {
  			TsvActions.apiCall('setCustomMachineSetting', PROP, val);
  		}
  	});

  	let languageSupported = TsvSettingsStore.getCache('custommachinesettings.languageSupported');
  	if (languageSupported !== this.state.supportLanguages) {
  		TsvActions.apiCall('setCustomMachineSetting', "languageSupported", this.state.supportLanguages);
  		TsvSettingsStore.setConfig('supportLanguages', this.state.supportLanguages);
  	}

	let MS = TsvSettingsStore.getCache('machineSettings');
	machineSettingsProps.forEach( PROP => {
		MS[PROP] = this.state[PROP];
	});

	let CMS = TsvSettingsStore.getCache('custommachinesettings');
	customMachineSettingsProps.forEach( PROP => {
		CMS[PROP] = this.state[PROP];
	});
	
	TsvSettingsStore.setCache({
		custommachinesettings: CMS,
		machineSettings: MS
	});

  }

  // Add change listeners to stores
  componentDidMount() {
  	TsvSettingsStore.addChangeListener(this._onTsvSettingsChange);
  }

  // Remove change listers from stores
  componentWillUnmount() {
  	TsvSettingsStore.removeChangeListener(this._onTsvSettingsChange);
  }
  
  _onTsvSettingsChange(event) {
    Big.log('_onTsvSettingsChange(event)');
    Big.log(event);
    if (
    	(event.type === 'cache' && event.path === '__multiple__') ||
    	(event.type === 'config' && event.path === 'supportLanguages')
    	) {
    	this.setState( this.getStateSettings() );
    	
    }
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
					<_E.FormInput _vkenabled="true" value={this.state.CCMerchantID} name='CCMerchantID' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelMerchantKey')} >
					<_E.FormInput _vkenabled="true" value={this.state.CCMerchantKey} name='CCMerchantKey' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelMachineSerialNumber')} >
					<_E.FormInput _vkenabled="true" value={this.state.MachineSerialNumber} name='MachineSerialNumber' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormSelect label={Translate.translate('AdminSettings','LabelDefaultLanguage')}
				  onChange={this.selectChange.bind(this, 'defaultLanguage')}
				  name="defaultLanguage" value={this.state.defaultLanguage}
				  options={[{ label: 'English', value: 'En' }, { label: 'French', value: 'Fr'}]} />

				<_E.FormField label={Translate.translate('AdminSettings','LabelSupportLanguages')} >
					<_E.FormInput _vkenabled="true" value={this.state.supportLanguages} name='supportLanguages' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelDropSensorAttached')} >
					<_E.FormInput _vkenabled="true" value={this.state.DropSensorAttached} name='DropSensorAttached' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelCardReaderType')} >
					<_E.FormInput _vkenabled="true" value={this.state.CCReaderType} name='CCReaderType' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelVMCPlatform')} >
					<_E.FormInput _vkenabled="true" value={this.state.VMCPlatform} name='VMCPlatform' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelMachineCount')} >
					<_E.FormInput _vkenabled="true" value={this.state.MachineCount} name='MachineCount' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelCOMPort')} >
					<_E.FormInput _vkenabled="true" value={this.state.VMCControlCOMPort} name='VMCControlCOMPort' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelSalesTaxRate')} >
					<_E.FormInput _vkenabled="true" value={this.state.SalesTaxRate} name='SalesTaxRate' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelShoppingCartMaxItemCount')} >
					<_E.FormInput _vkenabled="true" value={this.state.ShoppingCartMaxItemCount} name='ShoppingCartMaxItemCount' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelHasShoppingCart')} >
					<_E.FormInput _vkenabled="true" value={this.state.bHasShoppingCart} name='bHasShoppingCart' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelSingleProductDonation')} >
					<_E.FormInput _vkenabled="true" value={this.state.singleProductDonation} name='singleProductDonation' onChange={this.textChange.bind(this)} />
				</_E.FormField>

				<_E.FormField label={Translate.translate('AdminSettings','LabelMinimumDonationAmount')} >
					<_E.FormInput _vkenabled="true" value={this.state.minimumDonationAmount} name='minimumDonationAmount' onChange={this.textChange.bind(this)} />
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
