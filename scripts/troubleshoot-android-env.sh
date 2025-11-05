#!/usr/bin/env bash
set -euo pipefail

# Troubleshoots common issues when the Android env check was run from a subfolder
# and couldn't find the Gradle wrapper at ./android/gradlew

echo "=== Android Troubleshooter ==="

SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURR_DIR="$(pwd)"

get_repo_root() {
  if command -v git >/dev/null 2>&1; then
    local root
    root="$(git rev-parse --show-toplevel 2>/dev/null || true)"
    if [[ -n "$root" && -d "$root" ]]; then
      echo "$root"
      return 0
    fi
  fi
  # Fallback: assume script is in <repo>/scripts
  echo "${SCRIPT_DIR%/scripts}"
}

REPO_ROOT="$(get_repo_root)"

echo "--- Directories ---"
echo "Current directory: ${CURR_DIR}"
echo "Script directory : ${SCRIPT_DIR}"
echo "Repo root        : ${REPO_ROOT}"

GRADLEW_PATH="${REPO_ROOT}/android/gradlew"

if [[ "${CURR_DIR}" != "${REPO_ROOT}" ]]; then
  echo "⚠️  You are not in the repo root. Some relative checks may fail."
  echo "   Suggested: cd \"${REPO_ROOT}\" before running environment scripts."
fi

echo "--- Gradle Wrapper ---"
if [[ -f "${GRADLEW_PATH}" ]]; then
  echo "✅ Gradle wrapper exists at: ${GRADLEW_PATH}"
  echo "   Trying: ${GRADLEW_PATH} -v -p ${REPO_ROOT}/android"
  if "${GRADLEW_PATH}" -v -p "${REPO_ROOT}/android" >/dev/null 2>&1; then
    echo "✅ Gradle wrapper runs successfully."
  else
    echo "❌ Gradle wrapper exists but failed to run."
    echo "   Tips:"
    echo "   - Ensure JDK 17+ is active and JAVA_HOME points to it."
    echo "   - Try: ./android/gradlew clean -p ./android"
    echo "   - Check network connectivity if Gradle needs to download dependencies."
  fi
else
  echo "❌ Gradle wrapper not found at: ${GRADLEW_PATH}"
  echo "   Troubleshooting steps:"
  echo "   1) Confirm you are in the repo root: cd \"${REPO_ROOT}\""
  echo "   2) List android dir: ls -la \"${REPO_ROOT}/android\""
  echo "   3) If \"android\" is missing, generate native projects: pnpm prebuild"
  echo "   4) If Gradle wrapper is missing, ensure it wasn't excluded by .gitignore"
  echo "      or regenerate via: pnpm prebuild (Expo) or re-add wrapper files."
fi

echo "--- Java Consistency ---"
JAVA_BIN_VER="$(java -version 2>&1 | head -n 1 || true)"
JAVA_HOME_SHOW="${JAVA_HOME:-}"
echo "java -version : ${JAVA_BIN_VER}"
echo "JAVA_HOME     : ${JAVA_HOME_SHOW:-<not set>}"
if [[ -n "${JAVA_HOME_SHOW}" ]]; then
  # Try to read release file for version info
  if [[ -f "${JAVA_HOME_SHOW}/release" ]]; then
    JAVA_HOME_VER="$(grep '^JAVA_VERSION=' "${JAVA_HOME_SHOW}/release" | cut -d'=' -f2 | tr -d '"')"
    echo "JAVA_HOME ver : ${JAVA_HOME_VER}"
  fi
fi
echo "   If versions differ significantly, point JAVA_HOME to the java on PATH:"
echo "   On macOS (Homebrew OpenJDK 17): export JAVA_HOME=\"$(/usr/libexec/java_home -v 17 2>/dev/null || echo '<path-to-jdk-17>')\""

echo "--- Re-run Env Check From Root ---"
if [[ -f "${REPO_ROOT}/scripts/check-android-env.sh" ]]; then
  echo "Running consolidated env check from repo root:"
  (cd "${REPO_ROOT}" && bash scripts/check-android-env.sh) || true
else
  echo "⚠️  Env check script not found at ${REPO_ROOT}/scripts/check-android-env.sh"
fi

echo "=== Done ==="