const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const server = require("http").Server(app);
const PORT = process.env.PORT || 3000;
const io = require("socket.io")(server);
let rooms = [];
//Set view engine
app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
//Set static path
app.use(express.static(path.join(__dirname, "/public")));
//Routes
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/room", (req, res) => {
  const roomId = uuidv4();
  rooms.push(roomId);
  res.redirect(`/room/${roomId}`);
});
app.get("/room/:roomid", (req, res) => {
  const roomID = req.params.roomid;
  let roomExists = rooms.includes(roomID);
  if (roomExists) {
    res.render("room", { roomID });
  } else {
    res.redirect("/");
  }
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomid, userid) => {
    socket.join(roomid);
    socket.to(roomid).emit("user-connected", userid);
    socket.on("send_message", (data) => {
      socket.to(roomid).emit("receive_message", data);
    });
    socket.on("disconnect", () => {
      socket.to(roomid).emit("user-disconnected", userid);
    });
  });
});
server.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
