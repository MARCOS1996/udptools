const { spawn } = require('child_process');

var testnumber = process.argv[2];

switch (testnumber) {
  case "0":
    process.exit(0);
    break;
  case "1":
    test1(); // Perform test 1
    break;
  case "-h":
    printHelp();
    break;
  default:
    console.log("Error entering arguments, use -h for help");
}

function printHelp() {
  console.log("\nUsage: $ nodejs test.js <test_number>");
  console.log("\nAvailable test: 1, X, X, X\n");
}

function test1() {

  var settings = {
    streamerPort : "5004",
    viewerPort : "5008"
  };

  console.log('\x1b[36m%s\x1b[0m', "\nTest 1 - Stream Forwarder - RTP->RTP\n");

  // Start streamer
  const streamer = spawn('vlc', ["video.mp4", "--sout", "#transcode{vcodec=h264,acodec=mpga,ab=128,channels=2,samplerate=44100}:rtp{dst=localhost,port="+settings.streamerPort+",mux=ts}"]);
  console.log('\x1b[33m%s\x1b[0m',"  Streaming video.mp4 using vlc on port "+settings.streamerPort);
  // Start viewer
  const viewer = spawn('vlc', ["rtp://localhost:"+settings.viewerPort]);
  console.log('\x1b[33m%s\x1b[0m',"  Opening a viewer (vlc) on port: "+settings.viewerPort);
  // Start streamforwarder programm
  const streamforwarder = spawn('nodejs', ["../source/streamforwarder.js", "-c", "../configuration/sf_config.json"]);
  console.log('\x1b[33m%s\x1b[0m',"  Running the streamforwarder.js program"+settings.viewerPort);
  waitMillis(500);
  // Configuring service via mqtt messages
  const mqttmessage1 = spawn('mosquitto_pub', ["-p", "1883", "-t", "streamforwarder/configuration", "-m", '{ "mqttBroker":"localhost", "srcType":"rtp", "srcPort":"5004", "dstType":"rtp", "dstPort":"5008", "dstAddr":"localhost"}']);
  console.log('\x1b[33m%s\x1b[0m',"  Sending the most updated configuration like the ccontroller would do");
  // Configuring service via mqtt messages
  waitMillis(500);
  const mqttmessage2 = spawn('mosquitto_pub', ["-p", "1883", "-t", "streamforwarder", "-m", 'start']);
  console.log('\x1b[33m%s\x1b[0m',"  Starting the forwarding via MQTT with the start command for 30 seconds");
  waitMillis(10000);
  streamer.kill(1);
  viewer.kill(1);
  streamforwarder.kill(1);
  console.log('\x1b[36m%s\x1b[0m', "\nTest 1 - Test completed\n");

  streamforwarder.stdout.on('data', (data) => {
    console.log('\x1b[33m%s\x1b[0m',"  streamforwarder output:");
    console.log('\x1b[35m%s\x1b[0m',"    "+data.toString());
  });

};

function waitMillis(millis){
  var waitTill = new Date(new Date().getTime() + 1 * millis);
  while(waitTill > new Date()){}
}

/*

used shell commands:

prota no seabe como hacer la gestión del proyecto
pero el proyecto del libro es simple porque lo copian de uno europeo que les han cedido una patente
la madre de la suegra le instruye le dice que no se ralle

mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder" -m "start"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder" -m "stop"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder/source/port" -m "4005"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder/target/port" -m "6008"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder/target/address" -m "192.168.1.121"

vlc video.mp4 --sout "#transcode{vcodec=h264,acodec=mpga,ab=128,channels=2,samplerate=44100}:rtp{dst=localhost,port=5004,mux=ts}"

mosquitto_pub -h "localhost" -p "1883" -t "streamforwarder/configuration" -m '{ "mqttBroker":"localhost", "srcType":"rtp", "srcPort":"5004", "dstType":"rtp", "dstPort":"5008", "dstAddr":"localhost"}'

*/
