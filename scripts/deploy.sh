#!/usr/bin/env bash
# Publish the built site to GitHub Pages: builds dist/, then pushes it to the gh-pages branch.
#   scripts/deploy.sh
# Live at https://banozz0.github.io/ghostex-onboarding-prototypes/ — main keeps the source, gh-pages only the build.
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
url=https://banozz0.github.io/ghostex-onboarding-prototypes/

bun "$root/scripts/build.ts"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
site="$tmp/site"

git clone -q --depth 1 --branch gh-pages "$(git -C "$root" remote get-url origin)" "$site"
find "$site" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
cp -R "$root/dist/." "$site/"

git -C "$site" add -A
if git -C "$site" diff --cached --quiet; then
  echo "no changes; live at $url"
  exit 0
fi
git -C "$site" commit -q -m "Publish Ghostex onboarding prototypes from $(git -C "$root" rev-parse --short HEAD)"
git -C "$site" push -q origin gh-pages
echo "pushed; live at $url (Pages takes ~1 min to rebuild)"
