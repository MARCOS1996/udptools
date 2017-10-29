var mqtt = require('mqtt')

var mqttAddress = "";
var mqttPort = "";

if (parseAruments()) {
  var mqttClient = mqtt.connect({
    host: mqttAddress,
    port: mqttPort,
  });
}else {
  console.log("ERROR - Wrong arguments");
  process.exit(1);
}

mqttClient.on('connect', function () {
  mqttClient.subscribe('#');
})

mqttClient.on('message', function (topic, message) {
  // message is Buffer
  if (message.toString() == "get_config") {
    mqttClient.publish(topic.toString()+"/configuration", provideConfig(topic.toString()));
  }
})

//var stopic = topic.toString().split("/")

// mqttClient.publish(topic.toString()+"/configuration", provideConfig(topic.toString()))

function provideConfig(component){
  switch (component) {
    case "streamforwarder": // forcing the return of the config, db to be implemented
      return '{ "mqttBroker":"localhost", "srcType":"rtp", "srcPort":"5004", "dstType":"rtp", "dstPort":"5008", "dstAddr":"localhost"}';
      break;
    default:
      console.log("Error - trying to provide the config of a non recognized component");
  }
}

// correct arguments: -ba "localhost" -bp "1883"
function parseAruments() { // needs improvemts
  console.log(process.argv);
  if (process.argv[2]=="-ba" && process.argv[4]=="-bp") {
    mqttAddress = process.argv[3];
    mqttPort = process.argv[5];
  }else {
    return false;
  }
  return true;
};
