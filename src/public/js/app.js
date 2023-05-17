const messageList = document.querySelector("#chat");
const promptList = document.querySelector("#prompt");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
const currentUser = document.querySelector("#curUser");

// const socket = new WebSocket("http://localhost:3000"); 이렇게 하면 HTTP 프로토콜로 연결하는 게 되어서 오류 발생
const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
    const msg = { type, payload };
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    if (message.data[0] == '[') {
        if (message.data[1] == 'c')
            currentUser.innerText = message.data;
        else
            promptList.append(li);
    }
    else
        messageList.append(li);
    
});

socket.addEventListener("close", () => {
    console.log("Disconnected from server")
});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message", input.value));
    input.value="";
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname", input.value));
    input.value="";
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
