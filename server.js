const express = require("express");
const app = express();
const { Users } = require("./utils/users");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const server = require("http").Server(app);
const PORT = process.env.PORT || 3000;
const io = require("socket.io")(server);
let users = new Users();
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
  socket.on("join-room", (roomid, userid, name) => {
    socket.join(roomid);
    users.addUser(socket.id, name, roomid);
    socket.to(roomid).emit("user-connected", userid, users.getUser(socket.id));
    io.to(roomid).emit("update_users", users.getUserList(roomid));
    socket.on("send_message", (data) => {
      socket.to(roomid).emit("receive_message", data);
    });
    socket.on("disconnect", () => {
      let user = users.removeUser(socket.id);
      if (user) {
        io.to(user.room).emit("update_users", users.getUserList(user.room));
        io.to(user.room).emit("user_left", user.name);
      }
      socket.to(roomid).emit("user-disconnected", userid);
    });
  });
});
server.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});
