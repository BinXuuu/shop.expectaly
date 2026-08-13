' 双击本文件：不弹出黑色命令行窗口，直接停止占用 3100 端口的开发服务器进程。

Dim fso, scriptDir, shell

Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

Set shell = CreateObject("WScript.Shell")
shell.CurrentDirectory = scriptDir

' 第三个参数 True 表示等待停止流程执行完毕后再继续（即弹出确认框之前）。
shell.Run """" & scriptDir & "\stop-dev.bat""", 0, True

MsgBox "开发服务器已停止（如果原本在运行的话）。", 64, "意料之中～意购"
