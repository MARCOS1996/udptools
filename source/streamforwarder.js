var mqtt = require('mqtt')
var RtpSession=require("rtp-rtcp").RtpSession;
var RtpPacket=require("rtp-rtcp").RtpPacket;
var fs = require('fs')

configuration = {
  mqttBroker : undefined,
  srcType : undefined,
  srcPort : undefined,
  dstType : undefined,
  dstPort : undefined,
  dstAddr : undefined,
};

var Listener=new RtpSession(0);
var Sender=new RtpSession(0);

if (parseAruments()) {
  console.log("\nCONFIGURED STATE\n");

  var mqttClient = mqtt.connect({
    host: 'localhost',
    port: 1883,
  });

  console.log("  Config->Subscribed||Working offilne - triyng to connect with the broker");

  /*
  Decide is broker is up and running or not, now forcing to running
  */

  console.log("  Config->Subscribed||Working offilne - broker is up");

  mqttClient.on('connect', function (connack) { // subscribe to component topic
    console.log("\nSUBSCRIBED STATE\n");
    mqttClient.subscribe('streamforwarder/#');
    console.log("  Sub->Sub - requesting updated configuration");
    mqttClient.publish('streamforwarder', 'get_config');
  });

  mqttClient.on('message', function (topic, message) {
    if (topic == "streamforwarder/configuration") { // try to update config
      console.log("  Sub->StandbyOnline - Updating configuration");
      if (validateConfig(message)) { // config updated without problems
        console.log("\n  Sub->Sub - config updated");
        console.log("\nSUBSCRIBED STATE\n");
      }else { // config not updated
        console.log("\n  Sub->Sub - config not updated");
        console.log("\nSUBSCRIBED STATE\n");
      }
    } else if (message != "get_config") { // Check what of the four types of forwarding is configured and run it. avoid the message get_config that we sent previously
      if (configuration.srcType=="rtp" && configuration.dstType=="rtp") {
        rtp2rtp(message.toString());
      }else {
        console.log("ERROR - forwarding from "+configuration.srcType+" to "+configuration.dstType+" not implemented yet");
        process.exit(1);
      }
    }
  });

  mqttClient.on('error', function(error){
    console.log(error);
    mqttClient.end();
  });

}else {
  console.log("ERROR - Wrong arguments");
  process.exit(1);
};

function rtp2rtp(command){
  switch(command) {
    case "start":
      console.log("  Sub->Forw - MQTT Recevied start");
      console.log("\nFORWARDING STATE\n");
      Listener=new RtpSession(configuration.srcPort); // Create a listener
      Sender=new RtpSession(0); // Pick a random port, it won't be used, create a sender
      Sender.setRemoteAddress(configuration.dstPort,configuration.dstAddr); // set the target for the sender
      break;
    case "stop":
      console.log("  Forw->Sub - MQTT Recevied stop");
      console.log("\nSUBSCRIBED STATE\n");
      if (Listener!=undefined) { // only close if Listener is running
        Listener.close();
      }
      if (Sender!=undefined) { // only close if Listener is running
        Sender.close();
      }
      break;
    default:
      console.log("ERROR bad command");
  }

  Listener.on("listening",function(){
      console.log("    status: RTP server is running on port: "+configuration.srcPort);
  });

  Listener.on("message",function(msg,info){
      var rtpPacket=new RtpPacket(msg);
      var rtpPacketCopy=rtpPacket.createBufferCopy();
      //console.log("    status: Packet with SqNumber - "+rtpPacket.getSeqNumber().toString()+" forwarded from "+info.address+":"+info.port+" to "+configuration.dstAddr+":"+configuration.dstPort);
      Sender.sendPacket(rtpPacketCopy,rtpPacketCopy.length);
    });
};

function parseAruments() {
  var type = process.argv[2];
  console.log("\nRUNNING STATE\n");
  switch(type) {
    case "-c":
      console.log("  Run->Config - Recevied config from file "+process.argv[3]);
      var fileData = fs.readFileSync(process.argv[3], 'utf8');
      console.log("  Run->Config - Validating configuration");
      if (!validateConfig(fileData)) {
        return false;
      }
      break;
    case "-h":
      printHelp();
      return false;
    default:
      console.log("Error - Wrong arguments, type -h for help");
      return false;
  }
  return true;
};

function updateConfig(config) {
  var tmpConfig = JSON.parse(config);
  if (tmpConfig.srcType) {
    console.log("    Source type: "+tmpConfig.srcType);
    if (tmpConfig.srcPort) {
      console.log("    Source port: "+tmpConfig.srcPort);
      if (tmpConfig.dstType) {
        console.log("    Destination type: "+tmpConfig.dstType);
        if (tmpConfig.dstPort) {
          console.log("    Destination port: "+tmpConfig.dstPort);
          if (tmpConfig.dstAddr) {
            console.log("    Destination address: "+tmpConfig.dstAddr);
          } else {
            console.log("    Error on destination address");
            return false;
          }
        } else {
          console.log("    Error on destination port");
          return false;
        }
      } else {
        console.log("    Error on destination type");
        return false;
      }
    } else {
      console.log("    Error on source port");
      return false;
    }
  } else {
    console.log("    Error on source type");
    return false;
  }
  configuration = tmpConfig;
  return true;
};

function validateConfig(config) {
  var tmpConfig = JSON.parse(config);
  if (tmpConfig.mqttBroker) {
    console.log("\n    MQTT Broker: "+tmpConfig.mqttBroker);
    if (tmpConfig.srcType) {
      console.log("    Source type: "+tmpConfig.srcType);
      if (tmpConfig.srcPort) {
        console.log("    Source port: "+tmpConfig.srcPort);
        if (tmpConfig.dstType) {
          console.log("    Destination type: "+tmpConfig.dstType);
          if (tmpConfig.dstPort) {
            console.log("    Destination port: "+tmpConfig.dstPort);
            if (tmpConfig.dstAddr) {
              console.log("    Destination address: "+tmpConfig.dstAddr);
            } else {
              console.log("    Error on destination address");
              return false;
            }
          } else {
            console.log("    Error on destination port");
            return false;
          }
        } else {
          console.log("    Error on destination type");
          return false;
        }
      } else {
        console.log("    Error on source port");
        return false;
      }
    } else {
      console.log("    Error on source type");
      return false;
    }
  }else {
    console.log("    Error on mqtt broker");
    return false;
  }
  configuration = tmpConfig;
  return true;
};
