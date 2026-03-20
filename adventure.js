/* ================================================================
   The Diabolical Adventures of Shane Wyman — adventure.js
   ================================================================ */

'use strict';

// ── Screen routing helpers ────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('#app > .screen').forEach(s => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

function goToModeSelect() {
  showScreen('mode-screen');
}

// ── Mode-select buttons ───────────────────────────────────────────
document.getElementById('mode-pacman').addEventListener('click', () => {
  showScreen('start-screen');
});

document.getElementById('mode-adventure').addEventListener('click', () => {
  showScreen('adventure-screen');
  document.getElementById('adv-intro').style.display = '';
  document.getElementById('adv-game').style.display  = 'none';
});

// ── Back-to-menu buttons (Pac-Man side) ──────────────────────────
document.getElementById('pacman-back-btn').addEventListener('click',  goToModeSelect);
document.getElementById('gameover-back-btn').addEventListener('click', goToModeSelect);
document.getElementById('win-back-btn').addEventListener('click',     goToModeSelect);

// Override startGame (defined in game.js) to show the right start screen
// We punch through by patching after game.js is loaded.
const _origStartGame = window.startGame;
const _startBtn      = document.getElementById('start-btn');
const _restartBtn    = document.getElementById('restart-btn');
const _winRestartBtn = document.getElementById('win-restart-btn');

// game.js already wired up start/restart — keep those working but DON'T
// go back to mode-screen automatically on restart; only the back buttons do that.

// ── Adventure: intro ─────────────────────────────────────────────
document.getElementById('adv-back-btn').addEventListener('click', goToModeSelect);

document.getElementById('adv-enter-btn').addEventListener('click', () => {
  advState = { drift: false, steve: false, mall: false, job: false, turner: false };
  document.getElementById('adv-intro').style.display = 'none';
  document.getElementById('adv-game').style.display  = '';
  advRender('start');
});

document.getElementById('adv-game-back-btn').addEventListener('click', () => {
  document.getElementById('adv-intro').style.display = '';
  document.getElementById('adv-game').style.display  = 'none';
  goToModeSelect();
});

// ── Adventure: state & story ──────────────────────────────────────
let advState = { drift: false, steve: false, mall: false, job: false, turner: false };

