// Load sites from localStorage
function loadSites() {
  const stored = localStorage.getItem("kabutor_sites");
  return stored ? JSON.parse(stored) : [];
}

// Save sites to localStorage
function saveSites(sites) {
  localStorage.setItem("kabutor_sites", JSON.stringify(sites));
}

// Render sites
function renderSites() {
  const sites = loadSites();
  const sitesDiv = document.getElementById("sites");
  const hintsDiv = document.getElementById("hints");

  sitesDiv.innerHTML = "";

  if (sites.length > 0) {
    sitesDiv.style.display = "grid";
    hintsDiv.style.display = "none";

    sites.forEach((site) => {
      const link = document.createElement("a");
      link.href = site.url;
      link.textContent = site.name;
      sitesDiv.appendChild(link);
    });
  } else {
    sitesDiv.style.display = "none";
    hintsDiv.style.display = "block";
  }
}

// Add command to history
function addCommandLine(command) {
  const commandOutput = document.getElementById("command-output");
  const cmdLine = document.createElement("div");
  cmdLine.className = "line command-history";
  cmdLine.innerHTML = `<span class="prompt">[kabutor ~]#</span><span>${command}</span>`;
  commandOutput.appendChild(cmdLine);
}

// Add output message
function addOutput(text, type = "normal") {
  const commandOutput = document.getElementById("command-output");
  const output = document.createElement("div");
  output.className =
    type === "error" ? "error" : type === "success" ? "success" : "output";
  output.textContent = text;
  commandOutput.appendChild(output);
}

// Clear command history
function clearCommandHistory() {
  const commandOutput = document.getElementById("command-output");
  commandOutput.innerHTML = "";
}

// Kabufetch - system info
function showKabufetch() {
  const commandOutput = document.getElementById("command-output");
  const fetchDiv = document.createElement("div");
  fetchDiv.className = "fetch-container";

  const art = `                         +++==         
                         **+++*%        
                         **#+           
                        *##*#           
                      #*+**##           
                    ------:*#           
                  :----::----*          
                %---:::-----=*          
              *#+%##--------+           
            @+-*#*:--%*--=+*            
          ++=#*=:##+--=*#**             
       #%####***+**%#-=                 
      ##**@         %-                  
    *@@             #%=++`;

  const userAgent = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown";

  // Detect OS
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "macOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";

  // Detect Browser
  if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Edg")) browser = "Edge";
  else if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Safari")) browser = "Safari";

  const uptime = Math.floor(performance.now() / 1000);
  const uptimeMin = Math.floor(uptime / 60);
  const uptimeSec = uptime % 60;

  const sites = loadSites();

  fetchDiv.innerHTML = `
          <div class="fetch-art">${art}</div>
          <div class="fetch-info">
            <div><span class="fetch-label">kabutor</span>@newtab</div>
            <div class="fetch-separator">────────────────────────</div>
            <div><span class="fetch-label">OS</span>           ${os}</div>
            <div><span class="fetch-label">Browser</span>      ${browser}</div>
            <div><span class="fetch-label">Resolution</span>   ${screen.width}x${screen.height}</div>
            <div class="fetch-separator">────────────────────────</div>
            <div><span class="fetch-label">Sites</span>        ${sites.length}</div>
            <div><span class="fetch-label">Tabs</span>         <span id="tab-count">N/A</span></div>
            <div><span class="fetch-label">Extensions</span>   <span id="ext-count">N/A</span></div>
            <div><span class="fetch-label">Uptime</span>       ${uptimeMin}m ${uptimeSec}s</div>
          </div>
        `;

  commandOutput.appendChild(fetchDiv);

  // Try to get tab count (only works in extension context)
  if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.query({}, (tabs) => {
      document.getElementById("tab-count").textContent = tabs.length;
    });
  }

  // Try to get extension count (only works in extension context)
  if (typeof chrome !== "undefined" && chrome.management) {
    chrome.management.getAll((extensions) => {
      const enabledExt = extensions.filter(
        (ext) => ext.enabled && ext.type === "extension"
      ).length;
      document.getElementById("ext-count").textContent = enabledExt;
    });
  }
}

