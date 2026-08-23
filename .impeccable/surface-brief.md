# Mind Garden workspace redesign

## Scope and mode

- Target: `packages/client/ui-mind-garden/src/client/MindGardenView.tsx` and all plugin-owned garden surfaces.
- Mode: Operate with one bounded experiential focal surface per route.
- Approved composition: `.impeccable/mocks/today-b-paper-corridor.png`, fused with the navigation and quick-action hierarchy in `.impeccable/mocks/today-c-light-courtyard.png`.
- Audience job: feel received, understand what is available, and complete a private reflection action without losing provenance, consent, or control.

## Functional preservation map

| New region | Existing destinations retained | Default destination |
| --- | --- | --- |
| 此刻 | 今天 | 今天 |
| 心绪 | 心事篮、生活议题 | 心事篮 |
| 时光 | 日历、人生回望 | 日历 |
| 珍藏 | 照片故事、我的记忆 | 照片故事 |
| 星庭 | 我的星图、我的哲学 | 我的星图 |

Every existing destination remains a semantic button and a persisted `MindGardenSpace`. Grouping changes only the navigation topology. Settings, encrypted backup, authenticated restore, migration, key rotation, all confirmation gates, record history, edit/delete actions, and explicit composer handoff remain intact.

## Selected direction

The workspace is a fresh, warm New Chinese “晨光造物室”. A slim five-region top navigation replaces the dark nine-item rail. Today combines a calm practical entry with a diagonal paper-and-stone corridor: check-in, an open question, and a saved reflection become three clearly labeled stations connected by a restrained brass path. Selecting a station reveals semantic details and the real action; the spatial layer never replaces the forms below it.

The dominant move is the paper corridor. C's full architectural light well is not literalized as a photographic room; its morning-light direction, top navigation, and clear quick-action column are carried into the practical interface.

## Layout and interaction

- Desktop: full-width top navigation; Today uses a 36/64 practical-entry and spatial-corridor split, followed immediately by full check-in, journal, question, and review tools.
- Compact desktop/tablet: five region controls remain visible; active region destinations appear on a second row; Today stacks into intro, corridor, and forms.
- Mobile: five fixed-width region controls fit without horizontal scrolling; the active region's one or two destinations stay directly below; spatial stations become a vertical path with a stable details panel.
- One primary action per focal context. Secondary, destructive, history, and composer-handoff actions stay visibly named.
- Settings becomes a right-side control drawer on wide screens and a full-width sheet on compact screens, with existing focus trap and focus return preserved.

## Component and material inventory

| Ingredient | Medium | Commitment |
| --- | --- | --- |
| Five-region navigation | Semantic React buttons + existing authored SVG icon family | All five regions visible; selected region and exact subspace are separately indicated. |
| Today intro and quick actions | Semantic HTML/CSS | One heading, one prompt, direct anchors to full check-in, journal, question, and review tools. |
| Paper corridor topology | Semantic HTML + CSS 3D transforms + SVG brass path | Three truthful stations; no fabricated activity or score. |
| Paper and stone material | Produced raster textures composed by CSS | Texture remains visible at final opacity and responsive crop. |
| Porcelain check-in token | Produced transparent raster cutout + CSS transform; SVG icon remains code | No baked UI text, border, shadow, or interaction state. |
| Station labels and details | Semantic buttons, headings, status text, and links | Keyboard-selectable; color and position are never the only state. |
| Morning light and shadows | CSS lighting fields over produced textures | Directional offset shadows, no decorative glow or glass blur. |
| Routine forms and records | Semantic HTML/CSS using shared inherited tokens | Warm open planes, 12–16px type, restrained borders, no nested card wall. |
| Constellation and Photo Story | Existing Three.js/particle implementation, recolored and re-framed | Preserve all controls, fallbacks, bounded rendering, and reduced motion. |

## Sampled comp palette

- Main warm ground: `#F9EFE3`.
- Navigation paper: `#F8F0E5`.
- Limestone field: `#E1CFB5`.
- Light detail sheet: `#E6E3DD`.
- Indigo action field: `#445C7C`.
- Muted plum record signal: `#94655D`.
- Deep ink is implemented as `#352E29` to preserve readable contrast over the sampled light fields.
- Semantic confirmation green remains bounded to `#71806E` and never owns a large surface.

## States and boundaries

- Preserve loading, empty, error, retry, disabled, pending, confirmation, conflict recovery, migration preview, restore receipt, WebGL fallback, and reduced-motion states.
- Do not invent personal records for density. Existing fixture copy is illustrative only in screenshots and tests.
- Do not rasterize navigation, labels, controls, dates, user records, or personal content.
- Do not weaken any of the nine destination workflows while combining their top-level entry points.
