# Private repository preparation

Target: `bekindforurself/oddframe-studio-engine`, intended visibility **private**. This records preparation only; repository availability, ownership permissions and remote state have not been queried. No remote, commit or push has been created.

## Source boundary

For a future standalone source repository, copy the contents of `engine/` into its root: public `index.ts`, `math.ts`, the seven component/example directories, documentation and a standalone TypeScript configuration. Keep the example as an opt-in import example. Do not include finished film sources, `public/` audio, previews, `out/`, backups, browser binaries, caches, `node_modules/` or this project's Git metadata.

The current `engine/tsconfig.json` deliberately extends the host configuration. After separation, replace that inheritance with the host's compiler options (ES2020, DOM, react-jsx, ESNext, Bundler resolution, strict, esModuleInterop, skipLibCheck, noEmit) and include the new repository's TypeScript files. This is a documented future step; this directory remains integrated with the current host today.

## Packaging decisions before first publication

- Preserve source provenance and review ownership of original artwork/code before choosing a license; none is invented here.
- Keep any future package manifest private initially. Document the existing host dependency versions from its `package.json` and lockfile; choose peer dependency ranges only after compatibility checks.
- Decide between source consumption and a compiled package before adding build outputs, exports or release automation. No package build or install is needed for the present source API.
- Create or select the private GitHub repository only when authorized. Verify private visibility before a first push. Do not reuse this film project's remote configuration implicitly.
- Exclude local outputs and credentials in the future repository ignore rules. Keep the Node browser helper separate from the browser bundle.

The current deliverable is a reusable, type-checkable source foundation within Our-Animated-Shorts, with a documented migration boundary. It is not represented as an independently packaged or published repository.
