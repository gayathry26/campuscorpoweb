const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { v4: uuidv4 } = require('uuid');

const RUNTIME_TIMEOUT_MS = parseInt(process.env.CODE_EXEC_TIMEOUT_MS || '5000', 10);
const MAX_OUTPUT_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Execute command and return stdout/stderr/exitCode
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve) => {
    // If command has spaces and shell is true on Windows, ensure it is safely wrapped
    const safeCommand = process.platform === 'win32' && command.includes(' ') && !command.startsWith('"')
      ? `"${command}"`
      : command;

    const child = spawn(safeCommand, args, {
      ...options,
      shell: true,
      windowsHide: true,
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timeout = setTimeout(() => {
      timedOut = true;
      try {
        child.kill('SIGKILL');
      } catch (e) {}
    }, options.timeout || RUNTIME_TIMEOUT_MS);

    if (options.input !== undefined && options.input !== null) {
      try {
        child.stdin.write(String(options.input));
        child.stdin.end();
      } catch (e) {}
    }

    child.stdout.on('data', (data) => {
      if (stdout.length < MAX_OUTPUT_BYTES) {
        stdout += data.toString();
      }
    });

    child.stderr.on('data', (data) => {
      if (stderr.length < MAX_OUTPUT_BYTES) {
        stderr += data.toString();
      }
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      resolve({
        code: code === null ? 1 : code,
        stdout,
        stderr,
        timedOut,
      });
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      resolve({
        code: 1,
        stdout,
        stderr: err.message,
        timedOut: false,
        error: err,
      });
    });
  });
}

/**
 * Detect runtime and compiler availability on host system
 */
async function detectCompilers() {
  const pythonPath = process.env.PYTHON_PATH || 'python';
  const gccPath = process.env.COMPILER_GCC_PATH || 'gcc';
  const gxxPath = process.env.COMPILER_GXX_PATH || 'g++';
  const javacPath = process.env.COMPILER_JAVAC_PATH || 'javac';
  const javaPath = process.env.COMPILER_JAVA_PATH || 'java';
  const nodePath = process.execPath || 'node';

  const results = {
    python: { available: false, version: null, path: pythonPath, error: null },
    javascript: { available: true, version: process.version, path: nodePath, error: null },
    java: { available: false, version: null, path: javacPath, error: null },
    c: { available: false, version: null, path: gccPath, error: null },
    cpp: { available: false, version: null, path: gxxPath, error: null },
  };

  // Test Python
  try {
    const res = await runCommand(pythonPath, ['--version'], { timeout: 3000 });
    if (res.code === 0 && (res.stdout || res.stderr)) {
      results.python.available = true;
      results.python.version = (res.stdout || res.stderr).trim();
    } else {
      results.python.error = res.stderr || 'Python executable not found in PATH.';
    }
  } catch (err) {
    results.python.error = err.message;
  }

  // Test Java
  try {
    const resJavac = await runCommand(javacPath, ['-version'], { timeout: 3000 });
    const resJava = await runCommand(javaPath, ['-version'], { timeout: 3000 });
    if ((resJavac.code === 0 || (resJavac.stderr && resJavac.stderr.includes('javac'))) && (resJava.code === 0 || (resJava.stderr && resJava.stderr.includes('version')))) {
      results.java.available = true;
      results.java.version = (resJavac.stdout || resJavac.stderr || resJava.stderr || '').split('\n')[0].trim();
    } else {
      results.java.error = 'JDK/JRE not found in PATH.';
    }
  } catch (err) {
    results.java.error = err.message;
  }

  // Test GCC
  try {
    const res = await runCommand(gccPath, ['--version'], { timeout: 3000 });
    if (res.code === 0 && (res.stdout || res.stderr)) {
      results.c.available = true;
      results.c.version = (res.stdout || res.stderr).split('\n')[0].trim();
    } else {
      results.c.error = 'GCC compiler not found in PATH.';
    }
  } catch (err) {
    results.c.error = err.message;
  }

  // Test G++
  try {
    const res = await runCommand(gxxPath, ['--version'], { timeout: 3000 });
    if (res.code === 0 && (res.stdout || res.stderr)) {
      results.cpp.available = true;
      results.cpp.version = (res.stdout || res.stderr).split('\n')[0].trim();
    } else {
      results.cpp.error = 'G++ compiler not found in PATH.';
    }
  } catch (err) {
    results.cpp.error = err.message;
  }

  return results;
}

/**
 * Normalize whitespace and line endings for fair string comparison
 */
