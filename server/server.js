const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

// Set up Sequelize with your PostgreSQL connection string
const sequelize = new Sequelize('postgresql://postgres:Tharun@13@localhost:5432/pgusers', {
  dialect: 'postgres',
  logging: false,
});

// Define Message model
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  room: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
});

// Sync the model with the database
sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Error syncing database:', err));

const httpServer = http.createServer();

const io = new Server(httpServer, {
  cors: {
    origin: 'https://amogademoapp.vercel.app',
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('join_room', async (roomId) => {
    socket.join(roomId);
    console.log(`------user with id-${socket.id} joined room - ${roomId}------`);

    try {
      const recentMessages = await Message.findAll({
        where: { room: roomId },
        order: [['created_at', 'DESC']],
        limit: 50
      });
      socket.emit('load_messages', recentMessages.reverse());
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  });

  socket.on('send_msg', async (data) => {
    console.log("data---", data);
    
    try {
      const newMessage = await Message.create(data);
      io.in(data.room).emit('receive_msg', newMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server is running on port ${PORT}`);
});