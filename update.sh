#!/bin/bash

# This script downloads the latest version of a specified branch from the Kalibran repository.
# It requires curl and unzip to be installed.

REPO="bensheed/Kalibran"
echo "Enter the branch name to download (e.g., feature/setup-flow-fix):"
read BRANCH

if [ -z "$BRANCH" ]; then
    echo "No branch name entered. Exiting."
    exit 1
fi

echo "Fetching the latest version of branch: $BRANCH..."

# Construct the URL for the zip archive
ZIP_URL="https://github.com/$REPO/archive/refs/heads/$BRANCH.zip"

# Download the zip file
curl -L -o "$BRANCH.zip" "$ZIP_URL"

# Check if the download was successful
if [ $? -ne 0 ]; then
    echo "Failed to download the branch. Please check the branch name and your internet connection."
    exit 1
fi

# Unzip the archive
unzip -o "$BRANCH.zip"

# Check if unzip was successful
if [ $? -ne 0 ]; then
    echo "Failed to unzip the archive."
    exit 1
fi

# Clean up the downloaded zip file
rm "$BRANCH.zip"

echo "Update complete. The latest version of the '$BRANCH' branch has been downloaded."
