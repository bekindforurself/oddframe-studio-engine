# Animation rules

## Frame-driven motion

All story motion must derive from the supplied frame, not wall-clock time, randomness or accumulated simulation. The baseline is 30 fps. Rig blending currently spans 18 frames; breathing and arm bob also use fixed frame frequencies. Changing fps needs deliberate retiming of these constants.

Build an `ActorProps` state with identity, frame, position, emotion and pose. Set `fromPose` and `poseAge` when transitioning, then assign `buildHumanRig(actor)`. Arm lengths are 146 and 142 artwork units; targets clamp to the solver's reachable range. Keep the same shoulder anchors and rounded hand styles. The solver supplies pose targets, not full-body motion capture or grasp physics.

## Walking and grounding

Provide `sampleWalk` at least two finite `[frame, x, z]` keys in strictly increasing time order. Frames and step duration must be finite, and step duration must be at least one frame. The default step span is 10 frames; the original worker gait used 8. Routes are caller-owned and sampled with eased segments.

Use the returned root position for the actor and returned feet for `GroundedLegs`. Select `walk` while moving, build the rig, and render separate legs only when `rig.separateLegs` is true. Rendering the built-in painted legs and separate legs simultaneously creates duplicates.

Feet remain in world coordinates during stance; each swing lifts and eases toward its next anchor. The leg solver projects these anchors into camera-facing artwork. It reduces sliding but does not guarantee anatomical proportions or perfect contact for every route, scale or camera. Keep default scale for the extracted gait until a new scale is calibrated. Stationary duplicate route segments still fall inside the moving time interval; split walking and idle beats explicitly.

Plan routes around furniture and through real door openings. Exit beside the desk before approaching the door. There is no collision detection, navigation mesh or automatic door timing. Account for the full billboard width, hand reach and door sweep, not just the actor root.

## Cameras, poses and staging

Place `CameraRig` before billboard actors and projected legs so they use the current camera matrices. Supply explicit shot boundaries, camera position, look target and field of view. `sampleCameraShot` eases optional translation; the short owns cuts and shot selection.

The rigs face the camera. Sleeping, leaning and rising use staged graphical rotations and positions, not volumetric articulated bodies. Keep face, pillow, hand and bed relationships readable from the chosen camera. Do not assume a pose works from every view.

Use `Contact` near each grounded actor and tune its size for the shot. It currently lies at fixed world y=0.065 and ignores `p[1]`; raised platforms need a future explicit adapter. Do not use floor contacts as floating character shadows.

## Review for future work

When visual review is authorized on a future short, inspect stance/swing boundaries, cuts, doorway crossings, pose changes, prop contact and wake/sleep transitions. TypeScript proves type compatibility only. This extraction task authorizes no still or video rendering, so no new visual verification is claimed.
