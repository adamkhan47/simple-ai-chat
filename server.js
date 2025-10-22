const express = require("express");
const path = require("path");
const app = express();
const yaml = require('js-yaml');
const fs = require('fs');
const WebSocket = require('ws');
const http = require('http');

server = http.createServer(app);

const fileContents = fs.readFileSync('config.yaml', 'utf8');
const config = yaml.load(fileContents);
let httpOrHTTPS = false; // http = false, https = true

const PORT = config.port;

let LISTENING = config.listen;
if (LISTENING === "local") {LISTENING = '127.0.0.1';}
else if (LISTENING === "all") {LISTENING = '0.0.0.0'} 

const betterConsole = config.alerts;



app.use(express.static(path.join(__dirname, "public")));

server.listen(PORT, LISTENING, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Listening on ${LISTENING}`);
  if (httpOrHTTPS) {console.log("Using HTTPS!")} else {console.log("Using HTTP!");}
});
