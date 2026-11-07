# OddFrame Studio Engine

Current release: **2.1.0** (`version.json`). The production-intelligence API is
opt-in at `v2_1/index.ts`; existing imports retain their defaults. Start with
`knowledge/index.json` and `PRODUCTION_21.md` for current workflows. Historical
foundation/extraction notes below describe earlier preparation, not current
GitHub publication state. The existing remote is preserved through its history;
see `knowledge/PUBLISHING.md` for the engine-only release boundary.

Reusable source foundation for future OddFrame animated shorts. Intended private repository: `bekindforurself/oddframe-studio-engine`. No repository has been created, connected, committed, or pushed by this preparation.

This directory was already present as an untracked extraction scaffold when this task began. It retains the working human artwork and cinematic environment code, with local imports and small adapters for caller-owned routes, cameras and lighting. Existing films continue to import their original modules. This is a source library consumed inside the existing project, not an independently installed package.

Start with [ENGINE_USAGE.md](ENGINE_USAGE.md), then [STYLE_GUIDE.md](STYLE_GUIDE.md), [ANIMATION_RULES.md](ANIMATION_RULES.md), and [KNOWN_ISSUES.md](KNOWN_ISSUES.md). [PROVENANCE.md](PROVENANCE.md) maps modules to working originals. [REPOSITORY_PREPARATION.md](REPOSITORY_PREPARATION.md) records the future private repository boundary.

```text
engine/
  index.ts                     public browser-side API
  math.ts                      vectors, easing, interpolation
  characters/                  human artwork, billboard rigs, expressions
  animation/                   arm solver, anchored gait, projected legs
  environments/                office, exterior, beach, materials, contacts
  lighting/                    warm/cool day and night lighting
  cameras/                     frame-based camera sampling and application
  rendering/                   depth finish, presets, Node browser helpers
  examples/FutureShort.tsx      unregistered six-second import example
  tsconfig.json                engine, example and existing-source validation
```

No new dependency, asset download or film registration is required. Validation is TypeScript only; the example has not been visually reviewed or rendered in this task.
