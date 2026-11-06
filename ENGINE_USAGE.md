# Engine usage

## Within this project

Import reusable modules from `engine/index.ts`. Existing compositions remain registered in `src/Root.tsx` and retain their original code paths. Do not migrate approved films merely to adopt the engine.

The host already supplies React, Three, React Three Fiber, Remotion and `@remotion/three`. No dependency installation is needed. The engine has no imports from the film directories and uses procedural textures rather than downloaded assets.

See [examples/FutureShort.tsx](examples/FutureShort.tsx) for a complete six-second component combining an office, lighting, frame-driven camera, actor rig, world-anchored walk, contact shadow and depth finish. It imports the public engine API and deliberately has no registration or effect on current films.

```tsx
import {Human, buildHumanRig, sampleWalk} from '../../engine';
import type {ActorProps, WalkKey} from '../../engine';

const route: WalkKey[] = [[0, 1, 0.9], [120, 1.4, 0.9]];
const walk = sampleWalk(route, frame);
const actor: ActorProps = {
  id: 'sleeper', frame, position: walk.root,
  emotion: 'happy', pose: walk.moving ? 'walk' : 'idle',
};
actor.rig = buildHumanRig(actor);
// Inside ThreeCanvas, after CameraRig:
// render GroundedLegs with walk.feet when actor.rig.separateLegs;
// render <Human {...actor} /> and a matching Contact.
```

`frame` in this fragment comes from the future short's `useCurrentFrame()`. The complete example supplies its canvas and camera. `Office` owns a `MaterialLibrary`; wrap standalone `Block`/`Exterior` usage in `MaterialLibrary`. The beach supplies its own procedural materials.

## Public modules

| Area | API and responsibility |
| --- | --- |
| Characters | `Human`, `Billboard`, `drawHuman`, `drawRigLeg`; artwork dimensions, actor and rig types; emotion and pose lists. |
| Animation | `buildHumanRig`, `sampleWalk`, `GroundedLegs`; caller owns actor state and route keys. |
| Environments | `Office`, `OFFICE_DESK_TOP`, `Beach`, `Exterior`, `Contact`, `MaterialLibrary`, `Block`, `GlowPatch`. |
| Lighting | `CinematicLighting` with `night` or `day` mode; office practical lighting remains in the set. |
| Cameras | `CameraRig`, `sampleCameraShot`, `CameraShot`, `CameraState`; no story-specific shot list. |
| Rendering | `DepthFinish`, `SHORT_FORMAT`, `LOW_POWER_CANVAS`, `PREVIEW_RENDER`, `CAMERA_CLIP`. |
| Math | `V3`, `ease`, `clamp`, `mix`, `mix3`. |

Import Node-only helpers directly from `engine/rendering/browser.mjs` in a future render script: `installedBrowser`, `closeBrowser`, `chromiumOptions`. They are intentionally absent from the browser entry point. Importing them does not launch a browser; the caller owns any rendering operation.

## Validation only

From the project root, use the already installed compiler:

```powershell
.\node_modules\.bin\tsc.cmd --noEmit
.\node_modules\.bin\tsc.cmd --noEmit -p engine/tsconfig.json
```

The root configuration covers existing `src/` files. The engine configuration additionally includes all engine TypeScript and the example. Neither emits files, starts Studio, renders, downloads a browser or checks JavaScript browser helpers. No automated visual or runtime guarantees follow from type checking.
