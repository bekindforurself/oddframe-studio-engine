# OddFrame visual identity

## Characters

Use original expressive 2D human artwork inside cinematic 3D sets. The reusable baseline is the approved sleep-film human system, with `worker` and `sleeper` identities. Earlier geometric characters and the young-adult showcase remain separate preserved systems; their designs are not silently merged into this API.

Preserve the rounded silhouette, readable facial expressions, consistent head/body proportions and restrained clothing details. The drawing canvas is 700 × 1100; default world height is 3.2, with sole reference at artwork y=1040. Keep the same calibration across body, arms and legs. Avoid stretching the texture to change a pose.

Use dark ink `#201F23`, warm skin `#F2C9A5`, cream `#EBDCC1`, teal `#5A9388` and trousers `#354351` as baseline artwork colors. Preserve thinner lit contours and thicker shadow-side contours. `Human` adjusts ink to the camera; avoid adding a uniform expanded sticker border or independently thickening limbs.

Expressions must read through brows, eyes, mouth and body gesture. Available emotions are tired, hopeful, happy, asleep, yawn, angry, confused, shocked and relaxed. Prefer clear held expressions over continuous exaggerated motion. Existing hands are simplified rounded shapes; their limitations are documented in KNOWN_ISSUES.

## Environments and light

Use dimensional sets with layered foreground, subject and background, tactile rough materials and small believable props. Reuse the office's wood, plaster, glass and metal treatment. The beach is a simpler warm environment; match its palette rather than treating it as equally detailed scenery.

Maintain warm/cool contrast: warm practical lamps and skin against cooler blue exterior/night fill; day scenes use warm sun and pale sky fill. `CinematicLighting` provides starting values, while the office contains its own practical lamp. Balance both when staging a new scene.

Characters use unlit billboard materials and painted shading. Environment lighting does not relight their skin automatically. Use soft contact shadows to ground feet and furniture; keep shadow direction, softness and density coherent with the apparent key light. Current contact planes are approximations, not physically cast shadows.

## Cinematic framing

Default delivery coordinates are portrait 1080 × 1920 at 30 fps. Compose natural medium and wide views with readable faces, breathing room and room geography. Existing shots often use roughly 40–46 degree vertical field of view; treat that as a reference, not a universal constraint.

Use restrained eased camera travel and motivated cuts. Keep doors, walls, desks, pillows and props from hiding faces or contradicting movement. Preserve silhouettes during gestures. Focus blur should be subtle and protect the actor plane; never obscure acting to disguise pose or collision problems.

Future shorts own story, pacing, sound and shot choices. The engine establishes visual continuity; it does not require copying the sleep story or its narration.
