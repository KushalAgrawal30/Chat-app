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
 
let all_users = []

io.on("connection",  (socket) => {
    console.log(User ${socket.id} connected`)

    socket.on('join-room', (data) => {
        all_users.push(data)
        const uniqueUsers = all_users.filter(
            (user, index, self) =>
              index === self.findIndex((u) => u.userEmail === user.userEmail)
          );
        socket.join(data.roomName)
        socket.to(data.roomName).emit('user-joined', data)
        socket.to(data.roomName).emit('room-users', uniqueUsers)
        io.to(data.socketID).emit('room-users', uniqueUsers)
    })

    socket.on("disconnect", () =>{
        const user_disconnected = all_users.find(user => user.socketID === socket.id)
        const index = all_users.findIndex(user => user.socketID === socket.id)
        if (index !== -1) {
            all_users.splice(index, 1); // 🧨 modifies original array
        }
        console.log(user_disconnected)
        
        if(user_disconnected !== undefined){
            io.to(user_disconnected.roomName).emit("user-left", user_disconnected)
            io.to(user_disconnected.roomName).emit('room-users', all_users)
        }

    })

    socket.on('send-message', (data) => {
        console.log(data)
        socket.to(data.roomName).emit('recieve-message', data)
    })

})

server.listen(PORT, () => {
    console.log(`Server running on PORT:${PORT}`)
})
