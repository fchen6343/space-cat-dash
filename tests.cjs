const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2]||'index.html','utf8'),script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function create(store={},width=1080,blocked=false){
 const els={},events={},docEvents={},queue=[],calls=[];
 const ctx=new Proxy({}, {get:(o,k)=>o[k]??((...args)=>calls.push({k,args})),set:(o,k,v)=>(o[k]=v,true)});
 function el(id){return els[id]??={value:id==='difficultySelect'?'easy':'Tester',checked:false,width:1080,height:400,textContent:'',innerHTML:'',classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return ctx;},addEventListener(n,f){this[n]=f;},showModal(){this.open=true;},close(){this.open=false;}};}
 const document={hidden:false,getElementById:el,addEventListener(n,f){docEvents[n]=f;}},sandbox={document,window:{innerWidth:width,addEventListener(n,f){events[n]=f;}},localStorage:{getItem(k){if(blocked)throw Error();return store[k]||null;},setItem(k,v){if(blocked)throw Error();store[k]=v;}},performance:{now:()=>0},requestAnimationFrame(fn){queue.push(fn);},Math:Object.assign(Object.create(Math),{random:()=>.5})};
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
// Boss encounters: weak cats fail, strong ones win and keep running; route-specific loot.
for(const difficulty of ['easy','medium','hard'])for(const mode of ['classic','items']){
 const g=create();begin(g,mode,difficulty);for(let i=0;i<35;i++)g.read('collectFood()');g.read('runMeters=nextBossAt; startBoss()');for(let i=0;i<240;i++)g.read('update()');
 assert.equal(g.read('gameOver'),false);assert.equal(g.read('bossEncounter'),null);assert.equal(g.read('running'),true);assert.equal(g.read('progress.wins'),1);
 const reward=5+({easy:0,medium:1,hard:2}[difficulty])+(mode==='items'?3:0);assert(g.read(`progress.released.includes(${reward})`));assert(create(g.store).read(`progress.released.includes(${reward})`));
}
const weak=create();begin(weak);weak.read('runMeters=nextBossAt; startBoss()');for(let i=0;i<120;i++)weak.read('update()');assert.equal(weak.read('gameOver'),true);assert.equal(weak.read('failureReason'),'boss');assert.equal(weak.read('progress.wins'),0);
const bossDev=create();begin(bossDev,'items','hard',true);for(let i=0;i<35;i++)bossDev.read('collectFood()');bossDev.read('startBoss()');for(let i=0;i<240;i++)bossDev.read('update()');assert.equal(bossDev.read('progress.wins'),0);assert.equal(bossDev.read('progress.released.length'),1);
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
console.log('PASS: no blue bars; growth; mode/difficulty locks; currency and 4 upgrade tracks; migration; Boss success/failure/loot; endless continuation; 3 failure animations; pause, replay, timing and jumps.');
