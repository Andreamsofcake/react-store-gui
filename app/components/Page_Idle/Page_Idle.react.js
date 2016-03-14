var React = require('react');
var RootscopeActions = require('../actions/RootscopeActions');
var TsvService = require('../lib/TsvService');
var RootscopeStore =require('../store/RootscopeStore')

function getIdleState() {
    RootscopeStore.bDisplayCgryNavigation = false;
    RootscopeStore.bShowCredit = RootscopeStore.credit && true;

    RootscopeStore.translate = function(name){
        return translate.translate("Page_Idle", name);
    };

    RootscopeStore.idleClicked = function(){
    TSVService.idleClicked(location, rootScope);
    };

    TSVService.disableLoginDevices();
}

var Page_Idle = React.createClass({

  getInitialState: function() {
    return getIdleState();
  },

  // Add change listeners to stores
  componentDidMount: function() {
  },

  // Remove change listers from stores
  componentWillUnmount: function() {
  },


  render: function() {
        return (
      <div className={"Page_Idle"}></div>
    );
  },

  _onChange: function() {
    this.setState(getIdleState());
  }

});

module.exports = Page_Idle;
