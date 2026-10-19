const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');

let aiProcess = null;

/**
 * Ensures the internal Python AI microservice (Mistral 7B) is running in the background.
 * Keeps port 8000 purely internal so external users only interact with single port 5000.
 */
async function ensureAiDaemonRunning() {
  const AI_URL = process.env.PYTHON_SERVICE_URL || 'http://127.0.0.1:8000';
  const pythonPath = process.env.PYTHON_PATH || 'python';
  const aiAppPath = path.resolve(__dirname, '../../../ai_service/app.py');
  const aiDir = path.resolve(__dirname, '../../../ai_service');

  try {
    const health = await axios.get(`${AI_URL}/health`, { timeout: 1200 });
    console.log(`[AI DAEMON] Local Python AI service is already active on internal loopback (${AI_URL})`);
    return { status: 'running', external: true, health: health.data };
  } catch (err) {
    console.log('[AI DAEMON] Internal AI service is not running. Spawning background Python process...');
  }

  try {
    aiProcess = spawn(pythonPath, [aiAppPath], {
      cwd: aiDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    aiProcess.stdout.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) console.log(`[AI DAEMON LOG] ${msg}`);
    });

    aiProcess.stderr.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg && !msg.includes('INFO:') && !msg.includes('DEBUG:')) {
        console.warn(`[AI DAEMON] ${msg}`);
      }
    });

    aiProcess.on('error', (err) => {
      console.warn(`[AI DAEMON] Failed to spawn Python process: ${err.message}`);
    });

    aiProcess.on('exit', (code) => {
      console.log(`[AI DAEMON] Python process exited with code ${code}`);
      aiProcess = null;
    });

    // Clean exit on node shutdown
    const cleanup = () => {
      if (aiProcess) {
        try {
          aiProcess.kill();
        } catch (e) {}
      }
    };
    process.on('exit', cleanup);
    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    console.log('[AI DAEMON] Background Python AI daemon launched successfully.');
    return { status: 'spawned', pid: aiProcess.pid };
  } catch (err) {
    console.warn(`[AI DAEMON] Could not auto-spawn Python service: ${err.message}`);
    return { status: 'error', error: err.message };
  }
}

module.exports = {
  ensureAiDaemonRunning,
  getAiProcess: () => aiProcess,
};
