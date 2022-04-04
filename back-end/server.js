const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");

const chats = require('./data/data');
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes"); 
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleWare")
const path = require("path");

const app = express();
dotenv.config();
connectDB();


//Port number
const PORT = process.env.PORT || 5000;

app.use(express.json());





app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --------------------Deployment----------------

const __dirname1 = path.resolve();
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname1, "/front-end/build")));

    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname1, "front-end", "build", "index.html"));
    })
} else {
    app.get("/", (req, res) => {
      res.send("API is running successfully !!");
    });
}


// --------------------Deployment----------------

//error middlewares
app.use(notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
    console.log(`Server started on PORT : ${PORT}`.yellow.bold)
})

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
    },
})

//creating the connection
io.on("connection", (socket) => {
    console.log("connected to socket.io");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        //console.log(userData._id); 
        socket.emit("connected");
    });

    //creating the user room
    socket.on("join chat", (room) => {
        socket.join(room);
        console.log('User joined Room :' + room);
    })

    socket.on("typing", (room) => socket.in(room).emit("typing"))
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    // send message or new message
    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;

        if (!chat.users) return console.log("chat.users not defined");

        //to other rooms and not me
        chat.users.forEach(user => {
            if (user._id == newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message recieved", newMessageRecieved)
        }) 
    })

    // to clean up the socket to avoid bandwidth lapse
    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id)
    })
})