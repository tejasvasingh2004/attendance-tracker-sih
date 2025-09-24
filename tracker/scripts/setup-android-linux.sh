#!/usr/bin/env bash
set -euo pipefail

# This script installs Android SDK command-line tools, required SDK components,
# and NDK r26, and exports environment variables for the current shell.
# Tested on Ubuntu/Debian-based distros. Requires: unzip, curl, zip.

ANDROID_SDK_ROOT_DEFAULT="$HOME/Android/Sdk"
SDK_URL="https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip"
NDK_VERSION="26.1.10909125"
PLATFORM_API="34"
BUILD_TOOLS="35.0.0"

echo "[info] Android SDK root will be: ${ANDROID_SDK_ROOT_DEFAULT}"
mkdir -p "${ANDROID_SDK_ROOT_DEFAULT}"
cd "${ANDROID_SDK_ROOT_DEFAULT}"

if ! command -v unzip >/dev/null 2>&1; then
  echo "[info] Installing unzip"
  sudo apt-get update -y && sudo apt-get install -y unzip
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "[info] Installing curl"
  sudo apt-get update -y && sudo apt-get install -y curl
fi

echo "[step] Downloading Android command-line tools..."
curl -L -o cmdline-tools.zip "${SDK_URL}"
rm -rf cmdline-tools
mkdir -p cmdline-tools
unzip -q cmdline-tools.zip -d cmdline-tools-tmp
mkdir -p cmdline-tools/latest
mv cmdline-tools-tmp/cmdline-tools/* cmdline-tools/latest/
rm -rf cmdline-tools-tmp cmdline-tools.zip

export ANDROID_SDK_ROOT="${ANDROID_SDK_ROOT_DEFAULT}"
export ANDROID_HOME="${ANDROID_SDK_ROOT}"
export PATH="$ANDROID_SDK_ROOT/platform-tools:$ANDROID_SDK_ROOT/emulator:$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$PATH"

yes | sdkmanager --licenses >/dev/null

echo "[step] Installing required SDK packages..."
sdkmanager \
  "platform-tools" \
  "platforms;android-${PLATFORM_API}" \
  "build-tools;${BUILD_TOOLS}" \
  "ndk;${NDK_VERSION}" \
  "cmake;3.22.1"

echo "\n[done] Android SDK installed at: $ANDROID_SDK_ROOT"
echo "[hint] Add these lines to your shell profile (~/.bashrc or ~/.zshrc):"
cat <<EOF
export ANDROID_SDK_ROOT="$ANDROID_SDK_ROOT"
export ANDROID_HOME="$ANDROID_SDK_ROOT"
export PATH="\$ANDROID_SDK_ROOT/platform-tools:\$ANDROID_SDK_ROOT/emulator:\$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:\$PATH"
EOF


