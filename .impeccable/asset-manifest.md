# B+C asset contract

## Produced assets

| Asset | Role | Output | Constraints |
| --- | --- | --- | --- |
| Morning xuan paper | Low-contrast page and corridor material | `packages/client/ui-mind-garden/src/assets/morning-xuan-texture-v2.webp` | Seamless square texture; no ink, writing, stains, border, or lighting baked into the tile. |
| Warm limestone | Station plinth and settings sheet material | `packages/client/ui-mind-garden/src/assets/warm-limestone-texture-v2.webp` | Seamless square texture; no cracks, tiles, focal object, or strong contrast. |
| Pale ash wood | Small stand and rail material | `packages/client/ui-mind-garden/src/assets/pale-ash-wood-texture-v2.webp` | Seamless fine grain; no plank seams, knots, furniture, or dramatic shadow. |
| Porcelain thought token | Check-in station focal cutout | `packages/client/ui-mind-garden/src/assets/porcelain-thought-token-v2.png` | Transparent background, single ivory object, no text/icon/UI chrome or baked drop shadow. |
| Morning photo threshold | Photo Story empty-state focal image | `packages/client/ui-mind-garden/src/assets/photo-story-empty-morning-v2.webp` | Warm xuan paper, pale wood frame, limestone shelf, negative space; no green surface, people, photo, text, or UI. |
| Today courtyard corridor | Today focal spatial scene | `packages/client/ui-mind-garden/src/assets/today-courtyard-corridor-v3.webp` | Warm limestone steps, pale wood folios and restrained brass path; no baked controls, labels, records, or dates. |
| Concern paper lattice | Concerns focal writing scene | `packages/client/ui-mind-garden/src/assets/concern-paper-lattice-v3.webp` | Fresh hanging paper slips and warm light; no user text or interaction state. |
| Memory archive alcove | Memory governance focal scene | `packages/client/ui-mind-garden/src/assets/memory-archive-alcove-v3.webp` | Pale archive wall, porcelain drawers and indigo recess; no invented memories or counts. |
| Growth observation bench | Growth focal scene | `packages/client/ui-mind-garden/src/assets/growth-observation-bench-v3.webp` | Light wood observation bench and journal material; no charts, scores, or baked copy. |
| Philosophy folio room | Philosophy focal scene | `packages/client/ui-mind-garden/src/assets/philosophy-folio-room-v3.webp` | Folios, paper sleeve and indigo alcove; no written principle or label. |
| Photo Story threshold | Photo library focal scene | `packages/client/ui-mind-garden/src/assets/photo-story-threshold-v3.webp` | Warm framed threshold with quiet negative space; no photo content, people, or UI. |
| Life time corridor | Life Review focal scene | `packages/client/ui-mind-garden/src/assets/life-time-corridor-v3.webp` | Warm time corridor, folios and sparse plum branch; no fabricated dates, records, or metrics. |

Each produced file receives a `.prompt.txt` and `.json` provenance sidecar. The exact prompt is also embedded in the image metadata before delivery.

## Directly authored assets

- Five-region navigation, station path, icons, labels, controls, focus states, and responsive behavior remain semantic React/CSS/SVG.
- Morning light and directional shadows remain CSS so they respond to layout and reduced-motion settings.
- The existing Three.js star map remains code and data driven.

## Semantic restrictions

- Produced textures are decorative and receive no accessibility name.
- The porcelain token is decorative beside a real labelled button; it never carries state or content alone.
- No generated image contains navigation, personal records, dates, action labels, or user-entered content.
