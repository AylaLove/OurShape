# Household Beta Checklist

## Before connecting real people

- Create a dedicated Supabase development project.
- Apply both migrations without errors.
- Create one owner account, a second adult account, and one parent-managed child profile.
- Confirm every private record has the correct `household_id`.
- Confirm child responses omit adult-only rewards, balance detail, audit data, and private notes.
- Review every row in `data/flatastic-import-review.csv` before seeding it.

## Core loop

- A member can join an open quest.
- Two members can join the same quest.
- Hold-to-finish moves the quest to Waiting for Thanks.
- A participant cannot thank their own completion.
- One non-participant thank-you completes the quest.
- Duplicate taps and simultaneous requests cannot pay twice.
- Each helper gets full appreciation points.
- Contribution units divide equally by default.
- Needs One Small Finishing Touch returns the quest without shame or lost points.

## Child check

- Sage can complete the main flow from icons and spoken instructions.
- The child profile sees High Fives and child-safe rewards only.
- The child sees supportive household language rather than individual balance ratios.
- Unfinished quests are noticeable but quiet during quiet hours.

## Three-phone check

- All three phones show the same state after refresh.
- Simultaneous joins are preserved.
- Weak connection actions retry safely and display their state.
- Yesterday's history remains after tomorrow is generated.
- Signing into another household exposes no names, quests, points, or inferred balances.

## Seven-day trial questions

- Did the app reduce daily administration?
- Did it make cooperation more likely?
- Did endorsement feel like gratitude rather than inspection?
- Were any quests unclear, noisy, unfair, or unnecessary?
- Did the reward prices feel useful without becoming the only motivation?
- Did the shape help adults notice imbalance without blaming the child?
