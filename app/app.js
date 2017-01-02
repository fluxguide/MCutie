(function() {

    // local app var
    var app = app || {};

    // app settings defaults
    app.settings =  {
        /* Default Settings */
        environment: 'testing'      // 'testing' or 'production'
    };



    /**
     * Initialize App
     */
    app.init = function() {

        // export app (for debugging purposes only)
        if(app.debugMode()) window.app = app;

        // initialize UI
        app.initUI();
    };




    /**
     * OTHER METHODS:

      app.client.unsubscribe(topic)  // unsubscribe from topic
      app.client.end() // close the connection

     */



    /**
     * Event handler for connection established
     */
    app.onConnect = function() {
        app.ui.subscriberLog("Connected to " + app.client.options.host);
        app.ui.publisherLog("Connected to " + app.client.options.host);
        document.querySelector('body').classList.remove("disconnected");
        document.querySelectorAll('.connection-container input').forEach(function(el) { el.setAttribute('disabled', 'true'); });
        console.log("connected");

        // subscribe to "presence" topic
        //app.client.subscribe('presence');
        // publish a message to "presence" topic
        //app.client.publish('presence', 'Hello MQTT!');
    };

    /**
     * Event handler for connection lost / server unavailable
     */
    app.onOffline = function () {
        app.ui.subscriberLog("Connection lost.");
        app.ui.publisherLog("Connection lost.");
        document.querySelector('body').classList.add("offline");
        console.log("offline / server down");
    };

    /**
     * Event handler for trying to reconnect to server
     */
    app.onReconnect = function () {
        document.querySelector('body').classList.remove("offline");
        console.log("try to reconnect!");
    };

    /**
     * Event handler for connection closed by client
     */
    app.onClose = function () {
        document.querySelector('body').classList.add("disconnected");
        document.querySelectorAll('.connection-container input').forEach(function(el) { el.removeAttribute('disabled', 'true'); });
        console.log("connection closed by client.");
    };

    /**
     * Event handler for message received
     */
    app.onMessageReceived = function (topic, message) {
        console.log(message.toString());    // message is a Buffer
        app.ui.subscriberLog("Message received on \"" + topic + "\": " + message.toString());
    };



    /**
     * Function to determine if debugMode is on or off
     * @return boolean the current debugMode
     */
    app.debugMode = function() {
        if(app.settings.environment == 'testing' || app.settings.environment == 'debug') return true;
        else return false;
    };



    /**
     *
     * UI
     *
     */

    app.ui = app.ui || {};

    /**
     * Connection UI: Connect Button Event Handler
     */
    app.ui.connectButtonHandler = function() {
        var serverIp = document.querySelector('.connection-input-ip').value;
        var serverPort = document.querySelector('.connection-input-port').value;
        var validationError = false;

        // simple check for valid values
        if(serverIp === "") {
            document.querySelector('.connection-input-ip').classList.add("error");
            window.setTimeout(function() { document.querySelector('.connection-input-ip').classList.remove("error"); }, 1000);
            validationError = true;
        }

        if(serverPort === "" || isNaN(parseInt(serverPort)) ) {
            document.querySelector('.connection-input-port').classList.add("error");
            window.setTimeout(function() { document.querySelector('.connection-input-port').classList.remove("error"); }, 1000);
            validationError = true;
        }
        //
        if(validationError) return;

        // store to localStorage
        localStorage.setItem('serverIp', serverIp);
        localStorage.setItem('serverPort', serverPort);

        // connect
        app.client = mqtt.connect('mqtt://' + serverIp.concat(":", serverPort));
        // event listeners
        app.client.on('connect', app.onConnect);
        app.client.on('message', app.onMessageReceived);
        app.client.on('offline', app.onOffline);
        app.client.on('reconnect', app.onReconnect);
        app.client.on('close', app.onClose);
    };

    /**
     * Connection UI: Disconnect Button Event Handler
     */
    app.ui.disconnectButtonHandler = function() {

        if(app.client.connected) {
            app.client.end();
        }
    };

    /**
     * Subscriber UI: Subscribe Button Event Handler
     */
    app.ui.subscribeButtonHandler = function() {

        var topic = document.querySelector('.subscriber-topic-input').value;

        if(topic !== "") {
            app.client.subscribe(topic);
            app.currentlySubscribedTopics = app.currentlySubscribedTopics || [];
            app.currentlySubscribedTopics.push(topic);
            app.ui.subscriberLog("Subscribed to \"" + topic + "\"");
        }
        else {
            document.querySelector('.subscriber-topic-input').classList.add("error");
            window.setTimeout(function() { document.querySelector('.subscriber-topic-input').classList.remove("error"); }, 1000);
        }
    };

    /**
     * Subscriber UI: Unsubscribe Button Event Handler
     */
    app.ui.unsubscribeButtonHandler = function() {
        if(app.currentlySubscribedTopics.length === 0) return;

        // unsubscribe from all currently subscribed topics
        for (var i = app.currentlySubscribedTopics.length - 1; i >= 0; i--) {
            app.client.unsubscribe(app.currentlySubscribedTopics[i]);
        }
        app.ui.subscriberLog("Unsubscribed from: " + app.currentlySubscribedTopics.join(', '));

    };


    /**
     * Publisher UI: Send Message Button Event Handler
     */
    app.ui.sendMessageButtonHandler = function() {
        var topic =     document.querySelector('.publisher-topic-input').value;
        var message =   document.querySelector('.publisher-message-input').value;

        // error case – empty topic or message
        if(topic === "" || message === "") {
            var selector = (topic === "") ? '.publisher-topic-input' : '.publisher-message-input';
            document.querySelector(selector).classList.add("error");
            window.setTimeout(function() { document.querySelector(selector).classList.remove("error"); }, 1000);
            return;
        }

        // send message
        app.client.publish(topic, message);
        app.ui.publisherLog('Message published to "' + topic + '": ' + message);
    };


    /**
     * Clear Log Button Event Handler
     */
    app.ui.clearLog = function(event) {
        if(event.target.classList.contains('subscriber-clear-log-button') === true) document.querySelector('textarea.subscriber-log-output').value = "";
        if(event.target.classList.contains('publisher-clear-log-button') === true) document.querySelector('textarea.publisher-log-output').value = "";
    };


    /**
     * Initialize UI: Add event listeners to all the buttons
     */
    app.initUI = function() {

        // fill Server Information from localStorage if available
        if(localStorage.getItem('serverIp') != undefined && localStorage.getItem('serverPort') != undefined) {
            document.querySelector('.connection-input-ip').value = localStorage.getItem('serverIp');
            document.querySelector('.connection-input-port').value = localStorage.getItem('serverPort');
        }

        // Connection Buttons
        document.querySelector('.connection-connect-button').addEventListener('click', app.ui.connectButtonHandler);
        document.querySelector('.connection-disconnect-button').addEventListener('click', app.ui.disconnectButtonHandler);

        // Subscriber Buttons
        document.querySelector('.subscriber-subscribe-button').addEventListener('click', app.ui.subscribeButtonHandler);
        document.querySelector('.subscriber-unsubscribe-button').addEventListener('click', app.ui.unsubscribeButtonHandler);
        document.querySelector('.subscriber-clear-log-button').addEventListener('click', app.ui.clearLog);

        // Publisher Buttons
        document.querySelector('.publisher-send-message-button').addEventListener('click', app.ui.sendMessageButtonHandler);
        document.querySelector('.publisher-clear-log-button').addEventListener('click', app.ui.clearLog);
    };






    /**
     * Subscriber Log output
     */
    app.ui.subscriberLog = function(message) {
        var d = new Date();
        document.querySelector('textarea.subscriber-log-output').value = app.getDateString() + " – " + message + "\n" + document.querySelector('textarea.subscriber-log-output').value;
    };

    /**
     * Publisher Log output
     */
    app.ui.publisherLog = function(message) {
        var d = new Date();
        document.querySelector('textarea.publisher-log-output').value = app.getDateString() + " – " + message + "\n" + document.querySelector('textarea.publisher-log-output').value;
    };

    /**
     * Help Function to format Date String (for logs)
     */
    app.getDateString = function() {
        var d = new Date();
        var hours = (d.getHours()<10?'0':'') + d.getHours();
        var minutes = (d.getMinutes()<10?'0':'') + d.getMinutes();
        var seconds = (d.getSeconds()<10?'0':'') + d.getSeconds();
        return hours + ":" + minutes + ":" + seconds;
    };


    // initialize app when document is ready
    document.addEventListener('DOMContentLoaded', app.init);

})();
