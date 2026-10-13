const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2]||'index.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function create(store={},width=1080,blocked=false){
 const els={},events={},docEvents={},queue=[],calls=[];
 const ctx=new Proxy({}, {get:(o,k)=>o[k]??((...args)=>calls.push({k,args})),set:(o,k,v)=>(o[k]=v,true)});
 function el(id){return els[id]??={value:id==='difficultySelect'?'easy':'Tester',checked:false,width:1080,height:400,textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){}},setAttribute(k,v){this[k]=v;},getAttribute(k){return this[k]||null;},getContext(){return ctx;},addEventListener(n,f){this[n]=f;},showModal(){this.open=true;},close(){this.open=false;}};}
 const document={documentElement:{setAttribute(){}},querySelectorAll(){return [];},hidden:false,getElementById:el,addEventListener(n,f){docEvents[n]=f;}},sandbox={URLSearchParams,location:{search:''},document,window:{innerWidth:width,addEventListener(n,f){events[n]=f;}},localStorage:{getItem(k){if(blocked)throw Error();return store[k]||null;},setItem(k,v){if(blocked)throw Error();store[k]=v;}},performance:{now:()=>0},requestAnimationFrame(fn){queue.push(fn);},Math:Object.assign(Object.create(Math),{random:()=>.5})};
 vm.createContext(sandbox);vm.runInContext(script,sandbox);
 return {els,store,calls,read:s=>vm.runInContext(s,sandbox),key(code,repeat=false){events.keydown({code,repeat,preventDefault(){}});},frame(t){queue.shift()(t);},hidden(){document.hidden=true;docEvents.visibilitychange();}};
}
function begin(g,mode='classic',difficulty='easy',dev=false){g.els.itemModeToggle.checked=mode==='items';g.els.devModeToggle.checked=dev;g.els.difficultySelect.value=difficulty;g.els.startBtn.click();g.key('Space');}
// Food changes strength, motion and visual scale, not the equipped skin.
const growth=create();begin(growth);const initial=growth.read('currentSkin');
assert.equal(growth.read('growthStage().name'),'Hungry');for(let i=0;i<20;i++)growth.read('collectFood()');
assert.equal(growth.read('growthStage().name'),'Strong');assert.equal(growth.read('currentSkin'),initial);assert.equal(growth.read('gameOver'),false);assert.equal(growth.read('victory'),false);
assert(growth.read('growthStage().speed')>growth.read('GROWTH[0].speed'));assert(growth.read('growthStage().jump')>growth.read('GROWTH[0].jump'));assert(growth.read('growthStage().scale')>growth.read('GROWTH[0].scale'));
assert.equal(growth.read('progress.wallet'),20);assert.equal(create(growth.store).read('progress.wallet'),20);
// No blue exhaust rectangles are drawn on either jump.
assert(!html.includes('ctx.fillRect(20, 40, 2, 10)'));assert(!html.includes('ctx.fillRect(34, 40, 2, 10)'));
// Mode/difficulty gates cannot be earned through another route or developer mode.
const wrong=create();begin(wrong,'items','hard');for(let i=0;i<10;i++)wrong.read('collectTool("magnet")');assert(!wrong.read('progress.released.includes(1)'));
const right=create();begin(right,'items','easy');for(let i=0;i<10;i++)right.read('collectTool("magnet")');assert(right.read('progress.released.includes(1)'));assert.equal(create(right.store).read('progress.modeStats.items_easy.items'),10);
const cheat=create();begin(cheat,'items','easy',true);for(let i=0;i<40;i++){cheat.read('collectFood(); collectTool("shield")');}assert.equal(cheat.read('progress.wallet'),0);assert.equal(cheat.read('progress.totalItems'),0);assert.equal(cheat.read('progress.released.length'),1);
// Old earned skins/reservations survive; previously collected food becomes wallet once.
const migrated=create({spacecat_collection_v1:JSON.stringify({released:[0,1,4],equipped:4,upcoming:[1],wins:3,totalFood:40})});assert.equal(migrated.read('progress.equipped'),4);assert.equal(migrated.read('progress.wallet'),40);assert(migrated.read('progress.upcoming.includes(1)'));migrated.read('buyUpgrade("magnetTime")');assert.equal(create(migrated.store).read('progress.wallet'),30);
// Shop purchase, rejection, cap and persisted upgrades; four different effects.
const shop=create({spacecat_collection_v1:JSON.stringify({wallet:2000})});for(const key of ['magnetRange','magnetTime','shieldTime','shieldArea']){for(let i=0;i<5;i++)assert(shop.read(`buyUpgrade('${key}')`));assert.equal(shop.read(`progress.upgrades.${key}`),5);assert(!shop.read(`buyUpgrade('${key}')`));}
assert.equal(shop.read('progress.wallet'),1400);assert(!shop.read('buyUpgrade("unknown")'));assert.equal(create(shop.store).read('progress.upgrades.magnetRange'),5);begin(shop,'items');shop.read('collectTool("magnet")');assert.equal(shop.read('magnetTicks'),600);shop.read('collectTool("shield")');assert.equal(shop.read('shieldTicks'),600);assert(!shop.read('buyUpgrade("magnetTime")'));
const poor=create();assert(!poor.read('buyUpgrade("magnetRange")'));assert.equal(poor.read('progress.wallet'),0);
// Magnet range really attracts a distant food item only after the range upgrade.
const baselineMagnet=create(), upgradedMagnet=create({spacecat_collection_v1:JSON.stringify({upgrades:{magnetRange:5}})});
for(const g of [baselineMagnet,upgradedMagnet]){begin(g,'items');g.read('collectTool("magnet");foods.push({x:330,y:280,w:24,h:24,wobble:0});update()');}
assert(upgradedMagnet.read('foods[0].x')<baselineMagnet.read('foods[0].x'));
// Upgraded shield reach destroys an obstacle outside the un-upgraded collision box.
shop.read('obstacles.length=0; foods.length=0; player.y=280; player.vy=0; obstacles.push({x:160,y:285,w:30,h:30,rot:0,spin:0}); update()');assert.equal(shop.read('obstacles.length'),0);
// Actual distance triggers the encounter; collecting 20 food never ends the run.
const distance=create();begin(distance);distance.read('spawnObstacle=()=>{};spawnFood=()=>{};');for(let i=0;i<20;i++)distance.read('collectFood()');for(let i=0;i<2500&&!distance.read('bossEncounter');i++)distance.read('update()');assert(distance.read('bossEncounter!==null'));assert(distance.read('runMeters>=1200'));
// There must be enough food opportunities before the first Boss, even on Hard.
// Remove meteors and align spawned foods vertically to model perfect collection;
// horizontal spawning, travel, growth, distance and encounter timing stay real.
for(const difficulty of ['easy','medium','hard']){const g=create();begin(g,'classic',difficulty);g.read('spawnObstacle=()=>{}; const spawnOriginal=spawnFood; spawnFood=()=>{spawnOriginal();foods[foods.length-1].y=GROUND_Y-30;};');for(let i=0;i<6000&&!g.read('bossEncounter');i++)g.read('update()');assert(g.read('bossEncounter!==null'));assert(g.read('growthLevel>=bossEncounter.required'),difficulty+' first Boss must be attainable with perfect collection');}
// Three distinct distance-based animation paths run to completion before replay.
for(const [meters,style] of [[100,'tumble'],[800,'orbit'],[2000,'storm']]){const g=create();begin(g);g.read(`runMeters=${meters};failRun('meteor');`);assert.equal(g.read('failureStyle'),style);for(let i=0;i<150;i++)g.read('update();render()');assert.equal(g.read('failureTick'),150);g.els.retryBtn.click();assert.equal(g.read('gameOver'),false);assert.equal(g.read('growthLevel'),0);assert.equal(g.read('runMeters'),0);}
// Pause freezes movement, item timers, growth, failure and Boss animation.
const pause=create();begin(pause);pause.read('collectTool("shield");');pause.key('Escape');const frozen=pause.read('JSON.stringify({score,runMeters,shieldTicks,y:player.y})');for(let i=0;i<100;i++)pause.read('update()');assert.equal(pause.read('JSON.stringify({score,runMeters,shieldTicks,y:player.y})'),frozen);pause.key('Escape');assert(!pause.read('paused'));
// Frame-rate invariant and double-jump repeat protection remain intact.
let baseline;for(const hz of [30,60,120,144,240]){const g=create();begin(g);g.read('spawnObstacle=()=>{};');for(let i=1;i<=hz*4;i++)g.frame(i*1000/hz);const value=g.read('JSON.stringify({score,runMeters,speed})');if(baseline)assert.equal(value,baseline);baseline=value;}
const jump=create();begin(jump);jump.frame(1000/60);for(let i=0;i<5;i++)jump.key('Space',true);assert.equal(jump.read('player.jumpsUsed'),1);jump.key('Space');assert.equal(jump.read('player.jumpsUsed'),2);assert.equal(jump.read('player.vy'),jump.read('JUMP_VELOCITY*growthStage().jump'));
create({},390,true);create({spacecat_collection_v1:'broken'});assert.equal(create({},390).els.game.width,640);
// Bosses require actual input and offer a viable skilled route at low growth.
function fight(g){for(let i=0;i<1800&&g.read('bossEncounter&&!gameOver');i++){
 if(g.read('bossEncounter.shots.some(s=>s.x<220&&s.x>70)&&player.onGround'))g.key('Space');
 g.key('KeyJ');g.read('update();render()');
}}
for(const difficulty of ['easy','medium','hard'])for(const mode of ['classic','items']){
 const g=create();begin(g,mode,difficulty);for(let i=0;i<35;i++)g.read('collectFood()');g.read('runMeters=nextBossAt;startBoss()');
 assert.equal(g.read('bossEncounter.won'),false);assert.equal(g.read('bossEncounter.hp'),3);assert.equal(g.read('bossEncounter.lives'),4);
 assert.equal(g.read('attackBoss()'),false);fight(g);assert(!g.read('gameOver'));assert.equal(g.read('bossEncounter'),null);assert.equal(g.read('progress.wins'),1);
 const reward=5+({easy:0,medium:1,hard:2}[difficulty])+(mode==='items'?3:0);assert(g.read(`progress.released.includes(${reward})`));assert(create(g.store).read(`progress.released.includes(${reward})`));
}
const skilled=create();begin(skilled);skilled.read('startBoss()');assert.equal(skilled.read('bossEncounter.hp'),5);assert.equal(skilled.read('bossEncounter.lives'),2);fight(skilled);assert(!skilled.read('gameOver'));assert.equal(skilled.read('progress.wins'),1);
const idle=create();begin(idle);idle.read('startBoss()');for(let i=0;i<1000&&!idle.read('gameOver');i++)idle.read('update()');assert(idle.read('gameOver'));assert.equal(idle.read('failureReason'),'boss');assert.equal(idle.read('progress.wins'),0);
const bossDev=create();begin(bossDev,'items','hard',true);for(let i=0;i<35;i++)bossDev.read('collectFood()');bossDev.read('startBoss()');fight(bossDev);assert.equal(bossDev.read('progress.wins'),0);assert.equal(bossDev.read('progress.wallet'),0);
const combatPause=create();begin(combatPause);combatPause.read('startBoss()');combatPause.key('Escape');const frozenBoss=combatPause.read('JSON.stringify(bossEncounter)');for(let i=0;i<100;i++){combatPause.key('KeyJ');combatPause.read('update()');}assert.equal(combatPause.read('JSON.stringify(bossEncounter)'),frozenBoss);
// Regional transition clears obstacles and introduces the new hazards safely.
const region=create();begin(region);region.read('runMeters=900;obstacles.push({x:100});updateRegion();');assert.equal(region.read('regionIndex'),1);assert.equal(region.read('obstacles.length'),0);for(let i=0;i<100;i++)region.read('update()');assert.equal(region.read('obstacles.length'),0);assert(region.els.hint.textContent.includes('drones'));
region.read('Math.random=()=>.1;spawnObstacle()');assert.equal(region.read('obstacles[0].kind'),'drone');assert(region.read('obstacles[0].y<GROUND_Y-100'));
// Chapters preserve mode-specific gates and reward first clears only once.
const chapters=create();assert(!chapters.read('startChallenge(2)'));assert(chapters.read('startChallenge(1)'));chapters.key('Space');chapters.key('Space');for(let i=0;i<8;i++)chapters.read('collectFood()');chapters.read('runMeters=2200;updateChallenge();');assert(chapters.read('challengeWon'));assert.equal(chapters.read('progress.challenges[0]'),3);assert.equal(chapters.read('progress.wallet'),28);assert.equal(chapters.read('progress.modeStats.classic_easy.food'),0);assert.equal(chapters.read('progress.modeStats.classic_easy.bosses'),0);
chapters.els.retryBtn.click();assert.equal(chapters.read('challengeId'),1);assert.equal(chapters.read('runMeters'),0);chapters.key('Space');chapters.key('Space');for(let i=0;i<8;i++)chapters.read('collectFood()');chapters.read('runMeters=2200;updateChallenge()');assert.equal(chapters.read('progress.wallet'),36);
assert(chapters.read('startChallenge(2)'));chapters.key('Space');for(let i=0;i<5;i++)chapters.read('collectTool("magnet")');chapters.read('runMeters=2600;updateChallenge()');assert.equal(chapters.read('progress.wallet'),66);assert.equal(chapters.read('progress.modeStats.items_easy.items'),0);
assert(chapters.read('startChallenge(3)'));chapters.key('Space');chapters.read('runMeters=2000;startBoss()');fight(chapters);assert(chapters.read('challengeWon'));assert.equal(chapters.read('progress.wallet'),106);assert.equal(chapters.read('progress.wins'),0);assert(!chapters.read('progress.released.includes(5)'));assert.equal(create(chapters.store).read('progress.challenges.join(",")'),'3,3,3');
// Validate real file serialization, replacement, old-version migration and rejection.
chapters.read('backToMenu()');const exported=chapters.read('makeSave()');const target=create();target.read(`pendingImport=parseSave(${JSON.stringify(exported)})`);assert(target.read('applySave()'));assert.equal(target.read('progress.wallet'),106);assert.equal(target.read('progress.challenges[2]'),3);assert.equal(create(target.store).read('progress.wallet'),106);
const legacy=JSON.parse(exported);legacy.progress.version=2;delete legacy.progress.challenges;assert.equal(target.read(`parseSave(${JSON.stringify(JSON.stringify(legacy))}).progress.challenges.join(',')`),'0,0,0');
const before=target.read('JSON.stringify(progress)');for(const bad of ['bad','{}',JSON.stringify({...legacy,game:'Other'}),JSON.stringify({...legacy,format:99}),JSON.stringify({...legacy,progress:{...legacy.progress,wallet:-1}}),JSON.stringify({...legacy,progress:{...legacy.progress,upgrades:{...legacy.progress.upgrades,magnetTime:99}}}),JSON.stringify({...legacy,progress:{...legacy.progress,modeStats:{}}})]){assert.throws(()=>target.read(`parseSave(${JSON.stringify(bad)})`));assert.equal(target.read('JSON.stringify(progress)'),before);}
const blocked=create({},1080,true);blocked.read(`pendingImport=parseSave(${JSON.stringify(exported)})`);assert(blocked.read('applySave()'));assert.equal(blocked.read('progress.wallet'),106);assert.equal(blocked.read('storageAvailable'),false);
// Stored sound/effects preferences, silent fallback and bounded cosmetic particles.
target.els.soundToggle.checked=false;target.els.volumeSlider.value='25';target.els.effectsToggle.checked=true;target.els.soundToggle.change();assert.equal(create(target.store).read('settings.volume'),.25);assert.equal(create(target.store).read('settings.sound'),false);assert.equal(create(target.store).read('settings.reducedEffects'),true);
target.read('settings.reducedEffects=true;currentSkin=7;emitSkinEffect()');assert.equal(target.read('skinParticles.length'),0);target.read('settings.reducedEffects=false;');for(let i=0;i<50;i++)target.read('emitSkinEffect()');assert.equal(target.read('skinParticles.length'),30);assert.equal(target.read('skinParticles[0].shape'),'star');
const sound=create();sound.read(`window.AudioContext=class{constructor(){this.state='running';this.currentTime=0;this.destination={};}createOscillator(){return{frequency:{setValueAtTime(){}},connect(){},start(){},stop(){}}}createGain(){return{gain:{setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){}}}};unlockAudio();playSound('grow')`);assert.equal(sound.read('audioFailed'),false);
console.log('PASS: six Boss routes, skilled weak-cat victory, real damage/failure, pause, regional grace, all chapters/rewards/replay, strict save validation/import/migration, sound/effects settings and bounded particles.');

