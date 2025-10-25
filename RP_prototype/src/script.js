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
        <div style="height:8px;width:100%;background:#fee2e2;border-radius:4px;margin-top:4px;">
          <div style="height:8px;width:30%;background:#ef4444;border-radius:4px;"></div>
        </div>
        <p style="font-size:12px;color:#6b7280;margin-top:4px;">Predicted performance: Above average for r/science</p>
      </div>

      <div style="margin-bottom:16px;">
        <p style="margin:0;font-size:14px;color:#374151;display:flex;align-items:center;gap:6px;">
          <span>Risk of Deletion</span>
        </p>
        <div style="height:8px;width:100%;background:#fee2e2;border-radius:4px;margin-top:4px;">
          <div style="height:8px;width:40%;background:#ef4444;border-radius:4px;"></div>
        </div>
        <p style="font-size:12px;color:#6b7280;margin-top:4px;">Moderate risk: Tone slightly aggressive</p>
      </div>

      <div style="border-top:1px solid #e5e7eb;padding-top:10px;">
        <p style="font-size:14px;font-weight:600;margin-bottom:6px;">Suggestions</p>
        <ul style="font-size:13px;color:#374151;margin:0 0 12px 20px;">
          <li>Consider softening language to match subreddit norms.</li>
          <li>Add a supporting reference to increase credibility.</li>
          <li>Shorten intro paragraph for clarity.</li>
        </ul>

        <div style="display:flex;gap:8px;">
          <button style="flex:1;padding:6px 10px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
            <span>Ignore</span>
          </button>
          <button style="flex:1;padding:6px 10px;border:none;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;">
            <span>Accept</span>
          </button>
        </div>
      </div>
    </div>
  `;

  box.appendChild(toggle);
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
}


  // Attach to the first visible textarea
  function attachFeedback() {
    const textAreas = deepQuerySelector(document, 'textarea#innerTextArea.no-label');
    const visible = textAreas.filter(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).display !== 'none';
    });

    if (visible.length > 0) {
      document.querySelectorAll('#feedback-box').forEach(e => e.remove());
      createFeedbackBox(visible[0]);
    } else {
      console.log('[mp] No visible textareas found, retrying...');
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
  button.textContent = 'Click Me, RP CMV test :)';
  button.classList.add('sample-button');
  button.addEventListener('click', () => console.log('Button clicked!'));
  const beforeElement = document.body.querySelector('faceplate-tracker[noun="reddit_logo"]');
  if (beforeElement) beforeElement.insertAdjacentElement('afterend', button);
});
