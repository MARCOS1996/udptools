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
  mqttClient.subscribe(['configuration','streamforwarder/configuration']);
  console.log("  Subscribed to 'configuration' for requests");
  console.log("  Subscribed to 'streamforwarder/configuration' for saving configs in db");
})

mqttClient.on('message', function (topic, message) {

  console.log("MQTT Recevied: "+topic.toString()+" "+message.toString());

  if (topic.toString() == "configuration") { // send configuration
    mqttClient.publish(message.toString()+"/configuration", provideConfig(message.toString()));
    console.log("MQTT Sent: "+message.toString()+"/configuration"+" "+provideConfig(message.toString()));
  }else { // save config in db
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
