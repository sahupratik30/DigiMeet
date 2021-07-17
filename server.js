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
const users = {};
io.on("connection", (socket) => {
  socket.on("join-room", (roomid, userid, name) => {
    socket.join(roomid);
    let userNames = [];
    users[socket.id] = name;
    for (const name in users) {
      userNames.push(users[name]);
    }
    socket.to(roomid).emit("user-connected", userid, userNames);
    io.in(socket.id).emit("update_users", userNames);
    socket.on("send_message", (data) => {
      socket.to(roomid).emit("receive_message", data);
    });
    socket.on("disconnect", () => {
      delete users[socket.id];
      let userNames = [];
      for (const name in users) {
        userNames.push(users[name]);
      }
      socket.to(roomid).emit("user-disconnected", userid, userNames);
    });
  });
});
server.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
