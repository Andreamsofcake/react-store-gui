import React, { Component } from 'react'
import TsvService from '../../lib/TsvService'
import * as Translate from '../../lib/Translate'

import RootscopeActions from '../actions/RootscopeActions'
import RootscopeStore from '../stores/RootscopeStore'
import browserHistory from 'react-router'
import * as _E from 'elemental'

class Admin_Auto_Map extends Component {

  constructor(props, context) {
    // MUST call super() before any this.*
    super(props, context);

    RootscopeActions.setSession('currentView', 'Admin_Auto_Map');
    RootscopeActions.setSession('bRunningAutoMap', false);

    this.state = {
      bShowMachine2 : false,
      status: "",
      coilMap:[]
    }

    if(RootscopeStore.getCache('machineList').length > 1){
        this.state.bShowMachine2 = true;
    }
  }


  backToAdminHome() {
    browserHistory.push("/Admin_Home");
  }

  mapMachine(machineID){

    if(!RootscopeStore.getSession('bRunningAutoMap'){
        RootscopeActions.setSession('bRunningAutoMap', true);
        TsvService.runAutoMap(machineID, -1, () => {});
        this.setState({
          coilMap: []
        })
    }
  }


  // Add change listeners to stores
  componentDidMount() {
    TSVService.subscribe("notifyMapStatusChange", (status, info) => {

        if (RootscopeStore.getCache('currentLocation') != "/Admin_Auto_Map") return;

        this.setState({
          status: status
        })

        switch(status){
            case "Map":
                if(this.state.coilMap.indexOf(info.coilNumber) == -1){
                  this.setState({
                    coilMap: this.state.coilMap.push(info.coilNumber)
                  })
                }
                break;
            case "End":
                RootscopeActions.setSession('bRunningAutoMap', false);
                break;
            default:
                break;
        }
    }, "app.automap");

  }

  // Remove change listers from stores
  componentWillUnmount() {
    TsvService.unsubscribe("notifyMapStatusChange", "app.automap")
  }

  render() {
    return (
      <_E.Row class="automap">
        <_E.Col>
          <_E.Button type="primary" component={(<Link to="/Admin_Home">{Translate.translate('Admin_Home','Home')}</Link>)} />

          <h2>{this.state.status}</h2>

          <_E.Row>
            <_E.Col>
              <_E.Row>
                  <_E.Col basis="1/2"><_E.Button id="machine0"  onClick={this.mapMachine.bind(this, 0)}>{Translate.translate('Admin_Auto_Map','Map1')}</_E.Button></_E.Col>

                  { this.state.bShowMachine2 ? this.renderShowMachine2() : null }

              </_E.Row>
            </_E.Col>
          </_E.Row>
          <_E.Row id="wrapper">
              {JSON.stringify(this.state.coilMap)}
          </_E.Row>
        </_E.Col>
      </_E.Row>


    );

    /*
      <div class="automap">

          <img class="regularBtn" id="backImg" ng-src="{{localizedImage('back.png')}}" err-src="../Images/back.png" ng-click="backToAdminHome()">

          <h2>{{ status }}</h2>

          <table class="maps">

              <tr>
                  <td><button id="machine0" src="" data-ng-click="mapMachine(0)">{{translate("Map1")}}</button></td>

                  <td ng-show="bShowMachine2"><button id="machine1" src="" data-ng-click="mapMachine(1)">{{translate("Map2")}}</button></td>
              </tr>

          </table>

          <div id="wrapper">
              <table id="mapTable"></table>

              <!--<table id="mapTable">
                  <tr class="trayCoils"><td class='coilNumber'>11</td><td class='coilNumber'>12</td><td class='coilNumber'>13</td><td class='coilNumber'>14</td></tr>
                  <tr class="trayCoils"><td class='coilNumber'>21</td><td class='coilNumber'>22</td><td class='coilNumber'>23</td><td class='coilNumber'>24</td></tr>
                  <tr class="trayCoils"><td class='coilNumber'>31</td><td class='coilNumber'>32</td><td class='coilNumber'>33</td><td class='coilNumber'>34</td></tr>
                  <tr class="trayCoils"><td class='coilNumber'>41</td><td class='coilNumber'>42</td><td class='coilNumber'>43</td><td class='coilNumber'>44</td></tr>
                  <tr class="trayCoils"><td class='coilNumber'>51</td><td class='coilNumber'>52</td><td class='coilNumber'>53</td><td class='coilNumber'>54</td><td class='coilNumber'>55</td></tr>
                  <tr class="trayCoils"><td class='coilNumber'>61</td><td class='coilNumber'>62</td><td class='coilNumber'>63</td><td class='coilNumber'>64</td><td class='coilNumber'>65</td><td class='coilNumber'>66</td><td class='coilNumber'>67</td><td class='coilNumber'>65</td><td class='coilNumber'>66</td><td class='coilNumber'>67</td></tr>
                  <tr class="trayCoils"><td class='coilNumber'>71</td><td class='coilNumber'>72</td><td class='coilNumber'>73</td><td class='coilNumber'>74</td><td class='coilNumber'>75</td></tr>
              </table>-->

          </div>

      </div>

    */
  }

  renderShowMachine2() {
    return(
      <_E.Col basis="1/2"><_E.Button id="machine1" onClick={this.mapMachine.bind(this, 1)}>{Translate.translate('Admin_Auto_Map','Map2')}</_E.Button></_E.Col>
    )
  }

}

export default Admin_Auto_Map
