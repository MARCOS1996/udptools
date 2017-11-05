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
  if (true) { // test if broker is ok
    console.log("  Config->Connected - broker is up, trying to connect...");
  }
  console.log("\nCONNECTED STATE\n");
}else {
  console.log("ERROR - Wrong arguments");
  process.exit(1);
}

mqttClient.on('connect', function () {
  mqttClient.subscribe(['getconfig','setconfig']);
  console.log("  Subscribed to 'getconfig' and 'setconfig'\n");
})

mqttClient.on('message', function (topic, message) {

  if (topic == "getconfig") { //message in format: <component> <id>
    var msg = message.toString().split(" ");
    console.log("  getconfig received from componet "+msg[0]+" with id "+msg[1]);
    mqttClient.publish(msg[0]+"/"+msg[1]+"/configuration", provideConfig(msg[0], msg[1]));
    console.log("    config provided: "+provideConfig(msg[0], msg[1]));
  }else if (topic == "setconfig") {
    console.log("not implemented");
  }else {
    console.log("Error with the mqtt message");
  }

})

function provideConfig(component, id){
  switch (component) {
    case "streamforwarder": // forcing the return of the config, db to be implemented
      return getConfigDB(component, id);
      break;
    default:
      console.log("Error - trying to provide the config of a non recognized component");
  }
}

function getConfigDB(component, id){
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
