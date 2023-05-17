import express from 'express';
import http from 'http'
import WebSocket from 'ws'

const app = express();

// 뷰 설정
app.set("view engine", "pug");
app.set("views", __dirname + "/views");

// __dirname: Node.js의 기본 전역 변수, 현재 실행하는 폴더의 경로
app.use("/public", express.static(__dirname + "/public"));

// 라우팅
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");
//app.listen(3000, handleListen);

// 서버 생성
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const sockets = []

// connection 핸들링
wss.on("connection", (socket) => {
    let cnt = 0;
    sockets.push(socket);
    printCurUser();
    console.log("Connected to Browser");
    socket.on("close", () => {
        console.log("Disconnected from Browser");
        for (let i = 0; i < sockets.length; i++) {
            if (sockets[i]["nickname"] == socket["nickname"])
                sockets.splice(i, 1);
        }
        sockets.forEach(aSocket => aSocket.send("[user out] " + socket["nickname"] + " leaved this chat"));
        printCurUser();
    });
    socket.on("message", (msg) => {
        if (!cnt)
            socket["nickname"] = "Anonymous";
        const message = JSON.parse(msg);
        switch (message.type) {
            case "new_message":
                sockets.forEach(aSocket => aSocket.send(`${socket.nickname}: ${message.payload}`));
                if (!cnt) {
                    sockets.forEach(aSocket => aSocket.send("[user in] " + socket["nickname"] + " joined this chat"));
                    cnt++;
                }
                
                break;
            case "nickname":
                if (cnt)
                    sockets.forEach(aSocket => aSocket.send("[alert] " + socket["nickname"] + " changed nickname to " + message.payload));
                else
                    sockets.forEach(aSocket => aSocket.send("[user in] " + message.payload + " joined this chat"));
                socket["nickname"] = message.payload;
                cnt++;
                break;
        }
        printCurUser();
    });
});

server.listen(3000, handleListen);

function printCurUser() {
    let curUser = "[current user] ";
    sockets.forEach(aSocket => { if (aSocket["nickname"] != undefined) curUser += aSocket["nickname"] + " " });
    //console.log(curUser);
    sockets.forEach(aSocket => aSocket.send(curUser));
};

/*
 * 그냥 구현해 본 것
 * 1 현재 대화에 참여 중인 유저 출력
 *   - 대화를 입력해야 참여한 것으로 간주: 닉네임을 설정해서 쿼리를 한 번이라도 던진 경우는 괜찮은데,
 *     아무것도 안 한 Anonymous가 참여 중인 유저 리스트에 집계되는 경우를 처리하는 게 좀 힘들었다
 *   - 새로 유저가 들어왔을 때, 닉네임을 설정하기 전에 유저 리스트를 볼 수 있도록 함
 *   - 유저가 나가면 리스트 갱신
 * 2 프롬프트와 대화창 분리
 *   - 두 메시지를 [로 구분하도록 했는데 별로 좋은 방법은 아닌 것 같다
 * 3 유저의 상태를 알리는 프롬프트 출력(입장, 퇴장, 닉네임 변경)
 * 
 * 뭔가 DM 같은 걸 구현해도 좋을 듯...
 */