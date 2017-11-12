# Stream Forwarder - streamforwarder.js

This component works as a packet forwarder for different types of streams. The input can be rtp or udp and the same for the output. the programm when starts reads the config from the file and if the broker is available, requests the component controller the most updated config, applies it and waits for the "start" command to start forwarding packets. If the broker is not available, starts forwarding packets and will try to connect to the broker, when finally connects, requests the most updated... 

States diagram available on docs/sf_ diagram.png

### Required libraries, both available via npm

        rtp-rtcp
        mqtt

### Running method

        $ node streamfrowarder.js -c <config_file>.json

### Configuration file example

        {
        "id":"1",
        "mqttBroker":"localhost",
        "srcType":"rtp",
        "srcPort":"5004",
        "dstType":"udp",
        "dstPort":"5008",
        "dstAddr":"192.168.1.121"
        }

### MQTT API

Susbscribed to topics:

* streamforwarder/id/config <configuration> - for receiving configurations via JSON object like the one shown avobe

* streamforwarder/id/cmd - for ejectuing the following commands

        start - start the forwarding
        stop - stop the forwarding
        setconfig - aply the current config
        getconfig - not yet supported
        getstatus - sends their statu on /status/streamforwarder/id <status>

To make changes in the configuration take effect, you must send the command setconfig

### Dev status

Only supports RTP->RTP and if the broker is not online waits for it.
