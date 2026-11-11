const { spawn } = require('child_process');
const net = require('net');
const path = require('path');
const fs = require('fs');

console.log('================================================================');
console.log('🚀 [INNOVO PLATFORM] Launching Backend Server & Client Dev Server');
console.log('================================================================');

// 1. Check if MySQL is running
function checkPort(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

async function main() {
  const isMySqlRunning = await checkPort(3306);
  if (!isMySqlRunning) {
    const xamppMysqld = 'C:\\xampp\\mysql\\bin\\mysqld.exe';
    const myIni = 'C:\\xampp\\mysql\\bin\\my.ini';
    if (fs.existsSync(xamppMysqld)) {
      console.log('⚙️  [DATABASE] Port 3306 offline. Auto-starting XAMPP MySQL daemon...');
      spawn(xamppMysqld, [`--defaults-file=${myIni}`, '--standalone'], {
        detached: true,
        stdio: 'ignore'
      }).unref();
      // wait 2 seconds for MySQL to bind port 3306
      await new Promise(r => setTimeout(r, 2000));
      console.log('✓ [DATABASE] MySQL daemon process initiated.');
    } else {
      console.warn('⚠️  [DATABASE] MySQL does not seem to be running on port 3306. Please start MySQL/XAMPP.');
    }
  } else {
    console.log('✓ [DATABASE] MySQL is actively running on port 3306.');
  }

  // 2. Start Backend Server
  console.log('🔌 [BACKEND] Starting REST API server on port 5000...');
  const serverProc = spawn('node', ['server/src/server.js'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  // 3. Start Frontend Client Dev Server
  console.log('💻 [FRONTEND] Starting Vite React client on port 5173...');
  const clientProc = spawn('npm', ['run', 'dev', '--prefix', 'client'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  function cleanExit() {
    console.log('\n🛑 Shutting down Innovo services...');
    try { serverProc.kill(); } catch (e) {}
    try { clientProc.kill(); } catch (e) {}
    process.exit(0);
  }

  process.on('SIGINT', cleanExit);
  process.on('SIGTERM', cleanExit);
  process.on('exit', cleanExit);
}

main().catch(console.error);
