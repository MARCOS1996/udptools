# UDP Tools
MQTT controlled set of tools to forward packages, send realiable data and get statistics about it.
# RTP Forwarder - rtpforwarder.js

MQTT server configuration to be controlled by:

        var mqttClient = mqtt.connect({
                host: 'localhost',
                port: 1883,
                username: 'rtptool',
                password: '1234'
        });

Default configuration for the forwarder

        var settings = {
          srcPort : "5004",
          dstPort : "5008",
          dstAddr : "192.168.1.121"
        }

Supported MQTT Messages:

To controll the status use

        rtpforwarder <start/stop>

To modify the default values of the settings object

        rtpforwarder/source/port <port>
        rtpforwarder/destination/port <port>
        rtpforwarder/destination/port <address>
