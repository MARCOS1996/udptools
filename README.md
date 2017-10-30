# UDP Tools
MQTT controlled set of tools to forward packages, send realiable data and get statistics about it.

# Getting started on ubuntu/linux

Install the requiered packages

        $ sudo apt-get install nodejs npm mosquitto mosquitto-clients vlc

Clone the repository

        $ git clone https://github.com/MARCOS1996/udptools
        
Download the needed dependencies

        $ cd udptools
        $ npm install

Run the stream frowarder test

        $ node /test/sf_test.js
        
# Component Controller - ccontroller.js

Required libraries, available via npm

        mqtt
        
Running method

        $ node componentcontroller.js -ba <broker's address> -bp <broker's port>

This component is the one that controls all other tools, is listening all mqtt messages and depending on the topic and the messages knows what is being requested.

When a component initializes and connects with the broker, tries to get the previous or more updated configuration. The component send the message "get_config" using their own topic and the component controller gets this config from the database and forwards it to the component.

The database is not ready yet and the component controller sends a hardcoded config.

# Stream Forwarder - streamforwarder.js

This component works as a packet forwarder for different types of streams. The input can be rtp or udp and the same for the output. the programm when starts reads the config from the file and if the broker is available, requests the component controller the most updated config, applies it and waits for the "start" command to start forwarding packets. If the broker is not available, starts forwarding packets and will try to connect to the broker, when finally connects, requests the most updated... States diagram available on docs/sf_ diagram.png

Required libraries, both available via npm

        rtp-rtcp
        mqtt
        
Running method

        $ node streamfrowarder.js -c <config_file>.json
        
Configuration file example

        {
        "mqttBroker":"localhost",
        "srcType":"rtp",
        "srcPort":"5004",
        "dstType":"udp",
        "dstPort":"5008",
        "dstAddr":"192.168.1.121"
        }
        
MQTT API

        streamforwarder <start/stop>
        streamforwarder/configuration <json_object> - Like the one shown previously
        
To make changes in the configuration take effect, you must restart the service with start/stop

Dev status: Only supports RTP->RTP and if the broker is not online waits for it.

# Test Tool - test.js

Used to perform various test of the implemented tools

        Test 1 - Tests the Stream Forwarder without using the controller, sends a specific config for local test. Now uses              transcodification, needs to be changed.
