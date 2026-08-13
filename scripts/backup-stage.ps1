<#
.SYNOPSIS
  将项目安全备份到指定阶段目录，遵循「意料之中～意购」项目的备份规则。

.DESCRIPTION
  - 源目录严格校验为 C:\网站\意料之中-shop
  - 目标根目录严格校验为 D:\网页备份\意料之中-易购
  - 每次备份创建独立的「阶段名-时间戳」目录，不覆盖、不删除旧备份
  - 使用 robocopy 复制，排除 node_modules、.next、dist、build、coverage 等大型/缓存目录
  - 不使用 /MIR 或 /PURGE 等会删除目标端多余文件的高风险参数
  - 复制后校验关键文件（package.json、src 或 app、docs）是否存在
  - 将备份结果追加到 docs/PROGRESS.md
  - 失败时返回非零退出码

.PARAMETER StageName
  阶段目录名称，例如 "stage-00-initial"、"stage-03-public-pages"。

.EXAMPLE
  ./scripts/backup-stage.ps1 -StageName "stage-00-initial"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$StageName
)

$ErrorActionPreference = "Stop"

$ProjectRoot = "C:\网站\意料之中-shop"
$BackupRoot = "D:\网页备份\意料之中-易购"

function Fail([string]$Message) {
    Write-Error $Message
    exit 1
}

# ---- 1. 严格校验源目录 ----
$resolvedProjectRoot = [System.IO.Path]::GetFullPath($ProjectRoot).TrimEnd('\')
$expectedProjectRoot = [System.IO.Path]::GetFullPath("C:\网站\意料之中-shop").TrimEnd('\')
if ($resolvedProjectRoot -ne $expectedProjectRoot) {
    Fail "源目录校验失败：期望 [$expectedProjectRoot]，实际 [$resolvedProjectRoot]。已终止备份。"
}
if (-not (Test-Path -LiteralPath $ProjectRoot -PathType Container)) {
    Fail "源目录不存在：$ProjectRoot"
}

# ---- 2. 严格校验目标根目录 ----
$resolvedBackupRoot = [System.IO.Path]::GetFullPath($BackupRoot).TrimEnd('\')
$expectedBackupRoot = [System.IO.Path]::GetFullPath("D:\网页备份\意料之中-易购").TrimEnd('\')
if ($resolvedBackupRoot -ne $expectedBackupRoot) {
    Fail "备份根目录校验失败：期望 [$expectedBackupRoot]，实际 [$resolvedBackupRoot]。已终止备份。"
}
if (-not (Test-Path -LiteralPath $BackupRoot -PathType Container)) {
    New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
}

# ---- 3. 阶段名称合法性（防止路径穿越）----
if ($StageName -match '[\\/]' -or $StageName -match '\.\.') {
    Fail "阶段名称不合法（不允许包含路径分隔符或 '..'）：$StageName"
}

# ---- 4. 生成带时间戳的目标目录 ----
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$targetDirName = "$StageName-$timestamp"
$targetDir = Join-Path $BackupRoot $targetDirName

if (Test-Path -LiteralPath $targetDir) {
    Fail "目标目录已存在，为避免覆盖已终止：$targetDir"
}

New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

# ---- 5. 安全复制（排除大型缓存目录，不使用 /MIR /PURGE）----
$excludeDirs = @("node_modules", ".next", "dist", "build", "coverage", ".turbo")

Write-Output "正在备份：$ProjectRoot -> $targetDir"
Write-Output "排除目录：$($excludeDirs -join ', ')"

$robocopyArgs = @(
    "`"$ProjectRoot`"",
    "`"$targetDir`"",
    "/E",
    "/XD"
) + $excludeDirs + @(
    "/R:2",
    "/W:2",
    "/NFL",
    "/NDL",
    "/NJH",
    "/NJS"
)

$process = Start-Process -FilePath "robocopy.exe" -ArgumentList $robocopyArgs -NoNewWindow -Wait -PassThru
$robocopyExitCode = $process.ExitCode

# robocopy 退出码 0-7 均表示成功（0=无变化，1=已复制，2=有多余文件但未删除，等）；>=8 表示出现错误
if ($robocopyExitCode -ge 8) {
    Fail "robocopy 复制失败，退出码：$robocopyExitCode"
}

# ---- 6. 校验关键文件是否存在 ----
$missing = @()

if (-not (Test-Path -LiteralPath (Join-Path $targetDir "package.json"))) {
    $missing += "package.json"
}
$hasSrcOrApp = (Test-Path -LiteralPath (Join-Path $targetDir "src")) -or (Test-Path -LiteralPath (Join-Path $targetDir "app"))
if (-not $hasSrcOrApp) {
    $missing += "src 或 app 目录"
}
if (-not (Test-Path -LiteralPath (Join-Path $targetDir "docs"))) {
    $missing += "docs 目录"
}

if ($missing.Count -gt 0) {
    Fail "备份校验失败，以下关键内容缺失：$($missing -join '; ')。备份目录：$targetDir"
}

Write-Output "备份完成并校验通过：$targetDir"

# ---- 7. 将记录插入 docs/PROGRESS.md 的「备份记录汇总」标记区块（最新记录置顶）----
$progressFile = Join-Path $ProjectRoot "docs\PROGRESS.md"
$startMarker = "<!-- BACKUP_LOG_START -->"

if (Test-Path -LiteralPath $progressFile) {
    $progressContent = Get-Content -LiteralPath $progressFile -Raw -Encoding UTF8
    $logLine = "- [$timestamp] 阶段 `"$StageName`" 已备份至: $targetDir"

    if ($progressContent.Contains($startMarker)) {
        $newContent = $progressContent.Replace($startMarker, "$startMarker`r`n`r`n$logLine")
        Set-Content -LiteralPath $progressFile -Value $newContent -Encoding UTF8 -NoNewline
        Write-Output "已将备份记录插入 docs/PROGRESS.md 的备份记录汇总区块"
    } else {
        Add-Content -LiteralPath $progressFile -Value $logLine -Encoding UTF8
        Write-Warning "未找到 BACKUP_LOG_START 标记，已改为追加到文件末尾。"
    }
} else {
    Write-Warning "未找到 docs/PROGRESS.md，跳过日志追加。"
}

Write-Output "BACKUP_PATH=$targetDir"
exit 0

