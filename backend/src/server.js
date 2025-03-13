import express from 'express'
import { Server } from 'socket.io'
import {createServer} from 'http'

const PORT = 3000

const app = express()
const server = createServer(app)

const io = new Server(server, {
    cors:{
    origin:"http://localhost:5173",
    methods: ["GET","POST"],
    credentials: true
    }
})


io.on("connection", async (socket) => {
    console.log(`User ${socket.id} connected`)

    socket.on('join-room', (data) => {
        socket.join(data.roomName)
        console.log(data)
    })

    socket.on('send-message', (data) => {
        console.log(data)
        socket.to(data.roomName).emit('recieve-message', data)
    })

})

server.listen(PORT, () => {
    console.log(`Server running on PORT:${PORT}`)
})