const { spawn } = require('child_process');

test1();

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
  const rtpforwarder = spawn('node', ["rtpforwarder.js"]);
  console.log("Info: starting forwarder");
  var waitTill = new Date(new Date().getTime() + 1 * 1000);
  while(waitTill > new Date()){}
  // Starting service via mqtt messages
  const mqtt1 = spawn('mosquitto_pub', ["-p", "1883", "-t", "rtpforwarder", "-m", "start"]);
  console.log("Info: starting rtpforwarder service via mqtt");

};

/*
console.log("Configuring source port");
const mqtt2 = spawn('mosquitto_pub', ["-h", "localhost", "-p", "1883", "rtpforwarder", "-m", "start"]);

mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder" -m "start"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder" -m "stop"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder/source/port" -m "4005"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder/target/port" -m "6008"
mosquitto_pub -h "localhost" -p "1883" -t "rtpforwarder/target/address" -m "192.168.1.121"

vlc video.mp4 --sout "#transcode{vcodec=h264,acodec=mpga,ab=128,channels=2,samplerate=44100}:rtp{dst=localhost,port=5004,mux=ts}"

*/
