# Space Cat Dash Development Log

This log records the product decisions, feedback and changes behind Space Cat Dash. Dates use Sydney time. I independently planned the game and its iteration requirements; Codex assisted with code implementation and automated checks. I do not claim that I hand-wrote every line of code.

## Before public release — original prototype

I built the original prototype approximately a year before its October 2026 public release. The exact development dates were not recorded.

The idea was a small game for relaxing and passing time: a space cat dodges meteors, collects food, changes appearance and eventually flies back to Earth. The implementation uses HTML, CSS, JavaScript and Canvas in a single file, without a backend or external assets. The best score is stored in the browser.

### Feedback and early iteration

- I played the game myself and invited several friends to try it. The original version was too difficult for the intended relaxing experience, so I added Easy, Medium and Hard choices.
- I added random power-ups and a Developer Mode with starting-item choices to make testing easier.
- I noticed that the victory animation returned to the start screen before players could see the complete sequence. I extended the animation and changed it to require a manual restart.

No exact playtester count, retention, satisfaction score or product-market-fit result was measured.

## 2026-10-11 — first public release

- Created the public `fchen6343/space-cat-dash` repository.
- Published the uploaded `spacecat.html` unchanged as `index.html` and added a README explaining the gameplay and AI-assisted development process.
- Enabled GitHub Pages from the root of `main`.
- Verified the public page, starting a run, jumping, scoring, item countdowns, food collection, collisions and returning to the menu.

