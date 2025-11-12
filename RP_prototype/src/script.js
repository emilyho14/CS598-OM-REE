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
          Predicted performance: <em>Loading...</em>
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
        <ul style="font-size:13px;color:#374151;margin:0 0 12px 20px;">
          <p id="suggestions-text" style="font-size:12px;color:#6b7280;margin-top:4px;">
            No suggestions detected.
          </p>
        </ul>

        <div style="display:flex;gap:8px;">
          
        </div>
      </div>
    </div>
  `;

  box.appendChild(toggle);
  // --- SEND TO BACKEND BUTTON ---
const sendButton = document.createElement('button');
sendButton.textContent = 'Send to Backend';
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
  console.log('[mp] Sending post data:', data);

  // Optional: visual feedback
  sendButton.textContent = 'Sending...';
  sendButton.disabled = true;
  sendButton.style.opacity = '0.7';

  // Show data on the page
  displayBox.textContent = JSON.stringify(data, null, 2);
  // try {
  //   const res = await fetch('https://backend-url.com/api/post', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(data),
  //   });

  //   if (res.ok) {
  //     console.log('[mp] Successfully sent post data!');
  //     sendButton.textContent = '✅ Sent!';
  //     sendButton.style.background = '#16a34a';
  //   } else {
  //     console.error('[mp] Failed to send:', res.statusText);
  //     sendButton.textContent = '❌ Failed';
  //     sendButton.style.background = '#dc2626';
  //   }
  // } catch (err) {
  //   console.error('[mp] Error sending data:', err);
  //   sendButton.textContent = '❌ Error';
  //   sendButton.style.background = '#dc2626';
  // }

  setTimeout(() => {
    sendButton.textContent = 'Send to Backend';
    sendButton.disabled = false;
    sendButton.style.opacity = '1';
    sendButton.style.background = '#10b981';
  }, 2000);
});


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


  // Attach to the first visible textarea
  // function attachFeedback() {
  //   const textAreas = deepQuerySelector(document, 'textarea#innerTextArea.no-label');
  //   const visible = textAreas.filter(el => {
  //     const r = el.getBoundingClientRect();
  //     return r.width > 0 && r.height > 0 && getComputedStyle(el).display !== 'none';
  //   });

  //   if (visible.length > 0) {
  //     document.querySelectorAll('#feedback-box').forEach(e => e.remove());
  //     createFeedbackBox(visible[0]);
  //   } else {
  //     console.log('[mp] No visible textareas found, retrying...');
  //     setTimeout(attachFeedback, 1500);
  //   }
  // }
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

// Keep your button
window.addEventListener('load', async () => {
  console.log('Page loaded! Starting extension code...');
  const button = document.createElement('button');
  button.textContent = 'Click Me, RP r/careeradvice test :)';
  button.classList.add('sample-button');
  button.addEventListener('click', () => console.log('Button clicked!'));
  const beforeElement = document.body.querySelector('faceplate-tracker[noun="reddit_logo"]');
  if (beforeElement) beforeElement.insertAdjacentElement('afterend', button);
});