if (location.protocol === "https:") { protocol = "wss://";} else {protocol = "ws://";}
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
    if (autoclear) {
        document.getElementById("inputText").value = "";
    }
}


socket.onmessage = function(event) {
    let data = JSON.parse(event.data);
    if (data.type === "messages") {
        let message = "";
        message = data.user + " (" + data.time + "): " + data.contents;
        document.getElementById("messages").innerHTML = message + '<br>' + document.getElementById("messages").innerHTML;
        if (data.ai === true) {
            history.push({ role: "assistant", content: data.contents });
        }
    }
}
socket.onclose = function(event) {
    document.getElementById("status").innerHTML = "🔴";
}
socket.onopen = function(event) {
    document.getElementById("status").innerHTML = "🟢";
}