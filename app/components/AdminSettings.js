import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

import TsvActions from '../actions/TsvActions'

class Admin_Settings extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    //RootscopeActions.setSession('currentView', 'Admin_Settings');
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
  }

  // Remove change listers from stores
  componentWillUnmount() {
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
      <_E.Row className="Admin_Settings">
        <_E.Col>
          <h2>{Translate.translate('MachineSettings')}}</h2>
        </_E.Col>
          <_E.Row id="machineSettings">

              <_E.Row>
                  <_E.FormSelect label={Translate.translate('Admin_Settings','LabelCardProcessorMode')}
                  	onChange={this.selectChange.bind(this, 'CCProcessorMode')}
                  	name="CCProcessorMode" value={this.state.CCProcessorMode}
                  	options={[{ label: 'Production', value: 'Production' }, { label: 'Certification', value: 'Certification'}]} />
              </_E.Row>

              <_E.Row>
                  <_E.FormField label={Translate.translate('Admin_Settings','LabelMerchantID')} >
                      <_E.FormInput value={this.state.CCMerchantID} name='CCMerchantID' onChange={this.textChange.bind(this)} />
                  </_E.FormField>
              </_E.Row>

              <_E.Row>
                  <_E.FormField label={Translate.translate('Admin_Settings','LabelMerchantKey')} >
                      <_E.FormInput value={this.state.CCMerchantKey} name='CCMerchantKey' onChange={this.textChange.bind(this)} />
                  </_E.FormField>
              </_E.Row>

              <_E.Row>
                  <_E.FormField label={Translate.translate('Admin_Settings','LabelMachineSerialNumber')} >
                      <_E.FormInput value={this.state.MachineSerialNumber} name='MachineSerialNumber' onChange={this.textChange.bind(this)} />
                  </_E.FormField>
              </_E.Row>

              <_E.Row>
                  <_E.FormSelect label={Translate.translate('Admin_Settings','LabelDefaultLanguage')}
                  	onChange={this.selectChange.bind(this, 'defaultLanguage')}
                  	name="defaultLanguage" value={this.state.defaultLanguage}
                  	options={[{ label: 'English', value: 'En' }, { label: 'French', value: 'Fr'}]} />
              </_E.Row>

              <_E.Row>
                  <_E.FormField label={Translate.translate('Admin_Settings','LabelSupportLanguages')} >
                      <_E.FormInput value={this.state.supportLanguages} name='supportLanguages' onChange={this.textChange.bind(this)} />
                  </_E.FormField>
              </_E.Row>

              <_E.Row>
                  <_E.FormField label={Translate.translate('Admin_Settings','LabelDropSensorAttached')} >
                      <_E.FormInput value={this.state.DropSensorAttached} name='DropSensorAttached' onChange={this.textChange.bind(this)} />
                  </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelCardReaderType')} >
                    <_E.FormInput value={this.state.CCReaderType} name='CCReaderType' onChange={this.textChange.bind(this)} />
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelVMCPlatform')} >
                    <_E.FormInput value={this.state.VMCPlatform} name='VMCPlatform' onChange={this.textChange.bind(this)} />
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelMachineCount')} >
                    <_E.FormInput value={this.state.MachineCount} name='MachineCount' onChange={this.textChange.bind(this)} />
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelCOMPort')} >
                    <_E.FormInput value={this.state.VMCControlCOMPort} name='VMCControlCOMPort' onChange={this.textChange.bind(this)} />
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelSalesTaxRate')} >
                    <_E.FormInput value={this.state.SalesTaxRate} name='SalesTaxRate' onChange={this.textChange.bind(this)} />
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelShoppingCartMaxItemCount')} >
                    <_E.FormInput value={this.state.ShoppingCartMaxItemCount} name='ShoppingCartMaxItemCount' onChange={this.textChange.bind(this)} />
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelHasShoppingCart')} >
                    <_E.FormInput value={this.state.bHasShoppingCart} name='bHasShoppingCart' onChange={this.textChange.bind(this)} />
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelSingleProductDonation')} >
                    <_E.FormInput value={this.state.singleProductDonation} name='singleProductDonation' onChange={this.textChange.bind(this)} />
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelMinimumDonationAmount')} >
                    <_E.FormInput value={this.state.minimumDonationAmount} name='minimumDonationAmount' onChange={this.textChange.bind(this)} />
                </_E.FormField>
              </_E.Row>

          </_E.Row>

            <_E.Button type="primary" component={(<Link to="/Admin_Home">{Translate.translate('Admin_Home','Home')}</Link>)} />

      </_E.Row>

    );
  }

}

export default Admin_Settings
