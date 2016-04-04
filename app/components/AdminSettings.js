import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Admin_Settings extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'Admin_Settings');
    this.state = {
      supportLanguages: RootscopeStore.getConfig('supportLanguages'),
      defaultLanguage: RootscopeStore.getCache('machineSettings.defaultLanguage'),
      ccProcessorMode: RootscopeStore.getCache('machineSettings.CCProcessorMode'),
      machineSerialNumber: RootscopeStore.getCache('machineSettings.MachineSerialNumber'),
      merchantKey: RootscopeStore.getCache('machineSettings.CCMerchantKey'),
      merchantID: RootscopeStore.getCache('machineSettings.CCMerchantID'),
      dropSensorAttached: RootscopeStore.getCache('machineSettings.DropSensorAttached'),
      ccReaderType: RootscopeStore.getCache('machineSettings.CCReaderType'),
      vmcPlatform: RootscopeStore.getCache('machineSettings.VMCPlatform'),
      machineCount: RootscopeStore.getCache('machineSettings.MachineCount'),
      comPort: RootscopeStore.getCache('machineSettings.VMCControlCOMPort'),
      salesTaxRate: RootscopeStore.getCache('machineSettings.SalesTaxRate'),
      shoppingCartMaxItemCount: RootscopeStore.getCache('machineSettings.ShoppingCartMaxItemCount'),
      bHasShoppingCart: RootscopeStore.getCache('custommachinesettings.bHasShoppingCart'),
      singleProductDonation: RootscopeStore.getCache('custommachinesettings.singleProductDonation'),
      minimumDonationAmount: RootscopeStore.getCache('custommachinesettings.minimumDonationAmount'),
    };


  };


  save(e) {

  	if (e) { e.preventDefault(); }

  	var machineSettingsProps = [
  		'defaultLanguage', 'CCProcessorMode', 'MachineSerialNumber', 'CCMerchantKey', 'CCMerchantID', 'DropSensorAttached', 'CCReaderType', 'VMCPlatform', 'MachineCount', 'MCControlCOMPort', 'SalesTaxRate', 'ShoppingCartMaxItemCount'
  	];

  	var customMachineSettingsProps = [
  		'bHasShoppingCart', 'singleProductDonation', 'minimumDonationAmount',
  	];

  	machineSettingsProps.forEach( PROP => {
  		var val = this.state[PROP];
  		if (val !== RootscopeStore.getCache('machineSettings.'+PROP)) {
  			TsvService.setMachineSetting(PROP, val, () => {});
  		}
  	});

  	customMachineSettingsProps.forEach( PROP => {
  		var val = this.state[PROP];
  		if (val !== RootscopeStore.getCache('custommachinesettings.'+PROP)) {
  			TsvService.setCustomMachineSetting(PROP, val, () => {});
  		}
  	});

  	var languageSupported = RootscopeStore.getCache('custommachinesettings.languageSupported');
  	if (languageSupported !== this.state.supportLanguages) {
  		TsvService.setCustomMachineSetting("languageSupported", this.state.supportLanguages, () => {});
  		RootscopeActions.setCache('custommachinesettings.languageSupported', this.state.supportLanguages);
  		RootscopeActions.setConfig('supportLanguages', this.state.supportLanguages);
  	}

  }

  // Add change listeners to stores
  componentDidMount() {
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
    return (
      <_E.Row className="Admin_Settings">
        <_E.Col>
          <h2>{Translate.translate('MachineSettings')}}</h2>
        </_E.Col>
          <_E.Row id="machineSettings">

              <_E.Row>
                  <_E.FormSelect label={Translate.translate('Admin_Settings','LabelCardProcessorMode')} name="cardProcessorMode" value={this.state.ccProcessorMode} options={[{ label: 'Production', value: 'Production' }, { label: 'Certification', value: 'Certification'}]} />
              </_E.Row>

              <_E.Row>
                  <_E.FormField label={Translate.translate('Admin_Settings','LabelMerchantID')}  className="textArea" >
                      <_E.FormInput value={this.state.merchantID} name='merchantID'/>
                  </_E.FormField>
              </_E.Row>

              <_E.Row>
                  <_E.FormField label={Translate.translate('Admin_Settings','LabelMerchantKey')}  className="textArea" >
                      <_E.FormInput value={this.state.merchantKey} name='merchantKey'/>
                  </_E.FormField>
              </_E.Row>

              <_E.Row>
                  <_E.FormField label={Translate.translate('Admin_Settings','LabelMachineSerialNumber')}  className="textArea" >
                      <_E.FormInput value={this.state.machineSerialNumber} name='machineSerialNumber'/>
                  </_E.FormField>
              </_E.Row>

              <_E.Row>
                  <_E.FormSelect label={Translate.translate('Admin_Settings','LabelDefaultLanguage')} name="defaultLanguage" value={this.state.defaultLanguage} options={[{ label: 'Production', value: 'Production' }, { label: 'Certification', value: 'Certification'}]} />
              </_E.Row>

              <_E.Row>
                  <_E.FormField label={Translate.translate('Admin_Settings','LabelSupportLanguages')}  className="textArea" >
                      <_E.FormInput value={this.state.supportLanguages} name='supportLanguages'/>
                  </_E.FormField>
              </_E.Row>

              <_E.Row>
                  <_E.FormField label={Translate.translate('Admin_Settings','LabelDropSensorAttached')}  className="textArea" >
                      <_E.FormInput value={this.state.dropSensorAttached} name='dropSensorAttached'/>
                  </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelCardReaderType')}  className="textArea" >
                    <_E.FormInput value={this.state.ccReaderType} name='ccReaderType'/>
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelVMCPlatform')}  className="textArea" >
                    <_E.FormInput value={this.state.vmcPlatform} name='vmcPlatform'/>
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelMachineCount')}  className="textArea" >
                    <_E.FormInput value={this.state.machineCount} name='machineCount'/>
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelCOMPort')}  className="textArea" >
                    <_E.FormInput value={this.state.comPort} name='comPort'/>
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelSalesTaxRate')}  className="textArea" >
                    <_E.FormInput value={this.state.salesTaxRate} name='salesTaxRate'/>
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelShoppingCartMaxItemCount')}  className="textArea" >
                    <_E.FormInput value={this.state.shoppingCartMaxItemCount} name='shoppingCartMaxItemCount'/>
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelHasShoppingCart')}  className="textArea" >
                    <_E.FormInput value={this.state.bHasShoppingCart} name='bHasShoppingCart'/>
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelSingleProductDonation')}  className="textArea" >
                    <_E.FormInput value={this.state.singleProductDonation} name='singleProductDonation'/>
                </_E.FormField>
              </_E.Row>

              <_E.Row>
                <_E.FormField label={Translate.translate('Admin_Settings','LabelMinimumDonationAmount')}  className="textArea" >
                    <_E.FormInput value={this.state.minimumDonationAmount} name='minimumDonationAmount'/>
                </_E.FormField>
              </_E.Row>

          </_E.Row>

            <_E.Button type="primary" component={(<Link to="/Admin_Home">{Translate.translate('Admin_Home','Home')}</Link>)} />

      </_E.Row>


    );
    /*

    <div class="Admin_Settings">

        <h2>{{translate('MachineSettings')}}</h2>

        <div id="machineSettings">

            <div>
                <label>{{translate('LabelCardProcessorMode')}}: </label><br>
                <select class="droplist" id="cardProcessorMode" value="{{ccProcessorMode}}"></select>
            </div>

            <div>
                <label>{{translate('LabelMerchantID')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting3" value={{merchantID}} ng-model="merchantID" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}">
                    <FormInput/>
                </FormField>
            </div>

            <div>
                <label>{{translate('LabelMerchantKey')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting2" value={{merchantKey}} ng-model="merchantKey" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}"/>
            </div>

            <div>
                <label>{{translate('LabelMachineSerialNumber')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting1" value={{machineSerialNumber}} ng-model="machineSerialNumber" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}"/>
            </div>

            <div>
                <label>{{translate('LabelDefaultLanguage')}}: </label><br>
                <select class="droplist" id="defaultLanguage" value="{{defaultLanguage}}"></select>
            </div>

            <div>
                <label>{{translate('LabelSupportLanguages')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting0" value={{supportLanguages}} ng-model="supportLanguages" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}"/>
            </div>

            <div>
                <label>{{translate('LabelDropSensorAttached')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting4" value={{dropSensorAttached}} ng-model="dropSensorAttached" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}"/>
            </div>

            <div>
                <label>{{translate('LabelCardReaderType')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting5" value={{ccReaderType}} ng-model="ccReaderType" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}"/>
            </div>

            <div>
                <label>{{translate('LabelVMCPlatform')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting6" value={{vmcPlatform}} ng-model="vmcPlatform" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}"/>
            </div>

            <div>
                <label>{{translate('LabelMachineCount')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting7" value={{machineCount}} ng-model="machineCount" avt-virtual-keyboard="{kt: 'Numeric', enterSubmit:save, showInMobile:true}"/>
            </div>

            <div>
                <label>{{translate('LabelCOMPort')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting8" value={{comPort}} ng-model="comPort" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}"/>
            </div>

            <div>
                <label>{{translate('LabelSalesTaxRate')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting9" value={{salesTaxRate}} ng-model="salesTaxRate" avt-virtual-keyboard="{kt: 'Numeric', enterSubmit:save, showInMobile:true}"/>
            </div>

            <div>
                <label>{{translate('LabelShoppingCartMaxItemCount')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting10" value={{shoppingCartMaxItemCount}} ng-model="shoppingCartMaxItemCount" avt-virtual-keyboard="{kt: 'Numeric', enterSubmit:save, showInMobile:true}"/>
            </div>

            <div>
                <label>{{translate('LabelHasShoppingCart')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting11" value={{bHasShoppingCart}} ng-model="bHasShoppingCart" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}"/>
            </div>

            <div>
                <label>{{translate('LabelSingleProductDonation')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting12" value={{singleProductDonation}} ng-model="singleProductDonation" avt-virtual-keyboard="{kt: 'Numeric', enterSubmit:save, showInMobile:true}"/>
            </div>

            <div>
                <label>{{translate('LabelMinimumDonationAmount')}}: </label><br>
                <input type='text' class="textArea" id="machineSetting13" value={{minimumDonationAmount}} ng-model="minimumDonationAmount" avt-virtual-keyboard="{kt: 'Numeric', enterSubmit:save, showInMobile:true}"/>
            </div>

        </div>

        <img class="regularBtn" id="backImg" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="backToAdminHome()">

    </div>


    */
  }

}

export default Admin_Settings
