const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCRATCH_DIR = path.resolve('C:\\Users\\Ramchi\\.gemini\\antigravity\\brain\\093f0542-1999-4ed4-aa1b-4dbf89b796af\\scratch');

async function testAssessmentHubShare() {
  console.log('Testing Assessment Hub Link Sharing Modal in Chrome...');
  const userDataDir = path.join(__dirname, '../../tmp/chrome-admin-' + Date.now());

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9225',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1400,900',
    'about:blank'
  ]);

  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9225/json/version');
      if (res.ok) break;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 200));
  }

  // Open login page
  const tabRes = await fetch('http://127.0.0.1:9225/json/new?http://localhost:5000/admin', { method: 'PUT' });
  const tab = await tabRes.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);

  let msgId = 1;
  const pending = new Map();
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
  };

  await send('Page.enable');
  await send('Runtime.enable');

  async function evalJs(expr) {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return res?.result?.value;
  }

  // Wait for login page
  await new Promise((r) => setTimeout(r, 2000));

  // Perform login via injected localStorage auth credentials
  console.log('Setting auth token for admin@college.edu directly in localStorage...');
  const loginApiRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@college.edu', password: 'Password@123' })
  });
  const authData = await loginApiRes.json();

  await evalJs(`(() => {
    localStorage.setItem('placement_token', ${JSON.stringify(authData.token)});
    localStorage.setItem('placement_user', ${JSON.stringify(JSON.stringify(authData.user))});
    localStorage.setItem('campuscorp_theme_mode', 'dark');
    window.location.href = 'http://localhost:5000/assessment';
  })()`);

  // Wait for Assessment Hub to load
  await new Promise((r) => setTimeout(r, 3500));

  console.log('Inspecting Assessment Hub UI...');
  const assessState = await evalJs(`(() => {
    const cards = Array.from(document.querySelectorAll('.rounded-2xl, .border')).map(c => c.innerText.slice(0, 100));
    const shareBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Share Link') || b.innerText.includes('Share'));
    return {
      title: document.title,
      url: window.location.href,
      shareButtonsCount: shareBtns.length,
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean).slice(0, 15)
    };
  })()`);
  console.log('Assessment Hub State:', assessState);

  // Take screenshot of Assessment Hub
  const ssHub = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SCRATCH_DIR, '06_assessment_hub_dark.png'), Buffer.from(ssHub.data, 'base64'));
  console.log('📸 Saved 06_assessment_hub_dark.png');

  // Click the first "Share Link" button
  console.log('Clicking "Share Link" button on test card...');
  const modalOpenResult = await evalJs(`(() => {
    const shareBtns = Array.from(document.querySelectorAll('button')).filter(b => b.innerText.includes('Share Link'));
    if (shareBtns.length > 0) {
      shareBtns[0].click();
      return 'Clicked first Share Link button';
    }
    return 'Share Link button not found';
  })()`);
  console.log('Modal trigger result:', modalOpenResult);

  await new Promise((r) => setTimeout(r, 800));

  // Check modal contents
  const modalState = await evalJs(`(() => {
    const modal = document.querySelector('[class*="fixed inset-0"]');
    const input = modal?.querySelector('input');
    const text = modal?.innerText || '';
    return {
      modalOpen: !!modal,
      sharedUrl: input ? input.value : 'not found',
      modalTextSnippet: text.slice(0, 300)
    };
  })()`);
  console.log('Share Modal State:', modalState);

  // Screenshot Share Modal in Dark Mode
  const ssModalDark = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SCRATCH_DIR, '07_share_modal_dark.png'), Buffer.from(ssModalDark.data, 'base64'));
  console.log('📸 Saved 07_share_modal_dark.png');

  // Switch to Light Mode and screenshot Share Modal
  await evalJs(`(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('campuscorp_theme_mode', 'light');
  })()`);
  await new Promise((r) => setTimeout(r, 500));

  const ssModalLight = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SCRATCH_DIR, '08_share_modal_light.png'), Buffer.from(ssModalLight.data, 'base64'));
  console.log('📸 Saved 08_share_modal_light.png');

  chromeProc.kill();
  try {
    fs.rmSync(userDataDir, { recursive: true, force: true });
  } catch (e) {}
}

testAssessmentHubShare().catch(console.error);
