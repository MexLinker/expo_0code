#!/usr/bin/env bash
set -euo pipefail

echo "=== Android Build Environment Check ==="

FAIL_COUNT=0
WARN_COUNT=0

fail() {
  echo "❌ $1"
  FAIL_COUNT=$((FAIL_COUNT+1))
}

warn() {
  echo "⚠️  $1"
  WARN_COUNT=$((WARN_COUNT+1))
}

ok() {
  echo "✅ $1"
}

section() {
  echo ""
  echo "--- $1 ---"
}

section "Host OS"
OS_NAME="$(uname -s)"
ok "Detected OS: ${OS_NAME}"

section "Java (JDK)"
if ! command -v java >/dev/null 2>&1; then
  fail "Java is not installed or not on PATH."
  echo "   Fix: Install OpenJDK 17 and export JAVA_HOME."
else
  JAVA_VERSION_STR="$(java -version 2>&1 | head -n 1)"
  JAVA_MAJOR="$(echo "$JAVA_VERSION_STR" | sed -E 's/.*version "[^0-9]*([0-9]+).*/\1/')"
  if [[ -z "${JAVA_MAJOR}" ]]; then
    warn "Unable to parse Java version from: ${JAVA_VERSION_STR}"
  elif [[ "${JAVA_MAJOR}" -lt 17 ]]; then
    fail "Java version is < 17. Found: ${JAVA_VERSION_STR}"
    echo "   Fix: Install OpenJDK 17 and set PATH/JAVA_HOME accordingly."
  else
    ok "Java version OK: ${JAVA_VERSION_STR}"
  fi
  if [[ -n "${JAVA_HOME:-}" ]]; then
    ok "JAVA_HOME is set: ${JAVA_HOME}"
  else
    warn "JAVA_HOME is not set. Gradle may still work via PATH."
  fi
fi

section "Android SDK"
SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"
if [[ -z "${SDK_ROOT}" ]]; then
  fail "ANDROID_SDK_ROOT/ANDROID_HOME is not set."
  echo "   Fix: export ANDROID_SDK_ROOT=/Users/<you>/Library/Android/sdk"
else
  ok "SDK root: ${SDK_ROOT}"
  if [[ ! -d "${SDK_ROOT}" ]]; then
    fail "SDK directory does not exist: ${SDK_ROOT}"
  fi
fi

if [[ -n "${SDK_ROOT:-}" && -d "${SDK_ROOT}" ]]; then
  # Platform tools
  if [[ -d "${SDK_ROOT}/platform-tools" ]]; then
    ok "platform-tools present."
  else
    fail "platform-tools missing at ${SDK_ROOT}/platform-tools"
    echo "   Fix: Install via Android Studio SDK Manager or sdkmanager."
  fi

  # Build tools
  if [[ -d "${SDK_ROOT}/build-tools" ]]; then
    BUILD_TOOLS_COUNT="$(ls -1 "${SDK_ROOT}/build-tools" 2>/dev/null | wc -l | tr -d ' ')"
    if [[ "${BUILD_TOOLS_COUNT}" -ge 1 ]]; then
      LATEST_BUILD_TOOLS="$(ls -1 "${SDK_ROOT}/build-tools" | sort -V | tail -n 1)"
      ok "build-tools present (latest: ${LATEST_BUILD_TOOLS})."
    else
      fail "No build-tools versions installed."
      echo "   Fix: Install a recent Build Tools via SDK Manager."
    fi
  else
    fail "build-tools directory missing."
  fi

  # Platforms
  if [[ -d "${SDK_ROOT}/platforms" ]]; then
    PLAT_COUNT="$(ls -1 "${SDK_ROOT}/platforms" 2>/dev/null | wc -l | tr -d ' ')"
    if [[ "${PLAT_COUNT}" -ge 1 ]]; then
      LATEST_PLATFORM="$(ls -1 "${SDK_ROOT}/platforms" | sort -V | tail -n 1)"
      ok "Android platforms present (latest: ${LATEST_PLATFORM})."
    else
      fail "No Android API platforms installed."
      echo "   Fix: Install at least one API level (e.g., android-34)."
    fi
  else
    fail "platforms directory missing."
  fi

  # sdkmanager presence (optional check)
  SDKMANAGER_BIN="${SDK_ROOT}/cmdline-tools/latest/bin/sdkmanager"
  if [[ -x "${SDKMANAGER_BIN}" ]]; then
    SDKMANAGER_VER="$(${SDKMANAGER_BIN} --version 2>/dev/null || true)"
    ok "sdkmanager found: ${SDKMANAGER_VER}"
  elif command -v sdkmanager >/dev/null 2>&1; then
    ok "sdkmanager found on PATH."
  else
    warn "sdkmanager not found. Use Android Studio or install cmdline-tools."
  fi

  # Licenses
  if [[ -d "${SDK_ROOT}/licenses" ]] && ls "${SDK_ROOT}/licenses" 2>/dev/null | grep -q "android-sdk-license"; then
    ok "Android SDK licenses present."
  else
    warn "SDK licenses not detected."
    echo "   Fix: Open Android Studio and accept licenses,"
    echo "        or run: \$SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --licenses"
  fi
fi

section "ADB"
if command -v adb >/dev/null 2>&1; then
  ADB_VER="$(adb version 2>&1 | head -n 1)"
  ok "adb OK: ${ADB_VER}"
  DEVICES_COUNT="$(adb devices | sed '1d' | grep -v '^$' | wc -l | tr -d ' ')"
  if [[ "${DEVICES_COUNT}" -ge 1 ]]; then
    ok "Device(s) detected by adb."
  else
    warn "No devices/emulators detected. Connect a device or start an emulator."
  fi
else
  fail "adb not found on PATH."
  echo "   Fix: Ensure platform-tools are installed and PATH includes \$SDK_ROOT/platform-tools."
fi

section "Gradle Wrapper"
if [[ -f "./android/gradlew" ]]; then
  if ./android/gradlew -v -p ./android >/dev/null 2>&1; then
    ok "Gradle wrapper runs."
  else
    fail "Gradle wrapper exists but failed to run."
    echo "   Fix: Check JDK setup and network connectivity."
  fi
else
  fail "Gradle wrapper not found at ./android/gradlew"
fi

echo ""
echo "=== Summary ==="
if [[ "${FAIL_COUNT}" -eq 0 ]]; then
  ok "Essential checks passed. Android build environment looks good."
  if [[ "${WARN_COUNT}" -gt 0 ]]; then
    warn "${WARN_COUNT} warning(s). See notes above."
  fi
  exit 0
else
  fail "Found ${FAIL_COUNT} blocking issue(s). Please fix and re-run."
  if [[ "${WARN_COUNT}" -gt 0 ]]; then
    warn "${WARN_COUNT} additional warning(s)."
  fi
  exit 1
fi