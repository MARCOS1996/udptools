const { spawn } = require('child_process');

test1(); // Perform test 1

function test1() {

  var settings = {
    streamerPort : "5004",
    viewerPort : "5008"
  };

  console.log("Performing test 1 - rtpforwarder without changing port");

  // Start streamer
  const streamer = spawn('vlc', ["video.mp4", "--sout", "#transcode{vcodec=h264,acodec=mpga,ab=128,channels=2,samplerate=44100}:rtp{dst=localhost,port="+settings.streamerPort+",mux=ts}"]);
  console.log("Info: startig streamer at port "+settings.streamerPort);
  // Start viewer
  const viewer = spawn('vlc', ["rtp://localhost:"+settings.viewerPort]);
  console.log("Info: startig viewer at port "+settings.viewerPort);
  // Start rtpforwarder programm
  const streamforwarder = spawn('node', ["../source/streamforwarder.js", "-c", "../source/config.json"]);
  console.log("TEST - 1 - Info: starting forwarder");
  waitMillis(1500);
  // Configuring service via mqtt messages
  const mqttmessage1 = spawn('mosquitto_pub', ["-p", "1883", "-t", "streamforwarder/configuration", "-m", '{ "mqttBroker":"localhost", "srcType":"rtp", "srcPort":"5004", "dstType":"rtp", "dstPort":"5008", "dstAddr":"localhost"}']);
  console.log("Info: starting rtpforwarder service via mqtt");
  // Configuring service via mqtt messages
  waitMillis(1500);
  const mqttmessage2 = spawn('mosquitto_pub', ["-p", "1883", "-t", "streamforwarder", "-m", 'start']);
};

function waitMillis(millis){
  var waitTill = new Date(new Date().getTime() + 1 * millis);
  while(waitTill > new Date()){}
}

/*

used shell commands:

mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder" -m "start"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder" -m "stop"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder/source/port" -m "4005"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder/target/port" -m "6008"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder/target/address" -m "192.168.1.121"

vlc video.mp4 --sout "#transcode{vcodec=h264,acodec=mpga,ab=128,channels=2,samplerate=44100}:rtp{dst=localhost,port=5004,mux=ts}"

mosquitto_pub -h "localhost" -p "1883" -t "streamforwarder/configuration" -m '{ "mqttBroker":"localhost", "srcType":"rtp", "srcPort":"5004", "dstType":"rtp", "dstPort":"5008", "dstAddr":"localhost"}'

*/
