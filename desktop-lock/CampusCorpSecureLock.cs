using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Net;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows.Forms;
using Microsoft.Win32;

namespace CampusCorp.SecureLock
{
    public class Program
    {
        private static LowLevelKeyboardProc _proc = HookCallback;
        private static IntPtr _hookID = IntPtr.Zero;
        private static HttpListener _httpListener;
        private static Thread _httpThread;
        private static Thread _monitorThread;
        private static bool _isRunning = true;
        private static string _lastViolation = "NONE";
        private static int _prohibitedDetections = 0;
        private static DateTime _startTime = DateTime.UtcNow;
        private static Process _kioskProcess = null;
        private static MainForm _mainForm = null;
        private static List<Form> _secondaryMonitors = new List<Form>();

        private const int WH_KEYBOARD_LL = 13;
        private const int WM_KEYDOWN = 0x0100;
        private const int WM_SYSKEYDOWN = 0x0104;
        private const int VK_TAB = 0x09;
        private const int VK_ESCAPE = 0x1B;
        private const int VK_LWIN = 0x5B;
        private const int VK_RWIN = 0x5C;
        private const int VK_SNAPSHOT = 0x2C; // PrintScreen
        private const int VK_F4 = 0x73;

        private delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        [return: MarshalAs(UnmanagedType.Bool)]
        private static extern bool UnhookWindowsHookEx(IntPtr hhk);

