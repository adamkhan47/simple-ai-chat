if (location.protocol === "https:") { protocol = "wss://";} else {protocol = "ws://";}
let socket = new WebSocket(protocol + location.host);

function send() {
    socket.send(JSON.stringify({
        type: "message",
        user: localStorage.getItem("username"),
        contents: document.getElementById("inputText").value
    }));
    if (autoclear) {
        document.getElementById("inputText").value = "";
    }
}


socket.onmessage = function(event) {
    let data = JSON.parse(event.data);
    if (data.type === "messages") {
        let message = "";
        message = "User: (" + data.time + "): " + data.contents;
        document.getElementById("messages").innerHTML = message + '<br>' + document.getElementById("messages").innerHTML;
    }
}
socket.onclose = function(event) {
    document.getElementById("status").innerHTML = "🔴";
}
socket.onopen = function(event) {
    document.getElementById("status").innerHTML = "🟢";
}