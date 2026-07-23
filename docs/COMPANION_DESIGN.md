# Home Dinosaur Design Contract

## Identity

The household companion is an original young triceratops. Its visual direction is a polished stylized 3D game character: emerald and teal body, cream belly and horns, coral, gold, and blue geometric frill accents, teal spots, and large expressive eyes.

The child may eventually name and customise the companion. `Home Dinosaur` is the internal product name until then.

## Personality

- Curious
- Warm
- Sturdy
- Patient
- Quietly mischievous
- Delighted by cooperation
- Peaceful during evening review

The companion never displays hunger, illness, neglect, fear, shame, or disappointment in response to unfinished work.

## Pose Mapping

| Household state | Asset |
| --- | --- |
| Resting | `/companion/home-dinosaur-neutral-v1.png` |
| Something needs us | `/companion/home-dinosaur-curious-v1.png` |
| Someone joined | `/companion/home-dinosaur-encouraging-v1.png` |
| Working together or celebrated | `/companion/home-dinosaur-celebrating-v1.png` |
| Waiting for thanks | `/companion/home-dinosaur-carrying-energy-v1.png` |
| Appreciation entering the home | `/companion/home-dinosaur-sharing-energy-v1.png` |
| Quiet hours or evening | `/companion/home-dinosaur-sleeping-v1.png` |
| Gratitude close-up | `/companion/home-dinosaur-gratitude-closeup-v1.png` |

The complete transparent reference sheet and chroma-key source files are retained under `design/companion/` and must never be loaded by the app. Only the individual pose assets under `apps/web/public/companion/` belong in the running interface.

## Interaction Rules

1. The companion reflects household state, not an individual score.
2. Home Energy appears only after endorsement.
3. Cooperation may produce a stronger celebration than solo completion, but personal appreciation remains equal for every participant.
4. Motion must be short, purposeful, and replaceable with a static state under `prefers-reduced-motion`.
5. The companion may look toward a quest but must not obstruct quest labels, member tokens, or controls.
6. Sound is optional and must respect quiet hours.
7. The same approved character design must be used across future poses and media.

## Future, Not This Pass

Future household milestones may add habitat objects, seasonal details, blankets, plants, lights, or small treasures. Do not add a cosmetic store, inventory economy, or companion-care obligation before the real household beta.
