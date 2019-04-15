const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

/* Initiate the app */
app.use(express.static('../game/build/'));
app.get('/', (req, res) => {
    res.sendFile(__dirname + '../game/build/index.html');
});

/* When the connection socket is fired */
io.sockets.on('connection', socket => {
    socket.userData = {x: 0, y: 0, z: 0, heading: 0 };
    console.log(`${socket.id} connected`);
    socket.emit('setId', { id: socket. id });

    /* When this player disconnects, broadcast their player deletion to the client */
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);
        socket.broadcast.emit('deletePlayer', { id: socket.id });
    });
    /* Initiate socket with its base data */
    socket.on('init', data => {
        console.log('socket init', data.model);
        socket.userData.model = data.model;
        socket.userData.colour = data.colour;
        socket.userData.x = data.x;
        socket.userData.y = data.y;
        socket.userData.z = data.z;
        socket.userData.heading = data.h;
        socket.userData.pb = data.pb;
        socket.userData.action = "Idle";
    });
    /* Update socket with new data */
    socket.on('update', data => {
        socket.userData.x = data.x
        socket.userData.y = data.y;
        socket.userData.z = data.z;
        socket.userData.heading = data.h;
        socket.userData.pb = data.pb;
        socket.userData.action  = data.action;
    });

    socket.on('chat message', data => {
        console.log(`chat message-${data.id}: ${data.message}`);
        io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
    });
});

http.listen(2002,() => {
    console.log("\x1b[31m$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\x1b[0m");
    console.log("\x1b[31m$$$ Server Running on port 2002 $$$\x1b[0m");
    console.log("\x1b[31m$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\x1b[0m")
})

setInterval(() => {
    const nsp = io.of('/');
    let pack = [];

    for (let id in io.sockets.sockets) {
        const socket = nsp.connected[id];

        if(socket.userData.model !== undefined) {
            pack.push({
                id: socket.id,
                model: socket.uderData.model,
                colour: socket.uderData.colour,
                x: socket.uderData.x,
                y: socket.uderData.y,
                z: socket.uderData.z,
                heading: socket.uderData.heading,
                pb: socket.uderData.pb,
                action: socket.uderData.action
            });
        }
    }

    if(pack.length > 0) io.emit('remoteData', pack);
}, 40);