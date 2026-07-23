# Child Delight Redesign Brief

## Objective

Transform the private playable demo from a calm household dashboard into a visually exciting participation game that a six-year-old can understand primarily through imagery, movement, position, colour, and spoken instructions.

Preserve the existing modular architecture, quest state machine, gratitude rules, point ledger, contribution evidence, child privacy, and future Supabase boundary.

## Central Experience

The living household shape becomes the game world. The approved Home Dinosaur lives inside it and expresses the household state.

The visual loop is:

`The home needs something -> I join -> We do it -> The dinosaur holds the result -> Someone sends thanks -> Home Energy strengthens the household`

## Bounded Implementation Pass

1. Reorganise Today into `Needs Us`, `Being Done`, `Waiting for Thanks`, and `Finished Today`.
2. Show only the most important two or three quests in the living shape; keep the complete list below.
3. Make member tokens visibly join a quest.
4. Use the curious, encouraging, carrying-energy, sharing-energy, and sleeping poses to communicate state.
5. Derive demo Home Energy from endorsed quests; do not create another persistence system.
6. Make gratitude emotionally meaningful with short optional appreciation phrases.
7. Keep detailed ratios and management controls inside the adult Family view.
8. Respect quiet hours and `prefers-reduced-motion`.

## Visual Standard

- Exciting and tactile for a six-year-old without becoming preschool software.
- Calm, efficient, and Apple-comfortable for adults.
- Varied forest, teal, coral, gold, and blue palette.
- Large illustrated quest tokens and clear player tokens.
- No generic dashboard composition, oversized card stacks, decorative blobs, shame states, or casino effects.
- The dinosaur is functional guidance, not a decorative sticker.

## Acceptance

- A child can identify, join, finish, and understand a quest without depending on text.
- The dinosaur state accurately matches the quest flow.
- Home Energy appears only after endorsement.
- Cooperation is visibly meaningful without becoming competition.
- Reduced-motion and sound-off experiences remain clear.
- Adult controls remain efficient and private details remain hidden from the child.
- Phone and desktop layouts have no overlap or clipping.
- Existing domain, schema-contract, architecture, and production-build checks continue to pass.
