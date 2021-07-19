let meetingId;
//DOM Elements
const chatBtn = document.getElementById("chatBtn");
const mainContainer = document.getElementById("main");
const input = document.getElementById("input__box");
const messageList = document.querySelector(".messages");
const messageContainer = document.querySelector(".main__right__chat");
const participantsList = document.querySelector(".participants");
const shareInviteBtn = document.getElementById("shareInviteBtn");
const sharingLink = document.getElementById("share__invite");
const promptBox = document.querySelector(".prompt");
const muteBtn = document.getElementById("mute__btn");
const videoBtn = document.getElementById("video__btn");
const leaveBtn = document.getElementById("leaveBtn");
const muteIcon = document.getElementById("mute__icon");
const videoIcon = document.getElementById("video__icon");
const audioState = document.getElementById("audio__state");
const videoState = document.getElementById("video__state");
const videoGrid = document.getElementById("video__grid");
const participantCloseBtn = document.querySelector(
  ".main__right1 .main__right__header .fa-times"
);
const chatCloseBtn = document.querySelector(
  ".main__right .main__right__header .fa-times"
);
const showParticipants = document.getElementById("showParticipants");
const socket = io("/");
let user_name;
do {
  let name = prompt("Please Enter your name:");
  user_name = name.trim();
} while (!user_name);
//PeerJS
var peer = new Peer();
//Video Part
let myVideoStream;
let screenShareStream;
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
    socket.on("user-connected", (userid, user) => {
      connectToNewUser(userid, stream);
      showPrompt(`${user.name} has joined the meeting.`);
    });
    socket.on("update_users", (userNames) => {
      participantsList.innerHTML = "";
      userNames.forEach((username) => {
        const li = document.createElement("li");
        li.classList.add("participant");
        const markup = `<i class="fas fa-user"></i>${username}`;
        li.innerHTML = markup;
        participantsList.append(li);
      });
    });
  });
socket.on("user-disconnected", (userid) => {
  if (peers[userid]) peers[userid].close();
});
socket.on("user_left", (name) => {
  showPrompt(`${name} has left the meeting.`);
});
peer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id, user_name);
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
  if (!mainContainer.classList.contains("participants__inactive")) {
    mainContainer.classList.add("participants__inactive");
  }
  if (mainContainer.classList.contains("chat__inactive")) {
    mainContainer.classList.remove("chat__inactive");
    input.focus();
  } else {
    mainContainer.classList.add("chat__inactive");
  }
};
//Function to toggle participants
function toggleParticipants() {
  if (!mainContainer.classList.contains("chat__inactive")) {
    mainContainer.classList.add("chat__inactive");
  }
  if (mainContainer.classList.contains("participants__inactive")) {
    mainContainer.classList.remove("participants__inactive");
  } else {
    mainContainer.classList.add("participants__inactive");
  }
}
//Function to append message to DOM
const appendMessage = (msg, type) => {
  const li = document.createElement("li");
  li.classList.add("message", type);
  const markup = `<h4 class="username">${msg.user}</h4>
  <p class="input__message">${msg.message}</p>`;
  li.innerHTML = markup;
  messageList.append(li);
  input.value = "";
  scrollToBottom();
};
//Function to send message
const sendMessage = (e) => {
  let key = e.key;
  let msg = {
    user: user_name,
    message: e.target.value.trim(),
  };
  if (key === "Enter" && msg.message !== "") {
    appendMessage(msg, "outgoing");
    socket.emit("send_message", msg);
  }
};
socket.on("receive_message", (msg) => {
  showPrompt("1 new message recieved.");
  appendMessage(msg, "incoming");
});
//Function to scroll to bottom
function scrollToBottom() {
  messageContainer.scrollTop = messageContainer.scrollHeight;
}
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
//Function to close participants bar
function closeParticipants() {
  mainContainer.classList.add("participants__inactive");
}
//Function to close chat bar
function closeChat() {
  mainContainer.classList.add("chat__inactive");
}
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
//Function to show prompt box
let timeout;
function showPrompt(message) {
  promptBox.style.transform = `translate(-50%, 0)`;
  promptBox.innerText = message;
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    promptBox.style.transform = `translate(-50%, -300px)`;
  }, 3000);
}
//Function to share invite
function shareInvite() {
  const url = window.location.href;
  meetingId = url.split("/").slice(-1)[0];
  sharingLink.value = meetingId;
  sharingLink.select();
  document.execCommand("copy");
  showPrompt("MeetingID copied successfully. You can share now.");
}
//Function to leave meeting
function leaveMeeting() {
  window.location.href = "/";
}
chatBtn.addEventListener("click", toggleChatBox);
input.addEventListener("keyup", sendMessage);
muteBtn.addEventListener("click", toggleMuteUnmute);
videoBtn.addEventListener("click", toggleVideo);
leaveBtn.addEventListener("click", leaveMeeting);
showParticipants.addEventListener("click", toggleParticipants);
participantCloseBtn.addEventListener("click", closeParticipants);
chatCloseBtn.addEventListener("click", closeChat);
shareInviteBtn.addEventListener("click", shareInvite);