Original release: [`4e2beac`](https://github.com/fchen6343/space-cat-dash/commit/4e2beac9bb4ee1c23dd3cb16deba71cc047a9f76). The original remains available in Git history. This release was not a claim that every device or complete victory sequence had been tested.

## 2026-10-12 — speed and double-jump correction

### Problem reported

After opening the GitHub Pages version, I noticed that the game ran too fast and the second jump was difficult to use. I suggested that display refresh rate could be responsible.

### Cause and change

- The original loop advanced gameplay once per rendered frame. High-refresh-rate screens could therefore run the game faster and shorten nominal item durations.
- Gameplay now advances at a fixed 60 Hz simulation pace, independently of rendering frequency.
- Holding a jump key could generate repeated `keydown` events and use the second jump unintentionally. Repeated keydown events are now ignored.
- Hidden-tab time is discarded on return instead of fast-forwarding the game.

### Verification

Automated simulations checked 30, 60, 120, 144 and 240 Hz render rates, consistent scores and movement pace, five-second item timers, keyboard and touch double jumps, restored jumps after landing, and the seven-second victory delay. The updated source and successful Pages deployment were checked, and the public page was opened for a smoke test.

Fix commit: [`0124315`](https://github.com/fchen6343/space-cat-dash/commit/01243151ed13506a6270808f77a723964a14624e).

## 2026-10-12 — mobile play and permanent collection

### Product direction

I requested a better mobile layout, pause and direct replay controls, a clearer objective and progress, a gentle speed ceiling for Easy, and a permanent skin cabinet. I also requested ten future skin slots with achievement conditions and individual bonuses, plus a forthcoming challenge-mode entry.

### Implemented in this iteration

- Moved the start menu into normal page flow so smaller screens can scroll instead of cropping the form.
- Added a mobile jump button and a smaller logical playfield on narrow screens. Kept the same two-jump limit and fixed simulation timing.
- Added the upper-left pause control and desktop Esc shortcut, with Continue, Restart run and Back to home. Switching to a hidden tab pauses an active run.
- Added direct replay after failure and after the victory animation. Name, difficulty and item settings are retained; run-specific progress resets.
- Displayed the complete goal: collect 20 food items to discover all five looks. Added a persistent 0/20 run-progress display, distance and remaining jumps.
- Capped Easy speed at 7.2 simulation units per tick, compared with its 5.8 starting speed. This is a preliminary balance choice, not a measured player-satisfaction result.
- Made the five original looks permanently collectible during normal play. Collected looks can be equipped, with their starting-skin bonus applied throughout the run.
- Added a home-screen Skin Cabinet containing ten forthcoming skin slots. All ten previews remain `?` until the skins are released.
- Stored lifetime wins, difficulty-specific wins, distance, food collection, unlocked looks and selected skin in local browser storage. Developer Mode does not earn collection progress.
- Kept a session-only fallback with a visible notice when browser storage is unavailable.
- Added a Challenge Mode entry that opens a Coming Soon notice; playable levels have not been released.
- Stopped the food-update loop immediately when collecting the final item triggers victory, avoiding further access to the cleared food list.

### Original collected looks

| Look | Current bonus |
|---|---|
| Snowball | Standard balance, no modifier |
| Marmalade | Food score +5% |
| Cloud | Collected shield duration +0.5 seconds |
| Mint | Magnet attraction range +20 game pixels |
| Starry Night | Running score +5% |

### Ten future slots

These names and values are preliminary. Meeting a condition permanently records the reserved unlock, but an unreleased skin cannot be equipped and its planned bonus is not active.

| Slot | Working name | Unlock condition | Planned bonus |
|---|---|---|---|
| 01 | First Flight | First victory | Food score +8% |
| 02 | Homeward Bound | 3 victories | Shield duration +0.5 seconds |
| 03 | Orbit Keeper | 10 victories | Magnet duration +1 second |
| 04 | Starlight Captain | 25 victories | Running score +8% |
| 05 | Moon Walker | 500 metres in total | Magnet attraction range +15% |
| 06 | Comet Chaser | 2,000 metres in total | Food score +10% |
| 07 | Galaxy Voyager | 10,000 metres in total | Shield duration +1 second |
| 08 | Snack Scout | 50 food items in total | Food collection radius +10% |
| 09 | Cosmic Chef | 200 food items in total | Magnet duration +1.5 seconds |
| 10 | Three Star Pilot | Win on all three difficulties | Running score +10% |

Distance is an in-game measure. Collection data belongs to this browser and site: it does not sync between devices, and clearing site data removes it. Test runs on localhost do not transfer to the GitHub Pages site.

### Verification and remaining work

The dependency-free regression checks cover pause and Esc, direct replay, the 20-food victory condition, persistent collection data, all ten milestone thresholds and question-mark slots, Developer Mode exclusions, the Easy speed ceiling, active original-skin bonuses, unavailable or malformed storage, hidden-tab pause and the final-food collision case. Timing checks compare multiple simulated rendering rates. Browser checks inspect desktop and narrow-screen layouts and the home, cabinet, pause and challenge controls.

The ten new skin designs, their actual gameplay modifiers, and challenge levels are **Coming Soon**. Future playtesting should tune balance and check additional real mobile devices. Responsive desktop-browser checks are not a claim of exhaustive phone testing.

## Continuing this log

For each future change, record the problem or feedback, the design decision, the implementation, what was actually checked, and any remaining limitations. Keep unreleased ideas separate from completed features.

## 2026-10-12 — endless runs, growth, Boss skins and upgrades

### Requested direction

I requested six changes: remove the blue jump bars; add mode- and difficulty-specific skin tasks; let earned food upgrade power-ups; replace food-based random appearance changes with growth from hungry to strong; make normal play endless with strength-gated Boss encounters; and show different failure animations at different distances. I confirmed that endless play and Bosses should launch in this update, while Challenge Mode remains Coming Soon.

### What changed

- Removed the two blue exhaust rectangles beneath the cat during a jump.
- Kept equipped skin and run strength separate. Food now changes growth level, body size, running pace and jump height without replacing the equipped skin.
- Growth stages are Hungry at 0 food, Fed at 5, Fit at 12, Strong at 20 and Mighty at 35. Growth resets each run; the cosmetic collection and upgrades persist.
- Each normal-play food item adds one spendable food credit. Developer Mode adds no credits or achievement progress. Previously saved normal-play food is credited once when migrating the old save format; future reloads use the saved wallet balance.
- Added four permanent upgrade tracks: magnet range, magnet duration, shield duration and shield reach. Each has five levels, costing 10/20/30/40/50 food. Range adds 25 per level, magnet and shield timers add one second per level, and shield reach adds 15 extra protection radius per level. Skin bonuses stack with upgrades. Purchases take effect on the next run.
- Normal play no longer ends after collecting 20 food. It continues through repeated Boss encounters. Boss intervals are 1,200m on Easy, 1,500m on Medium and 1,800m on Hard.
- The first Easy/Medium Boss requires Strong. The first Hard Boss and subsequent Bosses require Mighty. The encounter compares the prepared growth level automatically: enough strength defeats the Boss, awards its skin in normal play, and resumes the run; insufficient strength ends the run.
- Increased food opportunities on Medium and Hard so their first Boss requirements are reachable with good collection. A perfect-collection simulation preserves food travel and encounter timing to check attainability; it is not a claim that a typical player will succeed.
- Added six released Boss skins tied to Classic or Item Mode and a specific difficulty. Hard-exclusive legendary looks have crowns, wings and stronger modifiers. Skin tasks and progress are visible in the cabinet.
- Updated the original skin requirements: Marmalade needs 10 Item Mode/Easy power-ups; Cloud needs a 1,000m Classic/Medium run; Mint needs 25 Item Mode/Medium power-ups; Starry Night needs 1,200m in Classic/Hard while Strong or Mighty. Existing collections are grandfathered rather than removed.
- Updated the ten unreleased slots to route-specific tasks, including power-up collection, food collection, distance and Boss defeats. Earlier reserved unlocks remain preserved. These ten designs still show question marks and their planned bonuses remain inactive.
- Added three 2.5-second failure animations: below 500m, a tumbling rough landing; 500–1,499m, drifting out of orbit; from 1,500m, a meteor storm. Replay controls appear after the animation.
- Kept fixed simulation timing, reliable double jump, pause/Esc, same-settings replay, local persistence, storage fallback and responsive layouts.

### Released Boss rewards

| Mode | Difficulty | Boss | Skin | Bonus |
|---|---|---|---|---|
| Classic | Easy | Stone Warden | Pebble Pal | Food score +8% |
| Classic | Medium | Solar Warden | Solar Knight | Shield duration +1s |
| Classic | Hard | Void Warden | Void Sovereign | Running score +15%, jump height +6% |
| Item Mode | Easy | Lunar Warden | Lunar Mechanic | Magnet range +25 |
| Item Mode | Medium | Aurora Warden | Aurora Hunter | Magnet duration +1s, range +30 |
| Item Mode | Hard | Nebula Warden | Nebula Emperor | Food score +15%, both item durations +1s |

Food-score bonuses change score, not the one-credit-per-food wallet rate. All balance values are initial choices and remain candidates for further playtesting.

### Checks performed

Dependency-free simulations checked growth without skin replacement; real speed/jump/size modifiers; mode and difficulty gating; Developer Mode exclusions; legacy save migration without duplicate credits; purchases, insufficient funds, level caps and persistence; actual extended magnet attraction and shield protection; all six Boss reward routes; weak-Boss failure and strong-Boss continuation; distance-triggered encounters; all three failure paths; replay; pause; multi-refresh-rate timing and repeated-key double-jump protection.

Browser checks covered a real workshop purchase followed by reload, the phone workshop layout, and controlled local QA scenes rendering the airborne cat, Mighty form, Boss result and all three failure animations. The QA scene controls are not shipped in the public game. These checks do not establish a measured difficulty balance or exhaustive compatibility with every phone.
