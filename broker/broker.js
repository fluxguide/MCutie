// console.log("hello world");

// // get mosca
// var mosca = require('mosca');


// var pubsubSettings = {
//   //using ascoltatore
//   type: 'mongo',
//   url: 'mongodb://localhost:27017/mqtt',
//   pubsubCollection: 'ascoltatori',
//   mongo: {}
// };


// var moscaSettings = {
//   port: 1883,           	// mosca (mqtt) port
//   backend: pubsubSettings   // pubsubSettings is the object we created above
// };

// var server = new mosca.Server(moscaSettings);   	// here we start mosca
// server.on('ready', setup);  						//on init it fires up setup()

// // fired when the mqtt server is ready
// function setup() {
//   console.log('Mosca server is up and running')
// }


var mosca = require('mosca')


var settings = {
  http: {
    port: 1883,
    bundle: true,
    static: './'
  }
};

//here we start mosca
var server = new mosca.Server(settings);

// Server Event Listeners
server.on('ready', onSetup);
server.on('clientConnected', onClientConnected);
server.on('subscribed', onClientSubscribed);
server.on('published', function() {});



// fired when the mqtt server is ready
function onSetup() {
	console.log('Mosca server is up and running')
}

function onClientConnected(client) {
	console.log('Client Connected:', client.id);
}

function onClientSubscribed(topic, client) {
	console.log("Client " + client.id + " subscribed to: " + topic);

	// send back a message
	var message = {
	  topic: 'presence',
	  payload: 'abcde', // or a Buffer
	  qos: 0, // 0, 1, or 2
	  retain: false // or true
	};

	server.publish(message, function() {
	  console.log('Message sent.');
	});
}
