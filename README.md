# vending-app-gui

<<<<<<< HEAD
### how to run for dev:

1. clone repo
2. cd /path/to/repo
3. npm install
4. node index.js (or, use nodemon or forever for advanced options)

### to-dos:

App "init" module (probably App.js) should:  
1. import Translate, set up / load init language "en"

### notes:

- language files in old\_code/Translation\_Service are out of date, better ones in Images/languages

- $location.path() => RootscopeStore.getCache('currentLocation')
- $location.path( PATHNAME ) => browserHistory.push( PATHNAME )  
	=> requires "import { browserHistory } from 'react-router'"

- tsv.customSetting(name, dflt) => RootscopeStore.getConfig('customSetting.'+name, dflt)

=======
GUI refactor for the vending machine!
>>>>>>> 1885a0461224d2ba0f6fe1e6e5fb489f3e6b7d85

### .env file in root

the app needs a .env file to run, these are default settings:

```
CANNED_API_DATA=false
COOKIE_PASSWORD=justthevendingappguiembeddedlocalsitedoesnotneedacomplexcookiepassword
USE_HARDWARE_API=true
CLIENT_PORTAL_URL=http://clients.sdkcore.com
MYSQL_USER=
MYSQL_PASSWORD=
MACHINE_TYPE=avt
# delay time for bootup / loader re-run:
BOOTUP_DELAY_TIME_MS=300000
```