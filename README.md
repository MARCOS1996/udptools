# UDP Tools
MQTT controlled set of tools to forward packages, send realiable data and get statistics about it.

# Test Tool - test.js

Used to perform various test of the implemented tools

Usage:

        $ node test.js <test number>
        
Test 1: Simple port forwarding using vlc to stream data and visualize it (uses transcodification), tested on linux.

# Stream Forwarder - streamForwarder.js

Required libraries, both available via npm

        rtp-rtcp
        mqtt

Configuration via JSON object containing:

        { 
        "mqttBroker":"localhost", 
        "srcType":"rtp", 
        "srcPort":"5004", 
        "dstType":"udp", 
        "dstPort":"5008", 
        "dstAddr":"192.168.1.4"
        }

The initial configuration can be set by:

        Programm arguments - $ node streamForwarder.js -c '{ "mqttBroker":"localhost", ... ,  "dstAddr":"192.168.1.4"}'
        Text file - $ node streamForwarder.js -c '/home/file.txt'
        Database - (not implemented)
        

Supported MQTT messages for changing configuration when the programm is running

        streamForwarder <start/stop>
        streamForwarder/source/port <port>
        streamForwarder/destination/port <port>
        streamForwarder/destination/port <address>
        
next to be added:

        streamForwarder/source/type <rtp/udp>
        streamForwarder/destination/type <rtp/udp>
