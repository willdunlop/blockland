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
    console.log("\x1b[32m$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\x1b[0m");
    console.log("\x1b[32m$$$ Server Running on port 2002 $$$\x1b[0m");
    console.log("\x1b[32m$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\x1b[0m")
})

/**
 * This set interval will gather the data of all the connected sockets 
 * and place them in an array whcih is sent to the client. It is set to do the every 40ms.
 * Ideally, you would find a way to only package up data relative to the user, ie, only 
 * package up socket activity that is occuring on the currently loaded tile. No need to 
 * send the state of the entir game to the user when they can only see less than 1%
 */

setInterval(() => {
    const nsp = io.of('/');
    let pack = [];

    for (let id in io.sockets.sockets) {
        const socket = nsp.connected[id];
        // console.log("socket", socket.userData.model)
        if(socket.userData.model !== undefined) {
            pack.push({
                id: socket.id,
                model: socket.userData.model,
                colour: socket.userData.colour,
                x: socket.userData.x,
                y: socket.userData.y,
                z: socket.userData.z,
                heading: socket.userData.heading,
                pb: socket.userData.pb,
                action: socket.userData.action
            });
        }
    }
    // console.log("pack", pack)
    if(pack.length > 0) io.emit('remoteData', pack);
}, 40);