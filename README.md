# Space Cat Dash

An offline Canvas runner about a space cat dodging meteors, eating food, growing stronger and fighting Wardens. It uses one HTML file, with no backend, external assets or online APIs.

## Language and pixel style

Choose English or Simplified Chinese from the top-bar Language selector or Settings & Save. The game remembers your choice, and switching during a run pauses play. Menus, HUD, skin tasks, chapters, Boss messages and save prompts are localized. Nicknames and existing progress are preserved. Save backups include the preference; older backups keep the current language.

The presentation now uses shaded pixel cats, four running poses, pixel planets and layered terrain, clear item/Boss sprites and bounded square-particle feedback. Retro square/triangle sound motifs retain mute/volume and offline play. Reduced-effects settings suppress optional particles.

## Play

[Play in your browser](https://fchen6343.github.io/space-cat-dash/), or download `index.html` and open it offline.

- Choose Easy, Medium or Hard. Classic play has food and obstacles; Item Mode adds random magnets and shields. Developer Mode can choose starting power-ups but earns no food credits, skins or achievements.
- Press Space / Up Arrow, tap the playfield, or use the mobile JUMP button. Two separate presses give a double jump; holding a key does not spend the second jump. Pause with Esc or the upper-left button.
- Eat food to grow from Hungry to Fed (5), Fit (12), Strong (20) and Mighty (35). Body size and jump height increase while running pace rises gently. Your equipped skin stays the same.
- Endless regions change at 900m and 1,800m: Moonrise, Orbital Station and Violet Nebula. New regions introduce their obstacles with four seconds without new obstacle spawns.
- Wardens arrive every 1,200m on Easy, 1,500m on Medium and 1,800m on Hard. Jump over red meteors. When the weak point turns gold and the button says PULSE NOW, press J or tap PULSE. Strong cats have four hearts and need three hits; weaker cats have two hearts and need five hits. Good timing can win at any growth level. The first Easy/Medium Warden gives the strength advantage at Strong; Hard and later encounters require Mighty for that advantage.
- Six mode/difficulty-specific Boss skins remain available. Winning resumes endless play. Failure shows distance-dependent animation, earned food, growth advice and relevant skin task progress.

## Three short chapters

Challenge Mode now has three sequential practice chapters, designed for roughly 1–3 minutes each; actual completion time depends on collection and survival.

1. **Double-jump Flight:** 2,200m, eight food and a double jump. First-clear reward: 20 food.
2. **Power-up Patrol:** 2,600m and five power-ups. First-clear reward: 30 food.
3. **Warden Trial:** reach the Warden at 2,000m and defeat it. First-clear reward: 40 food.

Clear a chapter to open the next. Completed chapters show three completion stars, not a performance rating. Replaying earns collected food but never repeats the first-clear bonus. Practice chapters do not advance endless mode skin tasks or grant endless Boss skins.

## Upgrades, skins and saves

Each normally collected food earns one credit. The Workshop upgrades magnet range/time and shield duration/reach, with five levels per track costing 10, 20, 30, 40 and 50 food. Upgrades apply next run and stack with equipped skin bonuses. Food-score bonuses affect score rather than wallet income.

The Cabinet shows exact mode/difficulty requirements. Skins offer different benefits, such as magnet reach versus shield duration, and coloured jump particles; legendary skins have star effects, crowns, wings and halos. Victory effects use the equipped skin's palette. Ten future designs remain marked Coming Soon, with reserved unlocks and inactive planned bonuses.

Settings include generated sound effects, volume and reduced visual effects. Audio starts after a player gesture; unsupported browsers can continue silently. Nothing is downloaded for sound.

Progress stays on this browser/site. Use **Settings & Save → Export save** for a JSON backup. To move it to another device, choose that file, inspect the preview, then select **Replace current save**. Import replaces progress, best score and settings; export a backup first. Invalid saves are rejected before replacement. Existing local skins, upgrades, food credits and achievements are carried over. If storage is blocked, progress lasts for the current session only. There is no automatic cloud sync.

## Product and development

I independently planned the theme, gameplay and iteration requirements, using Codex to assist code implementation and checks. Several friends playtested the original game. Their feedback and my own testing led to difficulty choices; I also improved the original ending's pacing and manual restart. This is a product-planning and AI-assisted development project, not a claim that I hand-wrote all the code.

The unchanged original upload is preserved in [the first release](https://github.com/fchen6343/space-cat-dash/tree/4e2beac9bb4ee1c23dd3cb16deba71cc047a9f76). Later changes and verification are recorded in [DEVLOG.md](DEVLOG.md).

## Checks

Run `node tests.cjs index.html` with Node.js. The dependency-free simulation suite covers timing, jump input, progression, migration, upgrades, all six Boss reward routes, real combat damage and skilled low-growth victory, chapter rewards/replay, region transitions, save validation/replacement and sound/effects settings. Browser checks cover responsive layouts and actual export/import and attack-button interactions. These checks do not establish exhaustive phone compatibility or measured player difficulty balance.
