# 后台窗口猎手：Next.js/Turbopack 在 Windows 上会另外派生一个标题为
# "next-server (vX.X.X)" 的子进程窗口，该窗口不会继承父进程（我们隐藏启动的 cmd）的
# 隐藏状态，因此需要单独扫描并隐藏它。只要 3100 端口还在监听（即开发服务器仍在运行），
# 就持续每 0.5 秒检查一次；端口停止监听后自动退出，不会遗留后台进程。

Add-Type -Name Win32 -Namespace NativeMethods -MemberDefinition @"
[DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
"@ -ErrorAction SilentlyContinue

$SW_HIDE = 0
$port = 3100

while ($true) {
    $listening = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if (-not $listening) { break }

    Get-Process -ErrorAction SilentlyContinue |
        Where-Object { $_.MainWindowTitle -like "next-server*" -and $_.MainWindowHandle -ne 0 } |
        ForEach-Object { [NativeMethods.Win32]::ShowWindow($_.MainWindowHandle, $SW_HIDE) | Out-Null }

    Start-Sleep -Milliseconds 500
}
