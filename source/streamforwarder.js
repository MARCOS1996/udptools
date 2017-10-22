var mqtt = require('mqtt')

var RtpSession=require("rtp-rtcp").RtpSession;
var RtpPacket=require("rtp-rtcp").RtpPacket;

configuration = {
  mqttBroker : undefined,
  srcType : undefined,
  srcPort : undefined,
  dstType : undefined,
  dstPort : undefined,
  dstAddr : undefined,
};

var Listener;
var Sender;

if (parseAruments()){ // if pase arguments was succesfull, do something
  console.log("\nCONFIGURED STATE\n");

  var mqttClient = mqtt.connect({
    host: configuration.mqttBroker,
    port: 1883,
    username: 'rtptool',
    password: '1234'
  });

  mqttClient.on('connect', function () {
    mqttClient.subscribe('rtpforwarder/#')
  });

  mqttClient.on('message', function (topic, message) {
    if (configuration.srcType=="rtp" && configuration.dstType=="rtp") {
      rtp2rtp(topic, message);
    }else {
      console.log("not implemented");
    }
  });

  console.log("...working really hard...");



}else {
  process.exit(1);
}

function rtp2rtp(topic, message){

  if (topic.toString()=="rtpforwarder" && message.toString()=="start"){ // rtpforwarder stop

    console.log("Configuration: starting forwarder...");
    Listener=new RtpSession(configuration.srcPort); // Create a listener
    Sender=new RtpSession(0); // Pick a random port, it won't be used, create a sender
    Sender.setRemoteAddress(configuration.dstPort,configuration.dstAddr); // set the target for the sender

  }else if (topic.toString()=="rtpforwarder" && message.toString()=="stop") { // rtpforwarder stop

    console.log("Configuration: forwarder stopped");
    if (Listener!=undefined) { // only close if Listener is running
      Listener.close();
    }
    if (Sender!=undefined) { // only close if Listener is running
      Sender.close();
    }

  }else if (topic.toString()=="rtpforwarder/source/port"){ // rtpforwarder/source/port

    console.log("Configuration: source port set to "+message.toString());
    configuration.srcPort = message.toString(); // change the global configuration
    if (Listener!=undefined) { // only close if Listener is running
      Listener.close();
    }
    Listener=new RtpSession(configuration.srcPort); // create a new Listener

  }else if (topic.toString().includes("rtpforwarder/target")){
    if (topic.toString().includes("port")){ // rtpforwarder/target/port

      console.log("Configuration: target port set to "+message.toString());
      configuration.dstPort = message.toString();

    }else{ // rtpforwarder/target/address

      console.log("Configuration: target address port set to "+message.toString());
      configuration.dstAddr = message.toString();

    }

    if (Sender!=undefined) { // only close if Listener is running
      Sender.setRemoteAddress(configuration.dstPort,configuration.dstAddr);
    }

  }else{

    console.log("MQTT Error: "+topic.toString()+" does not exist");

  }

  Listener.on("listening",function(){
      console.log("Status: RTP server is running on port: "+configuration.srcPort);
  });

  Listener.on("message",function(msg,info){
      var rtpPacket=new RtpPacket(msg);
      var rtpPacketCopy=rtpPacket.createBufferCopy();
      console.log("Packet with SqNumber - "+rtpPacket.getSeqNumber().toString()+" forwarded from "+info.address+":"+info.port+" to "+configuration.dstAddr+":"+configuration.dstPort);
      Sender.sendPacket(rtpPacketCopy,rtpPacketCopy.length);
    });
};

// Parse arguments from command line, true if the configuration is valid
function parseAruments() {
  var type = process.argv[2];
  console.log("\nRUNNING STATE\n");
  switch(type) {
    case "-c":
      console.log("  Run->Config - Recevied config from argments");
      return validateConfig(process.argv[3]);
      break;
    case "-f":
      console.log("  Run->Config - Recevied config from file: "+process.argv[3]);
      return false // not yet supported
      break;
    case "-d":
      console.log("  Run->Config - Recevied config from database: "+process.argv[3]);
      return false // not yet supported
      break;
    case "-h":
      printHelp();
      return false;
      break;
    default:
      console.log("Error - Wrong arguments, type -h for help");
      return false;
  }
};

/*
Example of a valid configuration: '{ "mqttBroker":"localhost", "srcType":"rtp", "srcPort":"5004", "dstType":"udp", "dstPort":"5008", "dstAddr":"192.168.1.4"}'
*/

function validateConfig(config) {
  var tmpConfig = JSON.parse(config);
  console.log("  Run->Config - Validating: "+config);
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

// Print the help of the programm
function printHelp() {
  console.log("I'm the help");
};
