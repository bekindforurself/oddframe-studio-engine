# Known issues

These are inherited limitations and review risks, not fixes made to existing films.

| Issue | Cause and visible risk | Guidance for future shorts |
| --- | --- | --- |
| Malformed hands | Open, closed and pointing shapes are simplified; extreme targets or prop overlaps can make hands read poorly. | Keep gestures within calibrated reach; review silhouette and contact before accepting close shots. |
| Inconsistent shadows | Painted character shading, environment lights and soft floor contact textures are separate systems; low-power presets disable cast shadows. | Match key direction and tune contact size/opacity per setup; avoid claiming physical shadow consistency. |
| Foot sliding | Anchored gait reduces drift, but eased roots, segment changes, hip reassignment and walk/idle transitions can still alter perceived contact. | Calibrate speed, step span and camera together; inspect transition frames. |
| Wall intersections | Routes do not collide with walls, desks or moving doors; billboards occupy more space than their roots. | Route around desk edges and through open door geometry with sufficient clearance. |
| Simplified poses | Front-facing cutouts and graphical rotations approximate sleeping, rising, yawning and grasping. | Stage for the supported view; avoid promising side/rear anatomy or realistic full-body articulation. |

Additional constraints:

- Only two human identities are included. Expressions are preset names, not a facial blendshape or lip-sync system.
- The arm solver's body bob uses a fixed frequency even if gait step duration changes.
- `GroundedLegs` assumes the existing 3.2 world-height artwork calibration; actor scaling is not propagated into its solver.
- `Contact` uses a fixed floor height. Its texture does not move or rotate with a physical light source.
- `DepthFinish` reconstructs depth using near=0.1 and far=80. Keep `CAMERA_CLIP` consistent or update the shader in a future change.
- Canvas drawing requires a browser DOM and WebGL. These components cannot execute as pure Node server rendering.
- The example is type-checked only. Door clearance, leg transitions, lighting and finish have not been rendered or visually validated here.
- `browser.mjs` is Node JavaScript and is outside TypeScript checking. It locates installed Chrome/Edge using Windows defaults or `ODDFRAME_BROWSER`; it never downloads one.
- The extracted office uses a fixed desk calibration and expects caller-supplied door state. The beach has fewer fine details than the office.
- The existing final film's English narrator remains absent as described in its report. Audio generation, narration and the sleep story are not part of this engine extraction.
