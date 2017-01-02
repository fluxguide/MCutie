# README #

This is a repository for simple MQTT Broker and Webapp for testing. It will be used in the EOT Project.

Copyright 2016 Fluxguide

## Demo ##
Open the (Demo-App)[http://40.68.84.0/mqtt/]

For Testing Purposes enter the following server information:

**IP:** 40.68.84.0

**Port:** 1884


## What is this repository for? ##

* MCutie: A simple MQTT Testing Webapp
* Broker: A simple MQTT Broker

## How do I get set up? ##

### Set up and run the broker ###

```
# change to directory /broker
cd /broker
# install packages
npm install
# run broker
node ./broker.js
```

Default port is 1883

### Set up and run the Webapp ###

- Put the contents of the /app directory in a web server directory
- open the url in your browser
- Enter the IP and Port of your MQTT Server in the "Connection" section
- Hit the "Connect" Button





## Based on ##

[Mosca MQTT Broker](https://github.com/mcollina/mosca)

[MQTT.JS](https://github.com/mqttjs/MQTT.js)

## TODO ##

### Web GUI ###

- Feature: add possibility to unsubscribe from individual topics

### Broker ###

- Add persistence layer for logging etc
