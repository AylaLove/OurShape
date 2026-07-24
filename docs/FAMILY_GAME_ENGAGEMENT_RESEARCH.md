# Family Participation Game: Engagement Research and Redesign Direction

Date: 2026-07-23

## Executive Verdict

The prototype has a stronger product foundation than its current appearance suggests.
It already contains the difficult practical rules:

- family members can join the same quest;
- completing work and receiving thanks are separate events;
- another person must confirm the effort;
- points are awarded once and can be spent on rewards;
- contribution can be reviewed without exposing a child to a blame score;
- the Home Dinosaur has eight states tied to real household events;
- Home Energy is derived from verified help rather than invented clicks.

The main weakness is presentation. The app explains these systems with headings, labels,
metadata, counters, and stacked lists. It makes the child read the game instead of feel it.
The triangle, quest board, dinosaur, Home Energy, points, gratitude, and history are all
presented at once, so none of them becomes the emotional centre.

The next design goal is therefore not "add more gamification." It is:

> Turn one real act of household participation into one clear visual story.

The living household shape should be the game world. The dinosaur should be the guide,
witness, and carrier of the household's energy. Gratitude should be the climax. Text lists
should become secondary adult tools rather than the child's main experience.

## What The Current Prototype Gets Right

### Product meaning

The game rewards participation, cooperation, and recognition rather than obedience or
competition. Shared quests give each helper the full appreciation reward. Contribution
evidence can still be divided fairly behind the scenes. This is unusually thoughtful and
worth protecting.

### Practical family logic

The state sequence is sound:

`Needs doing -> Join -> Do -> Waiting for thanks -> Endorsed -> Gratitude + points`

This is more meaningful than an ordinary chore checkbox because the work is not complete
socially until another person sees it.

### Child safety

Adult balance information is separated from the child's view. Person-provided rewards
remain requests rather than debts. Intimacy is not treated as something that can be bought.
These decisions should remain architectural rules.

### Technical direction

The app is modular, the domain rules are tested, the Supabase boundary is prepared, and
the dinosaur state is derived from real app state. We do not need to discard the product
logic to make the experience better.

## Where The Experience Currently Breaks

### 1. The child sees a dashboard before seeing a game

The first screen contains date, household name, learner selection, alerts, a demo notice,
welcome copy, the triangle, quest nodes, dinosaur, Home Energy, a full four-stage quest
board, and navigation. This is useful information, but too many things ask for attention.

### 2. The triangle and the list repeat the same question

Both attempt to answer "what needs doing?" The triangle should be the visual answer. The
full list should be available through a drawer, swipe, or adult view.

### 3. Quest positions imply relationships that are not true

Fixed quest dots can appear to belong to the nearby person even when the underlying quest
does not. Position must have a stable meaning:

- personal quest: near that member's vertex;
- two-person quest: on the relevant edge;
- whole-family quest: in the centre;
- open household quest: in a neutral shared orbit until someone joins.

### 4. The dinosaur reacts, but does not yet change the world

The app has eight useful poses, but most reactions are brief image swaps. The child can
ignore them without losing any information. The dinosaur needs persistent cause and effect:
it notices a need, joins the action, carries completed energy, waits for thanks, and places
the energy into the home.

### 5. Home Energy is a number instead of a visible consequence

Verified help should light a window, grow a plant, reveal a constellation point, warm the
nest, or unlock a small discovery. A number alone cannot carry the emotional meaning.

### 6. Gratitude is operational rather than climactic

"Waiting for thanks" is currently another stage in a list. It should be the moment when
the effort becomes visible: the dinosaur carries the finished energy to another family
member, the member acknowledges it, and that energy enters the shared home.

### 7. The child is still required to read too much

Quest kind, state, points, participant names, stage headings, explanatory copy, and
navigation labels compete with the icon. Spoken instructions exist, but the interface is
not yet designed so audio and imagery can genuinely replace reading.

## Benchmark Lessons

| Product | What it does especially well | What to borrow | What to avoid |
| --- | --- | --- | --- |
| Joon | Connects real tasks to caring for a virtual pet; parents approve completed quests | Make the companion depend visibly on real household participation | Letting pet maintenance become a separate game unrelated to family meaning |
| Finch | Gives small actions immediate energy, adventures, discoveries, customization, and gentle encouragement | Persistent companion growth, discoveries, and emotional warmth | Feature accumulation that obscures the primary daily action |
| Nipto | Clear shared chore tracking, approval, customizable values, and family rewards | Fast practical setup and trustworthy approval | Leaderboards or competition that turn family contribution into winning |
| S'moresUp | Supports collaborative chores, approval, rewards, and family communication | Explicit cooperation and flexible household rules | Adult administration spreading into the child's main screen |
| Sweepy | Makes household work concise and scannable | A simple adult list and lightweight task values | Treating the child experience as a scored checklist |
| Habitica | Makes actions visibly affect a world, character, inventory, and party | A strong sense that real action changes the game world | Punishment, complex currencies, and fantasy systems detached from household care |
| Insight Timer | Uses calm milestones, cumulative progress, reflection, and a personal archive | Cumulative milestones and gentle remembering without streak shame | Dense discovery surfaces and too many competing destinations |
| Duolingo | Excellent micro-feedback, visual hierarchy, friend goals, and clear next action | One obvious next action and immediate feedback | Coercive streak pressure, urgency traps, and excessive celebration |

