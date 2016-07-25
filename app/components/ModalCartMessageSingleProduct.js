import React, { Component } from 'react'
import * as Translate from '../../lib/Translate'
import Slider from 'react-slick';

import TsvSettingsStore from '../stores/TsvSettingsStore'
import StorefrontActions from '../actions/StorefrontActions'
import StorefrontStore from '../stores/StorefrontStore'

import * as _E from 'elemental'

import appConstants from '../constants/appConstants'

import TsvActions from '../actions/TsvActions'

class ModalCartMessage extends Component {

	constructor(props, context) {
		// MUST call super() before any this.*
		super(props, context);
		this.state = {
			showModalSingleProductMessage: false
		}
		this._onStoreFrontChange = this._onStoreFrontChange.bind(this);
	}
	
	componentDidMount() {
		StorefrontStore.addChangeListener(this._onStoreFrontChange);
	}

	componentWillUnmount() {
		StorefrontStore.removeChangeListener(this._onStoreFrontChange);
	}

	_onStoreFrontChange(event) {
		if (event.type == appConstants.SINGLE_PRODUCTS_ONLY) {
			this.setState({
				showModalSingleProductMessage: true
			});
		}
	}

	resetCartMessageModal() {
  		this.setState({
  			showModalSingleProductMessage: false
  		});
	}

	render() {
		return (
			<_E.Modal className="ModalSystemMessage" isOpen={this.state.showModalSingleProductMessage} width={600} backdropClosesModal={true} onCancel={this.resetCartMessageModal.bind(this)}>
				<_E.ModalHeader text="Cart Restriction" onClose={this.resetCartMessageModal.bind(this)} showCloseButton={true} />
				<_E.ModalBody>
					<p style={{fontSize: '1.5em'}}>You already have this item in your cart. Currently we only are able to support single quantity of each product for each purchase.</p>
					<p style={{fontSize: '1.5em'}}>To buy more than one, please make a transaction for each one.</p>
					<p style={{fontSize: '1.5em'}}>Apologies for any inconvenience.</p>
				</_E.ModalBody>
				<_E.ModalFooter>
					<_E.Button type="primary" size="lg" onClick={this.resetCartMessageModal.bind(this)}>OK</_E.Button>
				</_E.ModalFooter>
			</_E.Modal>
		);
	}
}

export default ModalCartMessage