// Process commands
function processCommand(command) {
  const parts = command.trim().split(/\s+/);
  const cmd = parts[0];

  if (cmd === "mkdir" && parts.length === 3) {
    addCommandLine(command);
    const url = parts[1];
    const name = parts[2];

    // Validate URL format
    if (!url.match(/^https?:\/\/.+/)) {
      addOutput(
        `mkdir: invalid URL format. Use: mkdir https://site.com sitename`,
        "error"
      );
      return;
    }

    const sites = loadSites();

    // Check if site already exists
    if (sites.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      addOutput(`mkdir: site '${name}' already exists`, "error");
      return;
    }

    sites.push({ name, url });
    saveSites(sites);
    renderSites();
    addOutput(`mkdir: created site '${name}'`, "success");
  } else if (cmd === "rm" && parts[1] === "-rf" && parts.length === 3) {
    addCommandLine(command);
    const name = parts[2];
    const sites = loadSites();
    const index = sites.findIndex(
      (s) => s.name.toLowerCase() === name.toLowerCase()
    );

    if (index === -1) {
      addOutput(`rm: cannot remove '${name}': No such site`, "error");
      return;
    }

    sites.splice(index, 1);
    saveSites(sites);
    renderSites();
    addOutput(`rm: removed site '${name}'`, "success");
  } else if (cmd === "clear") {
    clearCommandHistory();
  } else if (cmd === "kabufetch") {
    addCommandLine(command);
    showKabufetch();
  } else if (cmd === "help") {
    addCommandLine(command);
    addOutput("Available commands:");
    addOutput("  mkdir <url> <name>  - Add a new site");
    addOutput("  rm -rf <name>       - Remove a site");
    addOutput("  clear               - Clear command history");
    addOutput("  kabufetch           - Show system info");
    addOutput("  help                - Show this help");
    addOutput("  Type any text and press Enter to search");
  } else if (command.trim()) {
    // If not a command, treat as search
    window.location.href =
      "https://duckduckgo.com/?q=" + encodeURIComponent(command);
  }
}

// Date time
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

// Initialize sites
renderSites();

// Input handling
const typed = document.getElementById("typed");

const undoStack = [];
const redoStack = [];

function pushHistory() {
  undoStack.push(typed.textContent);
  if (undoStack.length > 200) undoStack.shift();
}

document.addEventListener("keydown", (e) => {
  // undo
  if ((e.ctrlKey || e.metaKey) && e.key === "z") {
    e.preventDefault();
    if (undoStack.length) {
      redoStack.push(typed.textContent);
      typed.textContent = undoStack.pop();
    }
    return;
  }

  // redo
  if ((e.ctrlKey || e.metaKey) && e.key === "y") {
    e.preventDefault();
    if (redoStack.length) {
      undoStack.push(typed.textContent);
      typed.textContent = redoStack.pop();
    }
    return;
  }

  // backspace (normal + ctrl)
  if (e.key === "Backspace") {
    if (typed.textContent.length > 0) {
      pushHistory();
      redoStack.length = 0;

      if (e.ctrlKey || e.metaKey) {
        const text = typed.textContent;
        const trimmed = text.replace(/\s+$/, "");
        const newText = trimmed.replace(/\S+$/, "");
        typed.textContent = newText;
      } else {
        typed.textContent = typed.textContent.slice(0, -1);
      }
    }
    return;
  }
  // shift enter
  if (e.key === "Enter" && e.shiftKey) {
    e.preventDefault();
    pushHistory();
    redoStack.length = 0;
    typed.textContent += "\n";
    return;
  }
  // enter
  if (e.key === "Enter") {
    const command = typed.textContent.trim();
    if (command) processCommand(command);
    typed.textContent = "";
    undoStack.length = 0;
    redoStack.length = 0;
    return;
  }

  // ctrl/meta + letter → ignore printing
  if (e.ctrlKey || e.metaKey) return;

  // printable characters
  if (e.key.length === 1) {
    pushHistory();
    redoStack.length = 0;
    typed.textContent += e.key;
  }
});

// paste
document.addEventListener("paste", (e) => {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData("text");
  pushHistory();
  redoStack.length = 0;
  typed.textContent += text;
});
