const mqtt = require('mqtt');
const express = require('express');
const path = require('path');
const app = express();

const mqttHost = "mqtt://nam1.cloud.thethings.network:1883";
const mqttUsername = "edd-teste@ttn";
const mqttPassword = "NNSXS.LLUHKYHC7UVX4C636JOJ2ETAV7KQTWHFQOVJGAI.4AKRHEDUM2OIJZXWOI67Y7NKD6UYLQGVKJW7AOXKSSA4NMBKSEDQ";

const client = mqtt.connect(mqttHost, {
    username: mqttUsername,
    password: mqttPassword
});

let messageHistory = [];

client.on('connect', function () {
    console.log('Connected to MQTT Broker');
    client.subscribe('#', function (err) {
        if (!err) {
            console.log('Subscribed to all topics');
        }
    });
});

client.on('message', function (topic, message) {
    // Parse the JSON payload and extract dev_addr and payload
    try {
        const payload = JSON.parse(message.toString());
        const dev_addr = payload.end_device_ids.dev_addr || "No dev_addr found";
        const data_payload = payload.uplink_message.frm_payload || "No payload found";
        const entry = {
            dev_addr: dev_addr,
            payload: data_payload
        };
        messageHistory.push(entry);

        // Limit the history to a maximum number of entries
        if (messageHistory.length > 10) {
            messageHistory.shift(); // Remove the oldest item
        }

        console.log(`Message received on ${topic}:`, entry);
    } catch (e) {
        console.log("Invalid message format", e);
    }
});

// Endpoint to send the latest message history to the frontend
app.get('/mqtt-data', (req, res) => {
    res.json(messageHistory);
});

// Serving the index.html directly from the project root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Setting up server port
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
