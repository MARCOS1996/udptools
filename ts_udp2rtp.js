var mqtt = require('mqtt');

const dgram = require('dgram');

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
  dstAddr : "192.168.1.121"
}

var Listener;
var Sender;

mqttClient.on('connect', function () {
  mqttClient.subscribe('rtpforwarder/#')
});

mqttClient.on('message', function (topic, message) {

  if (message.toString().includes("start")){

    Listener=dgram.createSocket('udp4');
    Listener.bind(settings.srcPort);

    Sender=new RtpSession(0); // Pick a random port, it won't be used
    Sender.setRemoteAddress(settings.dstPort,settings.dstAddr);

  }else if (message.toString().includes("stop")) {

    if (Listener!=undefined) {
      Listener.close();
    }
    if (Sender!=undefined) {
      Sender.close();
    }

  }else if (topic.toString().includes("source")){ // rtpforwarder/source/port

    console.log("Configuration: source port set to "+message.toString());
    settings.srcPort = message.toString();
    if (Listener!=undefined) {
      Listener.close();
    }
    Listener=new RtpSession(settings.srcPort);

  }else if (topic.toString().includes("target")){
    if (topic.toString().includes("port")){ // rtpforwarder/target/port

      console.log("Configuration: target port set to "+message.toString());
      settings.dstPort = message.toString();

    }else{ // rtpforwarder/target/address

      console.log("Configuration: target address port set to "+message.toString());
      settings.dstAddr = message.toString();

    }
    if (Sender!=undefined) {
      Sender.setRemoteAddress(settings.dstPort,settings.dstAddr);
    }

  }else{

    console.log("MQTT Error: "+topic.toString()+" does not exist");

  }

  Listener.on("listening",function(){
      console.log("Status: RTP server is now running on port: "+settings.srcPort);
  });

  Listener.on("message",function(msg,info){

    var rtpPacket=new RtpPacket(msg);
    var rtpPacketCopy=rtpPacket.createBufferCopy();Configuration:

    console.log("Configuration: Packet with SqNumber - "+rtpPacket.getSeqNumber().toString()+"forwarded from "+info.address+":"+info.port+" to "settings.dstAddr+":"+settings.dstport);
    Sender.sendPacket(rtpPacketCopy,rtpPacketCopy.length);

  });

});
