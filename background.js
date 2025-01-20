chrome.runtime.onInstalled.addListener(function() {
  console.log("Clipboard Manager Extension Installed");
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('Message received in background:', request);

  if (request.action === "saveClipboard") {
    console.log('Saving clipboard data:', request.data);
    saveClipboardData(request.data, sendResponse);
    return true; 
  } else if (request.action === "getClipboardHistory") {
    console.log('Fetching clipboard history');
    getClipboardHistory(sendResponse);
    return true; 
  } else if (request.action === "clearClipboardHistory") {
    console.log('Clearing clipboard history');
    clearClipboardHistory(sendResponse);
    return true;
  }
});

function saveClipboardData(data, sendResponse) {
  chrome.storage.local.get({ clipboardHistory: [] }, function(result) {
    if (chrome.runtime.lastError) {
      console.error('Error getting clipboard history:', chrome.runtime.lastError);
      sendResponse({ status: 'error', message: 'Failed to retrieve history' });
      return;
    }

    let history = result.clipboardHistory || [];
    data.timestamp = new Date().getTime();
    history.push(data);

    const now = Date.now();
    history = history.filter(item => now - item.timestamp <= 45 * 24 * 60 * 60 * 1000);

    chrome.storage.local.set({ clipboardHistory: history }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving clipboard history:', chrome.runtime.lastError);
        sendResponse({ status: 'error', message: 'Failed to save data' });
        return;
      }
      console.log('Updated clipboard history after save:', history);
      sendResponse({ status: 'success' });
    });
  });
}

function getClipboardHistory(sendResponse) {
  chrome.storage.local.get({ clipboardHistory: [] }, function(result) {
    if (chrome.runtime.lastError) {
      console.error('Error fetching clipboard history:', chrome.runtime.lastError);
      sendResponse({ status: 'error', message: 'Failed to fetch data' });
      return;
    }

    console.log('Clipboard history fetched:', result.clipboardHistory || []);
    sendResponse({ status: 'success', data: result.clipboardHistory || [] });
  });
}

function clearClipboardHistory(sendResponse) {
  chrome.storage.local.set({ clipboardHistory: [] }, function() {
    if (chrome.runtime.lastError) {
      console.error('Error clearing clipboard history:', chrome.runtime.lastError);
      sendResponse({ status: 'error', message: 'Failed to clear data' });
      return;
    }

    console.log('Clipboard history cleared');
    sendResponse({ status: 'success' });
  });
}
