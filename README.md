# vending-app-gui


### to-dos:

App "init" module (probably App.js) should:  
1. import Translate, set up / load init language "en"

### notes:

- language files in old\_code/Translation\_Service are out of date, better ones in Images/languages

- $location.path() => RootscopeStore.getCache('currentLocation')
- $location.path( PATHNAME ) => browserHistory.push( PATHNAME )
	=> requires "import { browserHistory } from 'react-router'"