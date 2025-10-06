// date time
function updateTime() {
  const now = new Date();
  document.getElementById("time").textContent = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  document.getElementById("date").textContent = now.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
setInterval(updateTime, 1000);
updateTime();

// search
const typed = document.getElementById("typed");

document.addEventListener("keydown", (e) => {
  if (e.key.length === 1) {
    typed.textContent += e.key;
  } else if (e.key === "Backspace") {
    typed.textContent = typed.textContent.slice(0, -1);
  } else if (e.key === "Enter") {
    const query = typed.textContent.trim();
    if (query) {
      window.location.href =
        "https://duckduckgo.com/?q=" + encodeURIComponent(query);
    }
  }
});
