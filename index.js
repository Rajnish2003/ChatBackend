const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const app=express();
const userRoutes=require("./routes/userRoutes");
const messageRoute=require("./routes/messagesRoute");
require("dotenv").config();
const PORT=process.env.PORT||5000;
const socket=require('socket.io');


app.use(cors());
app.use(express.json());
app.use('/api/auth',userRoutes);
app.use('/api/messages',messageRoute);

mongoose.connect(process.env.MONGO_URL)
 .then(() => console.log("Connected to database"))
 .catch((err) => console.log((err)));

app.get('/',(req,res)=>{
    res.send("Backend is listening");
})

const server=app.listen(PORT,()=>{
    console.log(`I am listening ${PORT}`);
})

const io = socket(server, {
    cors: {
      origin: `${process.env.ORIGIN}`,
      credentials: true,
    },
  });
  
  global.onlineUsers = new Map();
  io.on("connection", (socket) => {
    global.chatSocket = socket;
    socket.on("add-user", (userId) => {
      onlineUsers.set(userId, socket.id);
    });
  
    socket.on("send-msg", (data) => {
      const sendUserSocket = onlineUsers.get(data.to);
      if (sendUserSocket) {
        socket.to(sendUserSocket).emit("msg-recieve", data.message);
      }
    });
});
