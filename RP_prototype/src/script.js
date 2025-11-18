console.log('[mp] injected:', location.href);
console.log('[mp] pathname:', location.pathname);

function run() {
  // Helper: Deep query selector
  function deepQuerySelector(root, selector) {
    const out = [];
    const visited = new Set();

    function walk(node) {
      if (!node || visited.has(node)) return;
      visited.add(node);

      if (node instanceof Element && node.matches(selector)) out.push(node);

      if (
        node instanceof Element ||
        node instanceof Document ||
        node instanceof DocumentFragment ||
        node instanceof ShadowRoot
      ) {
        for (const child of node.children || []) walk(child);
      }

      if (node instanceof Element && node.shadowRoot) walk(node.shadowRoot);
    }

    walk(root);
    return out;
  }

  function collectRules(root = document) {
    const clean = s => (s || "").replace(/\s+/g, " ").trim();
    const rules = [];
  
    root.querySelectorAll("h2.i18n-translatable-text").forEach((h2, i) => {
      const title = clean(h2.textContent);
      let description = "";
  
      const details = h2.closest("details");
      if (details) {
        const parts = [];
        details.querySelectorAll(".md p, .md li").forEach(el => {
          const text = clean(el.textContent);
          if (text) parts.push(el.tagName === "LI" ? `- ${text}` : text);
        });
        if (parts.length) description = parts.join(" ");
      }
  
      if (title) {
        const ruleText = description ? `${i + 1}. ${title} — ${description}` : `${i + 1}. ${title}`;
        rules.push(ruleText);
      }
    });
  
    const string_rules = rules.join("\n");
    return string_rules;
  }
  

  function collectPostData() {
    const data = {};

    // --- Post Title ---
    const titleInput = deepQuerySelector(document, 'textarea[name="title"], input[name="title"], div[role="textbox"][data-testid*="post-title"]')[0];
    data.title = titleInput
      ? (titleInput.value || titleInput.innerText || '').trim()
      : null;

    // --- Post Body (text or markdown editor) ---
    const bodyEditor = deepQuerySelector(document, 'div[contenteditable="true"][name="body"], div[role="textbox"][data-testid*="post-content"]')[0];
    data.body = bodyEditor
      ? (bodyEditor.innerText || bodyEditor.textContent || '').trim()
      : null;

    // --- Tags / Flair ---
    const tagElements = deepQuerySelector(document, 'button[role="menuitemcheckbox"][aria-checked="true"], [data-testid="post-tag"]');
    data.tags = Array.from(tagElements).map(el => el.innerText.trim());

    // --- Metadata ---
    data.url = location.href;
    data.subreddit = location.pathname.split('/')[2] || null;

    return data;
  }

function createFeedbackBox(editor) {
  const rect = editor.getBoundingClientRect();

  const box = document.createElement('div');
  box.id = 'feedback-box';
  Object.assign(box.style, {
    // position: 'fixed',
    // top: `${rect.top}px`,
    position: 'absolute',
    top: `${rect.top + window.scrollY}px`,
    left: `${rect.right + 20}px`,
    width: '380px',
    background: '#fff',
    border: '2px solid #d1d5db',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
    fontFamily: 'system-ui, Arial, sans-serif',
    zIndex: '99999',
    cursor: 'grab',
  });

  // --- HEADER + MINIMIZE TOGGLE ---
  const toggle = document.createElement('button');
  toggle.textContent = '–';
  Object.assign(toggle.style, {
    position: 'absolute',
    top: '6px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#555',
  });

  let minimized = false;
  toggle.addEventListener('click', () => {
    minimized = !minimized;
    const content = box.querySelector('.feedback-content');
    content.style.display = minimized ? 'none' : 'block';
    toggle.textContent = minimized ? '+' : '–';
  });

  // --- MAIN CONTENT ---
  box.innerHTML = `
    <h3 style="margin:0 0 10px;font-size:18px;font-weight:600;color:#111;">Post Feedback</h3>
    <div class="feedback-content">
      <div style="margin-bottom:16px;">
        <p style="margin:0;font-size:14px;color:#374151;">Engagement Score</p>
        <p id="engagement-text" style="font-size:12px;color:#6b7280;margin-top:4px;">
          Predicted performance: <em>n/a</em>
        </p>
      </div>

      <div style="margin-bottom:16px;">
        <p style="margin:0;font-size:14px;color:#374151;display:flex;align-items:center;gap:6px;">
          <span>Rules Violated</span>
        </p>
        <p id="rules-violated-text" style="font-size:12px;color:#6b7280;margin-top:4px;">
          None detected.
        </p>
      </div>

      <div style="border-top:1px solid #e5e7eb;padding-top:10px;">
        <p style="font-size:14px;font-weight:600;margin-bottom:6px;">Suggestions</p>

        <div id="suggestions-text"
            style="
              font-size:13px;
              color:#374151;
              margin-top:6px;
              line-height:1.5;
              white-space:pre-wrap;
              max-height:200px;
              overflow-y:auto;
              padding-right:4px;
            ">
            No suggestions detected.
        </div>
      </div>
    </div>
  `;

  box.appendChild(toggle);
  // --- SEND TO BACKEND BUTTON ---
const sendButton = document.createElement('button');
sendButton.textContent = 'Generate Feedback';
Object.assign(sendButton.style, {
  width: '100%',
  padding: '8px',
  borderRadius: '20px',
  border: 'none',
  background: '#10b981',
  color: '#fff',
  fontWeight: '600',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
});

// initially disable
sendButton.disabled = true;
sendButton.style.opacity = "0.5";
sendButton.style.cursor = "not-allowed";
// Watch for text changes inside Reddit’s nested editor
const observer = new MutationObserver(updateButtonState);
observer.observe(editor, {
  subtree: true,
  characterData: true,
  childList: true
});

// Run right away for initial state
updateButtonState();

function updateButtonState() {
  const content = editor.innerText.trim();
  if (!content) {
    sendButton.disabled = true;
    sendButton.style.opacity = "0.5";
    sendButton.style.cursor = "not-allowed";
  } else {
    sendButton.disabled = false;
    sendButton.style.opacity = "1";
    sendButton.style.cursor = "pointer";
  }
}

const displayBox = document.createElement('pre');
Object.assign(displayBox.style, {
  background: '#f3f4f6',
  padding: '12px',
  borderRadius: '10px',
  marginTop: '10px',
  fontFamily: 'monospace',
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  maxHeight: '300px',
  overflowY: 'auto',
  border: '1px solid #e5e7eb',
});

sendButton.addEventListener('click', async () => {
  const data = collectPostData();
  const rules = collectRules();

  console.log("[mp] Sending to backend:", data, rules);

  // UI feedback
  sendButton.textContent = "Sending...";
  sendButton.disabled = true;
  sendButton.style.opacity = "0.7";

  // Show raw data in displayBox
  displayBox.textContent = JSON.stringify({ post: data, rules }, null, 2);

  // SEND DATA TO BACKEND
  chrome.runtime.sendMessage(
    {
      action: "evaluatePost",
      // postData: JSON.stringify(data),
      postData: JSON.stringify({
          full_text: `${data.title}\n\n${data.body}`.trim(),
          title: data.title,
          body: data.body,
          tags: data.tags,
          subreddit: data.subreddit
      }),
      rules: rules
    },
    (response) => {
      console.log("[CONTENT] Raw background response:", response);

      // Re-enable UI
      sendButton.textContent = "Generate Feedback";
      sendButton.disabled = false;
      sendButton.style.opacity = "1";

      if (!response || !response.success) {
        console.error("[CONTENT] Error from backend:", response?.error);
        displayBox.textContent = "❌ Backend error: " + response?.error;
        return;
      }

      console.log("Backend result:", response.result);

      // Parsing fields part from json 
      let parsed;
      try {
        parsed = typeof response.result === "string" ? JSON.parse(response.result.replace(/'/g, '"')) : response.result;
      } catch (e) {
        parsed = {
          rules_broken: [],
          feedback: response.result,
          engagement: response.engagement
        };
      }

      console.log("%c[CONTENT] Parsed object:", parsed);

      // Update UI Feedback Box
      document.getElementById("rules-violated-text").innerText =
        parsed.rules_broken?.join(", ") || "None";

      // parse feedback since json technically put rules, feedback and engagement in "feedback"
      let innerFeedback = parsed.feedback;

      if (typeof innerFeedback === "string") {
          // Strip markdown fences if the model puts them there too
          innerFeedback = innerFeedback
              .replace(/```json/i, "")
              .replace(/```/g, "")
              .trim();

          try {
              const innerObj = JSON.parse(innerFeedback);
              innerFeedback = innerObj.feedback || innerFeedback;
          } catch (e) {
              // leave it
          }
      }

      document.getElementById("suggestions-text").innerText =
          innerFeedback || "No feedback.";

      document.getElementById("engagement-text").innerText =
        parsed.engagement || "neutral";

    }
    
  );
});

  // setTimeout(() => {
  //   sendButton.textContent = 'Send to Backend';
  //   sendButton.disabled = false;
  //   sendButton.style.opacity = '1';
  //   sendButton.style.background = '#10b981';
  // }, 2000);
// });


const target = document.querySelector('[role="textbox"]')?.closest('form') || document.body;
target.appendChild(displayBox);


box.appendChild(sendButton);
  document.body.appendChild(box);

  // --- DRAG FUNCTIONALITY ---
  let offsetX, offsetY, dragging = false;

  box.addEventListener('mousedown', e => {
    dragging = true;
    box.style.cursor = 'grabbing';
    const r = box.getBoundingClientRect();
    offsetX = e.clientX - r.left;
    offsetY = e.clientY - r.top;
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    box.style.left = `${e.clientX - offsetX}px`;
    box.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
    box.style.cursor = 'grab';
  });

  console.log('[mp] Feedback box injected.');
  console.log('Rules: ', collectRules());
}

  function attachFeedback() {
    // Search the deep DOM (including shadow roots) for the post editor div
    const editors = deepQuerySelector(document, 'div[contenteditable="true"][name="body"]');
    const visible = editors.filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden';
    });

    if (visible.length > 0) {
      document.querySelectorAll('#feedback-box').forEach(e => e.remove());
      console.log('[mp] Found post body editor:', visible[0]);
      createFeedbackBox(visible[0]); // Pass the editable div to your popup creator
    } else {
      console.log('[mp] No post editor found yet, retrying...');
      setTimeout(attachFeedback, 1500);
    }
  }


  // Observe user focus events (so it reappears when clicking “Reply”)
  document.addEventListener('focusin', e => {
    if (e.target.tagName.toLowerCase() === 'textarea') {
      document.querySelectorAll('#feedback-box').forEach(e => e.remove());
      createFeedbackBox(e.target);
    }
  });

  setTimeout(attachFeedback, 2500);
}

setTimeout(run, 1200);

window.addEventListener('load', async () => {
  console.log('Page loaded! Starting extension code...');

  // just to help see if extension was reloaded, number doesn't mean anything
  const randomId = Math.floor(Math.random() * 100) + 1; 

  const button = document.createElement('button');
  button.textContent = `RP extension activated! [${randomId}]`;
  button.classList.add('sample-button');
  button.addEventListener('click', () => console.log('Button clicked!'));
  const beforeElement = document.body.querySelector('faceplate-tracker[noun="reddit_logo"]');
  if (beforeElement) beforeElement.insertAdjacentElement('afterend', button);
});