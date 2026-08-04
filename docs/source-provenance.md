# Source Provenance

## Original application

- Repository: https://github.com/ericwei97-cloud/gesture-synth
- Local source reviewed on: 2026-08-05
- Source package license field: `ISC`
- Migrated surface: gesture classification, chord mapping, three oscillator voices, camera/landmark drawing, energy waveform, volume meter, and help content.

## Authorization record

On 2026-08-05, the project owner provided the following implementation constraint:

> The author has explicitly allowed deployment without attribution and public deployment; this premise must have authorization proof that can be saved, while third-party dependency licenses remain in the project record.

This file records the project owner's representation. It is not a substitute for the original author's external message, email, agreement, or other primary evidence. Keep that primary evidence with the project records before public launch.

## Migration policy

The original repository is not nested in this project and no second build system or iframe is retained. The relevant behavior is migrated into React and TypeScript modules in `src/components/gesture-synth/`.
