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
      defaultLanguage: RootscopeStore.getCache('machineSettings.defaultLanguage'),
      ccProcessorMode: RootscopeStore.getCache('machineSettings.CProcessorMode'),
      machineSerialNumber: RootscopeStore.getCache('machineSettings.achineSerialNumber'),
      merchantKey: RootscopeStore.getCache('machineSettings.CMerchantKey'),
      merchantID: RootscopeStore.getCache('machineSettings.CMerchantID'),
      dropSensorAttached: RootscopeStore.getCache('machineSettings.ropSensorAttached'),
      ccReaderType: RootscopeStore.getCache('machineSettings.CReaderType'),
      vmcPlatform: RootscopeStore.getCache('machineSettings.MCPlatform'),
      machineCount: RootscopeStore.getCache('machineSettings.achineCount'),
      comPort: RootscopeStore.getCache('machineSettings.MCControlCOMPort'),
      salesTaxRate: RootscopeStore.getCache('machineSettings.alesTaxRate'),
      shoppingCartMaxItemCount: RootscopeStore.getCache('machineSettings.hoppingCartMaxItemCount'),
      bHasShoppingCart: RootscopeStore.getCache('custommachinese.tings.bHasShoppingCart'),
      singleProductDonation: RootscopeStore.getCache('custommachinese.tings.singleProductDonation'),
      minimumDonationAmount: RootscopeStore.getCache('custommachinese.tings.minimumDonationAmount'),
    };


  };

  backToAdminHome = function(){
      TsvService.removeKeyboard();
      browserHistory.push("/Admin_Home");
  };

  save() {

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
                  <label>{Translate.translate('Admin_Settings','LabelCardProcessorMode')} </label><br>
                  <select  id="cardProcessorMode" value="{{ccProcessorMode}}"></select>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelMerchantID')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting3" ng-model="merchantID" > /* avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}"*/
                      <FormInput value={this.merchantID}/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelMerchantKey')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting2" value={{merchantKey}} ng-model="merchantKey" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelMachineSerialNumber')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting1" value={{machineSerialNumber}} ng-model="machineSerialNumber" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelDefaultLanguage')} </label><br>
                  <select className="droplist" id="defaultLanguage" value="{{defaultLanguage}}"></select>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelSupportLanguages')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting0" value={{supportLanguages}} ng-model="supportLanguages" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelDropSensorAttached')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting4" value={{dropSensorAttached}} ng-model="dropSensorAttached" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelCardReaderType')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting5" value={{ccReaderType}} ng-model="ccReaderType" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelVMCPlatform')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting6" value={{vmcPlatform}} ng-model="vmcPlatform" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelMachineCount')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting7" value={{machineCount}} ng-model="machineCount" avt-virtual-keyboard="{kt: 'Numeric', enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelCOMPort')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting8" value={{comPort}} ng-model="comPort" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelSalesTaxRate')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting9" value={{salesTaxRate}} ng-model="salesTaxRate" avt-virtual-keyboard="{kt: 'Numeric', enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelShoppingCartMaxItemCount')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting10" value={{shoppingCartMaxItemCount}} ng-model="shoppingCartMaxItemCount" avt-virtual-keyboard="{kt: 'Numeric', enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelHasShoppingCart')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting11" value={{bHasShoppingCart}} ng-model="bHasShoppingCart" avt-virtual-keyboard="{deadkeysOn: false, enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelSingleProductDonation')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting12" value={{singleProductDonation}} ng-model="singleProductDonation" avt-virtual-keyboard="{kt: 'Numeric', enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

              <_E.Row>
                  <label>{Translate.translate('Admin_Settings','LabelMinimumDonationAmount')} </label><br>
                  <FormField label="Input" className="textArea" id="machineSetting13" value={{minimumDonationAmount}} ng-model="minimumDonationAmount" avt-virtual-keyboard="{kt: 'Numeric', enterSubmit:save, showInMobile:true}">
                      <FormInput/>
                  </FormField>
              </_E.Row>

          </_E.Row>

          <img className="regularBtn" id="backImg" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="backToAdminHome()">

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
