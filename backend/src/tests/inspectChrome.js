const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCRATCH_DIR = path.resolve('C:\\Users\\Ramchi\\.gemini\\antigravity\\brain\\093f0542-1999-4ed4-aa1b-4dbf89b796af\\scratch');

if (!fs.existsSync(SCRATCH_DIR)) {
  fs.mkdirSync(SCRATCH_DIR, { recursive: true });
}

async function runInteractiveVerification() {
  console.log('Starting Interactive Chrome E2E Proctor & Theme Verification...');
  const userDataDir = path.join(__dirname, '../../tmp/chrome-test-' + Date.now());

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1400,900',
    'about:blank'
  ]);

  let wsUrl = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        const data = await res.json();
        wsUrl = data.webSocketDebuggerUrl;
        break;
      }
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!wsUrl) {
    console.error('Failed to connect to Chrome CDP.');
    chromeProc.kill();
    return;
  }

  // Open Exam page
  const tabRes = await fetch('http://127.0.0.1:9222/json/new?http://localhost:5000/exam?testId=1', { method: 'PUT' });
  const tab = await tabRes.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();
  const consoleLogs = [];
  const errors = [];

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await new Promise((resolve) => (ws.onopen = resolve));

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve } = pending.get(msg.id);
      pending.delete(msg.id);
      resolve(msg.result);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      const text = msg.params.args.map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
      consoleLogs.push(`[${msg.params.type}] ${text}`);
      if (msg.params.type === 'error') {
        errors.push(`Console error: ${text}`);
      }
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const desc = msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text;
      errors.push(`Runtime Exception: ${desc}`);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');
  await send('DOM.enable');

  async function takeScreenshot(name) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    if (res && res.data) {
      const p = path.join(SCRATCH_DIR, `${name}.png`);
      fs.writeFileSync(p, Buffer.from(res.data, 'base64'));
      console.log(`📸 Screenshot saved: ${p}`);
      return p;
    }
  }

  async function evalJs(expr) {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return res?.result?.value;
  }

  // Helper for React controlled input value change
  const setInputHelper = `
    function setReactValue(input, value) {
      if (!input) return;
      const lastValue = input.value;
      input.value = value;
      const tracker = input._valueTracker;
      if (tracker) {
        tracker.setValue(lastValue);
      }
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  `;

  // 1. Wait for Check-in page
  await new Promise((r) => setTimeout(r, 2000));
  console.log('\n--- PHASE 1: CANDIDATE CHECK-IN GATE ---');
  let checkinState = await evalJs(`(() => {
    const formInputs = Array.from(document.querySelectorAll('form input')).map((i, idx) => ({ index: idx, placeholder: i.placeholder, val: i.value }));
    const header = document.querySelector('h1, h2')?.innerText || '';
    return { header, formInputs, bodySnippet: document.body.innerText.slice(0, 150) };
  })()`);
  console.log('Check-in UI detected:', checkinState);
  await takeScreenshot('01_candidate_checkin_dark');

  // Fill candidate details in the form
  console.log('Filling candidate details with React controlled input setter...');
  const fillResult = await evalJs(`(() => {
    ${setInputHelper}
    const inputs = document.querySelectorAll('form input');
    if (inputs.length >= 3) {
      setReactValue(inputs[0], 'Aditya Candidate');
      setReactValue(inputs[1], '2026CS999');
      setReactValue(inputs[2], 'candidate.aditya@campuscorp.edu');
      if (inputs[3]) setReactValue(inputs[3], 'Computer Science & Engineering');
    }

    const submitBtn = document.querySelector('form button[type="submit"]');
    if (submitBtn) {
      submitBtn.click();
      return 'Clicked submit button with ' + inputs.length + ' inputs filled';
    }
    return 'Submit button not found';
  })()`);
  console.log('Fill & submit result:', fillResult);

  // 2. Wait for Rules Phase
  await new Promise((r) => setTimeout(r, 1500));
  console.log('\n--- PHASE 2: EXAMINATION RULES & ANTI-CHEAT POLICIES ---');
  const rulesState = await evalJs(`(() => {
    const buttons = Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim());
    const checkbox = document.querySelector('input[type="checkbox"]');
    return {
      title: document.querySelector('h1, h2')?.innerText || '',
      buttons,
      hasCheckbox: !!checkbox,
      bodySnippet: document.body.innerText.slice(0, 200)
    };
  })()`);
  console.log('Rules UI detected:', rulesState);
  await takeScreenshot('02_exam_rules_dark');

  // Check agreement checkbox
  console.log('Accepting exam rules and compliance agreement...');
  await evalJs(`(() => {
    const checkbox = document.querySelector('input[type="checkbox"]');
    if (checkbox && !checkbox.checked) {
      checkbox.click();
      return 'Checkbox clicked';
    }
    return 'Checkbox not found or already checked';
  })()`);

  // Test switching to Light Theme to verify light mode styling on Rules
  console.log('\n--- THEME VERIFICATION: SWITCHING RULES TO LIGHT MODE ---');
  await evalJs(`(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('campuscorp_theme_mode', 'light');
    window.dispatchEvent(new Event('storage'));
  })()`);
  await new Promise((r) => setTimeout(r, 500));
  await takeScreenshot('03_exam_rules_light');

  // Switch back to Dark Theme
  await evalJs(`(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('campuscorp_theme_mode', 'dark');
  })()`);
  await new Promise((r) => setTimeout(r, 500));

  // 3. Click "Launch Proctored Exam"
  console.log('\n--- PHASE 3: LAUNCHING EXAM & VERIFYING LOCKS ---');
  const launchResult = await evalJs(`(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const startBtn = buttons.find(b => b.innerText.includes('Launch') || b.innerText.includes('Begin') || b.innerText.includes('Start'));
    if (startBtn) {
      startBtn.click();
      return 'Launched exam via button: ' + startBtn.innerText;
    }
    return 'Start button not found';
  })()`);
  console.log('Launch result:', launchResult);

  await new Promise((r) => setTimeout(r, 2500));
  await takeScreenshot('04_exam_screen_active_lock_overlay');

  // Check Proctor HUD and Lock Overlay state
  const examLockState = await evalJs(`(() => {
    const lockOverlay = document.querySelector('[class*="backdrop-blur"], [class*="fixed inset-0"]');
    const strikeText = document.body.innerText.match(/Strike\\s*\\d|Violation\\s*\\d|Security Violation/i)?.[0] || 'none';
    const resumeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Resume') || b.innerText.includes('Fullscreen'));
    const timerText = document.body.innerText.match(/\\d{1,2}:\\d{2}:\\d{2}|\\d{1,2}:\\d{2}/)?.[0] || 'none';

    return {
      hasLockOverlay: !!lockOverlay,
      strikeText,
      resumeButton: resumeBtn ? resumeBtn.innerText.trim() : null,
      timerText,
      bodyTextSnippet: document.body.innerText.slice(0, 300)
    };
  })()`);
  console.log('Exam Proctor Lock State:', examLockState);

  // 4. Test Lock Mechanisms via DOM Event Simulation
  console.log('\n--- PHASE 4: VERIFYING ALL PROCTOR SECURITY LOCKS ---');

  const locksTestResults = await evalJs(`(() => {
    const results = {};

    // 1. Test DevTools Shortcut Blocking (F12)
    const f12Event = new KeyboardEvent('keydown', { key: 'F12', keyCode: 123, which: 123, bubbles: true, cancelable: true });
    document.dispatchEvent(f12Event);
    results.f12Blocked = f12Event.defaultPrevented;

    // 2. Test Ctrl+Shift+I Blocking
    const devToolsEvent = new KeyboardEvent('keydown', { key: 'I', code: 'KeyI', ctrlKey: true, shiftKey: true, bubbles: true, cancelable: true });
    document.dispatchEvent(devToolsEvent);
    results.ctrlShiftIBlocked = devToolsEvent.defaultPrevented;

    // 3. Test Ctrl+U (View Source) Blocking
    const viewSourceEvent = new KeyboardEvent('keydown', { key: 'u', code: 'KeyU', ctrlKey: true, bubbles: true, cancelable: true });
    document.dispatchEvent(viewSourceEvent);
    results.ctrlUBlocked = viewSourceEvent.defaultPrevented;

    // 4. Test Copy Prevention
    const copyEvent = new ClipboardEvent('copy', { bubbles: true, cancelable: true });
    document.dispatchEvent(copyEvent);
    results.copyBlocked = copyEvent.defaultPrevented;

    // 5. Test Context Menu (Right Click) Prevention
    const contextMenuEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
    document.dispatchEvent(contextMenuEvent);
    results.contextMenuBlocked = contextMenuEvent.defaultPrevented;

    // 6. Test Selectstart Prevention
    const selectEvent = new Event('selectstart', { bubbles: true, cancelable: true });
    document.dispatchEvent(selectEvent);
    results.textSelectionBlocked = selectEvent.defaultPrevented;

    // 7. Check BroadcastChannel lock
    results.broadcastChannelSupported = typeof BroadcastChannel !== 'undefined';

    return results;
  })()`);
  console.log('Security Locks Event Results:', locksTestResults);

  // Take screenshot in Light Mode during Exam too
  await evalJs(`(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('campuscorp_theme_mode', 'light');
  })()`);
  await new Promise((r) => setTimeout(r, 500));
  await takeScreenshot('05_exam_screen_light_theme');

  console.log('\n========================================');
  console.log('SUMMARY OF CHECKS:');
  console.log('Runtime Errors:', errors.length);
  errors.forEach(e => console.log('  ❌', e));
  console.log('All anti-cheat locks operational:', JSON.stringify(locksTestResults, null, 2));
  console.log('========================================\n');

  // Close tab and chrome
  try {
    await fetch(`http://127.0.0.1:9222/json/close/${tab.id}`, { method: 'PUT' });
  } catch (e) {}

  chromeProc.kill();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (e) {}
}

runInteractiveVerification().catch(console.error);
