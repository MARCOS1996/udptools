var mqtt = require('mqtt')

var RtpSession=require("rtp-rtcp").RtpSession;
var RtpPacket=require("rtp-rtcp").RtpPacket;

// MQTT Client configuration
var mqttClient = mqtt.connect({
  host: 'localhost',
  port: 1883,
  username: 'rtptool',
  password: '1234'
});

// source/destination configuration
var settings = {
  srcPort : "5004",
  dstPort : "5008",
  dstAddr : "localhost"
}

var Listener;
var Sender;

mqttClient.on('connect', function () {
  mqttClient.subscribe('rtpforwarder/#')
});

mqttClient.on('message', function (topic, message) {

  if (topic.toString()=="rtpforwarder" && message.toString()=="start"){ // rtpforwarder stop

    console.log("Configuration: starting forwarder...");
    Listener=new RtpSession(settings.srcPort); // Create a listener
    Sender=new RtpSession(0); // Pick a random port, it won't be used, create a sender
    Sender.setRemoteAddress(settings.dstPort,settings.dstAddr); // set the target for the sender

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
    settings.srcPort = message.toString(); // change the global settings
    if (Listener!=undefined) { // only close if Listener is running
      Listener.close();
    }
    Listener=new RtpSession(settings.srcPort); // create a new Listener

  }else if (topic.toString().includes("rtpforwarder/target")){
    if (topic.toString().includes("port")){ // rtpforwarder/target/port

      console.log("Configuration: target port set to "+message.toString());
      settings.dstPort = message.toString();

    }else{ // rtpforwarder/target/address

      console.log("Configuration: target address port set to "+message.toString());
      settings.dstAddr = message.toString();

    }

    if (Sender!=undefined) { // only close if Listener is running
      Sender.setRemoteAddress(settings.dstPort,settings.dstAddr);
    }

  }else{

    console.log("MQTT Error: "+topic.toString()+" does not exist");

  }

  Listener.on("listening",function(){
      console.log("Status: RTP server is running on port: "+settings.srcPort);
  });

  Listener.on("message",function(msg,info){
      var rtpPacket=new RtpPacket(msg);
      var rtpPacketCopy=rtpPacket.createBufferCopy();
      console.log("Packet with SqNumber - "+rtpPacket.getSeqNumber().toString()+" forwarded from "+info.address+":"+info.port+" to "+settings.dstAddr+":"+settings.dstPort);
      Sender.sendPacket(rtpPacketCopy,rtpPacketCopy.length);
  });

});