## Product Principles

1. **One screen, one meaningful decision.**  
   The child should immediately know what the home needs and what they can do.

2. **Every real action visibly changes the home.**  
   Work should create light, warmth, growth, music, or another persistent shared change.

3. **The dinosaur is an actor, not a sticker.**  
   Its pose and location should explain the current state even when all text is hidden.

4. **Gratitude completes the loop.**  
   Marking work done creates pending energy. Another person's thanks releases it.

5. **Reveal complexity only when needed.**  
   Scheduling, recurrence, capacity, history, settings, and detailed finance-like evidence
   belong in adult layers.

6. **Teamwork must feel better than solo optimization.**  
   Joining together should create a unique animation, sound, discovery, or team memory.

7. **Use encouragement without coercion.**  
   Combine consecutive and cumulative milestones. Never punish a child for a broken streak.

8. **Progress should be remembered, not merely counted.**  
   A visible daily memory, home change, or dinosaur discovery is stronger than another
   statistic.

9. **The practical truth remains underneath the magic.**  
   Every visual event must still correspond to a valid quest, participant, completion,
   endorsement, point entry, or contribution record.

10. **Adults and children can share a world without sharing an interface.**  
    The child sees invitation and consequence. Adults can open the detailed list, fairness
    view, recurrence, and corrections.

## Redesigned Daily Loop

### 1. Opening: the home has a need

The first viewport is the living household habitat. The dinosaur is asleep when the home
is settled, curious when a need is waiting, and gently alert for an urgent need. One quest
is prominent. Two or three other quests can appear as smaller tokens.

The child does not begin with the complete list.

### 2. Choose a quest

Tapping the prominent visual opens one action scene:

- large quest illustration or icon;
- one spoken instruction button;
- family member tokens;
- one clear `Join` action.

Written detail can remain available, but it is not the primary path.

### 3. Join

The active person's token travels to the quest. The household geometry changes to show the
connection. The dinosaur changes from curious to ready or encouraging.

If another person joins, the relevant edge lights and a distinct teamwork reaction occurs.

### 4. Do the work

The screen becomes a simple work state. It may show the quest icon, participants, optional
timer, and spoken reminder. Avoid unrelated navigation and metadata.

### 5. Mark it done

The learner holds one large control. The completed work becomes an energy object that moves
to the dinosaur. The app clearly says, visually and briefly, that points are not awarded
until someone sends thanks.

### 6. Wait for recognition

The dinosaur persistently carries the energy. The relevant non-participant receives a
simple invitation: `Sage helped. Send thanks?`

### 7. Send thanks

The endorser can choose a short phrase, icon, voice note later, or simple high five. The
energy travels from the dinosaur into the shared home. Only now are points and contribution
evidence awarded.

### 8. Remember the day

The home keeps a small visual trace: a light, leaf, star, tile, musical note, or nest object.
The evening view can replay the day's contributions as gratitude rather than as an audit.

### 9. Tease tomorrow gently

At most one optional preview appears: `One thing is waiting for tomorrow.` No countdown
pressure and no broken-streak punishment.

## Recommended Home Screen

### Child view

- household name and one small active profile token;
- living household habitat as the dominant first viewport;
- one prominent `Needs us now` quest;
- two or three smaller quest tokens;
- dinosaur in a persistent, truthful state;
- Home Energy shown as part of the environment;
- a gesture or button to reveal all quests;
- three destinations at most: `Home`, `Thanks`, `Treasure`.

### Adult view

- the same shared habitat;
- fast access to the complete list;
- add, reschedule, assign, correct, and recurrence tools;
- private capacity and seven-day balance;
- settings and child-device controls.

The demo banner and profile selector should not occupy the child's ordinary first screen.
Profile switching can sit behind the member token or a parent gate.

## Dinosaur State Machine

| State | Trigger | What the child should understand |
| --- | --- | --- |
| Sleeping | Quiet hours or no immediate need | The home is resting |
| Resting | Normal settled state | We are okay |
| Curious | An open or urgent need exists | Something needs attention |
| Inviting | A quest is selected but no one has joined | Come help |
| Ready | One person joins | We are about to do it |
| Teamwork | Two or more people join | We are doing this together |
| Carrying energy | Work is marked done | The effort is waiting to be seen |
| Sharing energy | Another person sends thanks | The effort is entering the home |
| Celebrating | Verification and points succeed | The home changed because we helped |

The state should persist until its cause changes. Short animation can emphasize a transition,
but must not be the only explanation.

## Progression And Economy

### Personal points

Keep one spendable currency per person:

- `Watch Points` for the child;
- `Chill Points` or another chosen label for adults.

Rewards deduct points through the immutable ledger. Person-provided rewards remain requests
that can be accepted or declined freely.

### Shared Home Energy

Home Energy is not spendable. It represents verified care entering the household. It should
unlock shared environmental changes such as:

