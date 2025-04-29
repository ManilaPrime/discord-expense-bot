#!/bin/bash

echo "Expense Tracker Bot - Installation Fix Script"
echo "============================================"

# Clean npm cache
echo "Cleaning npm cache..."
npm cache clean --force

# Remove node_modules and package-lock.json
echo "Removing node_modules and package-lock.json..."
rm -rf node_modules package-lock.json

# Install with the correct dependency versions
echo "Installing dependencies with compatible versions..."
npm install

echo "Installation completed."
echo "If you still have issues, try: npm install --legacy-peer-deps"
