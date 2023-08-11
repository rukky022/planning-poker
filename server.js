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

    socket.on('cardChosen', function (isPlayerA, playerChoice) {
        io.emit('cardChosen', isPlayerA, playerChoice);
    });

    socket.on('cardDeselected', function (isPlayerA) {
        io.emit('cardDeselected', isPlayerA);
    });

    socket.on('revealCards', function() {
        io.emit('revealCards');
    });

    socket.on('refreshGame', function() {
        io.emit('refreshGame');
    })

    socket.on('disconnect', function () {
        console.log('A user disconnected: ' + socket.id);
        players = players.filter(player => player !== socket.id);
    });
});

httpServer.listen(3000, () => {
    console.log("Server started~")
});