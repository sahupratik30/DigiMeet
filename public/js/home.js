//DOM Elements
const input = document.getElementById("meeting__id");
const submitBtn = document.getElementById("submit__button");

//Adding event listener to input field
input.addEventListener("input", (e) => {
  let inputValue = e.target.value;
  let inputLength = inputValue.length;
  if (inputLength > 4) {
    submitBtn.removeAttribute("disabled");
  } else {
    if (!submitBtn.hasAttribute("disabled")) {
      submitBtn.setAttribute("disabled", "true");
    }
  }
});

//Adding event listener to join button
submitBtn.addEventListener("click", function () {
  const meetingID = input.value;
  window.location.href = `/room/${meetingID}`;
});
