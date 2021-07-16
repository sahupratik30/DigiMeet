//DOM Elements
const chatBtn = document.getElementById("chatBtn");
const mainContainer = document.getElementById("main");
const input = document.getElementById("input__box");
const messageList = document.querySelector(".messages");
const muteBtn = document.getElementById("mute__btn");
const videoBtn = document.getElementById("video__btn");
const leaveBtn = document.getElementById("leaveBtn");
const muteIcon = document.getElementById("mute__icon");
const videoIcon = document.getElementById("video__icon");
const audioState = document.getElementById("audio__state");
const videoState = document.getElementById("video__state");
const videoGrid = document.getElementById("video__grid");
const socket = io("/");
//PeerJS
var peer = new Peer();
//Video Part
let myVideoStream;
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    peer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    socket.on("user-connected", (userid) => {
      connectToNewUser(userid, stream);
    });
  });
socket.on("user-disconnected", (userid) => {
  if (peers[userid]) peers[userid].close();
});
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});
function connectToNewUser(userid, stream) {
  const call = peer.call(userid, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });
  peers[userid] = call;
}

//Function to add video stream to DOM
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}
//Function to toggle chatBox
const toggleChatBox = () => {
  if (mainContainer.classList.contains("chat__inactive")) {
    mainContainer.classList.remove("chat__inactive");
  } else {
    mainContainer.classList.add("chat__inactive");
  }
};
//Function to append message to DOM
const appendMessage = (message) => {
  const li = document.createElement("li");
  const markup = `<li class="message">
  <h4 class="username">user</h4>
  <p class="input__message">${message}</p>
</li>`;
  li.innerHTML = markup;
  messageList.append(li);
  input.value = "";
};
//Function to send message
const sendMessage = (e) => {
  let key = e.key;
  let message = e.target.value;
  if (key === "Enter") {
    appendMessage(message);
  }
};
//Function to toggle mute and unmute
const toggleMuteUnmute = () => {
  if (muteIcon.classList.contains("fa-microphone")) {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      muteIcon.classList.replace("fa-microphone", "fa-microphone-slash");
      audioState.innerText = "Unmute";
    }
  } else {
    muteIcon.classList.replace("fa-microphone-slash", "fa-microphone");
    audioState.innerText = "Mute";
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};
//Function to toggle video
const toggleVideo = () => {
  const enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    if (videoIcon.classList.contains("fa-video")) {
      videoIcon.classList.replace("fa-video", "fa-video-slash");
      videoState.innerText = "Start Video";
    }
  } else {
    videoIcon.classList.replace("fa-video-slash", "fa-video");
    videoState.innerText = "Stop Video";
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};
//Function to leave meeting
function leaveMeeting() {
  window.location.href = "/";
}
chatBtn.addEventListener("click", toggleChatBox);
input.addEventListener("keyup", sendMessage);
muteBtn.addEventListener("click", toggleMuteUnmute);
videoBtn.addEventListener("click", toggleVideo);
leaveBtn.addEventListener("click", leaveMeeting);
