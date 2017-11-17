1. Install Platform

  Install nodejs 8.X and npm 5.X

    Linux - Debian
      $ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
      $ sudo apt-get install nodejs

    Windows & Mac
      Download from https://nodejs.org/es/download/current/

  Download or clone the repository
    $ git clone https://github.com/MARCOS1996/udptools -b working

  Run npm install in the project folder to install the requiered libraries

2. Choose a broker

  Option A - Mosquitto - Lightweight and not scalable, suitable for small environments

    Linux - Avaliable via apt-get or yum
    Windows and Mac see official page https://mosquitto.org/download/

  Option B - VerneMQ - Scalable and production ready

    Avaliable only for linux, see installation and setup guide on /docs/VerneMQSetup.txt

3. Configure the broker

  Option A - Mosquitto
    No initial configuration needed
    
  Option B - VerneMQ
    Needs to setup a cluster, see [VerneMQsetup.txt](https://github.com/MARCOS1996/udptools/blob/working/docs/VerneMQsetup.txt) for help
