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

mqttClient.on('connect', function () {
  mqttClient.subscribe('rtpforwarder/#')
});

var settings = {
  srcPort : "5004",
  dstPort : "5008",
  dstAddr : "192.168.1.121"
}

var Listener;
var Sender;

mqttClient.on('message', function (topic, message) {

  if (message.toString().includes("start")){

    Listener=new RtpSession(settings.srcPort);
    Sender=new RtpSession(0); // Pick a random port, it won't be used
    Sender.setRemoteAddress(settings.dstPort,settings.dstAddr);

  }else if (message.toString().includes("stop")) {

    Listener.close();
    Sender.close();

  }else if (topic.toString().includes("source")){ // rtpforwarder/source/port

    console.log("Configuration: source port set to "+message.toString());
    settings.srcPort = message.toString();
    Listener.close();
    Listener=new RtpSession(settings.srcPort);

  }else if (topic.toString().includes("target")){
    if (topic.toString().includes("port")){ // rtpforwarder/target/port

      console.log("Configuration: target port set to "+message.toString());
      settings.dstPort = message.toString();

    }else{ // rtpforwarder/target/address

      console.log("Configuration: target address port set to "+message.toString());
      settings.dstAddr = message.toString();

    }
    Sender.setRemoteAddress(settings.dstPort,settings.dstAddr);

  }else{

    console.log("MQTT Error: "+topic.toString()+" does not exist");

  }

  Listener.on("listening",function(){
      console.log("Status: RTP server is running on port: "+settings.srcPort);
  });

  Listener.on("message",function(msg,info){
      var rtpPacket=new RtpPacket(msg);
      var rtpPacketCopy=rtpPacket.createBufferCopy();
      console.log("L: SN="+rtpPacket.getSeqNumber().toString()+" TS="+rtpPacket.getTimestamp().toString()+" from "+info.address+":"+info.port);
      Sender.sendPacket(rtpPacketCopy,rtpPacketCopy.length);
  });
});
