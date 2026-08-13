' 双击本文件：不会弹出任何黑色命令行窗口，在后台重启开发服务器（端口 3100）。
' 输出日志写入同目录下的 dev-server.log，可用记事本随时查看。
' 停止服务请双击 stop-dev-silent.vbs（同样不会弹窗），或 stop-dev.bat。

Dim fso, scriptDir, shell

Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = scriptDir

' 第三个参数 False 表示不等待（dev server 会长期运行）；第二个参数 0 表示隐藏窗口。
shell.Run """" & scriptDir & "\restart-dev-silent.bat""", 0, False

MsgBox "开发服务器正在后台启动（端口 3100，局域网 / Tailscale 均可访问）。" & vbCrLf & vbCrLf & _
       "查看日志：dev-server.log" & vbCrLf & _
       "停止服务：双击 stop-dev-silent.vbs", _
       64, "意料之中～意购"
