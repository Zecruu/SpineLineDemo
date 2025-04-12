#!/bin/bash

# Make sure we're in the correct directory (the root of the project)
echo "Current directory: $(pwd)"

# Initialize a new Git repository
echo "Initializing Git repository..."
git init

# Add all files to the staging area
echo "Adding files to staging area..."
git add .

# Check Git status
echo "Git status:"
git status

# Commit the changes
echo "Committing changes..."
git commit -m "Initial commit: SpineLine backend infrastructure"

# Add the remote repository
echo "Adding remote repository..."
git remote add origin https://github.com/Zecruu/SpineLineDemo.git

# Push to the main branch
echo "Pushing to GitHub..."
git push -u origin main

echo "Done!"