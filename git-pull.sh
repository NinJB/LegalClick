#!/bin/bash

echo "⚙️ Resetting repo to match remote 'main'..."

git reset --hard
git clean -fd
git pull origin main

echo "✅ Repo updated successfully!"
