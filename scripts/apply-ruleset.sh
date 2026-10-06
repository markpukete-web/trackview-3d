#!/usr/bin/env bash
# Applies .github/rulesets/protect-main.json to the repo on GitHub. GitHub does not read that file
# by itself; this script is the only thing that pushes it, so re-run it after editing the JSON.
#
# Idempotent: updates the ruleset with the same name if one exists, otherwise creates it.
# Needs `gh` logged in as a repo admin (`gh auth login`).
#
# What the ruleset does to the default branch (main):
#   - no deletion, no force-push
#   - changes land through a pull request only; 0 approvals because a solo owner cannot approve
#     their own PR; open review conversations must be resolved before merging
#   - `lint · typecheck · build` and `secret scan` must pass on a branch that is up to date with
#     main. Both are pinned to the GitHub Actions app (integration_id 15368) so a commit status
#     from anything else with the same name cannot satisfy them.
#   - nobody bypasses it, people or apps (bypass_actors is empty). If CI breaks for a reason
#     outside the code, relax the ruleset in Settings -> Rules rather than adding a standing bypass.
#
# The ruleset was first set up in the GitHub UI; this file mirrors it. If you change it in the UI,
# copy the change here (GET repos/{owner}/{repo}/rulesets/{id}) so the two do not drift.
#
# If a job in .github/workflows/ci.yml is renamed, update the matching "context" here too, or the
# check stays "Expected — waiting for status" and every PR is blocked.
set -euo pipefail

repo="${1:-markpukete-web/trackview-3d}"
file="$(cd "$(dirname "$0")/.." && pwd)/.github/rulesets/protect-main.json"
name="$(node -p "require(process.argv[1]).name" "$file")"

id="$(gh api "repos/$repo/rulesets" --jq ".[] | select(.name == \"$name\") | .id")"

if [ -n "$id" ]; then
  gh api --method PUT "repos/$repo/rulesets/$id" --input "$file" --jq '"Updated ruleset \(.id): \(.name)"'
else
  gh api --method POST "repos/$repo/rulesets" --input "$file" --jq '"Created ruleset \(.id): \(.name)"'
fi

gh api "repos/$repo/rules/branches/main" --jq '"Rules now active on main: " + ([.[].type] | join(", "))'
