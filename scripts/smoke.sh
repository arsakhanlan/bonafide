#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../backend"
export JAVA_HOME="${JAVA_HOME:-/Library/Java/JavaVirtualMachines/temurin-25.jdk/Contents/Home}"
export PATH="$HOME/google-cloud-sdk/bin:$PATH"
./mvnw test -Plive
