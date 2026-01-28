#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
# The new SDK version can be passed as the first argument to this script.
NEW_SDK_VERSION=$1

# --- 1. Update SDK Version (Optional) ---
if [ -n "$NEW_SDK_VERSION" ]; then
  echo "?? Updating SDK version to $NEW_SDK_VERSION..."
  node ./scripts/update-sdk-version.js "$NEW_SDK_VERSION"
else
  echo "??Skipping SDK version update. Using version from variables.gradle."
fi

# --- 1b. Auto-increment Android version code ---
echo "?? Updating Android VERSION_CODE..."
node ./scripts/update-build-version.js

# --- 2. Setup Secrets ---
# In your CI/CD environment, you must create these files using secrets.
# For example, in GitHub Actions, you would use `echo "$GCP_KEY_SECRET" > android/fastlane/google-play-key.json`
if [ ! -f "android/keystore.properties" ] || [ ! -f "android/fastlane/google-play-key.json" ]; then
    echo "?�️ WARNING: Secret files not found."
    echo "This script expects 'android/keystore.properties' and 'android/fastlane/google-play-key.json' to exist."
    echo "In a CI environment, create them from secrets before running this script."
    # For a local test, you can create them manually. For CI, this should be a hard failure.
    # exit 1 
fi

# --- 3. Install Dependencies ---
echo "?? Installing npm dependencies..."
npm install

# --- 4. Build Web Assets for Capacitor ---
echo "?? Building web assets..."
npm run build:cap

# --- 5. Sync Android Project ---
echo "?? Syncing Capacitor assets to Android..."
npx cap sync android

# --- 6. Build Android App Bundle (.aab) ---
echo "?? Building Android App Bundle..."
# On Windows, you would use 'gradlew.bat'
(cd android && ./gradlew bundleRelease)

# --- 7. Deploy to Google Play Store ---
echo "?? Deploying to Google Play Store via fastlane..."
# Fastlane uses Ruby, ensure it's installed on your runner.
# You may need to run 'bundle install' inside the 'android' directory if you have a Gemfile.
(cd android && fastlane deploy)

echo "?�� --- Build and Deploy Complete! --- ?��"
