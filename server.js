const { name } = require('ejs')
const express = require('express')
const path = require('path')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidV4 } = require('uuid')

const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use('/peerjs', peerServer);

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})

const users = {}
io.on('connection', socket => {
    socket.on('join-room', (roomId, userId, name) => {
        socket.join(roomId)
        socket.to(roomId).emit("user-connected", userId);
        users[socket.id] = name
        socket.on('disconnect', () => {
            socket.to(roomId).emit("user-disconnected", userId);
        })
    })

    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
})

server.listen(process.env.PORT || 3000)
