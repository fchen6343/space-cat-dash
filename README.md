# Space Cat Dash

An offline Canvas endless runner about a space cat dodging meteors, eating food and growing strong enough to defeat Bosses. Built with HTML, CSS and JavaScript in one file, without a backend or external assets.

## Play

[Play in your browser](https://fchen6343.github.io/space-cat-dash/), or download `index.html` and open it offline.

- Choose Easy, Medium or Hard. Leave Item Mode off for Classic play, or enable it for random magnets and shields.
- Press Space or Up Arrow, tap the playfield, or use the mobile jump button. Two separate presses give a double jump. Holding a key does not spend the second jump.
- Eat food to grow: Hungry → Fed → Fit → Strong → Mighty. Your body, running pace and jump height change while your equipped skin stays the same.
- Prepare for Bosses at 1,200m intervals on Easy, 1,500m on Medium and 1,800m on Hard. The first Easy/Medium Boss needs Strong; Hard and later Bosses need Mighty. Enough strength wins the encounter and lets you keep running; too little ends the run.
- Use the upper-left icon or Esc to pause. Continue, restart with the same settings or return home. Failure animations vary with distance before replay becomes available.

## Food upgrades and skins

Each food item collected during normal play earns one food credit. Spend credits in the home-screen Power-up Workshop to upgrade magnet range/time and shield duration/reach. Each track has five levels, costing 10, 20, 30, 40 and 50 food. Upgrades apply on your next run and can stack with an equipped skin's bonus.

The Skin Cabinet displays the exact mode, difficulty, task and progress for each skin. Six Boss rewards are now playable; stronger legendary skins require Hard-mode achievements. Existing earned skins stay unlocked when updating.

Ten future designs still use `?` previews and Coming Soon labels. Their mode-specific unlock reservations are tracked, but they cannot be equipped and their planned modifiers are inactive. Challenge Mode is also Coming Soon; this release does not include playable levels.

Developer Mode does not earn food credits, skins or achievements. Saves are local to this browser and site, with a session-only fallback if storage is blocked. They do not sync between devices. Earlier saved normal-play food is converted once to the new wallet.

## Product and development

I independently planned the theme, gameplay and iteration requirements, using Codex to assist code implementation and checks. Several friends playtested the original game. Their feedback and my own testing led to difficulty choices; I also improved the original ending's pacing and manual restart. This is a product-planning and AI-assisted development project, not a claim that I hand-wrote all the code.

The unchanged original upload is preserved in [the first release](https://github.com/fchen6343/space-cat-dash/tree/4e2beac9bb4ee1c23dd3cb16deba71cc047a9f76). The previous 20-food victory flow is documented as history in [DEVLOG.md](DEVLOG.md); endless growth and Bosses now replace it.

## Checks

Run `node tests.cjs index.html` with Node.js. The dependency-free tests cover progression, gated unlocks, upgrades and currency, save migration, Boss outcomes, failure animations, pause/replay and timing. Browser visual checks complement these simulations; they do not replace further player feedback or exhaustive real-phone testing.