// Language can switch without changing gameplay or player-supplied names.
const bilingual=create();assert.equal(bilingual.read('language'),'en');assert(bilingual.read('setLanguage("zh-CN")'));assert.equal(create(bilingual.store).read('language'),'zh-CN');assert(!bilingual.read('setLanguage("fr")'));
assert.equal(bilingual.read('loc("Challenge Mode · 闯关模式")'),'闯关模式');assert.equal(bilingual.read('loc("Run endlessly. Eat food to grow from ")'),'开启无尽奔跑。收集猫粮，逐步成长： ');assert(!bilingual.read('loc(RELEASED_BONUSES[9].label)').includes('range'));assert(!bilingual.read('loc(RELEASED_BONUSES[10].label)').includes('durations'));
begin(bilingual);bilingual.read('playerName="Snowball 测试"; updateHUD();');assert.equal(bilingual.els.nameText.textContent,'昵称 Snowball 测试');assert(bilingual.els.foodText.textContent.includes('猫粮'));assert(bilingual.els.bossText.textContent.includes('首领'));
const same=bilingual.read('JSON.stringify({foodCount,runMeters,score,growthLevel,progress})');assert(bilingual.read('setLanguage("en")'));assert.equal(bilingual.read('JSON.stringify({foodCount,runMeters,score,growthLevel,progress})'),same);assert.equal(bilingual.els.nameText.textContent,'Name Snowball 测试');assert(bilingual.els.foodText.textContent.includes('Food'));
bilingual.els.languageSelect.focus();assert(bilingual.read('paused'));bilingual.key('Escape');assert(!bilingual.read('paused'));
bilingual.read('setLanguage("zh-CN");renderCollection();renderWorkshop();renderChallenges()');assert(bilingual.els.releasedGrid.innerHTML.includes('雪球'));assert(bilingual.els.releasedGrid.innerHTML.includes('累计收集'));assert(bilingual.els.upgradeGrid.innerHTML.includes('护盾持续时间'));assert(bilingual.els.challengeGrid.innerHTML.includes('二段跳试飞'));assert(bilingual.els.challengeGrid.innerHTML.includes('首次通关奖励'));
bilingual.read('setLanguage("en")');assert(bilingual.els.releasedGrid.innerHTML.includes('Snowball'));assert(!bilingual.els.challengeGrid.innerHTML.includes('二段跳'));assert(!bilingual.els.upgradeGrid.innerHTML.includes('护盾'));assert(!bilingual.els.releasedGrid.innerHTML.includes('已收藏'));
// A backup carries language; older exports preserve the user's current choice.
bilingual.read('backToMenu();setLanguage("zh-CN")');const localizedSave=bilingual.read('makeSave()');const receiver=create();receiver.read(`pendingImport=parseSave(${JSON.stringify(localizedSave)})`);assert(receiver.read('applySave()'));assert.equal(receiver.read('language'),'zh-CN');const oldLanguage=JSON.parse(localizedSave);delete oldLanguage.language;assert.equal(receiver.read(`parseSave(${JSON.stringify(JSON.stringify(oldLanguage))}).language`),'zh-CN');
const langBlocked=create({},390,true);assert(langBlocked.read('setLanguage("zh-CN")'));assert.equal(langBlocked.read('language'),'zh-CN');assert.equal(langBlocked.read('storageAvailable'),false);
// Cosmetic simulation freezes with pause; effects are bounded and reducible.
const pixel=create();begin(pixel);pixel.read('pixelBurst("hit",200,100,150)');assert.equal(pixel.read('pixelEffects.length'),96);pixel.key('Escape');const artFrozen=pixel.read('artTick');pixel.read('update()');assert.equal(pixel.read('artTick'),artFrozen);pixel.key('Escape');pixel.read('settings.reducedEffects=true;update()');assert.equal(pixel.read('pixelEffects.length'),0);
const sprite=create();begin(sprite);sprite.read('drawPlayer()');assert(sprite.calls.filter(c=>c.k==='fillRect').length>10);sprite.calls.length=0;sprite.read('drawPlayer()');assert(!sprite.calls.some(c=>c.k==='arc'));assert.equal(sprite.read('player.w'),52);assert.equal(sprite.read('player.h'),50);
// Deterministic hooks provide real state and do not bypass gameplay rewards.
assert.equal(JSON.parse(pixel.read('window.render_game_to_text()')).language,'en');pixel.read('window.advanceTime(100)');assert(pixel.read('controlledTime'));assert.equal(pixel.read('progress.wins'),0);
console.log('PASS: English/Chinese switch, live text/markup restoration, preserved names/gameplay, language persistence/import/fallback, crisp sprites, cosmetic pause/reduced-effects limits and deterministic state hooks.');
