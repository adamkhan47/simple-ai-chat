const express = require("express");
const path = require("path");
const app = express();
const yaml = require('js-yaml');
const fs = require('fs');
const WebSocket = require('ws');
const http = require('http');
const OpenAI = require("openai").default;
require('dotenv').config();


server = http.createServer(app);

const openai = new OpenAI({
    apiKey: process.env.API_KEY,
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

let clientGlobal;
const wss = new WebSocket.Server({ server});
wss.on('connection', function connection(ws) {
    clientGlobal = ws;
    ws.on('message', function incoming(message) {
        const data = JSON.parse(message);
        if (betterConsole) {console.log('received: %s', message);}
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                if (data.type === "message") {
                    client.send(JSON.stringify({
                        type: "messages",
                        user: "User: ",
                        ai: false,
                        contents: data.contents,
                        chatHistory: data.chatHistory,
                        time: currentTime()
                    }));
                    chat(data.contents, data.chatHistory);
                    if(betterConsole) {console.log("sent message")};

                }
            }
        });
    });
});
function currentTime() {
    let now = new Date();
    let timeString = now.toLocaleTimeString();
    return timeString;
}

async function chat(contents, history) {
    console.log("Got a question..");
    clientGlobal.send(JSON.stringify({
        type: "streaming",
        user: "AI",
        ai: true,
        contents: "INIT",
        time: currentTime()
    }));
    const completion = await openai.chat.completions.create({
        model: "deepseek-ai/deepseek-v3.1",
        messages: history,
        temperature: 0.9,
        top_p: 0.7,
        max_tokens: 8192,
        chat_template_kwargs: { thinking: true },
        stream: true
    });

    let fullOutput = '';
    for await (const chunk of completion) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
            fullOutput += delta;
            clientGlobal.send(JSON.stringify({ 
                type: "streaming",
                user: "AI",
                ai: true,
                contents: delta,
                time: currentTime()
            }));
        }
    }
}




app.use(express.static(path.join(__dirname, "public")));

server.listen(PORT, LISTENING, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Listening on ${LISTENING}`);
  if (httpOrHTTPS) {console.log("Using HTTPS!")} else {console.log("Using HTTP!");}
});
