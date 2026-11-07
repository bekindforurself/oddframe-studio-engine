# Engine-only GitHub preservation boundary

Remote: https://github.com/bekindforurself/oddframe-studio-engine

Before 2.1 main was b28f574bbd6facac90f4da858bdea8adae07458c, with two commits
and engine contents at ROOT. The host has an unborn master with untracked films.
Do not replace main with the host workspace or publish host paths indiscriminately.

Use isolated worktree branch engine-2.1 descended from remote main. Copy engine
contents to root; retain old modules/history/provenance. Include engine-specific
AGENTS/architecture/production guidance, standalone tsconfig, private package
manifest and lockfile using existing dependencies. No npm release or LFS setup.

Do NOT copy host src/, public/, out/, backups/, original-templates/, film sources,
generated media/audio, browser binaries, node_modules, caches, credentials or env
files. Inventory references do not bundle assets or alter their existing licenses.
Do not invent an original source license.

Before commit verify standalone tests, allowed paths, diff, sizes, secrets and
production hashes. Stage only an explicit reviewed list. Push HEAD to engine-2.1
without force, verify its SHA; no merge into main is implied. On failure retain
the local commit and report the exact error. Windows Git may need a command-scoped
safe.directory exception for the exact workspace; do not change global settings.
