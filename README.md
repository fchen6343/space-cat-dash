# Space Cat Dash

A small, offline Canvas game about a space cat dodging meteors and collecting food. Built with HTML, CSS and JavaScript in a single file, with no backend, external assets or online APIs.

## Play

Open [the browser game](https://fchen6343.github.io/space-cat-dash/), or download `index.html` and open it in a browser to play offline.

- Choose Easy, Medium or Hard and enter a nickname.
- Press Space or Up Arrow, or tap the game, to jump. Double jumping is available.
- Collect food to unlock five cat looks and reach the rocket journey back to Earth.
- Enable Item Mode for random power-ups. Developer Mode lets you select starting power-ups for testing.
- Base magnet and shield durations are five seconds; equipped original skins can modify gameplay. Scores and collection progress are saved locally in the browser.

## Product and development

I independently planned the theme, gameplay and iteration requirements, and used Codex to assist with code implementation. This project reflects product planning, hands-on playtesting and AI-assisted development; it is not a claim that I independently hand-wrote all the code.

I invited several friends to playtest the game. Their feedback, together with my own testing, showed that the original difficulty was too high for the intended relaxing experience. I added difficulty choices and a Developer Mode to support further testing. I also extended the victory animation and changed the ending to require a manual restart, so players could see the full sequence.

The original uploaded source is preserved in [the first release](https://github.com/fchen6343/space-cat-dash/tree/4e2beac9bb4ee1c23dd3cb16deba71cc047a9f76). Later updates are recorded in [DEVLOG.md](DEVLOG.md).


## Controls and collection

Collect 20 food items to discover all five original looks and finish a run. The HUD shows total food progress, distance and remaining jumps. Easy has a gentle speed ceiling.

Use the upper-left pause icon or Esc on desktop. Continue, restart with the same settings, or return home. On phones, use the jump button or tap the playfield. Holding a jump key does not spend your second jump.

The home-screen Skin Cabinet keeps collected original looks, lets you equip them, and shows ten future skin slots with question-mark previews, unlock conditions and planned bonuses. Meeting a future condition reserves its unlock; those skins and their bonuses remain unavailable until release. Challenge Mode currently opens a Coming Soon notice.

Developer Mode does not earn collection progress. Progress is local to this browser and site, with a session-only fallback when storage is unavailable; it does not sync across devices.

## Regression checks

With Node.js installed, run `node tests.cjs index.html`. The tests use only Node's built-in modules. They simulate gameplay to check pause, replay, victory, persistence, skin conditions and bonuses, Easy's speed cap, storage fallback, and consistent timing across rendering rates. Responsive browser checks complement these tests; they do not replace testing on real phones.
