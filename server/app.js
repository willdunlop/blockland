const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

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

    socket.on('ready', data => {
      socket.userData.isReady = data.isReady;
      console.log(`user ${socket.id} is ready`);
      checkIfAllAreReady();
    })

    socket.on('chat message', data => {
        console.log(`chat message-${data.id}: ${data.message}`);
        io.to(data.id).emit('chat message', { id: socket.id, message: data.message });
    });
});

  function checkIfAllAreReady() {
    console.log("checking if all are ready")
    const noOfConnectedUsers = Object.keys(io.sockets.sockets).length
    console.log("number of connected users (I think)", noOfConnectedUsers)
    /*
    * io.sockets.sockets is an object containing each connected user
    * Loop that shit and check if all are ready
    */

    /*
    * this could be set outside the function and incremented on each
    * time the function is called, rather than resetting and running a
    * a loop each time
    */
    let noOfReady = 0
    // See if there is a noOfConnected paramater instead of a loop
    for (let id in io.sockets.sockets) {
      if (io.sockets.sockets[id].userData.isReady) noOfReady++;
    }
    console.log("ALL ARE READY?", noOfReady === noOfConnectedUsers)
    // if ^this^ shit, emit the ready shit
  }

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
    if(pack.length > 0) io.emit('remoteData', pack);
}, 40);



/**
* Listen and accept connections through port 2002
* This has to be done with the http server and i believe that is because
* of socket.io
*/
server.listen(2002,() => {
    console.log("\x1b[32m$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\x1b[0m");
    console.log("\x1b[32m$$$ Server Running on port 2002 $$$\x1b[0m");
    console.log("\x1b[32m$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$\x1b[0m")
})
