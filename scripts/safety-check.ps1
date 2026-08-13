<#
.SYNOPSIS
  校验路径是否严格位于本项目允许的边界内（项目目录或备份目录）。

.DESCRIPTION
  在执行任何写入 / 复制 / 删除 / 数据库初始化类操作之前，应先调用本脚本校验目标路径。
  只允许两个根目录：
    - 项目目录：C:\网站\意料之中-shop
    - 备份目录：D:\网页备份\意料之中-易购
  任何不在这两个根目录之下的路径都会被拒绝，脚本以非零状态码退出。

.PARAMETER Path
  要校验的目标路径（可以是文件或目录，不要求已存在）。

.PARAMETER Mode
  期望的边界类型："Project" 或 "Backup"。省略时两者皆可。

.EXAMPLE
  ./scripts/safety-check.ps1 -Path "C:\网站\意料之中-shop\docs\PROGRESS.md" -Mode Project
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Path,

    [Parameter(Mandatory = $false)]
    [ValidateSet("Project", "Backup", "Any")]
    [string]$Mode = "Any"
)

$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\网站\意料之中-shop"
$BackupRoot = "D:\网页备份\意料之中-易购"

function Get-NormalizedPath([string]$InputPath) {
    # 不要求路径已存在，手动规范化，避免 Resolve-Path 在目标不存在时报错
    if ([System.IO.Path]::IsPathRooted($InputPath)) {
        $full = $InputPath
    } else {
        $full = Join-Path (Get-Location) $InputPath
    }
    return [System.IO.Path]::GetFullPath($full).TrimEnd('\')
}

$normalizedTarget = Get-NormalizedPath -InputPath $Path
$normalizedProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\')
$normalizedBackupRoot = [System.IO.Path]::GetFullPath($BackupRoot).TrimEnd('\')

function Test-UnderRoot([string]$Target, [string]$Root) {
    return ($Target -eq $Root) -or ($Target.StartsWith($Root + '\', [System.StringComparison]::OrdinalIgnoreCase))
}

$isUnderProject = Test-UnderRoot -Target $normalizedTarget -Root $normalizedProjectRoot
$isUnderBackup = Test-UnderRoot -Target $normalizedTarget -Root $normalizedBackupRoot

$allowed = $false
switch ($Mode) {
    "Project" { $allowed = $isUnderProject }
    "Backup"  { $allowed = $isUnderBackup }
    "Any"     { $allowed = $isUnderProject -or $isUnderBackup }
}

if (-not $allowed) {
    Write-Error "安全校验失败：路径 [$normalizedTarget] 不在允许的边界内。`n允许的根目录：`n  项目目录: $normalizedProjectRoot`n  备份目录: $normalizedBackupRoot"
    exit 1
}

Write-Output "安全校验通过：$normalizedTarget"
exit 0

