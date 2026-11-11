> Current authorization: the user approved this isolated engine-only publication
> to `origin/engine-film03-capabilities`. The proposal below is retained as history;
> its former no-push restriction applied to the earlier preservation task.
> The production branch and remote `engine-2.1` remain protected.

# Film03 publishing assessment â€” proposal only

No push, cherry-pick, rebase, remote ref modification, branch switch or history
rewrite is authorized by the preservation task. The local commit belongs only to
`studio-production`. Do not push that branch to the engine-only repository.

Verified remote engine-2.1 tip: `db5ec269e46cbececc2f4843e7eb981dedfabba5`.
The local pre-preservation HEAD `a007b2768828b7a9b640c7d550836230fa098f91`
descends from that tip by two commits. The pre-existing tree difference is 276
paths, including moving root engine modules under `engine/`, host film source,
reports, assets/manifests and host configuration. Selecting a small staged change
does not remove those ancestors from a push. The remote does not currently have
`studio-production`. Its absence alone is not the safety issue; the publication
layout and ancestor scope are.

Recommended target after explicit approval:
`origin/engine-film03-capabilities`, based on `origin/engine-2.1` (recheck its SHA).

1. Leave the production checkout on its current branch. After approval, create an
   isolated engine-only checkout/worktree for the NEW target branch from the remote
   engine tip. Do not merge or cherry-pick the host branch/commit into it.
2. Prepare an explicit file projection: selected `engine/<path>` source becomes
   root `<path>` in the isolated engine checkout. Include tested helper files,
   tests, technical evidence and the reviewed cumulative-inheritance prerequisites.
   Exclude host `src/`, `public/`, `out/`, backups, original-templates, generated
   media, caches and credentials, including the archived Film03 source.
3. The remote 2.1 release predates the local cumulative registry. Review its missing
   registry/resolver/profile prerequisites separately; do not publish dangling
   hashes or silently replace old runtime implementations. Preserve remote root
   package/standalone TypeScript conventions. Check any pre-existing engine-source
   drift and retain/version old implementations before integrating behavior changes.
   Local passing tests are not standalone-export validation.
4. Validate the projected registry, dependencies, approved implementation hashes,
   standalone TypeScript, Node and Python suites. Host-dependent evidence tests
   must skip cleanly when films/backups are excluded. Review the complete root-path
   diff and sizes before an explicit allowlisted commit on that isolated branch.
5. Only after approval, publish that engine-only commit with an ordinary push to
   `origin/engine-film03-capabilities`. A PR into `engine-2.1` is a separate review.
   Keep `main`, `engine-2.1` and the production checkout unchanged by this proposal.

This is a proposed method and exact branch, not a prepared or approved export.
