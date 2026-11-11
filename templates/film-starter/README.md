# Unconfigured film starter (no Film 03 created)

For a new authorized story, copy only production.json to a new film directory.
Run `node engine/production/capabilities.mjs init --config=path/production.json`
from the project root. This generates capabilities.lock.json, capabilities.ts and
FilmFactory.tsx without overwriting files. Merge the printed capability fingerprint
inputs with your film inputs, then run the capabilities CLI verify command.
Use generated FilmFactory.tsx, not a relocated copy of Composition.tsx.
See engine/capabilities/WORKFLOW.md for the required lock and promotion policy.

The original Composition.tsx remains a backwards-compatible factory source. Supply your own identity,
title, scene intervals, references and event definitions. `status: draft`, empty
scenes and zero frames deliberately prevent rendering. No plot or cast is chosen.

`createFilmComponent` accepts a timeline and scene-renderer registry. Register the
returned component in the consuming project's Remotion Root only after configuring
it. The initializer adapts its timing/metrics imports to the locked browser bindings.
Pass **global frame** to characters, moving assets, cameras and effects; localFrame
is available for deliberate scene-local choreography. Supply scene renderers that
reuse engine/v2_1 or existing approved environments. Scene reference IDs are resolved
by your renderer registry; they do not trigger implicit asset downloads.

Camera references point to `makeShot`/`sampleShotSequence` configurations. Character
references point to existing illustrated identities; environment references point
to authored components and licensed asset manifests. `timelineEvents` are arbitrary
story actions keyed by integer frame, and `audioCues` contain `id`, `frame`, `bus`
(`sfx` or `music`), `effect`, `durationFrames`, `gain`, optional `pan`, `frequency`
and `notes` (MIDI note numbers for an original instrumental chord).

From the host project root:

```powershell
node engine/production/render.mjs --config=path/production.json --plan
node engine/production/render.mjs --config=path/production.json --out=out/new-preview
node engine/production/render.mjs --config=path/production.json --scene=scene-id --out=out/new-segment
python engine/production/audio_cli.py --config=path/production.json --out=out/new-audio
python engine/production/validate.py --config=path/production.json --video=out/new-preview/picture.mp4 --mode=preview --audio=silent --out=out/new-check
# Only after explicit human approval:
node engine/production/render.mjs --config=path/production.json --final --approved-final --out=out/new-final
```

Validate the render before attempting checkpoint reuse. The validator emits a
SHA-bound `.validated.json` receipt beside the video; metadata alone is insufficient.
Mux with `python engine/production/mux.py --video=path/picture.mp4 --audio=path/music-and-sfx.wav --out=path/new-sound-version.mp4`.

List all transitive source files, assets, render tools and package-lock.json in
`fingerprintInputs`. Same fingerprint + valid completed media is reused. Changed,
partial or unverified output is preserved and requires a new revision. Live render
leases prevent duplicate rendering. Scene rendering uses original global ranges.
The generic tool does not silently join segments or normalize unrelated codecs.
Validate each segment with `--scene=scene-id`; verify a full assembled export too.

The factory sets the actual ThreeCanvas DPR. An older composition may not expose
qualityScale: inspect it before using the generic renderer. Output dimensions alone
do not prove a native internal buffer. Use Film02's completed native evidence as
the model for production measurements.
