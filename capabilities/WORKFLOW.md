# Cumulative Engine workflow

This is an additive production policy over Engine 2.1, not a new animation engine.
The initial approved profile is `illustrated-vertical-lowpower@1.0.0`. Its scope is
reuse of the existing baseline authorized by the user, within recorded limitations.
It does not claim that extracted wrappers have pixel parity with the original film,
or approve any new story, artwork, experimental feature, or native film export.

## Start an authorized new film

1. Confirm the canonical workspace and active branch; never switch automatically.
2. Read `knowledge/index.json`, the capability registry, relevant film evidence and
   `knowledge/cumulative-engine.json`. Search existing implementations first.
3. Map story requirements to approved capabilities, host-reusable environments,
   candidates and missing features. Record a technical reason before rebuilding.
4. Create a new film directory only after story authorization. Copy **only** the
   starter `production.json` there. Do not copy previous film implementations.
5. Run from the consuming project root:

   ```powershell
   node engine/production/capabilities.mjs catalog
   node engine/production/capabilities.mjs init --config=path/production.json
   ```

   Initialization writes new `capabilities.lock.json`, `capabilities.ts`, and
   `FilmFactory.tsx`. It refuses existing outputs. The CLI prints the capability
   fingerprint inputs: merge them with the film's config, source, assets and tools
   in `fingerprintInputs`. No configuration or existing lock is overwritten.
6. Import `createFilmComponent` from `./FilmFactory` and shared browser symbols from
   `./capabilities`. Supply global-frame scene renderers; configure/register the
   composition only when the film is actually authorized and ready.
7. Run `node engine/production/capabilities.mjs verify --config=path/production.json`.
   The generic renderer also verifies required locks before planning/rendering.
   For Python tools run this preflight before audio generation/mux/validation;
   their existing algorithms and CLI behavior are intentionally unchanged.

The profile resolver selects the newest approved compatible profile version and
backtracks to compatible approved capability versions. Only exact, caret and tilde
stable version constraints are supported; prereleases and arbitrary ranges fail.
Compatibility uses Engine version and package-lock versions, not network requests.
Python packages, FFmpeg, browser availability and actual GPU behavior still require
the normal environment/production checks. No dependencies are installed.

## Freeze and verify

Approved registry records also contain implementation SHA-256 maps. Catalog checks
reject drift under an existing approved version even when creating a new film lock.
`implementationFingerprint` is a read-only maintenance helper; it never writes a
record or grants approval. Updating these maps requires the promotion review below.

The film lock embeds the selected profile and capability records, runtime separation,
implementation hashes, relative TypeScript import/export closure, explicitly declared
Node/Python files, package files and generated bindings. It is deterministic and
contains no clock or machine-specific absolute paths. New catalog versions do not
upgrade an existing lock. Changed selected records, source bytes, packages, bindings,
or missing fingerprint coverage fail verification.

All film-local JS/TS sources are checked for relative imports leaving the film tree.
Use generated bindings for engine imports. A necessary host environment adapter can
use `capabilities.importExceptions`, with exact `specifier`, `reason`, and a
project-relative existing `evidence` path. Review exceptions: they are architectural
decisions, not a mechanism to approve experiments. Computed imports are rejected.
This is an engineering guard, not a sandbox or proof that code contains no conceptual
duplication. Asset manifests remain authoritative for licensing and asset bytes.

Capabilities use independent stable versions. Never silently alter an existing
approved version. Preserve versioned implementation paths before changing behavior.
The initial 2.1.0 records describe baseline capabilities; they do not invent historical
per-capability releases. A frozen film can recover its exact source from its Git
revision and asset archive; hashes detect drift rather than reconstruct missing files.

## Promote a successful experiment

Film-local experiment -> candidate record -> focused validation -> additive shared
implementation -> regression checks -> explicit scoped approval -> approved record
and a new approved profile version. Passing tests does not grant artistic approval.

- Record origin, failures, constraints, implementation paths, dependencies, tests,
  immutable evidence and approval reference. Keep failures and superseded records.
- Keep story timing, scene coordinates and one-off material fixes in the film.
- Register candidates as candidate/experimental, never as approved by inference.
- Unit-check forward/reverse/random frame sampling, boundaries, degeneracies and
  transitions. For visible changes use targeted images or a short fixture with
  actual decoded-frame and drawing-buffer checks, not a complete-film rerender.
- Verify Film01/02 protected hashes and compatibility; never redirect their imports.
- Keep old implementations/profile versions recoverable. Upgrading an in-flight
  film requires a new reviewed revision/lock; never edit its existing lock silently.

## Acceptance commands

```powershell
node --test engine/tests/capabilities.test.cjs engine/tests/production.test.cjs
python -B engine/tests/test_audio.py
./node_modules/.bin/tsc --noEmit -p engine/tsconfig.json
```

The capability test suite includes real generated-browser binding type checking,
dependency conflicts/cycles, approval restrictions, package compatibility, immutable
locks, transitive fingerprints, input coverage, import policy and non-overwrite checks.
No full film or browser render is required for these tests.

Existing films without the `capabilities` field retain their previous behavior.
The blank starter requires it. Removing that field manually is a policy violation
for a new film; legacy compatibility cannot determine a film's age automatically.

## Film03 technical inheritance (profile 1.1.0)

New locks select `illustrated-vertical-lowpower@1.1.0`, adding three tested technical
capabilities. Existing 1.0.0 profiles/film locks and approved film source stay frozen.

- `animation.surface-contact@1.0.0`: import `sampleSurfacePress`,
  `lowestOpaquePoint`, `alignContactPlane` and their types from generated
  `./capabilities`. Supply authored global press frames, horizontal cap position,
  travel and phase durations. Use the SAME sampled depression for hand and cap.
  Measure the full RGBA outline, then anchor the upright XY hand plane using its
  actual canvas dimensions and world units per pixel. Keep positive surface and
  desk clearance. This is a front insert technique, not a full 3D hand/IK solver.
- `camera.prop-editorial@1.0.0`: import `propFraming` and `validateDeletionBeat`
  from the generated bindings. Use existing `makeShot`/`sampleShotSequence` for
  dolly in/out. Check the prop AABB at every requested camera frame, plus camera
  path obstacles separately. Author button/release -> object before/after deletion
  -> reaction intervals. Story frames, camera coordinates and DOF remain film-local.
- `production.audio-retiming@1.0.0`: after normal lock verification, Node/Python
  tools may use `production/audio_retime.py` (`engine/` prefix on the host).
  `retime_sfx_cues` changes only explicitly named SFX; `mix_preserved_music` retains
  the music samples and applies a constant SFX gain. Use existing seeded synthesis,
  stems, loudness/true-peak checks and decoded AAC sync validation. No new synthesis,
  music, voice, file export or automatic narration mixing is introduced.

For removal, put the prop, custom shadow cards, dependent lights/effects and
attachments in ONE conditionally mounted subtree. At the deletion frame unmount
that subtree, retaining normal shadow-map refresh. This Film03 pattern is documented
in `knowledge/film03-inheritance.json`; there is no certified general scene-deletion
API or scene-tree inspector. The Office adapter and giant finger stay in Film03.

Checks without rendering:
`node --test engine/tests/film03-inheritance.test.cjs` and
`python -B engine/tests/test_audio_retime.py`, in addition to the acceptance suite.
See `knowledge/film03-publishing-assessment.md` before proposing an engine-only export.
