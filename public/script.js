let protocol = (location.protocol === "https:") ? "wss://" : "ws://";
let socket = new WebSocket(protocol + location.host);
let doNotSend = false;

let history = [
    { role: "system", content: "You are a helpful assistant." }
];

window.onload = function() {
    if (localStorage.getItem("saveInStorage") === "true") {
        if (localStorage.getItem("save") === "" || localStorage.getItem("save") === "null" || localStorage.getItem("save") === null) {}
        else {
            document.getElementById("messages").innerHTML = localStorage.getItem("save");
            history = JSON.parse(localStorage.getItem("history"));
        }
    }
    localStorage.setItem("saveInStorage","false");
};


function send() {
    if (doNotSend) {alert ("Wait for the response to finish!"); return;}
    doNotSend = true;
    history.push({ role: "user", content: document.getElementById("inputText").value });
    socket.send(JSON.stringify({
        type: "message",
        user: localStorage.getItem("username"),
        contents: document.getElementById("inputText").value,
        chatHistory: history
    }));
}
function save() {
    localStorage.setItem("save",document.getElementById("messages").innerHTML);
    localStorage.setItem("saveInStorage","true");
    localStorage.setItem("history", JSON.stringify(history));
}
function clearSaveFunc() {
    localStorage.removeItem("save");
    localStorage.removeItem("saveInStorage");
    localStorage.removeItem("history");
    localStorage.setItem("DELETESAVE", "yes");
    alert("Removed save!");
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
            document.getElementById("messages").innerHTML = (data.user + ": (" + data.time + "): " + '<br>' + document.getElementById("messages").innerHTML);
        }
        else {
            let text = document.getElementById("messages").innerHTML;
            let lines = text.split("<br>");
            lines[0] += data.contents;
            text = lines.join("<br>");
            document.getElementById("messages").innerHTML = text;
        }
    }
    else if (data.type === "stop") {
        doNotSend = false;
    }
}
socket.onclose = function(event) {
    document.getElementById("status").innerHTML = "🔴";
}
socket.onopen = function(event) {
    document.getElementById("status").innerHTML = "🟢";
}