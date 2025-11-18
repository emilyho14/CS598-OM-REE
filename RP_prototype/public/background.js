chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "evaluatePost") {
    fetch("http://127.0.0.1:5001/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        post: message.postData,
        rules: message.rules
      })
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("[BACKGROUND] Parsed backend response:", data);

        sendResponse({
          success: true,
          result: data   
        });
      })
      .catch((err) => {
        console.error("[BACKGROUND] Error:", err);
        sendResponse({ success: false, error: err.toString() });
      });

    return true; 
  }
});
