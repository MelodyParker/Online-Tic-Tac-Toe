const express = require("express"); // use express
const app = express(); // create instance of express
const server = require("http").Server(app); // create server
const io = require("socket.io")(server); // create instance of socketio
const fs = require("fs");
const users = {};
const rooms = {};


app.use(express.static("public")); // use "public" directory for static files

io.on("connection", socket => {
    socket.on("joined", (username, room) => {
        if (!(room in rooms) || rooms[room] < 2) {
            socket.join(room);
            let playerPiece;
            if (!(room in rooms)) {
                playerPiece = "X";
            }
            else {
                playerPiece = "O";
            }
            socket.to(room).emit("joined", username, playerPiece);

            users[socket.id] = { username: username, room: room };
            console.log(users)
            if (room in rooms) {
                rooms[room]++;
            } else {

                rooms[room] = 1;
            }
            socket.emit("you-joined", playerPiece)
        }
        else {
            socket.emit("failed")

        }
    })


    socket.on("made-move", id => {
        try{
        let user = users[socket.id];
        socket.to(user.room).emit("made-move", id)
        } catch{}
    })
    socket.on("disconnect", () => {
        try{
        let user = users[socket.id];
        let room = user.room;
        if (rooms[room] > 0)
        {
            socket.to(user.room).emit("disconnection");
            rooms[room]--;
        } else { delete rooms[room] }
        delete users[socket.id]
        console.log(users)
        } catch{}})
})

server.listen(3000); // run server