function normalizeOutput(str) {
  if (!str) return '';
  return str
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

/**
 * Extract Java Class Name
 */
function extractJavaClassName(sourceCode) {
  const match = sourceCode.match(/public\s+class\s+([A-Za-z0-9_]+)/);
  if (match && match[1]) return match[1];
  const match2 = sourceCode.match(/class\s+([A-Za-z0-9_]+)/);
  if (match2 && match2[1]) return match2[1];
  return 'Main';
}

/**
 * Execute source code in sandboxed ephemeral directory
 * Supports single-run custom input AND multi-case evaluation
 */
async function executeSubmission({ language = 'python', sourceCode = '', testCases = [], input = '' }) {
  const compilers = await detectCompilers();
  const rawLang = String(language || 'python').toLowerCase().trim();

  const langMap = {
    python: 'python',
    py: 'python',
    python3: 'python',
    javascript: 'javascript',
    js: 'javascript',
    node: 'javascript',
    nodejs: 'javascript',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    'c++': 'cpp',
    cplusplus: 'cpp',
  };

  const resolvedLang = langMap[rawLang];
  if (!resolvedLang) {
    return {
      success: false,
      status: 'RUNTIME_ERROR',
      executionStatus: 'RUNTIME_ERROR',
      error: `Unsupported programming language: '${language}'. Supported: Python, JavaScript, Java, C, C++.`,
      errorMessage: `Unsupported programming language: '${language}'.`,
      output: '',
      passedTestCases: 0,
      totalTestCases: testCases.length || 1,
      score: 0,
    };
  }

  if (!compilers[resolvedLang]?.available) {
    return {
      success: false,
      status: 'RUNTIME_ERROR',
      executionStatus: 'RUNTIME_ERROR',
      error: `Runtime unavailable for ${resolvedLang}: ${compilers[resolvedLang]?.error || 'Executable missing'}`,
      errorMessage: `Runtime unavailable for ${resolvedLang}: ${compilers[resolvedLang]?.error || 'Executable missing'}`,
      output: '',
      runtimeMissing: true,
      compilerStatus: compilers[resolvedLang],
      passedTestCases: 0,
      totalTestCases: testCases.length || 1,
      score: 0,
    };
  }

  // Create isolated scratch directory
  const runId = uuidv4();
  const tempDir = path.join(os.tmpdir(), `campuscorp_sandbox_${runId}`);
  fs.mkdirSync(tempDir, { recursive: true });

  let srcFileName;
  let compileCmd = null;
  let executeCmd = null;
  let executeArgs = [];

  switch (resolvedLang) {
    case 'python':
      srcFileName = 'solution.py';
      executeCmd = compilers.python.path;
      executeArgs = [path.join(tempDir, srcFileName)];
      break;

    case 'javascript':
      srcFileName = 'solution.js';
      executeCmd = compilers.javascript.path;
      executeArgs = [path.join(tempDir, srcFileName)];
      break;

    case 'java': {
      const className = extractJavaClassName(sourceCode);
      srcFileName = `${className}.java`;
      compileCmd = {
        cmd: compilers.java.path,
        args: [path.join(tempDir, srcFileName)],
      };
      executeCmd = process.env.COMPILER_JAVA_PATH || 'java';
      executeArgs = ['-cp', tempDir, className];
      break;
    }

    case 'c': {
      srcFileName = 'solution.c';
      const cBinary = path.join(tempDir, 'solution.exe');
      compileCmd = {
        cmd: compilers.c.path,
        args: [path.join(tempDir, srcFileName), '-O2', '-o', cBinary],
      };
      executeCmd = cBinary;
      break;
    }

    case 'cpp': {
      srcFileName = 'solution.cpp';
      const cppBinary = path.join(tempDir, 'solution.exe');
      compileCmd = {
        cmd: compilers.cpp.path,
        args: [path.join(tempDir, srcFileName), '-O2', '-std=c++17', '-o', cppBinary],
      };
      executeCmd = cppBinary;
      break;
    }
  }

  const srcFilePath = path.join(tempDir, srcFileName);
  fs.writeFileSync(srcFilePath, sourceCode || '', 'utf8');

  try {
    // 1. Compilation stage if required
    if (compileCmd) {
      const compileRes = await runCommand(compileCmd.cmd, compileCmd.args, {
        cwd: tempDir,
        timeout: 10000,
      });

      if (compileRes.code !== 0) {
        const compErr = compileRes.stderr || compileRes.stdout || 'Compilation failed.';
        return {
          success: false,
          status: 'COMPILATION_ERROR',
          executionStatus: 'COMPILATION_ERROR',
          error: compErr,
          errorMessage: compErr,
          output: '',
          passedTestCases: 0,
          totalTestCases: testCases.length || 1,
          score: 0,
          testResults: [{ name: 'Compilation', status: 'Failed', detail: compErr }],
          results: [{ passed: false, error: compErr }],
        };
      }
    }

    // 2. Direct Sandbox Mode (no testCases or empty array)
    if (!testCases || testCases.length === 0) {
      const startT = Date.now();
      const runRes = await runCommand(executeCmd, executeArgs, {
        cwd: tempDir,
        input: input || '',
        timeout: RUNTIME_TIMEOUT_MS,
      });
      const execTime = Date.now() - startT;

      if (runRes.timedOut) {
        return {
          success: false,
          status: 'TIME_LIMIT_EXCEEDED',
          executionStatus: 'TIME_LIMIT_EXCEEDED',
          error: `Execution timed out after ${RUNTIME_TIMEOUT_MS}ms. Possible infinite loop.`,
          errorMessage: `Execution timed out after ${RUNTIME_TIMEOUT_MS}ms.`,
          output: runRes.stdout,
          executionTimeMs: execTime,
          passedTestCases: 0,
          totalTestCases: 1,
          score: 0,
        };
      }

      if (runRes.code !== 0) {
        return {
          success: false,
          status: 'RUNTIME_ERROR',
          executionStatus: 'RUNTIME_ERROR',
          error: runRes.stderr || `Process exited with error code ${runRes.code}`,
          errorMessage: runRes.stderr || `Process exited with code ${runRes.code}`,
          output: runRes.stdout,
          executionTimeMs: execTime,
          passedTestCases: 0,
          totalTestCases: 1,
          score: 0,
        };
      }

      return {
        success: true,
        status: 'ACCEPTED',
        executionStatus: 'ACCEPTED',
        output: runRes.stdout || '(Program executed successfully with no output to stdout)',
        error: runRes.stderr || null,
        executionTimeMs: execTime,
        passedTestCases: 1,
        totalTestCases: 1,
        score: 100,
      };
    }

    // 3. Test Cases Evaluation Mode
    let passedCount = 0;
    const testResults = [];
    const results = [];
    let overallStatus = 'ACCEPTED';
    let maxExecTimeMs = 0;
    let accumulatedOutput = '';

    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i];
      const tcInput = tc.input !== undefined ? tc.input : (tc.sample_input || '');
      const tcExpected = tc.output !== undefined ? tc.output : (tc.expected || tc.sample_output || '');
      const startT = Date.now();

      const runRes = await runCommand(executeCmd, executeArgs, {
        cwd: tempDir,
        input: tcInput,
        timeout: RUNTIME_TIMEOUT_MS,
      });

      const execTime = Date.now() - startT;
      if (execTime > maxExecTimeMs) maxExecTimeMs = execTime;
      if (i === 0 || !accumulatedOutput) {
        accumulatedOutput = runRes.stdout || runRes.stderr || '';
      }

      if (runRes.timedOut) {
        overallStatus = 'TIME_LIMIT_EXCEEDED';
        testResults.push({
          testCase: i + 1,
          name: `Test Case ${i + 1}`,
          status: 'TIME_LIMIT_EXCEEDED',
          detail: 'Time Limit Exceeded (> 5000ms)',
          timeMs: execTime,
          isSample: tc.isSample || false,
        });
        results.push({
          passed: false,
          input: tcInput,
          expected: tcExpected,
          actual: '[Timed Out]',
          error: 'Time Limit Exceeded',
        });
        break;
      }

      if (runRes.code !== 0) {
        overallStatus = 'RUNTIME_ERROR';
        const errDetail = runRes.stderr.trim() || `Exit code ${runRes.code}`;
        testResults.push({
          testCase: i + 1,
          name: `Test Case ${i + 1}`,
          status: 'RUNTIME_ERROR',
          error: errDetail,
          detail: errDetail,
          timeMs: execTime,
          isSample: tc.isSample || false,
        });
        results.push({
          passed: false,
          input: tcInput,
          expected: tcExpected,
          actual: runRes.stdout,
          error: errDetail,
        });
        break;
      }

      const normActual = normalizeOutput(runRes.stdout);
      const normExpected = normalizeOutput(tcExpected);
      const passed = normActual === normExpected || (normExpected === '' && runRes.code === 0);

      if (passed) {
        passedCount++;
        testResults.push({
          testCase: i + 1,
          name: `Test Case ${i + 1}`,
          status: 'PASSED',
          actualOutput: tc.isSample ? normActual : '[Hidden]',
          expectedOutput: tc.isSample ? normExpected : '[Hidden]',
          timeMs: execTime,
          isSample: tc.isSample || false,
        });
        results.push({
          passed: true,
          input: tcInput,
          expected: tcExpected,
          actual: runRes.stdout,
          error: null,
        });
      } else {
        if (overallStatus === 'ACCEPTED') overallStatus = 'WRONG_ANSWER';
        testResults.push({
          testCase: i + 1,
          name: `Test Case ${i + 1}`,
          status: 'WRONG_ANSWER',
          actualOutput: tc.isSample ? normActual : '[Hidden]',
          expectedOutput: tc.isSample ? normExpected : '[Hidden]',
          detail: `Expected: ${normExpected}\nGot: ${normActual}`,
          timeMs: execTime,
          isSample: tc.isSample || false,
        });
        results.push({
          passed: false,
          input: tcInput,
          expected: tcExpected,
          actual: runRes.stdout,
          error: `Output mismatch. Expected: "${normExpected}", Got: "${normActual}"`,
        });
      }
    }

    const finalStatus = passedCount === testCases.length ? 'ACCEPTED' : overallStatus;
    const score = testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 100;

    return {
      success: true,
      status: finalStatus,
      executionStatus: finalStatus,
      passedTestCases: passedCount,
      totalTestCases: testCases.length,
      score,
      executionTimeMs: maxExecTimeMs,
      output: accumulatedOutput,
      testResults,
      results,
    };
  } finally {
    // Clean up temporary sandboxed scratch files
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {}
  }
}

module.exports = {
  detectCompilers,
  executeSubmission,
  normalizeOutput,
  extractJavaClassName,
};
