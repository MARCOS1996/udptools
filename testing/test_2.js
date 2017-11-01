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
