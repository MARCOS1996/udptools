# Database Manager - dbmanager.js

info here...

States diagram available on docs/dbm_ diagram.png

### Required libraries, available via npm

        mqtt

### Running method

        $ node dbmanager.js -ba <broker's address> -bp <broker's port>

### MQTT API

Susbscribed to topics:

* **dbmanager/getconfig** <component_type[space]id> - for requesting configurations

* **dbmanager/getstatus** <component_type[space]id> - for requesting status

* **dbmanager/setconfig/component_type/id** <config> - for saving configurations in json format

* **dbmanager/reportstatus/component_type/id** <status> - for reporting status in json format

### Dev status

Now we are using a fake database
