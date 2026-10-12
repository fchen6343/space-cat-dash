const fs=require('node:fs'), vm=require('node:vm'), assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2],'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function create(store={}, width=1080, unavailable=false) {
 const els={},events={},docEvents={},queue=[];
 const context2d=new Proxy({}, {get:(o,k)=>o[k]??(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
 function el(id){return els[id]??={value:id==='difficultySelect'?'easy':'Tester',checked:false,width:1080,height:400,textContent:'',innerHTML:'',
  classList:{add(){},remove(){},toggle(){}},setAttribute(){},getContext(){return context2d;},
  addEventListener(n,f){this[n]=f;},showModal(){this.open=true;},close(){this.open=false;}};}
 const document={hidden:false,getElementById:el,addEventListener(n,f){docEvents[n]=f;}};
 const sandbox={document,window:{innerWidth:width,addEventListener(n,f){events[n]=f;}},localStorage:{getItem(k){if(unavailable)throw Error('Blocked');return store[k]||null;},setItem(k,v){if(unavailable)throw Error('Blocked');store[k]=v;}},performance:{now:()=>0},requestAnimationFrame(fn){queue.push(fn);},Math:Object.assign(Object.create(Math),{random:()=>.5})};
 vm.createContext(sandbox); vm.runInContext(script,sandbox);
 return {els,store,read:s=>vm.runInContext(s,sandbox),key(code,repeat=false){events.keydown({code,repeat,preventDefault(){}});},
  hidden(){document.hidden=true;docEvents.visibilitychange();},frame(t){queue.shift()(t);}};
}

const a=create(); a.els.startBtn.click(); a.key('Space');
// Both icon and Esc freeze physics, score and power-up timers.
a.read('shieldTicks=120; magnetTicks=120;'); a.els.pauseBtn.click();
const frozen=a.read('JSON.stringify({y:player.y,score,shieldTicks,magnetTicks,spawnTick})');
for(let i=0;i<120;i++)a.read('update()'); a.key('ArrowUp');
assert.equal(a.read('JSON.stringify({y:player.y,score,shieldTicks,magnetTicks,spawnTick})'),frozen);
a.key('Escape'); assert.equal(a.read('paused'),false); a.read('update()'); assert.equal(a.read('shieldTicks'),119);
a.key('Escape'); assert.equal(a.read('paused'),true); a.els.pauseRetryBtn.click();
assert.equal(a.read('paused'),false); assert.equal(a.read('foodCount'),0); assert.equal(a.read('runMeters'),0); assert.equal(a.els.difficultySelect.value,'easy');
// All 20 food items produce one win and all five permanent looks.
a.key('Space'); for(let i=0;i<20;i++)a.read('collectFood()'); a.read('updateHUD()');
assert.equal(a.read('victory'),true); assert.equal(a.read('progress.wins'),1); assert.equal(a.read('progress.totalFood'),20);
assert.equal(a.els.foodText.textContent,'Food 20/20'); assert.equal(a.els.foodProgress.value,20);
assert.equal(a.read('progress.released.length'),5); assert(a.read('progress.upcoming.includes(1)'));
a.read('triggerVictory(); recordRun(true)');assert.equal(a.read('progress.wins'),1);
const reloaded=create(a.store); assert.equal(reloaded.read('progress.released.length'),5); assert.equal(reloaded.read('progress.wins'),1); assert(reloaded.read('progress.upcoming.includes(1)'));
// Collection has exactly ten question-mark future previews with conditions and bonuses.
reloaded.els.collectionBtn.click(); assert.equal(reloaded.els.collectionDialog.open,true);
assert.equal((reloaded.els.futureGrid.innerHTML.match(/class="skin-card/g)||[]).length,10);
assert.equal((reloaded.els.futureGrid.innerHTML.match(/Unrevealed skin/g)||[]).length,10);
assert.equal((reloaded.els.futureGrid.innerHTML.match(/Planned bonus:/g)||[]).length,10);
reloaded.els.challengeBtn.click();assert.equal(reloaded.els.challengeDialog.open,true);assert.equal(reloaded.read('gameState'),'menu');
// Every condition has a persistent threshold, including wins across all difficulties.
const milestones=create(); milestones.read('progress.wins=25; progress.totalMeters=10000; progress.totalFood=200; progress.winsByDifficulty={easy:1,medium:1,hard:1}; saveProgress()');
assert.equal(milestones.read('progress.upcoming.length'),10); assert.equal(create(milestones.store).read('progress.upcoming.length'),10);
// Developer play does not unlock or count anything.
const dev=create();dev.els.devModeToggle.checked=true;dev.els.startBtn.click();dev.key('Space');
for(let i=0;i<20;i++)dev.read('collectFood()');
assert.equal(dev.read('progress.wins'),0);assert.equal(dev.read('progress.totalFood'),0);assert.equal(dev.read('progress.released.length'),1);assert.equal(dev.read('progress.runs'),0);
// Easy stays capped over a long run; distance persists after abandoning the run.
const cap=create();cap.els.startBtn.click();cap.key('Space'); cap.read('spawnObstacle=()=>{}; spawnFood=()=>{}; speed=7.1999;');
for(let i=0;i<3600;i++)cap.read('update()');assert.equal(cap.read('speed'),7.2);
assert(cap.read('runMeters')>2500);cap.els.pauseHomeBtn.click();assert(create(cap.store).read('progress.totalMeters')>2500);
// Equipping a collected original skin changes the real food bonus.
const bonus=create({spacecat_collection_v1:JSON.stringify({released:[0,1],equipped:1})});bonus.els.startBtn.click();bonus.key('Space');bonus.read('collectFood()');assert.equal(bonus.read('score'),47.25);
// Narrow canvas and safe storage fallback, including corrupt data.
assert.equal(create({},390).els.game.width,640); create({},390,true).els.startBtn.click();
assert.equal(create({spacecat_collection_v1:'broken'}).read('progress.wins'),0);
const hidden=create();hidden.els.startBtn.click();hidden.key('Space');hidden.hidden();assert.equal(hidden.read('paused'),true);
// Winning while two foods overlap cannot continue iterating a cleared foods array.
const finalFood=create();finalFood.els.startBtn.click();finalFood.key('Space');
for(let i=0;i<19;i++)finalFood.read('collectFood()');
finalFood.read('player.y=280; player.vy=0; foods.push({x:95,y:280,w:24,h:24,wobble:0},{x:95,y:280,w:24,h:24,wobble:0}); update()');
assert.equal(finalFood.read('victory'),true);assert.equal(finalFood.read('progress.wins'),1);
// The renderer rate does not change gameplay or bonuses.
let previous;
for(const hz of [30,60,120,144,240]) {
 const paced=create();paced.els.startBtn.click();paced.key('Space');paced.read('spawnObstacle=()=>{}; shieldTicks=300; magnetTicks=300;');
 for(let i=1;i<=hz*4;i++)paced.frame(i*1000/hz);
 const state=paced.read('JSON.stringify({score,speed,runMeters,shieldTicks,magnetTicks})');
 assert.equal(paced.read('shieldTicks'),60); if(previous)assert.equal(state,previous); previous=state;
}
console.log('PASS: pause/Esc, same-settings retry, 20-food victory, persistence, 10 placeholders, milestones, developer exclusion, Easy cap, skin bonuses, mobile canvas, storage fallback, hidden-tab pause.');
