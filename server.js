const express = require("express");
const path = require("path");
const app = express();
const yaml = require('js-yaml');
const fs = require('fs');
const WebSocket = require('ws');
const http = require('http');
import OpenAI from 'openai';
require('dotenv').config();


server = http.createServer(app);
const openai = new OpenAI({
  apiKey: '$API_KEY_REQUIRED_IF_EXECUTING_OUTSIDE_NGC',
  baseURL: 'https://integrate.api.nvidia.com/v1',
})


const fileContents = fs.readFileSync('config.yaml', 'utf8');
const config = yaml.load(fileContents);
let httpOrHTTPS = false; // http = false, https = true

const PORT = config.port;

let LISTENING = config.listen;
if (LISTENING === "local") {LISTENING = '127.0.0.1';}
else if (LISTENING === "all") {LISTENING = '0.0.0.0'} 

const betterConsole = config.alerts;


const wss = new WebSocket.Server({ server});
wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        if (betterConsole) {console.log('received: %s', message);}
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                if (data.type === "message") {
                    let now = new Date();
                    let timeString = now.toLocaleTimeString();
                    client.send(JSON.stringify({
                        type: "messages",
                        contents: data.contents,
                        time: timeString
                    }));
                    if(betterConsole) {console.log("sent message")};

                }
            }
        });
    });
});


app.use(express.static(path.join(__dirname, "public")));

server.listen(PORT, LISTENING, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Listening on ${LISTENING}`);
  if (httpOrHTTPS) {console.log("Using HTTPS!")} else {console.log("Using HTTP!");}
});
