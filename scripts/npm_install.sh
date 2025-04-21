#!/bin/bash
set -e
echo "Running npm install script."

# Debug: Show versions
echo "Debug: Node version: $(node --version)"
echo "Debug: NPM version: $(npm --version)"

# Suppress WASI experimental warnings
export NODE_NO_WARNINGS=1

#Login to prerelease CodeArtifact to pull latest prerelease packages for build
aws codeartifact login --tool npm --repository $CAEF_CODEARTIFACT_PRERELEASE_NPM_REPO --domain $CAEF_CODEARTIFACT_PRERELEASE_DOMAIN --domain-owner $CAEF_CODEARTIFACT_PRERELEASE_ACCOUNT --namespace '@aws-mdaa' --region us-east-1

#Bootstrap and build packages
npm install

echo "Debug: starting nx reset"
# Run nx reset in background with timeout
timeout 5m npx nx reset &
NX_PID=$!

# Wait for the process to complete
wait $NX_PID || TIMEOUT_STATUS=$?
if [ $TIMEOUT_STATUS -eq 124 ]; then
    echo "Debug: nx reset timed out after 5 minutes, continuing..."
else
    echo "Debug: nx reset completed with status $TIMEOUT_STATUS"
fi
echo "Debug: npm_install.sh script complete"
exit 0