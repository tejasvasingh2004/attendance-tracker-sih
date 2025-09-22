<#
This PowerShell script installs Android SDK command-line tools for Windows,
required SDK components, and NDK r26, and sets system environment variables.
Run as Administrator in PowerShell.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$sdkRoot = Join-Path $env:USERPROFILE 'AppData\Local\Android\Sdk'
$sdkUrl = 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip'
$ndkVersion = '26.1.10909125'
$platformApi = '34'
$buildTools = '35.0.0'

Write-Host "[info] Android SDK root will be: $sdkRoot"
New-Item -ItemType Directory -Force -Path $sdkRoot | Out-Null
Set-Location $sdkRoot

$zipPath = Join-Path $sdkRoot 'cmdline-tools.zip'
Invoke-WebRequest -Uri $sdkUrl -OutFile $zipPath

Remove-Item -Recurse -Force (Join-Path $sdkRoot 'cmdline-tools') -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force -Path (Join-Path $sdkRoot 'cmdline-tools-tmp') | Out-Null
Expand-Archive -Path $zipPath -DestinationPath (Join-Path $sdkRoot 'cmdline-tools-tmp') -Force
New-Item -ItemType Directory -Force -Path (Join-Path $sdkRoot 'cmdline-tools\latest') | Out-Null
Move-Item -Force (Join-Path $sdkRoot 'cmdline-tools-tmp\cmdline-tools\*') (Join-Path $sdkRoot 'cmdline-tools\latest')
Remove-Item -Recurse -Force (Join-Path $sdkRoot 'cmdline-tools-tmp')
Remove-Item -Force $zipPath

$paths = @(
  "$sdkRoot\platform-tools",
  "$sdkRoot\emulator",
  "$sdkRoot\cmdline-tools\latest\bin"
)

# Set environment variables (System scope)
[Environment]::SetEnvironmentVariable('ANDROID_SDK_ROOT', $sdkRoot, 'Machine')
[Environment]::SetEnvironmentVariable('ANDROID_HOME', $sdkRoot, 'Machine')
$existingPath = [Environment]::GetEnvironmentVariable('Path', 'Machine')
foreach ($p in $paths) {
  if ($existingPath -notlike "*${p}*") { $existingPath = "$existingPath;$p" }
}
[Environment]::SetEnvironmentVariable('Path', $existingPath, 'Machine')

$sdkManager = Join-Path $sdkRoot 'cmdline-tools\latest\bin\sdkmanager.bat'

Write-Host "[step] Accepting licenses..."
cmd.exe /c "yes | \"$sdkManager\" --licenses"

Write-Host "[step] Installing required SDK packages..."
& $sdkManager "platform-tools" "platforms;android-$platformApi" "build-tools;$buildTools" "ndk;$ndkVersion" "cmake;3.22.1"

Write-Host "`n[done] Android SDK installed at: $sdkRoot"
Write-Host "[hint] Restart PowerShell and IDE to pick up updated PATH and env vars."


