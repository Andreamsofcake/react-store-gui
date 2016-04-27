import React, { Component } from 'react'
//import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

import TsvActions from '../actions/TsvActions'

class System_Info extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);
  }

  // Add change listeners to stores
  componentDidMount() {
    TsvActions.apiCall('enumerateComponents', (err, data) => {
       this.setState({ versionInfos: data })
    })
  }

  // Remove change listers from stores
  componentWillUnmount() {
  }

  render() {
  	if (!this.state.versionInfos) {
  		return (
  			<h2>Loading, one moment please...</h2>
  		);
  	}
    return (
      <_E.Row className="systemInfo">
        <_E.Col>
          <h2>{Translate.translate('System_Info', 'SystemInfo')}</h2>
        </_E.Col>
        <_E.Col>
          <_E.Row >
            <_E.Col>
              {this.state.versionInfos.map((versionInfo, $index) => {
                  return (
                    <_E.Row key={$index}>
                      <_E.Col basis="1/2">{ versionInfo.name }</_E.Col>
                      <_E.Col basis="1/2">{ versionInfo.versionString }</_E.Col>
                    </_E.Row>
                  )}
                )}
            </_E.Col>
          </_E.Row>
        </_E.Col>
        <_E.Col>
          <_E.Button type="primary" component={(<Link to="/Admin_Home">{Translate.translate('Admin_Home','Home')}</Link>)} />
        </_E.Col>
      </_E.Row>

    );
    /*
      <div class="systemInfo">

          <h2>{{translate('SystemInfo')}}</h2>

          <div id = wrapper>

              <table class ="systemInfo">

                  <tr ng-repeat="versionInfo in versionInfos" class="systemInfo">

                      <th class="systemInfo">
                          {{ versionInfo.name }}
                      </th>

                      <td class="systemInfo">
                          {{ versionInfo.versionString }}
                      </td>

                  </tr>

              </table>

          </div>

          <img class="regularBtn" id="backImg" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="backToAdminHome()">

      </div>
    */
  }

}

export default System_Info
