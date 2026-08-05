# Gesture Synth Auto-Start Design QA

## Scope

- Reference: auto-start desktop concept generated for this implementation pass.
- Implementation capture: live local homepage at the desktop stage size below.
- Comparison: the reference and privacy-safe implementation capture were reviewed side by side in one image input.
- Camera imagery was hidden only for the QA capture. The production preview remains live.

## Results

- P0: none.
- P1: none. The homepage requests the camera automatically, shows the live preview before hand tracking finishes, and never creates Web Audio until the centered play button or recording action.
- P2: none. A light centered start overlay keeps the live camera surface visible, opens the browser sound gate with one explicit action, and leaves the established stage ratio unchanged.
- Desktop: the 1208 x 690 stage keeps the edge-control hierarchy after the start overlay fades away.
- Mobile: at a true 390 x 844 CSS viewport, the 339 x 430 stage has no control overflow and no pairwise control intersections.
- Accessibility: controls retain explicit labels, disabled states, and alert semantics.
- Privacy: camera and hand tracking remain local; microphone access is requested only for recording.

final result: passed
