const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"]
    }
});

let players = [];

io.on("connection", (socket) => {
    console.log('A user connected: ' + socket.id);
    players.push(socket.id);
    
    if(players.length === 1) {
        io.emit('isPlayerA');
    };

    socket.on('cardPlayed', function (gameObject, isPlayerA) {
        io.emit('cardPlayed', gameObject, isPlayerA);
    });

    socket.on('disconnect', function () {
        console.log('A user disconnected: ' + socket.id);
        players = players.filter(player => player !== socket.id);
    });
});

httpServer.listen(3000, () => {
    console.log("Server started~")
});