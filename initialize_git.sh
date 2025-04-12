#!/bin/bash

# Initialize Git repository
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: SpineLine backend infrastructure"

# Add remote repository
git remote add origin https://github.com/Zecruu/SpineLineDemo.git

# Push to GitHub
git push -u origin main

echo "Repository has been initialized and code pushed to GitHub."