import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import apiClient from '../api/client';
import {
  Terminal,
  Play,
  RotateCcw,
  Copy,
  Download,
  Upload,
  Check,
  Maximize2,
  Minimize2,
  ArrowLeft,
  Sparkles,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  Settings,
  ChevronDown,
  BookOpen,
  X,
  ExternalLink,
  Code2,
  Sun,
  Moon,
  ListOrdered,
  Send,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

// Default starter templates per language
const STARTER_TEMPLATES = {
  python: {
    hello: `# Python 3.10 Execution Environment
def main():
    print("Welcome to CampusCorp Compiler Execution Sandbox!")
    print("Runtime: Python 3.10.11 (Active & Isolated)")

if __name__ == "__main__":
    main()
`,
    twosum: `# Two Sum (Hash Map Solution)
import sys

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], i]
        seen[num] = i
    return []

def main():
    # Example input: target=9, array=[2, 7, 11, 15]
    nums = [2, 7, 11, 15]
    target = 9
    indices = two_sum(nums, target)
    print(f"Target: {target}")
    print(f"Array: {nums}")
    print(f"Indices: {indices}")
    print(f"Values: {[nums[i] for i in indices]}")

if __name__ == "__main__":
    main()
`,
    fibonacci: `# Fibonacci with Dynamic Programming (Memoization)
def fib(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib(n - 1, memo) + fib(n - 2, memo)
    return memo[n]

for i in range(12):
    print(f"F({i:02d}) = {fib(i)}")
`,
    stdin: `# Standard Input Processing
import sys

def main():
    input_data = sys.stdin.read().strip()
    if not input_data:
        print("No stdin provided. Provide custom input in the 'Custom Input' tab.")
        return
    
    print(f"Read {len(input_data)} bytes from stdin:")
    lines = input_data.splitlines()
    for idx, line in enumerate(lines, 1):
        print(f"Line {idx}: {line}")

if __name__ == "__main__":
    main()
`,
  },
  javascript: {
    hello: `// JavaScript (Node.js v22) Execution Sandbox
function main() {
    console.log("Welcome to CampusCorp Compiler Execution Sandbox!");
    console.log("Runtime: Node.js " + process.version + " (High-Speed V8)");
}

main();
`,
    twosum: `// Two Sum Algorithm (Node.js)
function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

const nums = [2, 7, 11, 15];
const target = 9;
const result = twoSum(nums, target);
console.log("Target:", target);
console.log("Array:", nums);
console.log("Solution Indices:", result);
`,
    fibonacci: `// Fibonacci DP Iterative with O(1) space
function fibonacci(n) {
    if (n <= 1) return n;
    let prev = 0, curr = 1;
    for (let i = 2; i <= n; i++) {
        const next = prev + curr;
        prev = curr;
        curr = next;
    }
    return curr;
}

for (let i = 0; i <= 15; i++) {
    console.log(\`Fibonacci(\${i}) = \${fibonacci(i)}\`);
}
`,
    stdin: `// Reading from process.stdin (Node.js)
const fs = require('fs');

try {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) {
        console.log("No stdin input found. Enter input in the 'Custom Input' tab.");
    } else {
        console.log("Received stdin input:");
        console.log(input);
    }
} catch (err) {
    console.error("Error reading stdin:", err.message);
}
`,
  },
  java: {
    hello: `// Java 21 OpenJDK Solution
public class Solution {
    public static void main(String[] args) {
        System.out.println("Welcome to CampusCorp Compiler Execution Sandbox!");
        System.out.println("Runtime: Java 21 LTS (OpenJDK)");
    }
}
`,
    twosum: `import java.util.*;

public class Solution {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[] nums = { 2, 7, 11, 15 };
        int target = 9;
        int[] result = twoSum(nums, target);
        System.out.println("Target: " + target);
        System.out.println("Result: [" + result[0] + ", " + result[1] + "]");
    }
}
`,
    fibonacci: `public class Solution {
    public static long fib(int n) {
        if (n <= 1) return n;
        long a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            long temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }

    public static void main(String[] args) {
        for (int i = 0; i <= 15; i++) {
            System.out.println("Fib(" + i + ") = " + fib(i));
        }
    }
}
`,
    stdin: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("--- Reading Scanner tokens from stdin ---");
        int count = 0;
        while (sc.hasNextLine()) {
            String line = sc.nextLine();
            count++;
            System.out.println("Token " + count + ": " + line);
        }
        if (count == 0) {
            System.out.println("No input lines supplied in Custom Input tab.");
        }
        sc.close();
    }
}
`,
  },
  c: {
    hello: `// C Language (GCC) Sandbox
#include <stdio.h>

int main() {
    printf("Welcome to CampusCorp Compiler Execution Sandbox!\\n");
    printf("Language: C (GCC 11+)\\n");
    return 0;
}
`,
    twosum: `#include <stdio.h>

int main() {
    int nums[] = {2, 7, 11, 15};
    int target = 9;
    int size = sizeof(nums) / sizeof(nums[0]);
    
    printf("Target: %d\\n", target);
    for (int i = 0; i < size; i++) {
        for (int j = i + 1; j < size; j++) {
            if (nums[i] + nums[j] == target) {
                printf("Found indices: [%d, %d]\\n", i, j);
                printf("Values: %d + %d = %d\\n", nums[i], nums[j], target);
                return 0;
            }
        }
    }
    printf("No matching pair found.\\n");
    return 0;
}
`,
    fibonacci: `#include <stdio.h>

int main() {
    long long a = 0, b = 1;
    printf("Fib(0) = 0\\nFib(1) = 1\\n");
    for (int i = 2; i <= 15; i++) {
        long long c = a + b;
        printf("Fib(%d) = %lld\\n", i, c);
        a = b;
        b = c;
    }
    return 0;
}
`,
    stdin: `#include <stdio.h>

int main() {
    char buffer[256];
    printf("Reading from standard input:\\n");
    if (fgets(buffer, sizeof(buffer), stdin)) {
        printf("Input received: %s\\n", buffer);
    } else {
        printf("No standard input provided.\\n");
    }
    return 0;
}
`,
  },
  cpp: {
    hello: `// C++17 (G++) Sandbox
#include <iostream>
#include <vector>

int main() {
    std::cout << "Welcome to CampusCorp Compiler Execution Sandbox!" << std::endl;
    std::cout << "Language: C++ (Standard 17, G++)" << std::endl;
    return 0;
}
`,
    twosum: `#include <iostream>
#include <vector>
#include <unordered_map>

std::vector<int> twoSum(const std::vector<int>& nums, int target) {
    std::unordered_map<int, int> map;
    for (int i = 0; i < nums.size(); ++i) {
        int comp = target - nums[i];
        if (map.count(comp)) {
            return {map[comp], i};
        }
        map[nums[i]] = i;
    }
    return {};
}

int main() {
    std::vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    auto res = twoSum(nums, target);
    if (!res.empty()) {
        std::cout << "Indices: [" << res[0] << ", " << res[1] << "]" << std::endl;
    }
    return 0;
}
`,
    fibonacci: `#include <iostream>
#include <vector>

int main() {
    std::vector<long long> fib = {0, 1};
    for (int i = 2; i <= 15; ++i) {
        fib.push_back(fib[i - 1] + fib[i - 2]);
    }
    for (size_t i = 0; i < fib.size(); ++i) {
        std::cout << "Fib(" << i << ") = " << fib[i] << std::endl;
    }
    return 0;
}
`,
    stdin: `#include <iostream>
#include <string>

int main() {
    std::string line;
    std::cout << "--- C++ Stdin Reader ---" << std::endl;
    while (std::getline(std::cin, line)) {
        std::cout << "Echo: " << line << std::endl;
    }
    return 0;
}
`,
  },
};

// Practice Challenges
const PRACTICE_CHALLENGES = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Table'],
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    sampleInput: 'nums = [2, 7, 11, 15], target = 9',
    sampleOutput: '[0, 1]',
    templateKey: 'twosum',
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Sequence',
    difficulty: 'Easy',
    tags: ['Dynamic Programming', 'Math'],
    description: 'Compute the n-th Fibonacci number using dynamic programming or memoization.',
    sampleInput: 'n = 10',
    sampleOutput: '55',
    templateKey: 'fibonacci',
  },
  {
    id: 'stdin-echo',
    title: 'Standard Input Processing',
    difficulty: 'Easy',
    tags: ['I/O', 'Strings'],
    description: 'Read dynamic input lines from stdin and process each token cleanly.',
    sampleInput: 'CampusCorp Sandbox 2026',
    sampleOutput: 'Line 1: CampusCorp Sandbox 2026',
    templateKey: 'stdin',
  },
];

export function CompilerSandbox() {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { showToast } = useToast();

  // Language & Code State
  const [language, setLanguage] = useState('python');
  const [template, setTemplate] = useState('hello');
  const [code, setCode] = useState(STARTER_TEMPLATES.python.hello);
  const [stdinInput, setStdinInput] = useState('');
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'input' | 'testcases'

  // Execution Output State
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [executionTime, setExecutionTime] = useState(null);

  // Editor Preferences
  const [editorTheme, setEditorTheme] = useState('dark'); // 'dark' | 'light'
  const [fontSize, setFontSize] = useState(14); // 12 | 14 | 16
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Challenges Drawer
  const [showChallenges, setShowChallenges] = useState(false);

  // Live Compiler Runtime Status
  const [compilerStatus, setCompilerStatus] = useState({
    python: { available: true, version: 'Python 3.10' },
    javascript: { available: true, version: 'Node.js v22' },
    java: { available: true, version: 'Java 21 LTS' },
    c: { available: false, version: null },
    cpp: { available: false, version: null },
  });

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Fetch Host Compiler Runtime Status on mount
  useEffect(() => {
    async function fetchRuntime() {
      try {
        const res = await apiClient.get('/assessment/runtime-status');
        if (res.data?.success && res.data.compilers) {
          setCompilerStatus(res.data.compilers);
        }
      } catch (err) {
        console.warn('Could not fetch runtime status:', err.message);
      }
    }
    fetchRuntime();
  }, []);

  // Handle Language Change
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const newCode = STARTER_TEMPLATES[newLang]?.[template] || STARTER_TEMPLATES[newLang]?.hello || '';
    setCode(newCode);
    setExecutionResult(null);
  };

  // Handle Template Change
  const handleTemplateChange = (newTemplate) => {
    setTemplate(newTemplate);
    const newCode = STARTER_TEMPLATES[language]?.[newTemplate] || STARTER_TEMPLATES[language]?.hello || '';
    setCode(newCode);
    setExecutionResult(null);
  };

  // Keyboard shortcut listener: Ctrl+Enter (Run Code) & Ctrl+S (Download)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleDownloadCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, stdinInput]);

  // Handle Tab indentation in Textarea
  const handleKeyDownTextarea = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const spaces = '    '; // 4 spaces
      const newCode = code.substring(0, start) + spaces + code.substring(end);
      setCode(newCode);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  // Run Code via backend execution endpoint
  const handleRunCode = async () => {
    if (!code.trim()) {
      showToast('Source code cannot be empty.', 'error');
      return;
    }

    setExecuting(true);
    setActiveTab('output');
    setExecutionResult(null);
    const startTimestamp = Date.now();

    try {
      const payload = {
        language,
        code,
        input: stdinInput,
      };

      const res = await apiClient.post('/compiler/run', payload);
      const latency = res.data?.executionTimeMs || (Date.now() - startTimestamp);
      setExecutionTime(latency);
      setExecutionResult(res.data);

      if (res.data?.success) {
        showToast(`Execution finished in ${latency}ms`, 'success');
      } else {
        showToast(res.data?.errorMessage || 'Code executed with errors.', 'error');
      }
    } catch (err) {
      const latency = Date.now() - startTimestamp;
      setExecutionTime(latency);
      const errMsg = err.response?.data?.errorMessage || err.response?.data?.error || err.message || 'Execution failed.';
      setExecutionResult({
        success: false,
        status: 'RUNTIME_ERROR',
        error: errMsg,
        errorMessage: errMsg,
        output: '',
      });
      showToast('Execution error: ' + errMsg, 'error');
    } finally {
      setExecuting(false);
    }
  };

  // Copy Code to Clipboard
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(true);
      showToast('Source code copied to clipboard!', 'success');
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      showToast('Could not copy code.', 'error');
    }
  };

  // Copy Output to Clipboard
  const handleCopyOutput = async () => {
    const text = executionResult?.output || executionResult?.error || '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedOutput(true);
      showToast('Console output copied to clipboard!', 'success');
      setTimeout(() => setCopiedOutput(false), 2500);
    } catch (e) {
      showToast('Could not copy output.', 'error');
    }
  };

  // Download Code as File
  const handleDownloadCode = () => {
    const extMap = { python: 'py', javascript: 'js', java: 'java', c: 'c', cpp: 'cpp' };
    const ext = extMap[language] || 'txt';
    const filename = language === 'java' ? 'Solution.java' : `solution.${ext}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`, 'success');
  };

  // Upload Code from Disk
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        setCode(content);
        showToast(`Loaded ${file.name} (${content.length} characters)`, 'success');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to default template
  const handleResetCode = () => {
    if (window.confirm('Reset code to the default starter template? Current unsaved edits will be cleared.')) {
      const freshCode = STARTER_TEMPLATES[language]?.[template] || STARTER_TEMPLATES[language]?.hello || '';
      setCode(freshCode);
      setExecutionResult(null);
      showToast('Code reset to default starter template.', 'info');
    }
  };

  // Load a practice challenge
  const handleLoadChallenge = (challenge) => {
    setTemplate(challenge.templateKey);
    const challengeCode = STARTER_TEMPLATES[language]?.[challenge.templateKey] || STARTER_TEMPLATES[language]?.hello || '';
    setCode(challengeCode);
    setShowChallenges(false);
    showToast(`Loaded "${challenge.title}" challenge into editor`, 'success');
  };

  const lineCount = code.split('\n').length;
  const charCount = code.length;

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-background overflow-y-auto' : ''}`}>
      {/* Top Breadcrumb & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            to="/assessment"
            className="p-2 rounded-xl bg-card border border-border text-foreground hover:bg-secondary transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Assessments</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
                <Terminal className="w-4 h-4" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Compiler Execution Sandbox
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Live Runner
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Isolated multi-language programming sandbox with real-time compilation, standard input, and diagnostics.
            </p>
          </div>
        </div>

        {/* Header Action Tools */}
        <div className="flex items-center gap-2">
          {/* Practice Challenges Trigger */}
          <button
            type="button"
            onClick={() => setShowChallenges(!showChallenges)}
            className="px-3 py-1.5 rounded-xl border border-border bg-card text-foreground hover:bg-secondary text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>Challenges ({PRACTICE_CHALLENGES.length})</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="p-2 rounded-xl border border-border bg-card text-foreground hover:bg-secondary transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Compiler Host Availability Badges */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-muted-foreground bg-card/60 p-2.5 rounded-xl border border-border">
        <span className="flex items-center gap-1 text-foreground font-bold">
          <Cpu className="w-3.5 h-3.5 text-primary" /> Host Compilers:
        </span>
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          ● Python 3.10 (Ready)
        </span>
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          ● Node.js v22 (Ready)
        </span>
        <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          ● Java 21 LTS (Ready)
        </span>
        <span className={`px-2 py-0.5 rounded-md border ${compilerStatus.c?.available ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
          {compilerStatus.c?.available ? '● GCC C (Ready)' : '○ GCC C (Host PATH pending)'}
        </span>
        <span className={`px-2 py-0.5 rounded-md border ${compilerStatus.cpp?.available ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
          {compilerStatus.cpp?.available ? '● G++ C++ (Ready)' : '○ G++ C++ (Host PATH pending)'}
        </span>
      </div>

      {/* Main Sandbox Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Code Editor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          {/* Editor Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-card border border-border">
            {/* Language & Template Pickers */}
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-lg border border-border text-xs font-bold bg-secondary text-foreground focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="python">🐍 Python 3.10</option>
                  <option value="javascript">⚡ JavaScript (Node.js)</option>
                  <option value="java">☕ Java 21 (OpenJDK)</option>
                  <option value="c">⚙️ C (GCC 11)</option>
                  <option value="cpp">🚀 C++17 (G++)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none text-muted-foreground" />
              </div>

              {/* Template Picker */}
              <div className="relative hidden sm:block">
                <select
                  value={template}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="h-9 pl-3 pr-8 rounded-lg border border-border text-xs font-semibold bg-secondary text-foreground focus:outline-none cursor-pointer appearance-none"
                >
                  <option value="hello">Template: Hello World</option>
                  <option value="twosum">Template: Two Sum</option>
                  <option value="fibonacci">Template: Fibonacci DP</option>
                  <option value="stdin">Template: Stdin Reader</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-3 pointer-events-none text-muted-foreground" />
              </div>
            </div>

            {/* Editor Settings & Tool Buttons */}
            <div className="flex items-center gap-1.5">
              {/* Font Size Selector */}
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                title="Font Size"
                className="h-8 px-2 rounded-lg border border-border text-[11px] font-bold bg-secondary text-foreground focus:outline-none cursor-pointer"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
              </select>

              {/* Editor Theme Toggle */}
              <button
                type="button"
                onClick={() => setEditorTheme(editorTheme === 'dark' ? 'light' : 'dark')}
                title={`Switch to ${editorTheme === 'dark' ? 'Light' : 'Dark'} Editor Theme`}
                className="p-2 rounded-lg border border-border bg-secondary text-foreground hover:opacity-80 transition cursor-pointer"
              >
                {editorTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              </button>

              {/* Copy Code */}
              <button
                type="button"
                onClick={handleCopyCode}
                title="Copy Source Code"
                className="p-2 rounded-lg border border-border bg-secondary text-foreground hover:opacity-80 transition cursor-pointer"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              {/* Download Code */}
              <button
                type="button"
                onClick={handleDownloadCode}
                title="Download Source Code (Ctrl+S)"
                className="p-2 rounded-lg border border-border bg-secondary text-foreground hover:opacity-80 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>

              {/* Upload Code */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Open Source Code from Disk"
                className="p-2 rounded-lg border border-border bg-secondary text-foreground hover:opacity-80 transition cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".py,.js,.java,.c,.cpp,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* Reset Code */}
              <button
                type="button"
                onClick={handleResetCode}
                title="Reset to Template"
                className="p-2 rounded-lg border border-border bg-secondary text-foreground hover:opacity-80 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Code Editor Box */}
          <div
            className={`rounded-2xl border overflow-hidden flex flex-col transition-colors shadow-sm ${
              editorTheme === 'dark'
                ? 'bg-[#0f172a] border-slate-800 text-slate-100'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            {/* Editor Window Bar */}
            <div
              className={`px-3.5 py-2 flex items-center justify-between border-b text-[11px] font-mono select-none ${
                editorTheme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800 text-slate-400'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                </div>
                <span className="font-bold text-foreground">
                  {language === 'java' ? 'Solution.java' : `solution.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : 'c'}`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span>UTF-8</span>
                <span>{lineCount} lines</span>
                <span>{charCount} chars</span>
              </div>
            </div>

            {/* Code Textarea with Line Numbers Container */}
            <div className="relative flex-1 min-h-[460px] flex">
              {/* Line Numbers Gutter */}
              <div
                className={`py-3.5 px-2.5 select-none text-right font-mono text-xs border-r leading-relaxed ${
                  editorTheme === 'dark'
                    ? 'bg-slate-950/60 border-slate-800/80 text-slate-600'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
                style={{ width: `${Math.max(3, String(lineCount).length + 1)}em` }}
              >
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Main Textarea */}
              <textarea
                ref={textareaRef}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDownTextarea}
                spellCheck="false"
                style={{ fontSize: `${fontSize}px` }}
                className={`w-full p-3.5 font-mono leading-relaxed focus:outline-none resize-none flex-1 bg-transparent ${
                  editorTheme === 'dark'
                    ? 'text-slate-100 selection:bg-emerald-800/60 selection:text-white'
                    : 'text-slate-900 selection:bg-emerald-200 selection:text-slate-900'
                }`}
                placeholder={`Write or paste your ${language} code here...`}
              />
            </div>
          </div>

          {/* Bottom Run Action Button & Shortcuts Hint */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5 font-mono">
              <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-bold">Ctrl</span> +
              <span className="px-1.5 py-0.5 rounded bg-secondary text-foreground font-bold">Enter</span> to Run Code
            </span>

            <button
              type="button"
              onClick={handleRunCode}
              disabled={executing}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-95 disabled:opacity-60 hover:opacity-90 cursor-pointer"
            >
              {executing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compiling & Executing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Execute in Sandbox</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Console, Stdin & Results (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-2">
          {/* Console Tab Navigation */}
          <div className="flex items-center justify-between p-1.5 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('output')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'output'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Output Console</span>
                {executionResult && (
                  <span className={`w-2 h-2 rounded-full ${executionResult.success ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('input')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'input'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Custom Stdin</span>
                {stdinInput.trim() && (
                  <span className="w-2 h-2 rounded-full bg-primary" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('testcases')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'testcases'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>Test Cases</span>
              </button>
            </div>

            {/* Clear Console Trigger */}
            {activeTab === 'output' && executionResult && (
              <button
                type="button"
                onClick={() => setExecutionResult(null)}
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground px-2 py-1 rounded transition"
              >
                Clear
              </button>
            )}
            {activeTab === 'input' && stdinInput && (
              <button
                type="button"
                onClick={() => setStdinInput('')}
                className="text-[11px] font-bold text-muted-foreground hover:text-foreground px-2 py-1 rounded transition"
              >
                Clear
              </button>
            )}
          </div>

          {/* Tab 1: Terminal Output Box */}
          {activeTab === 'output' && (
            <div className="flex-1 min-h-[460px] rounded-2xl bg-[#090d16] border border-slate-800 text-slate-100 flex flex-col overflow-hidden shadow-sm">
              {/* Terminal Title Bar with Status */}
              <div className="px-3.5 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                    Terminal Output
                  </span>
                  {executing ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Executing
                    </span>
                  ) : executionResult ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        executionResult.success
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      }`}
                    >
                      {executionResult.status || (executionResult.success ? 'ACCEPTED' : 'RUNTIME_ERROR')}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      IDLE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {executionTime !== null && (
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {executionTime}ms
                    </span>
                  )}
                  {executionResult && (
                    <button
                      type="button"
                      onClick={handleCopyOutput}
                      title="Copy Console Output"
                      className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
                    >
                      {copiedOutput ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Terminal Output Body */}
              <div className="p-4 flex-1 overflow-y-auto font-mono text-xs leading-relaxed space-y-2 select-text">
                {executing ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                    <p className="text-xs">Compiling & Running solution on backend sandbox...</p>
                  </div>
                ) : !executionResult ? (
                  <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-center space-y-2">
                    <Terminal className="w-8 h-8 opacity-40" />
                    <p className="text-xs">Ready for execution. Click "Execute in Sandbox" or press Ctrl+Enter.</p>
                  </div>
                ) : (
                  <>
                    {/* Standard Output (stdout) */}
                    {executionResult.output && (
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                          Standard Output (stdout):
                        </span>
                        <pre className="whitespace-pre-wrap text-emerald-300 font-mono text-xs">
                          {executionResult.output}
                        </pre>
                      </div>
                    )}

                    {/* Standard Error (stderr) */}
                    {executionResult.error && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                          Standard Error (stderr / Traceback):
                        </span>
                        <pre className="whitespace-pre-wrap text-rose-300 font-mono text-xs bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/40">
                          {executionResult.error}
                        </pre>
                      </div>
                    )}

                    {/* Fallback empty message */}
                    {!executionResult.output && !executionResult.error && (
                      <div className="text-slate-400 italic">
                        Process executed with return code {executionResult.status || '0'}, no console output.
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Custom Stdin Input */}
          {activeTab === 'input' && (
            <div className="flex-1 min-h-[460px] rounded-2xl bg-card border border-border p-4 flex flex-col space-y-3 shadow-sm">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">
                  Standard Input (stdin)
                </label>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Provide text or newline-separated values that your program reads via <code className="text-primary font-mono font-bold">input()</code> (Python), <code className="text-primary font-mono font-bold">Scanner</code> (Java), or <code className="text-primary font-mono font-bold">fs.readFileSync(0)</code> (JavaScript).
                </p>
              </div>

              {/* Quick Input Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[11px] font-bold text-muted-foreground">Quick Presets:</span>
                <button
                  type="button"
                  onClick={() => setStdinInput('9\n4\n2 7 11 15')}
                  className="px-2 py-1 rounded bg-secondary text-foreground text-[11px] font-mono hover:opacity-80 transition"
                >
                  Target & Array
                </button>
                <button
                  type="button"
                  onClick={() => setStdinInput('CampusCorp 2026 Sandbox Test')}
                  className="px-2 py-1 rounded bg-secondary text-foreground text-[11px] font-mono hover:opacity-80 transition"
                >
                  String Token
                </button>
                <button
                  type="button"
                  onClick={() => setStdinInput('10\n20\n30\n40\n50')}
                  className="px-2 py-1 rounded bg-secondary text-foreground text-[11px] font-mono hover:opacity-80 transition"
                >
                  5 Lines
                </button>
              </div>

              {/* Stdin Textarea */}
              <textarea
                value={stdinInput}
                onChange={(e) => setStdinInput(e.target.value)}
                placeholder="Enter standard input here... (e.g. 5, then newline, then array)"
                className="flex-1 w-full p-3 font-mono text-xs rounded-xl border border-border bg-secondary text-foreground focus:outline-none resize-none leading-relaxed min-h-[280px]"
              />

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span>{stdinInput.length} bytes prepared</span>
                <button
                  type="button"
                  onClick={handleRunCode}
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold flex items-center gap-1.5 text-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run With This Input</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Test Cases Evaluation */}
          {activeTab === 'testcases' && (
            <div className="flex-1 min-h-[460px] rounded-2xl bg-card border border-border p-4 flex flex-col space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-foreground">Interactive Test Cases</h3>
                  <p className="text-[11px] text-muted-foreground">Validate your algorithm against standard inputs.</p>
                </div>
                <button
                  type="button"
                  onClick={handleRunCode}
                  className="px-3 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Run Current Case</span>
                </button>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                <div className="p-3 rounded-xl border border-border bg-secondary/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Test Case 1 (Standard)</span>
                    <span className="text-emerald-500 font-mono text-[11px]">Default Target</span>
                  </div>
                  <div className="text-[11px] font-mono space-y-1 text-muted-foreground">
                    <div><strong>Input:</strong> nums = [2, 7, 11, 15], target = 9</div>
                    <div><strong>Expected:</strong> [0, 1]</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-secondary/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Test Case 2 (Edge Case)</span>
                    <span className="text-muted-foreground font-mono text-[11px]">Duplicates</span>
                  </div>
                  <div className="text-[11px] font-mono space-y-1 text-muted-foreground">
                    <div><strong>Input:</strong> nums = [3, 3], target = 6</div>
                    <div><strong>Expected:</strong> [0, 1]</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-border bg-secondary/60 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Test Case 3 (Zero Values)</span>
                    <span className="text-muted-foreground font-mono text-[11px]">Negative Integers</span>
                  </div>
                  <div className="text-[11px] font-mono space-y-1 text-muted-foreground">
                    <div><strong>Input:</strong> nums = [-3, 4, 3, 90], target = 0</div>
                    <div><strong>Expected:</strong> [0, 2]</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Practice Challenges Slide-out / Bottom Drawer */}
      {showChallenges && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-card border-l border-border h-full p-5 overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-base font-bold text-foreground">Practice Coding Challenges</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowChallenges(false)}
                className="p-1 rounded-lg hover:bg-secondary text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Select any classic interview challenge to load its problem description and working starter template directly into your editor.
            </p>

            <div className="space-y-3">
              {PRACTICE_CHALLENGES.map((challenge) => (
                <div
                  key={challenge.id}
                  className="p-3.5 rounded-xl border border-border bg-secondary/40 hover:bg-secondary transition flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{challenge.title}</h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {challenge.difficulty}
                        </span>
                        {challenge.tags.map((t) => (
                          <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-card text-muted-foreground border border-border">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {challenge.description}
                  </p>

                  <div className="text-[11px] font-mono bg-card p-2 rounded-lg border border-border text-muted-foreground">
                    <div><strong>Input:</strong> {challenge.sampleInput}</div>
                    <div><strong>Output:</strong> {challenge.sampleOutput}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleLoadChallenge(challenge)}
                    className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <span>Load Challenge into Editor</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

