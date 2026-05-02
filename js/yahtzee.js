/* ============================================================
   YAHTZEE — 5 dice, 3 rolls/turn, 13 scoring categories
   ============================================================ */
(function() {
  let dice, kept, rollsLeft, scores, gameOver, totalRounds;

  const CATEGORIES = [
    // Upper section
    { id: 'ones',   label: 'Ones',   section: 'upper', fn: d => sumOf(d,1) },
    { id: 'twos',   label: 'Twos',   section: 'upper', fn: d => sumOf(d,2) },
    { id: 'threes', label: 'Threes', section: 'upper', fn: d => sumOf(d,3) },
    { id: 'fours',  label: 'Fours',  section: 'upper', fn: d => sumOf(d,4) },
    { id: 'fives',  label: 'Fives',  section: 'upper', fn: d => sumOf(d,5) },
    { id: 'sixes',  label: 'Sixes',  section: 'upper', fn: d => sumOf(d,6) },
    // Lower section
    { id: 'threeOfKind',  label: '3 of a Kind',    section: 'lower', fn: d => hasN(d,3) ? d.reduce((a,b)=>a+b,0) : 0 },
    { id: 'fourOfKind',   label: '4 of a Kind',    section: 'lower', fn: d => hasN(d,4) ? d.reduce((a,b)=>a+b,0) : 0 },
    { id: 'fullHouseY',   label: 'Full House',      section: 'lower', fn: d => isFullHouse(d) ? 25 : 0 },
    { id: 'smStraight',   label: 'Sm. Straight',    section: 'lower', fn: d => isSmStraight(d) ? 30 : 0 },
    { id: 'lgStraight',   label: 'Lg. Straight',    section: 'lower', fn: d => isLgStraight(d) ? 40 : 0 },
    { id: 'yahtzee',      label: 'YAHTZEE!',        section: 'lower', fn: d => isYahtzee(d) ? 50 : 0 },
    { id: 'chance',       label: 'Chance',          section: 'lower', fn: d => d.reduce((a,b)=>a+b,0) },
  ];

  // Scoring helpers
  function sumOf(d, n) { return d.filter(v=>v===n).reduce((a,b)=>a+b, 0); }
  function counts(d) {
    const c = {};
    d.forEach(v => { c[v] = (c[v]||0)+1; });
    return c;
  }
  function hasN(d, n) { return Object.values(counts(d)).some(v => v >= n); }
  function isFullHouse(d) {
    const vals = Object.values(counts(d)).sort();
    return (vals.length === 2 && vals[0] === 2 && vals[1] === 3);
  }
  function isSmStraight(d) {
    const u = [...new Set(d)].sort((a,b)=>a-b);
    return hasSeq(u, 4);
  }
  function isLgStraight(d) {
    const u = [...new Set(d)].sort((a,b)=>a-b);
    return u.length === 5 && hasSeq(u, 5);
  }
  function isYahtzee(d) { return new Set(d).size === 1; }
  function hasSeq(sorted, len) {
    let streak = 1, best = 1;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i] === sorted[i-1]+1) { streak++; best = Math.max(best, streak); }
      else if (sorted[i] !== sorted[i-1]) streak = 1;
    }
    return best >= len;
  }

  function init() {
    scores      = {};
    dice        = [1,1,1,1,1];
    kept        = [false,false,false,false,false];
    rollsLeft   = 3;
    gameOver    = false;
    totalRounds = 0;

    buildGameScreen('yahtzee', 'YAHTZEE', `
      <div class="yahtzee-layout">
        <!-- Dice section -->
        <div class="yahtzee-dice-section">
          <div style="font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--text-dim);margin-bottom:4px">ROLL THE DICE</div>

          <div class="dice-row" id="ytz-dice"></div>

          <div class="rolls-left">
            <div style="margin-bottom:4px" id="ytz-roll-label">ROLLS LEFT</div>
            <div class="rolls-pips" id="ytz-pips">
              <div class="roll-pip"></div>
              <div class="roll-pip"></div>
              <div class="roll-pip"></div>
            </div>
          </div>

          <div id="ytz-message" class="game-message msg-info" style="font-size:0.95rem;text-align:center;min-width:220px">Roll to start!</div>

          <button class="btn btn-primary" id="ytz-roll-btn" onclick="YTZ.roll()">🎲 ROLL DICE</button>
          <div style="font-size:0.7rem;color:var(--text-dim);text-align:center">Click dice to keep/unkeep</div>

          <!-- Bonus indicator -->
          <div id="ytz-bonus-tracker" class="info-panel" style="min-width:200px;text-align:center">
            <div class="stat-label">UPPER SECTION BONUS</div>
            <div id="ytz-upper-total" class="stat-value" style="font-size:1rem">0 / 63</div>
            <div style="font-size:0.7rem;color:var(--text-dim);margin-top:2px">Reach 63 for +35 bonus</div>
            <div style="background:rgba(0,0,0,0.4);border-radius:4px;height:6px;overflow:hidden;margin-top:6px">
              <div id="ytz-upper-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--red-blood),var(--gold-bright));transition:width 0.5s;border-radius:4px"></div>
            </div>
          </div>
        </div>

        <!-- Scorecard -->
        <div class="yahtzee-scorecard">
          <table class="score-table" id="ytz-scorecard">
            <thead>
              <tr><th>Category</th><th>Score</th></tr>
