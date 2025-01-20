document.addEventListener("copy", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        chrome.runtime.sendMessage({ action: "saveClipboard", data: { text: text } });
        console.log("Copied text sent to background:", text);
      }
    } catch (error) {
      console.error("Failed to read clipboard content:", error);
    }
  });
  