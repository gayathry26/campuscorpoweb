const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCRATCH_DIR = path.resolve('C:\\Users\\Ramchi\\.gemini\\antigravity\\brain\\093f0542-1999-4ed4-aa1b-4dbf89b796af\\scratch');

async function checkCheckinScreenshots() {
  const chrome = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1400,900',
    'about:blank'
  ]);

  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9224/json/version');
      if (res.ok) break;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 200));
  }

  const res = await fetch('http://127.0.0.1:9224/json/new?http://localhost:5000/exam?testId=1', { method: 'PUT' });
  const tab = await res.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));

  let id = 1;
  const send = (m, p = {}) =>
    new Promise((r) => {
      const curId = id++;
      const handler = (msg) => {
        const d = JSON.parse(msg.data);
        if (d.id === curId) {
          ws.removeEventListener('message', handler);
          r(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: curId, method: m, params: p }));
    });

  await send('Page.enable');
  await send('Runtime.enable');

  // Wait for React hydration
  await new Promise((r) => setTimeout(r, 3500));

  // Dark mode screenshot
  const ssDark = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SCRATCH_DIR, '01_candidate_checkin_gate_dark.png'), Buffer.from(ssDark.data, 'base64'));

  // Switch to Light mode
  await send('Runtime.evaluate', {
    expression: "document.documentElement.classList.remove('dark'); localStorage.setItem('campuscorp_theme_mode', 'light');"
  });
  await new Promise((r) => setTimeout(r, 500));

  // Light mode screenshot
  const ssLight = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SCRATCH_DIR, '01_candidate_checkin_gate_light.png'), Buffer.from(ssLight.data, 'base64'));

  console.log('Saved checkin dark and light screenshots successfully.');
  chrome.kill();
}

checkCheckinScreenshots().catch(console.error);

