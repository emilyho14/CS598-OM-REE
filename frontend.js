const textarea = document.getElementById("innerTextArea");

textarea.addEventListener("input", (event) => {
  console.log("User typed:", event.target.value);
});

textarea.addEventListener("focus", () => {
  console.log("Textarea focused");
});

textarea.addEventListener("blur", () => {
  console.log("Textarea lost focus");
});
