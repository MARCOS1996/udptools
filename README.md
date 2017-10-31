# Realtime Stream Distribution Platform
MQTT controlled set of tools to forward packages, send realiable data and get statistics about realtime streams.

# Getting started

1. Install Platform

  Install nodejs 8.X and npm 5.X

    Linux - Debian
      $ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
      $ sudo apt-get install nodejs

    Windows & Mac
      Download from https://nodejs.org/es/download/current/

  Download or clone the repository
    $ git clone https://github.com/MARCOS1996/udptools -b working

  Run npm install in the project folder to insall the requiered libraries

2. Choose a broker

  Option A - Mosquitto - Lightweight and not scalable, suitable for small environments

    Linux - Avaliable via apt-get or yum
    Windows and Mac see official page https://mosquitto.org/download/

  Option B - VerneMQ - Scalable and production ready

    Avaliable only for linux, see installation and setup guide on /docs/VerneMQSetup.txt

3. Run the plaform

  <needs yo be documented>

# Platform Controller - pcontroller.js

  Required libraries, available via npm

          mqtt

  Running method

          $ node pcontroller.js -ba <broker's address> -bp <broker's port>

# Database Manager - dbmanager.js

Required libraries, available via npm

        mqtt

Running method

        $ node dbmanager.js -ba <broker's address> -bp <broker's port>

The database is not ready yet and the component controller sends a hardcoded config.

# Test Tool - test.js

Used to perform various test of the implemented tools

        Test 1 - Tests the Stream Forwarder without using the controller, sends a specific config for local test. Now uses              transcodification, needs to be changed.

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
        streamforwarder/configuration <json_object> - Json object like the one shown previously

To make changes in the configuration take effect, you must restart the service with start/stop

Dev status: Only supports RTP->RTP and if the broker is not online waits for it.
