const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const SCRATCH_DIR = path.resolve('C:\\Users\\Ramchi\\.gemini\\antigravity\\brain\\093f0542-1999-4ed4-aa1b-4dbf89b796af\\scratch');

async function inspectScannerLive() {
  console.log('Testing Upgraded Live GitHub Repo Scanner in Chrome...');
  const userDataDir = path.join(__dirname, '../../tmp/chrome-live-scanner-' + Date.now());
  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9227',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,950',
    'about:blank'
  ]);

  for (let i = 0; i < 20; i++) {
    try {
      const r = await fetch('http://127.0.0.1:9227/json/version');
      if (r.ok) break;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 200));
  }

  // Login as real active student first so Skill Import saves to DB too!
  const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student.cse1@college.edu', password: 'Password@123' })
  });
  let authData = await loginRes.json();
  if (!authData.token) {
    const adminLogin = await fetch('http://localhost:5000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@college.edu', password: 'Password@123' })
    });
    authData = await adminLogin.json();
  }

  const tabRes = await fetch('http://127.0.0.1:9227/json/new?http://localhost:5000/login', { method: 'PUT' });
  const tab = await tabRes.json();
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const pending = new Map();
  const errors = [];
  const send = (method, params = {}) => new Promise(resolve => {
    const cur = id++;
    pending.set(cur, resolve);
    ws.send(JSON.stringify({ id: cur, method, params }));
  });

  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg.result);
      pending.delete(msg.id);
    }
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      errors.push(msg.params.args.map(a => a.value || a.description).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');

  const evalJs = async (expr) => {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return r?.result?.value;
  };

  await new Promise(r => setTimeout(r, 1500));

  await evalJs(`(() => {
    localStorage.setItem('placement_token', ${JSON.stringify(authData.token)});
    localStorage.setItem('placement_user', ${JSON.stringify(JSON.stringify(authData.user))});
    localStorage.setItem('campuscorp_theme_mode', 'dark');
    window.location.href = 'http://localhost:5000/github-scanner';
  })()`);

  await new Promise(r => setTimeout(r, 3000));

  // 1. Trigger Live Scan of FastAPI
  console.log('1. Triggering Live SSE Scan of FastAPI...');
  await evalJs(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('FastAPI'));
    if (btn) btn.click();
  })()`);

  await new Promise(r => setTimeout(r, 6000));

  const overviewState = await evalJs(`(() => {
    const imgs = Array.from(document.querySelectorAll('img')).map(im => ({ src: im.src, complete: im.complete, nw: im.naturalWidth }));
    return {
      repoTitle: document.querySelector('h2')?.innerText,
      hasLiveSynced: document.body.innerText.includes('LIVE SYNCED'),
      score: document.querySelector('.text-5xl')?.innerText,
      imgs
    };
  })()`);
  console.log('Overview state:', overviewState);

  // Scroll down slightly so quality score & languages are clearly visible
  await evalJs(`window.scrollTo(0, 320);`);
  await new Promise(r => setTimeout(r, 400));

  // Screenshot Overview Dark
  const ss1 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SCRATCH_DIR, 'scanner_live_overview_dark.png'), Buffer.from(ss1.data, 'base64'));
  console.log('📸 Saved scanner_live_overview_dark.png');

  // 2. Click "Verify & Import Skills to Profile"
  console.log('2. Clicking "Verify & Import Skills to Profile"...');
  await evalJs(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Verify & Import'));
    if (btn) btn.click();
  })()`);
  await new Promise(r => setTimeout(r, 1500));

  const importState = await evalJs(`(() => ({
    hasVerifiedBtn: document.body.innerText.includes('Skills Verified')
  }))()`);
  console.log('Import skills state:', importState);

  // 3. Switch to Live Commits Tab
  console.log('3. Switching to Live Commits Tab...');
  await evalJs(`(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Live Commits'));
    if (btn) btn.click();
    window.scrollTo(0, 480);
  })()`);
  await new Promise(r => setTimeout(r, 800));

  const commitsState = await evalJs(`(() => ({
    hasLiveCommitsHeading: document.body.innerText.toUpperCase().includes('LIVE RECENT COMMITS'),
    hasContributors: document.body.innerText.toUpperCase().includes('TOP CONTRIBUTORS')
  }))()`);
  console.log('Commits tab state:', commitsState);

  const ss2 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SCRATCH_DIR, 'scanner_live_commits_dark.png'), Buffer.from(ss2.data, 'base64'));
  console.log('📸 Saved scanner_live_commits_dark.png');

  // 4. Switch to Structure & README Tab in Light Mode
  console.log('4. Switching to Structure & README Tab in Light Mode...');
  await evalJs(`(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('campuscorp_theme_mode', 'light');
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('File Structure'));
    if (btn) btn.click();
    window.scrollTo(0, 480);
  })()`);
  await new Promise(r => setTimeout(r, 800));

  const ss3 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SCRATCH_DIR, 'scanner_live_structure_light.png'), Buffer.from(ss3.data, 'base64'));
  console.log('📸 Saved scanner_live_structure_light.png');

  // 5. Test Profile Scan (@vercel)
  console.log('5. Testing Live Profile Lookup (@vercel)...');
  await evalJs(`(() => {
    window.scrollTo(0, 0);
    document.documentElement.classList.add('dark');
    localStorage.setItem('campuscorp_theme_mode', 'dark');
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('@vercel'));
    if (btn) btn.click();
  })()`);
  await new Promise(r => setTimeout(r, 4500));

  const profileState = await evalJs(`(() => ({
    profileTitle: document.querySelector('h2')?.innerText,
    scanButtonsCount: Array.from(document.querySelectorAll('button')).filter(b => b.innerText === 'Scan Live').length
  }))()`);
  console.log('Profile scan state:', profileState);

  const ss4 = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(SCRATCH_DIR, 'scanner_live_profile_dark.png'), Buffer.from(ss4.data, 'base64'));
  console.log('📸 Saved scanner_live_profile_dark.png');

  console.log('Browser Console Errors:', errors.length, errors);

  chromeProc.kill();
  try { fs.rmSync(userDataDir, { recursive: true, force: true }); } catch (e) {}
}

inspectScannerLive().catch(console.error);