const advStory = {
  start: {
    text: "You are <span class='adv-hl'>Shane Wyman</span>. Bremerton, Washington's most unrecognized hip-hop prodigy, connoisseur of fine sticky icky, and an absolute local legend. It's 1:30 PM on a Friday. You wake up in your apartment, slightly hungover from pounding Rainiers last night. The smell of low tide from the Puget Sound mixes with the stale smoke of yesterday's blunt.<br><br>You roll over, pack a fresh bowl of Alaskan Thunderfuck, and take a massive rip. You cough until you see Jesus. Your notebook of diabolical rap lyrics sits on the table. You know you're destined for hip-hop immortality, but right now, you are broke, thirsty, and looking for women. Today is the day you make moves.",
    choices: [
      { text: "Grab your notebook, throw on a hoodie, and hit the Bremerton streets.", target: "hub" }
    ]
  },
  hub: {
    text: () => {
      const done = Object.values(advState).filter(Boolean).length;
      if (done === 0) return "You step out onto the gritty streets of Bremerton. Navy squids walk by in uniform, seagulls violently fight over a discarded teriyaki wrapper, and the overcast sky perfectly matches your aesthetic. You feel an unstoppable wave of swagger. What's the master plan?";
      if (done < 5)  return "You're back on the streets of Kitsap County. You're riding a solid buzz and your swagger is on a hundred thousand trillion, but the day ain't over. Where to next, homie?";
      return "The sun has set over the Puget Sound. You are fueled by weed, cheap alcohol, and raw sexual energy. You've conquered the day. There is only one thing left to do to cement your legacy tonight.";
    },
    choices: () => {
      const opts = [];
      if (!advState.drift)  opts.push({ text: "Hit up the Drift In Saloon for a drink and try to bag a hot date.", target: "drift" });
      if (!advState.steve)  opts.push({ text: "Meet up with your friend Steve to collaborate on some dope ass hip hop tracks.", target: "steve" });
      if (!advState.mall)   opts.push({ text: "Take the Kitsap Transit bus to Silverdale and pick up chicks at the Kitsap Mall.", target: "mall" });
      if (!advState.job)    opts.push({ text: "Pretend to be a responsible adult and look for a job.", target: "job" });
      if (!advState.turner) opts.push({ text: "Wander down to the boardwalk and sneak onto the USS Turner Joy.", target: "turner" });
      const done = Object.values(advState).filter(Boolean).length;
      if (done >= 2) opts.push({ text: "Fuck it, the night is now. Hit up Karaoke and show the world your gift.", target: "karaoke", cls: "btn-adv-karaoke" });
      return opts;
    }
  },

  // Drift In Saloon
  drift: {
    text: "You swagger into the <span class='adv-hl'>Drift In Saloon</span> on 1st Street. It's dark, smells beautifully of stale beer and bleach, and is packed with shipyard workers day-drinking their pain away. You order a double shot of well whiskey and a Rainier.<br><br>Across the room, you spot a girl with a flannel shirt and a Monster Energy tattoo on her neck destroying everyone at the pool table. She is a certified PNW 10. How do you approach?",
    choices: [
      { text: "Hit her with a diabolical hip-hop pickup line.", target: "drift_line" },
      { text: "Throw down a crumpled $5 bill and challenge her to a game of 8-ball.", target: "drift_pool" }
    ]
  },
  drift_line: {
    text: "You walk up, lean smoothly on the pool table, and hit her with: 'Girl, are you the Manette Bridge? Because I wanna ride across you all night long and complain about the traffic.'<br><br>She stares at you, blinks, and then bursts out laughing. She loves it! You guys end up taking Jaeger bombs and making out aggressively in the alley next to the dumpsters. She gives you her number and says she's going to a Karaoke bar later. Absolute success.",
    action: () => advState.drift = true,
    choices: [{ text: "Wipe the cheap lip gloss off your mouth and head back to the streets.", target: "hub" }]
  },
  drift_pool: {
    text: "You try to look like a total badass pool shark. On the break, you scratch and send the cue ball flying off the table, directly into the shin of a 300-pound biker named 'Tiny'.<br><br>Tiny picks you up by your belt and physically throws you out the front doors onto the pavement. At least you still have your pride.",
    action: () => advState.drift = true,
    choices: [{ text: "Dust off your jacket and get back to the hustle.", target: "hub" }]
  },

  // Steve's studio
  steve: {
    text: "You pull up to <span class='adv-hl'>Steve's</span> basement studio in East Bremerton. It's so hazy with blunt smoke you can barely see the walls. Steve is hunched over his laptop, cooking up a grimy boom-bap beat.<br><br>'Shane, bro!' he yells. 'We need to lay down some dope ass hip hop tracks today. What's the vibe?'",
    choices: [
      { text: "A gritty, hardcore track about the struggles of living near the Naval Shipyard.", target: "steve_gritty" },
      { text: "A nasty club banger about getting high and bagging MILFs.", target: "steve_club" }
    ]
  },
  steve_gritty: {
    text: "You step up to the mic and spit raw fire about nuclear radiation, aggressive seagulls, and the rising price of tallboys at the local minimart.<br><br>Steve is literally crying. 'Bro, this is art. This is the realest shit I've ever heard,' he sobs. You smoke a massive victory blunt to celebrate your genius. You both agree you need to perform this at Karaoke tonight.",
    action: () => advState.steve = true,
    choices: [{ text: "Time to leave the studio and find some trouble.", target: "hub" }]
  },
  steve_club: {
    text: "You lay down a diabolical verse about popping bottles of cheap malt liquor and seducing bored housewives in Silverdale. The flow is immaculate. The beat is nasty.<br><br>Steve bounces out of his chair. 'This is gonna go platinum in the hood, bro!' You guys celebrate with some earth-shattering bong rips.",
    action: () => advState.steve = true,
    choices: [{ text: "Your lyrical thirst is quenched. Back to the streets.", target: "hub" }]
  },

  // Kitsap Mall
  mall: {
    text: "You ride the bus up through Gorst traffic to the <span class='adv-hl'>Kitsap Mall</span>. Ah, the promised land. The air smells like Auntie Anne's pretzels, cheap cologne, and desperation. It's prime hunting ground. Where do you post up?",
    choices: [
      { text: "Hit the food court and spit game near the pretzels.", target: "mall_food" },
      { text: "Lurk outside Spencer's Gifts to find a goth chick.", target: "mall_spencers" }
    ]
  },
  mall_food: {
    text: "You buy a large lemonade and sit near a group of girls sharing some fries. You start freestyling a cappella about how delicious their fries look and how you're the next big rap god.<br><br>One of them actually laughs and writes her number on a napkin before mall security rolls up on a Segway and tells you to stop aggressively rhyming at the customers.",
    action: () => advState.mall = true,
    choices: [{ text: "A number is a number! Head back to Bremerton.", target: "hub" }]
  },
  mall_spencers: {
    text: "You spot a thick goth girl looking at a wall of blacklight posters. You tell her your soul is darker than her eyeliner and invite her to smoke weed behind the JCPenney loading dock.<br><br>She agrees! You hotbox her 1998 Toyota Corolla for an hour while listening to your mixtape. Best trip to the mall ever.",
    action: () => advState.mall = true,
    choices: [{ text: "Smelling heavily of loud pack, you catch the bus back.", target: "hub" }]
  },

  // Job hunt
  job: {
    text: "Your weed fund is getting dangerously low, so you decide to bite the bullet and <span class='adv-hl'>look for a job</span>. You walk downtown. Where are you applying?",
    choices: [
      { text: "The Puget Sound Naval Shipyard recruitment office.", target: "job_sub" },
      { text: "The local weed dispensary, Destination HWY 420.", target: "job_weed" }
    ]
  },
  job_sub: {
    text: "You walk into the Navy recruitment office. The recruiter looks at your backward snapback, notices your bloodshot eyes, and smells the distinct aroma of dank weed radiating from your clothes. You tell him you want to be the captain of a nuclear submarine.<br><br>The recruiter laughs so hard he spits black coffee all over his desk. He tells you the only thing you're qualified to captain is a rubber dinghy. You flip him off and strut out, knowing the military-industrial complex just isn't ready for your genius.",
    action: () => advState.job = true,
    choices: [{ text: "Back to the grind.", target: "hub" }]
  },
  job_weed: {
    text: "You walk into the dispensary and ask the manager for a job. He hands you some rolling papers and an eighth of herb. 'Roll a cross joint,' he says.<br><br>You craft an architectural masterpiece of a joint that would make Seth Rogen weep. He hires you on the spot. You grab a free sample, tell him you're taking your 15-minute break, and literally never return.",
    action: () => advState.job = true,
    choices: [{ text: "Free weed! Run back to the hub.", target: "hub" }]
  },

  // USS Turner Joy
  turner: {
    text: "You walk onto the Bremerton boardwalk and sneak aboard the decommissioned <span class='adv-hl'>USS Turner Joy</span> destroyer. It's the perfect spot to get high and reflect on your lyrical genius.",
    choices: [
      { text: "Hotbox the captain's quarters.", target: "turner_smoke" }
    ]
  },
  turner_smoke: {
    text: "You spark up a massive blunt in the captain's chair. You start hallucinating that you're commanding the vessel in the Gulf of Tonkin, aggressively beatboxing over the ship's intercom system. A volunteer tour guide finds you, screams, and chases you off the ship with a broom. Classic Shane.",
    action: () => advState.turner = true,
    choices: [{ text: "Flee the scene and head back to the streets.", target: "hub" }]
  },

  // Karaoke finale
  karaoke: {
    text: "This is it. The culmination of your epic day. You swagger into the local <span class='adv-hl'>Karaoke bar</span>. The neon lights buzz, the drinks are flowing, and the stage is calling your name. You've got cheap whiskey in your veins, premium weed in your lungs, and the spirit of hip-hop in your soul.<br><br>The KJ calls your name: 'Next up, local legend... Shane Wyman!' You grab the mic. The crowd hushes. It's time to do a song by Eminem. Which one?",
    choices: [
      { text: "Spit 'Lose Yourself'.", target: "karaoke_eminem" },
      { text: "Spit 'Without Me'.", target: "karaoke_eminem" },
      { text: "Spit 'Rap God'.", target: "karaoke_eminem" }
    ]
  },
  karaoke_eminem: {
    text: "The beat drops. You close your eyes. You channel all the weed, the dive bar liquor, the Bremerton angst, and the mall thots into your vocal cords. You don't just sing... you BECOME the song.<br><br>Your flow is flawless. Your breath control is supernatural. You hit every single syllable with the precision of a Tomahawk missile. Women faint. Grown men weep openly. As the song ends, the crowd erupts into a deafening, earth-shattering standing ovation. You casually drop the mic.",
    choices: [
      { text: "Walk off stage like an absolute boss.", target: "karaoke_encounter" }
    ]
  },
  karaoke_encounter: {
    text: "You step off the stage, drenched in sweat and pure glory. Suddenly, the crowd parts. A figure steps out of the shadows in the corner of the bar. He's wearing a hoodie pulled low over his face. He lowers the hood. You gasp.<br><br>It's none other than Marshall Mathers himself. <span class='adv-hl'>Eminem.</span><br><br>He looks at you, dead serious, and says:<br><br><div class='adv-quote'>\"I've been keeping my eye on you. Your lyrics are diabolical, homie. And after hearing you spit straight fire on that mic... you blew me away. I'd like to sign you to my record label and be best friends.\"</div>",
    choices: [
      { text: "Accept his offer and secure your legacy.", target: "ending", cls: "btn-adv-karaoke" }
    ]
  },
  ending: {
    text: "You shake Eminem's hand. You immediately fly out of Bremerton on a private jet, leaving behind the Drift In saloon, the Kitsap Mall, and the naval yard. You and Eminem release a multi-platinum collab album called 'Bremerton Boyz'.<br><br>You tour the world, smoke the finest weed known to mankind, pick up the hottest chicks globally, and live happily ever after as a hip-hop god.<br><br><span class='adv-hl adv-win-banner'>YOU WIN.<br>SHANE WYMAN IS A LEGEND.</span>",
    choices: [
      { text: "Play Again", target: "start", resetState: true, cls: "btn-adv-karaoke" },
      { text: "← Main Menu", target: "_menu" }
    ]
  }
};

function advRender(nodeId) {
  if (nodeId === '_menu') { goToModeSelect(); return; }

  const node     = advStory[nodeId];
  const storyEl  = document.getElementById('adv-story');
  const choicesEl= document.getElementById('adv-choices');

  if (node.action) node.action();

  storyEl.style.opacity  = '0';
  choicesEl.style.opacity= '0';

  setTimeout(() => {
    storyEl.innerHTML  = typeof node.text    === 'function' ? node.text()    : node.text;
    const choices      = typeof node.choices === 'function' ? node.choices() : node.choices;
    choicesEl.innerHTML = '';
    choices.forEach(c => {
      if (c.resetState) advState = { drift:false, steve:false, mall:false, job:false, turner:false };
      const btn = document.createElement('button');
      btn.className = 'adv-choice-btn' + (c.cls ? ` ${c.cls}` : '');
      btn.innerHTML = c.text;
      btn.addEventListener('click', () => advRender(c.target));
      choicesEl.appendChild(btn);
    });
    storyEl.style.opacity  = '1';
    choicesEl.style.opacity= '1';
    document.getElementById('adv-game').scrollTo({ top: 0, behavior: 'smooth' });
  }, 280);
}
