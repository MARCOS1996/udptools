/*

used shell commands:

usefull info

mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder" -m "start"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder" -m "stop"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder/source/port" -m "4005"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder/target/port" -m "6008"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder/target/address" -m "192.168.1.121"

vlc video.mp4 --sout "#transcode{vcodec=h264,acodec=mpga,ab=128,channels=2,samplerate=44100}:rtp{dst=localhost,port=5004,mux=ts}"

mosquitto_pub -h "localhost" -p "1883" -t "streamforwarder/configuration" -m '{ "mqttBroker":"localhost", "srcType":"rtp", "srcPort":"5004", "dstType":"rtp", "dstPort":"5008", "dstAddr":"localhost"}'

*/

/*

This components listens on the /configuration/# topic, where the rest
of components will request their more updated configuration

*/

var mqtt = require('mqtt')

configuration = {
  mqttBroker : undefined,
  mqttPort : undefined,
};

console.log("\nRUNNING STATE\n");

if (parseAruments()) {
  console.log("  Run->Config - Actual configuration: \n");
  console.log("    mqttBroker:"+configuration.mqttBroker);
  console.log("    mqttPort:"+configuration.mqttPort);
  console.log("\nCONFIGURED STATE\n");
  var mqttClient = mqtt.connect({
    host: configuration.mqttBroker,
    port: configuration.mqttPort,
  });
  console.log("\CONNECTED STATE\n");
}else {
  console.log("ERROR - Wrong arguments");
  process.exit(1);
}

mqttClient.on('connect', function () {
  mqttClient.subscribe(['configuration','streamforwarder/#']);
  console.log("  Subscribed to 'configuration' for requests");
  console.log("  Subscribed to 'streamforwarder/#' for saving configs in db"); // del tipo "streamforwarder/id/configuration"
})

mqttClient.on('message', function (topic, message) {

  console.log("MQTT Recevied: "+topic.toString()+" "+message.toString());

  if (topic.toString() == "configuration") { // send configuration
    var msg = str.split(" ");
    if (msg[]) {

    }
    mqttClient.publish(message.toString()+"/configuration", provideConfig(message.toString()));
    console.log("MQTT Sent: "+message.toString()+"/configuration"+" "+provideConfig(message.toString()));
  }else if (topic.toString().includes("configuration")) {
    console.log("config saved in db");
  }

})

function provideConfig(component){
  switch (component) {
    case "streamforwarder": // forcing the return of the config, db to be implemented
      return getConfigDB(component);
      break;
    default:
      console.log("Error - trying to provide the config of a non recognized component");
  }
}

function getConfigDB(component){
  return '{ "mqttBroker":"localhost", "srcType":"rtp", "srcPort":"5004", "dstType":"rtp", "dstPort":"5008", "dstAddr":"localhost"}'
}

// correct arguments: -ba "localhost" -bp "1883"
function parseAruments() { // needs improvemts
  if (process.argv[2]=="-ba" && process.argv[4]=="-bp") {
    configuration.mqttBroker = process.argv[3];
    configuration.mqttPort = process.argv[5];
  }else {
    return false;
  }
  return true;
};
