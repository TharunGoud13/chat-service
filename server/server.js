const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express()
const httpServer = http.createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: 'https://amogademoapp.vercel.app', // Replace with your frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
})

app.use(cors())

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id)

  socket.on('join_room', (roomId) => {
    socket.join(roomId)
    console.log(`user with id-${socket.id} joined room - ${roomId}`)
  })

  socket.on('send_msg', (data) => {
    console.log('---data----',data)
    console.log("id---", data.room)
    //This will send a message to a specific room ID
    io.to(data.room).emit('receive_msg', data)
  })

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`)
})
