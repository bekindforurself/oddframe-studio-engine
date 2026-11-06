# Extraction provenance

The engine scaffold existed at the start of this task. This task retains those source snapshots and adapters rather than replacing working film code. This map identifies the working originals and intentional separation; it is not a claim that every extracted file is byte-identical.

| Engine module | Existing working source | Extraction boundary |
| --- | --- | --- |
| `characters/Human.tsx`, `humanArt.ts`, `Billboard.tsx` | `src/oddframe/sleep-short01/` corresponding files | Local type/math imports; established human artwork and rendering approach retained. |
| `characters/expressions.ts` | Emotion and Gesture unions in `sleep-short01/humanArt.ts` | Named supported expression/pose lists. |
| `animation/rig.ts` | Arm targets, arm solver and `rig` in `sleep-final01/timeline.ts` | Exported as `buildHumanRig`; no film timeline or actor scheduling. |
| `animation/walk.ts` | `gait` and path/anchor logic in `sleep-final01/timeline.ts` | Caller supplies route and step span; finite-key validation added in scaffold. |
| `animation/GroundedLegs.tsx` | `sleep-final01/Legs.tsx` | Actor and world feet supplied by caller instead of story lookup. |
| `environments/Office.tsx`, `Materials.tsx`, `Exterior.tsx` | `sleep-cinematic-test01/` corresponding files | Engine-local imports, fixed approved desk calibration and explicit door state. |
| `environments/Beach.tsx`, `Contact.tsx` | Beach, helpers and Contact in `sleep-short01/World.tsx` | Selected reusable set components separated from story world. |
| `lighting/CinematicLighting.tsx` | Light setups in `sleep-cinematic-polish02/Polish02.tsx` and `sleep-final01/Final01.tsx` | Reusable day/night wrapper, no scene selection. |
| `cameras/CameraRig.tsx` | Camera application in `sleep-final01/Final01.tsx` and eased travel in its `timeline.ts` | Generic shot state/travel sampler; story cuts omitted. |
| `rendering/DepthFinish.tsx` | `sleep-cinematic-test01/Finish.tsx` | Explicit focus positions and shot size instead of film actor timeline. |
| `rendering/presets.ts`, `browser.mjs` | Existing canvas settings and `scripts/render-sleep-final01.mjs` | Format/low-power defaults, installed-browser lookup and bounded shutdown; no executable render workflow. |
| `math.ts` | Timeline easing and interpolation helpers | Shared types and pure functions without story imports. |

Narration, music, sound effects, story timing, film-specific props and composition registrations remain in the original project. No existing film is redirected to this engine.
