document.addEventListener("DOMContentLoaded", () => {
  const historyContainer = document.getElementById("history");
  const readClipboardButton = document.getElementById("readClipboard");
  const clearHistoryButton = document.getElementById("clearHistory");

  fetchClipboardHistory();

  readClipboardButton.addEventListener("click", () => {
    readClipboardAndSave();
  });

  clearHistoryButton.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "clearClipboardHistory" }, () => {
      fetchClipboardHistory();
    });
  });

  function readClipboardAndSave() {
    navigator.clipboard.readText().then(text => {
      if (text) {
        console.log("Clipboard text read:", text);
        chrome.runtime.sendMessage({ action: "saveClipboard", data: { text: text } }, () => {
          fetchClipboardHistory();
        });
      } else {
        alert("Clipboard is empty");
      }
    }).catch(err => {
      console.error("Failed to read clipboard:", err);
      showPermissionInstructions();
    });
  }

  function showPermissionInstructions() {
    const os = navigator.platform;
    let instructions = "Please grant clipboard access permission.";

    if (os.includes("Mac")) {
      instructions = `Clipboard access may be blocked on macOS.
      Please go to System Preferences > Security & Privacy > Privacy > Screen Recording
      and ensure Chrome is checked.`;
    } else if (os.includes("Win")) {
      instructions = `Clipboard access may be restricted on Windows.
      Please ensure Chrome is allowed to access the clipboard in your system settings.`;
    }

    alert(instructions);
  }

  function fetchClipboardHistory() {
    chrome.runtime.sendMessage({ action: "getClipboardHistory" }, (response) => {
      if (response.status === "success") {
        displayHistory(response.data);
      } else {
        console.error("Failed to fetch clipboard history:", response.message);
      }
    });
  }

  function displayHistory(history) {
    historyContainer.innerHTML = "";
    if (history.length === 0) {
      historyContainer.innerHTML = "<p>No clipboard history available.</p>";
      return;
    }

    history.forEach(item => {
      const itemDiv = document.createElement("div");
      itemDiv.classList.add("item");
      
      const textDiv = document.createElement("div");
      textDiv.textContent = item.text;
      itemDiv.appendChild(textDiv);

      const timestampDiv = document.createElement("div");
      timestampDiv.classList.add("timestamp");
      timestampDiv.textContent = new Date(item.timestamp).toLocaleString();
      itemDiv.appendChild(timestampDiv);

      historyContainer.appendChild(itemDiv);
    });
  }
});