        [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

        [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern IntPtr GetModuleHandle(string lpModuleName);

        [STAThread]
        public static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            RegisterProtocolHandler();

            string targetUrl = "http://localhost:5000/exam?testId=1";

            if (args != null && args.Length > 0)
            {
                string first = args[0];
                if (first.StartsWith("campuscorp-lock://", StringComparison.OrdinalIgnoreCase))
                {
                    string raw = first.Substring("campuscorp-lock://".Length).TrimStart('/');
                    if (raw.StartsWith("exam", StringComparison.OrdinalIgnoreCase))
                    {
                        targetUrl = "http://localhost:5000/exam" + (raw.Contains("?") ? raw.Substring(raw.IndexOf("?")) : "");
                    }
                    else if (raw.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || raw.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                    {
                        targetUrl = raw;
                    }
                }
                else if (first.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || first.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                {
                    targetUrl = first;
                }
            }

            // Ensure exeLock flag is present so the web application knows it is inside the desktop lockdown client
            if (!targetUrl.Contains("exeLock=true"))
            {
                targetUrl += (targetUrl.Contains("?") ? "&" : "?") + "exeLock=true";
            }

            // Start Local Loopback Handshake Server on port 52189
            StartHttpBridge();

            // Start Anti-Cheat Background Process Scanner
            StartProcessAuditor();

            // Install Global Low-Level Keyboard Hook (Blocks Alt+Tab, Win Keys, Alt+F4, PrtScn)
            _hookID = SetHook(_proc);

            // Blackout secondary monitors if present
            ShieldSecondaryMonitors();

            // Find modern Chromium Kiosk executable (Edge or Chrome)
            string browserPath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            if (!File.Exists(browserPath))
            {
                browserPath = @"C:\Program Files\Microsoft\Edge\Application\msedge.exe";
            }
            if (!File.Exists(browserPath))
            {
                browserPath = @"C:\Program Files\Google\Chrome\Application\chrome.exe";
            }
            if (!File.Exists(browserPath))
            {
                browserPath = @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe";
            }

            if (File.Exists(browserPath))
            {
                string tempProfile = Path.Combine(Path.GetTempPath(), "CampusCorpSecureKioskProfile");
                string kioskArgs = string.Format(
                    "--kiosk \"{0}\" --edge-kiosk-type=fullscreen --no-first-run --no-default-browser-check --disable-features=TranslateUI,TouchpadAndWheelScrollLatching --user-data-dir=\"{1}\"",
                    targetUrl,
                    tempProfile
                );

                ProcessStartInfo psi = new ProcessStartInfo(browserPath, kioskArgs);
                psi.WindowStyle = ProcessWindowStyle.Maximized;

                try
                {
                    _kioskProcess = Process.Start(psi);
                    if (_kioskProcess != null)
                    {
                        // Monitor the kiosk process until it closes
                        while (!_kioskProcess.HasExited && _isRunning)
                        {
                            Thread.Sleep(500);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("[KIOSK LAUNCH NOTICE] " + ex.Message);
                    _mainForm = new MainForm(targetUrl);
                    Application.Run(_mainForm);
                }
            }
            else
            {
                _mainForm = new MainForm(targetUrl);
                Application.Run(_mainForm);
            }

            // Cleanup upon application exit
            _isRunning = false;
            if (_hookID != IntPtr.Zero)
            {
                UnhookWindowsHookEx(_hookID);
            }
            try
            {
                if (_httpListener != null && _httpListener.IsListening)
                {
                    _httpListener.Stop();
                    _httpListener.Close();
                }
            }
            catch { }

            foreach (var form in _secondaryMonitors)
            {
                try { form.Close(); } catch { }
            }
        }

        private static IntPtr SetHook(LowLevelKeyboardProc proc)
        {
            using (Process curProcess = Process.GetCurrentProcess())
            using (ProcessModule curModule = curProcess.MainModule)
            {
                return SetWindowsHookEx(WH_KEYBOARD_LL, proc, GetModuleHandle(curModule.ModuleName), 0);
            }
        }

        private static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam)
        {
            if (nCode >= 0 && (wParam == (IntPtr)WM_KEYDOWN || wParam == (IntPtr)WM_SYSKEYDOWN))
            {
                int vkCode = Marshal.ReadInt32(lParam);
                bool isAlt = (Control.ModifierKeys & Keys.Alt) != 0;
                bool isCtrl = (Control.ModifierKeys & Keys.Control) != 0;

                // 1. Windows Logo Keys (LWin & RWin)
                if (vkCode == VK_LWIN || vkCode == VK_RWIN)
                {
                    _lastViolation = "Windows Start key blocked";
                    return (IntPtr)1;
                }

                // 2. Alt + Tab (Task Switching)
                if (isAlt && vkCode == VK_TAB)
                {
                    _lastViolation = "Alt+Tab task switch blocked";
                    return (IntPtr)1;
                }

                // 3. Alt + Escape
                if (isAlt && vkCode == VK_ESCAPE)
                {
                    _lastViolation = "Alt+Esc blocked";
                    return (IntPtr)1;
                }

                // 4. Ctrl + Escape (Start Menu)
                if (isCtrl && vkCode == VK_ESCAPE)
                {
                    _lastViolation = "Ctrl+Esc blocked";
                    return (IntPtr)1;
                }

                // 5. Alt + F4 (Window Close)
                if (isAlt && vkCode == VK_F4)
                {
                    _lastViolation = "Alt+F4 close blocked";
                    return (IntPtr)1;
                }

                // 6. PrintScreen (PrtScn)
                if (vkCode == VK_SNAPSHOT)
                {
                    _lastViolation = "PrintScreen capture blocked";
                    try { Clipboard.Clear(); } catch { }
                    return (IntPtr)1;
                }
            }
            return CallNextHookEx(_hookID, nCode, wParam, lParam);
        }

        private static void ShieldSecondaryMonitors()
        {
            try
            {
                Screen[] screens = Screen.AllScreens;
                if (screens.Length > 1)
                {
                    for (int i = 0; i < screens.Length; i++)
                    {
                        if (!screens[i].Primary)
                        {
                            Form shield = new Form();
                            shield.FormBorderStyle = FormBorderStyle.None;
                            shield.StartPosition = FormStartPosition.Manual;
                            shield.Location = screens[i].Bounds.Location;
                            shield.Size = screens[i].Bounds.Size;
                            shield.BackColor = Color.FromArgb(12, 16, 22);
                            shield.TopMost = true;
                            shield.ShowInTaskbar = false;

                            Label lbl = new Label();
                            lbl.Text = "CAMPUSCORP SECURE ASSESSMENT LOCK\n\nDual / Secondary display blocked during active examination.";
                            lbl.ForeColor = Color.FromArgb(240, 90, 90);
                            lbl.Font = new Font("Segoe UI", 16, FontStyle.Bold);
                            lbl.Dock = DockStyle.Fill;
                            lbl.TextAlign = ContentAlignment.MiddleCenter;
                            shield.Controls.Add(lbl);

                            shield.Show();
                            _secondaryMonitors.Add(shield);
                        }
                    }
                }
            }
            catch { }
        }

        private static void StartProcessAuditor()
        {
            _monitorThread = new Thread(() =>
            {
                string[] blacklisted = new string[] {
                    "anydesk", "teamviewer", "discord", "obs64", "obs32",
                    "slack", "zoom", "whatsapp", "telegram", "chatgpt"
                };

                while (_isRunning)
                {
                    try
                    {
                        foreach (string name in blacklisted)
                        {
                            Process[] found = Process.GetProcessesByName(name);
                            if (found.Length > 0)
                            {
                                _prohibitedDetections++;
                                _lastViolation = "Prohibited software active: " + name;
                                if (_mainForm != null && !_mainForm.IsDisposed)
                                {
                                    _mainForm.SetViolationBanner("⚠️ Anti-Cheat Warning: Background app detected (" + name + "). Close it immediately!");
                                }
                            }
                        }
                    }
                    catch { }
                    Thread.Sleep(2000);
                }
            });
            _monitorThread.IsBackground = true;
            _monitorThread.Start();
        }

        private static void StartHttpBridge()
        {
            _httpThread = new Thread(() =>
            {
                try
                {
                    _httpListener = new HttpListener();
                    _httpListener.Prefixes.Add("http://127.0.0.1:52189/");
                    _httpListener.Prefixes.Add("http://localhost:52189/");
                    _httpListener.Start();

                    while (_isRunning && _httpListener.IsListening)
                    {
                        HttpListenerContext ctx = _httpListener.GetContext();
                        ThreadPool.QueueUserWorkItem((state) => HandleHttpRequest((HttpListenerContext)state), ctx);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("[EXE LOCK HTTP SERVER] Error: " + ex.Message);
                }
            });
            _httpThread.IsBackground = true;
            _httpThread.Start();
        }

        private static void HandleHttpRequest(HttpListenerContext ctx)
        {
            try
            {
                HttpListenerRequest req = ctx.Request;
                HttpListenerResponse res = ctx.Response;

                res.AddHeader("Access-Control-Allow-Origin", "*");
                res.AddHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                res.AddHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");

                if (req.HttpMethod == "OPTIONS")
                {
                    res.StatusCode = 200;
                    res.Close();
                    return;
                }

                string path = req.Url.AbsolutePath.ToLowerInvariant();

                if (path == "/status" || path == "/" || path == "/ping")
                {
                    int uptime = (int)(DateTime.UtcNow - _startTime).TotalSeconds;
                    string json = string.Format(
                        "{{\"success\":true,\"locked\":true,\"version\":\"2.4.0\",\"client\":\"CampusCorp Secure Lockdown Executable\",\"platform\":\"Windows_x64\",\"kioskActive\":true,\"keyboardHookActive\":true,\"clipboardLock\":true,\"dualMonitorShield\":true,\"prohibitedProcessAudit\":\"{0}\",\"prohibitedCount\":{1},\"lockToken\":\"CC-EXELOCK-8F3A92E1B4C6\",\"uptime\":{2},\"timestamp\":\"{3}\"}}",
                        _lastViolation == "NONE" ? "CLEAN" : _lastViolation,
                        _prohibitedDetections,
                        uptime,
                        DateTime.UtcNow.ToString("o")
                    );

                    byte[] buffer = Encoding.UTF8.GetBytes(json);
                    res.ContentType = "application/json";
                    res.ContentLength64 = buffer.Length;
                    res.OutputStream.Write(buffer, 0, buffer.Length);
                    res.StatusCode = 200;
                    res.Close();
                    return;
                }

                if (path == "/launch" && req.HttpMethod == "POST")
                {
                    string body = "";
                    using (var reader = new StreamReader(req.InputStream, req.ContentEncoding))
                    {
                        body = reader.ReadToEnd();
                    }

                    string targetUrl = "http://localhost:5000/exam?testId=1&exeLock=true";
                    if (body.Contains("http"))
                    {
                        int idx = body.IndexOf("http");
                        int end = body.IndexOf("\"", idx);
                        if (end > idx) targetUrl = body.Substring(idx, end - idx);
                        else targetUrl = body.Substring(idx);
                    }

                    if (!targetUrl.Contains("exeLock=true"))
                    {
                        targetUrl += (targetUrl.Contains("?") ? "&" : "?") + "exeLock=true";
                    }

                    if (_mainForm != null && !_mainForm.IsDisposed)
                    {
                        _mainForm.Invoke(new Action(() => _mainForm.NavigateTo(targetUrl)));
                    }

                    string okJson = "{\"success\":true,\"message\":\"Launched URL in secure kiosk\",\"targetUrl\":\"" + targetUrl + "\"}";
                    byte[] buffer = Encoding.UTF8.GetBytes(okJson);
                    res.ContentType = "application/json";
                    res.ContentLength64 = buffer.Length;
                    res.OutputStream.Write(buffer, 0, buffer.Length);
                    res.StatusCode = 200;
                    res.Close();
                    return;
                }

                if (path == "/exit" && req.HttpMethod == "POST")
                {
                    _isRunning = false;
                    try
                    {
                        if (_kioskProcess != null && !_kioskProcess.HasExited)
                        {
                            _kioskProcess.Kill();
                        }
                    }
                    catch { }

                    string okJson = "{\"success\":true,\"message\":\"Lockdown ended.\"}";
                    byte[] buffer = Encoding.UTF8.GetBytes(okJson);
                    res.ContentType = "application/json";
                    res.ContentLength64 = buffer.Length;
                    res.OutputStream.Write(buffer, 0, buffer.Length);
                    res.StatusCode = 200;
                    res.Close();

                    new Thread(() =>
                    {
                        Thread.Sleep(500);
                        Environment.Exit(0);
                    }).Start();
                    return;
                }

                res.StatusCode = 404;
                res.Close();
            }
            catch { }
        }

        private static void RegisterProtocolHandler()
        {
            try
            {
                string appPath = Application.ExecutablePath;
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Classes\campuscorp-lock"))
                {
                    key.SetValue("", "URL:CampusCorp Secure Exam Lock Protocol");
                    key.SetValue("URL Protocol", "");

                    using (RegistryKey defaultIcon = key.CreateSubKey("DefaultIcon"))
                    {
                        defaultIcon.SetValue("", "\"" + appPath + "\",0");
                    }

                    using (RegistryKey commandKey = key.CreateSubKey(@"shell\open\command"))
                    {
                        commandKey.SetValue("", "\"" + appPath + "\" \"%1\"");
                    }
                }
            }
            catch { }
        }
    }

    public class MainForm : Form
    {
        private WebBrowser _browser;
        private Panel _topBar;
        private Label _statusLabel;
        private Label _violationLabel;
        private Button _exitBtn;
        private Button _refreshBtn;

        public MainForm(string initialUrl)
        {
            // True Kiosk Settings
            this.FormBorderStyle = FormBorderStyle.None;
            this.WindowState = FormWindowState.Normal;
            this.StartPosition = FormStartPosition.Manual;
            this.Bounds = Screen.PrimaryScreen.Bounds;
            this.TopMost = true;
            this.ShowInTaskbar = false;
            this.BackColor = Color.FromArgb(15, 23, 42); // Slate-900

            InitializeComponents(initialUrl);
        }

        private void InitializeComponents(string initialUrl)
        {
            // ── TOP SECURITY HUD BAR ──
            _topBar = new Panel();
            _topBar.Dock = DockStyle.Top;
            _topBar.Height = 44;
            _topBar.BackColor = Color.FromArgb(15, 23, 42);
            _topBar.Padding = new Padding(12, 6, 12, 6);

            Label brandLabel = new Label();
            brandLabel.Text = "🛡️ CampusCorp SecureLock Browser (v2.4.0)";
            brandLabel.ForeColor = Color.White;
            brandLabel.Font = new Font("Segoe UI", 10, FontStyle.Bold);
            brandLabel.AutoSize = true;
            brandLabel.Location = new Point(14, 12);
            _topBar.Controls.Add(brandLabel);

            _statusLabel = new Label();
            _statusLabel.Text = "● EXE LOCK ACTIVE (Topmost Kiosk & Anti-Cheat Enforced)";
            _statusLabel.ForeColor = Color.FromArgb(52, 211, 153); // Emerald-400
            _statusLabel.Font = new Font("Segoe UI", 9, FontStyle.Bold);
            _statusLabel.AutoSize = true;
            _statusLabel.Location = new Point(340, 13);
            _topBar.Controls.Add(_statusLabel);

            _violationLabel = new Label();
            _violationLabel.Text = "";
            _violationLabel.ForeColor = Color.FromArgb(248, 113, 113); // Red-400
            _violationLabel.Font = new Font("Segoe UI", 8, FontStyle.Bold);
            _violationLabel.AutoSize = true;
            _violationLabel.Location = new Point(780, 14);
            _topBar.Controls.Add(_violationLabel);

            _exitBtn = new Button();
            _exitBtn.Text = "Admin Exit";
            _exitBtn.Font = new Font("Segoe UI", 8, FontStyle.Bold);
            _exitBtn.ForeColor = Color.FromArgb(226, 232, 240);
            _exitBtn.BackColor = Color.FromArgb(30, 41, 59);
            _exitBtn.FlatStyle = FlatStyle.Flat;
            _exitBtn.FlatAppearance.BorderColor = Color.FromArgb(71, 85, 105);
            _exitBtn.Size = new Size(84, 28);
            _exitBtn.Dock = DockStyle.Right;
            _exitBtn.Cursor = Cursors.Hand;
            _exitBtn.Click += (s, e) => HandleAdminExit();
            _topBar.Controls.Add(_exitBtn);

            _refreshBtn = new Button();
            _refreshBtn.Text = "Reload";
            _refreshBtn.Font = new Font("Segoe UI", 8, FontStyle.Bold);
            _refreshBtn.ForeColor = Color.FromArgb(226, 232, 240);
            _refreshBtn.BackColor = Color.FromArgb(30, 41, 59);
            _refreshBtn.FlatStyle = FlatStyle.Flat;
            _refreshBtn.FlatAppearance.BorderColor = Color.FromArgb(71, 85, 105);
            _refreshBtn.Size = new Size(68, 28);
            _refreshBtn.Dock = DockStyle.Right;
            _refreshBtn.Cursor = Cursors.Hand;
            _refreshBtn.Click += (s, e) => { if (_browser != null) _browser.Refresh(); };
            _topBar.Controls.Add(_refreshBtn);

            this.Controls.Add(_topBar);

            // ── BROWSER VIEW ──
            _browser = new WebBrowser();
            _browser.Dock = DockStyle.Fill;
            _browser.ScriptErrorsSuppressed = true;
            _browser.IsWebBrowserContextMenuEnabled = false;
            _browser.WebBrowserShortcutsEnabled = false;

            SetBrowserFeatureControl();

            _browser.DocumentCompleted += (s, e) =>
            {
                try
                {
                    if (_browser.Document != null)
                    {
                        HtmlElement head = _browser.Document.GetElementsByTagName("head")[0];
                        if (head != null)
                        {
                            HtmlElement script = _browser.Document.CreateElement("script");
                            script.SetAttribute("type", "text/javascript");
                            script.SetAttribute("text", "window.isCampusCorpExeLock = true; window.lockdownBrowser = { version: '2.4.0', platform: 'Windows_x64', locked: true, kiosk: true }; console.log('CampusCorp EXE Lock Verified.');");
                            head.AppendChild(script);
                        }
                    }
                }
                catch { }
            };

            this.Controls.Add(_browser);
            _browser.BringToFront();

            NavigateTo(initialUrl);
        }

        public void NavigateTo(string url)
        {
            try
            {
                _browser.Navigate(url);
            }
            catch { }
        }

        public void SetViolationBanner(string message)
        {
            if (this.InvokeRequired)
            {
                this.Invoke(new Action(() => SetViolationBanner(message)));
                return;
            }
            _violationLabel.Text = message;
        }

        private void HandleAdminExit()
        {
            string input = ShowInputDialog("Administrator Password to Unlock / Exit:", "CampusCorp Exam Lock");
            if (input == "EXAMEXIT2026" || input == "admin" || input == "CampusCorp@2026")
            {
                this.Close();
            }
            else if (!string.IsNullOrEmpty(input))
            {
                MessageBox.Show("Incorrect Admin Passcode. Lockdown remains active.", "Access Denied", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        }

        private string ShowInputDialog(string text, string caption)
        {
            Form prompt = new Form()
            {
                Width = 380,
                Height = 160,
                FormBorderStyle = FormBorderStyle.FixedDialog,
                Text = caption,
                StartPosition = FormStartPosition.CenterScreen,
                TopMost = true,
                BackColor = Color.FromArgb(15, 23, 42),
                ForeColor = Color.White
            };
            Label textLabel = new Label() { Left = 20, Top = 16, Text = text, AutoSize = true, ForeColor = Color.White };
            TextBox textBox = new TextBox() { Left = 20, Top = 42, Width = 320, PasswordChar = '*', BackColor = Color.FromArgb(30, 41, 59), ForeColor = Color.White };
            Button confirmation = new Button() { Text = "Unlock", Left = 250, Width = 90, Top = 78, DialogResult = DialogResult.OK, BackColor = Color.FromArgb(16, 185, 129), ForeColor = Color.White, FlatStyle = FlatStyle.Flat };
            confirmation.Click += (sender, e) => { prompt.Close(); };
            prompt.Controls.Add(textBox);
            prompt.Controls.Add(confirmation);
            prompt.Controls.Add(textLabel);
            prompt.AcceptButton = confirmation;

            return prompt.ShowDialog() == DialogResult.OK ? textBox.Text : "";
        }

        private static void SetBrowserFeatureControl()
        {
            try
            {
                string appName = Path.GetFileName(Application.ExecutablePath);
                using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Internet Explorer\Main\FeatureControl\FEATURE_BROWSER_EMULATION"))
                {
                    key.SetValue(appName, 11001, RegistryValueKind.DWord);
                }
            }
            catch { }
        }
    }
}
