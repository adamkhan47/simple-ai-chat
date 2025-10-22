let protocol = (location.protocol === "https:") ? "wss://" : "ws://";
let socket = new WebSocket(protocol + location.host);

let history = [
    { role: "system", content: "You are a helpful assistant." }
];

function send() {
    history.push({ role: "user", content: document.getElementById("inputText").value });
    socket.send(JSON.stringify({
        type: "message",
        user: localStorage.getItem("username"),
        contents: document.getElementById("inputText").value,
        chatHistory: history
    }));
}


socket.onmessage = function(event) {
    let data = JSON.parse(event.data);
    if (data.type === "messages") {
        let message = "";
        message = data.user + " (" + data.time + "): " + data.contents;
        document.getElementById("messages").innerHTML = message + '<br>' + document.getElementById("messages").innerHTML;
    }
    else if (data.type === "streaming") {
        if (data.contents === "INIT") {
            document.getElementById("messages").innerHTML = "AI: " + '<br>' + document.getElementById("messages").innerHTML;
        }
        else {
            let text = document.getElementById("messages").innerHTML;
            let lines = text.split("<br>");
            lines[0] += data.contents;
            text = lines.join("<br>");
            document.getElementById("messages").innerHTML = text;
        }
    }
}
socket.onclose = function(event) {
    document.getElementById("status").innerHTML = "🔴";
}
socket.onopen = function(event) {
    document.getElementById("status").innerHTML = "🟢";
}