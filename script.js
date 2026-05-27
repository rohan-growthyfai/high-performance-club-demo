const form = document.querySelector(".habit-form");
const note = document.querySelector(".form-note");
const select = document.querySelector("#habit-choice");

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  note.textContent = `"${select.value}" is your next seven-day promise. Keep it tiny and keep it visible.`;
});
