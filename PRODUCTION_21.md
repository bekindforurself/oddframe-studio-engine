# Engine 2.1 production capabilities

No existing film is migrated or rerendered by this release. Version2.1 is an
additive source API over the demonstrated v2 implementation, not an npm package.

| Capability | API/tool | Proven origin and boundary |
| --- | --- | --- |
| Global scene/event clocks | `v2_1/timing.ts` | Film02 retiming adapter; half-open intervals, validated coverage, sample clock |
| Camera shots/cuts/blends | `v2_1/cameras.ts` | Existing v2 tracking/dolly/fly/crash/whip/orbit/OTS/reveal; explicit optional blend |
| Movement/performance | `v2_1/characters.tsx` | Reexports v2 anchored locomotion and connected performance; no replacement solver |
| Illustrated actor integration | `IllustratedActor` | Review05 emission/contact texture and Film02 leg/shirt ordering, opt-in at calibrated scale1 |
| Lighting/atmosphere | `ProductionAtmosphere` | Existing local HDR light rig and Film02 fog/background values, no new heavy effects |
| Actual drawing-buffer evidence | `DrawingBufferProbe` | Film02 runtime metrics, generalized log prefix |
| Render/recovery | `production/render.mjs` | Existing browser, single worker, source dimensions, global segments, input fingerprints and active leases |
| Original SFX/instrumental kernels | `production/audio.py` | Film02 envelope/oscillator/filter/PCM/headroom math; no hardcoded film timeline or melody |
| Authored cue mixing | `production/audio_cli.py` | Integer-frame cues, seeded stereo buses, separate stems, conservative constant gain |
| Media validation | `production/validate.py` | Scene/full decode, metadata, allowed black intervals, loudness and actual buffer evidence |
| Blank production starter | `templates/film-starter` | Empty metadata/refs/events and unregistered renderer factory; no invented story |

## Host usage

Use commands in the starter README from the production host root. An approved
native export needs explicit human approval and the tool's `--final --approved-final`
flags. Flags alone do not establish approval. Segments use `--scene=id`, preserving
global frames. Review previews at actual 540x960 internal/output size. New native
exports are 1080x1920/DPR1. Render leases and matching input hashes protect against
duplicated work; an existing unverified/changed output is never overwritten.

The source library publishes without film/public/out files. A consuming project
supplies registered compositions, installed dependencies, local HDR/models and
license records. Scene definitions/reference IDs are authored by the film; no
asset service, decoder download, auto-story generator or narration is introduced.

## Targeted checks

In host: `npx tsc --noEmit -p engine/tsconfig.json`,
`node --test engine/tests/production.test.cjs`, `python engine/tests/test_audio.py`.
In standalone engine checkout: `npm run check`, `npm test`, `python tests/test_audio.py`.
Python dependencies (NumPy, SciPy; Pillow only for host review tools) and FFmpeg/
ffprobe are supplied by the current machine, not installed by engine scripts.

`tests/browser-fixture.tsx` is a one-second technical test, not a new film or story.
Its local host configuration deliberately points at `engine/tests/...`; when using
it from an engine-only checkout, prefix source paths with the installed engine
directory in your consuming host, or adjust entryPoint/fingerprintInputs. The
fixture does not register itself in the production Root. Unit tests run standalone.

## Remaining boundaries

- Camera interpolation does not avoid obstacles. Validate both shot paths and
  newly authored blends; billboards need silhouette clearance beyond a root point.
- Character integration is front-facing and scale1; support for full side/rear
  anatomy, scaled projected gait, realistic gripping and full 3D running is absent.
- HDR reflections do not mirror the city; shadows and contact planes are artistic
  approximations. The prehistoric atmosphere option is a configuration, not a new
  environment asset. Existing world components remain film-host modules.
- The generic validator measures clipping/loudness and decoding, not semantic
  Foley correctness or artistic approval. Review event frames and listen on the
  target setup. Synthetic audio is not recorded orchestral/Foley performance.
- Fingerprint dependencies are explicit, not automatically discovered. Include
  transitive source, all assets/sidecars, tools and lockfile before production.
- Rendering checkpoints are reusable only when metadata and input hashes match;
  perform full media validation before delivery. A live or ambiguous PID is never
  killed automatically. Partial files require inspection/new revision.
- Reuse requires the media validator's SHA-bound `.validated.json` receipt, not
  metadata alone. A successful browser export can still contain black frames.
- Keep one worker on i5/8GB/Intel HD. Bounded-memory validation decodes grayscale
  frames one at a time. Audio uses two stereo float32 buses (about38MB for49sec),
  plus synthesis/measurement buffers; do not run parallel full-film jobs.