- a brighter nest;
- a new plant or constellation point;
- a small dinosaur discovery;
- a household song or sound;
- a memory object from a teamwork quest.

### Milestones

Use both cumulative and consecutive forms:

- `We helped together three times` is cumulative and never lost;
- `We cared for home three days in a row` is a gentle optional observation.

No one loses a pet, level, or earned object because a day was difficult.

## Prioritized Build Batches

### Batch 1: Child-first home

**Goal:** one obvious next action.

- Make the habitat the first viewport.
- Show one prominent quest and only a few secondary tokens.
- Move the full four-stage board into a drawer or adult layer.
- Give every quest position a truthful geometric meaning.
- Hide demo and management information from the ordinary child view.

Estimate: 1-2 focused days. Medium implementation effort. No image generation required.

### Batch 2: Persistent dinosaur and energy journey

**Goal:** make the current companion assets functional.

- Add `inviting`, `ready`, and `teamwork` behavior using the existing asset set where possible.
- Keep states active while their real cause remains.
- Animate completed energy from quest to dinosaur to home.
- Add restrained sound and haptic feedback with sound-off and reduced-motion support.

Estimate: 1-2 focused days. Medium implementation effort. No new image batch initially.

### Batch 3: Visual quest action scene

**Goal:** let Sage complete a quest with minimal reading.

- Replace the information-heavy sheet with an icon-led action scene.
- Keep one audio instruction, participant tokens, join, and hold-to-finish.
- Make the waiting-for-thanks state visually distinct.
- Keep adult detail available behind a secondary control.

Estimate: 1-2 focused days. Medium implementation effort.

### Batch 4: Persistent home growth and memories

**Goal:** give participation an enduring consequence.

- Add code-native environmental growth tied to unique endorsed quests.
- Build a small memory shelf for gratitude and teamwork discoveries.
- Add cumulative, non-punitive milestones.
- Keep progression derived from the existing event and ledger truth.

Estimate: 2-4 focused days. Medium-high implementation effort. Begin code-native before
commissioning more artwork.

### Batch 5: Real household beta

**Goal:** prove the game works across three phones.

- Connect Supabase authentication and household data.
- Test adult invitations and the parent-managed child device.
- Add realtime synchronization, offline-safe pending actions, and quiet-hour notifications.
- Run the Sage test, then a seven-day household trial.
- Fix only observed problems before adding friend households.

Estimate: 3-5 focused days plus the seven-day trial. High implementation effort.

## Fifteen-Minute Sage Test

Do not explain how the app works before the test.

1. Hand Sage the phone on his profile.
2. Ask: `What do you think this is?`
3. Ask: `Can you find something the home needs?`
4. Observe whether he understands the main quest without reading every label.
5. Ask him to join it.
6. Ask him to explain what he thinks joining means.
7. Use the spoken instruction once.
8. Ask him to pretend the work is finished and complete the action.
9. Ask: `What do you think happens next?`
10. Switch to an adult and send thanks.
11. Hand the phone back and ask what changed.
12. Ask what the points mean, what the dinosaur is doing, and what he wants to do next.

Record:

- time to find the first quest;
- number of wrong taps;
- how often he asks an adult to read;
- whether he notices the dinosaur before being prompted;
- whether he predicts that another person must send thanks;
- whether he notices the home change;
- moments of delight, impatience, or confusion;
- the words he naturally uses for the features.

Success means he can find and join a quest in under ten seconds, use audio without help,
understand that thanks completes the action, notice a visible household change, and want to
repeat the loop.

Do not redesign during the test. Observe first.

## What Not To Build Yet

- more currencies;
- competitive family leaderboards;
- punishment for missed days;
- a large public social layer;
- AI-generated task suggestions;
- elaborate character customization;
- many new dinosaur images before current states are staged properly;
- friend households before the three-phone private beta works;
- visual polish that does not improve the daily action loop.

## Source Notes

Primary product sources reviewed:

- [Joon: How Joon Works](https://www.joonapp.io/user-manual/how-joon-works)
- [Joon product overview](https://www.joonapp.io/)
- [Finch New User Guide](https://help.finchcare.com/hc/en-us/articles/42149821015693-New-User-Guide)
- [Finch features](https://help.finchcare.com/hc/en-us/categories/37934152903309-Finch-Features)
- [Finch approach to self-care](https://help.finchcare.com/hc/en-us/articles/37935669335309-Our-Approach-to-Self-Care)
- [Nipto](https://nipto.app/)
- [S'moresUp features](https://www.smoresup.com/pricing)
- [Sweepy](https://sweepy.com/)
- [Habitica features](https://habitica.com/static/features?mobile-app=true&theme=dark)
- [Insight Timer milestones](https://help.insighttimer.com/support/solutions/articles/67000698008-how-do-milestones-work-)
- [Insight Timer journal](https://help.insighttimer.com/support/solutions/articles/67000664991-how-can-i-add-a-journal-entry-on-insight-timer-)
- [Duolingo Friend Streak product lessons](https://blog.duolingo.com/product-lessons-friend-streak/)
- [Duolingo core navigation redesign](https://blog.duolingo.com/core-tabs-redesign/)

