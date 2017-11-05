const { spawn } = require('child_process');
var schedule = require('node-schedule');

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
  streamer = spawn('vlc', ["video.mp4", "--sout", "#transcode{vcodec=h264,acodec=mpga,ab=128,channels=2,samplerate=44100}:rtp{dst=localhost,port="+settings.streamerPort+",mux=ts}"]);
  console.log('\x1b[33m%s\x1b[0m',"  Streaming video.mp4 using vlc on port "+settings.streamerPort);
  // Start viewer
  viewer = spawn('vlc', ["rtp://localhost:"+settings.viewerPort]);
  console.log('\x1b[33m%s\x1b[0m',"  Opening a viewer (vlc) on port: "+settings.viewerPort);
  // Start streamforwarder programm
  streamforwarder = spawn('nodejs', ["../source/streamforwarder.js", "-c", "../configuration/sf_config.json"]);
  console.log('\x1b[33m%s\x1b[0m',"  Running the streamforwarder.js program"+settings.viewerPort);
  waitMillis(500);
  // Configuring service via mqtt messages
  const mqttmessage1 = spawn('mosquitto_pub', ["-p", "1883", "-t", "streamforwarder/1/configuration", "-m", '{ "id":"1", "mqttBroker":"localhost", "srcType":"rtp", "srcPort":"5004", "dstType":"rtp", "dstPort":"5008", "dstAddr":"localhost"}']);
  console.log('\x1b[33m%s\x1b[0m',"  Sending the most updated configuration like the ccontroller would do");
  // Configuring service via mqtt messages
  const mqttmessage2 = spawn('mosquitto_pub', ["-p", "1883", "-t", "streamforwarder/1", "-m", 'start']);
  console.log('\x1b[33m%s\x1b[0m',"  Starting the forwarding via MQTT with the start command for 30 seconds");

  streamforwarder.stdout.on('data', function (data) {
    console.log('\x1b[35m%s\x1b[0m',data.toString());
  });

  streamforwarder.stderr.on('data', function (data) {
    console.log(data.toString());
  });

  let startTime = new Date(Date.now());
  let endTime = new Date(startTime.getTime() + 15000);
  var j = schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/30 * * * * *' }, function(){
    streamforwarder.kill(1);
    viewer.kill(1);
    streamer.kill(1);
    console.log('\x1b[36m%s\x1b[0m', "\nTest 1 - Finished\n");
  });

};

function waitMillis(millis){
  var waitTill = new Date(new Date().getTime() + millis);
  while(waitTill > new Date()){}
}
