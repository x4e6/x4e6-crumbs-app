#!/usr/bin/env bash
set -euo pipefail

REPO_NAME="x4e6-crumbs-app"

echo "==> Init git repo"
git init
git add .
git commit -m "chore: initial x4e6 scaffold"

echo "==> Create GitHub repo and push"
gh repo create "$REPO_NAME" --public --source=. --remote=origin --push

echo "Done."

