/* ============================================================
   WAR — Classic card battle. Ties go to war (3 cards down, 1 up)
   ============================================================ */
(function() {
  let playerDeck, cpuDeck, phase, warCards;

  function init() {
    buildGameScreen('war', 'WAR', `
      <div class="table-felt" style="max-width:700px;width:100%">
        <div class="war-arena">
          <div class="war-side">
            <div class="hand-label">OPPONENT</div>
            <div class="war-card-slot" id="war-cpu-card"></div>
            <div class="war-deck-count" id="war-cpu-count">26 cards</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:center;gap:12px">
            <div class="war-vs" id="war-vs">⚔</div>
            <div id="war-message" class="game-message msg-info" style="font-size:1rem;min-width:200px">Press BATTLE to begin</div>
          </div>
          <div class="war-side">
            <div class="hand-label">YOU</div>
            <div class="war-card-slot" id="war-player-card"></div>
            <div class="war-deck-count" id="war-player-count">26 cards</div>
          </div>
        </div>

        <!-- War pile display -->
        <div id="war-pile-area" style="text-align:center;margin-top:16px;min-height:40px"></div>
      </div>

      <div class="btn-row">
        <button class="btn btn-primary" id="war-battle-btn" onclick="WAR.battle()">⚔ BATTLE</button>
        <button class="btn btn-ghost" onclick="WAR.newGame()">NEW GAME</button>
      </div>

      <div class="info-panel" style="max-width:400px;width:100%">
        <div class="stat-row" style="justify-content:center;gap:32px">
          <div class="stat-item">
            <div class="stat-label">Your Cards</div>
            <div class="stat-value" id="war-p-total">26</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Rounds Won</div>
            <div class="stat-value" id="war-rounds">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Opponent</div>
            <div class="stat-value" id="war-c-total">26</div>
          </div>
        </div>
      </div>
    `);

    newGame();
  }

  function newGame() {
    const fullDeck = new Deck(1);
    playerDeck = [];
    cpuDeck    = [];
    fullDeck.cards.forEach((c, i) => {
      if (i % 2 === 0) playerDeck.push(c);
      else             cpuDeck.push(c);
    });
    warCards = [];
    phase    = 'ready';
    rounds   = 0;
    clearDisplay();
    setMessage('Press BATTLE to begin', 'msg-info');
    document.getElementById('war-battle-btn').textContent = '⚔ BATTLE';
    updateCounts();
  }

  let rounds = 0;

  function clearDisplay() {
    const pc = document.getElementById('war-player-card');
    const cc = document.getElementById('war-cpu-card');
    const pa = document.getElementById('war-pile-area');
    if (pc) pc.innerHTML = '';
    if (cc) cc.innerHTML = '';
    if (pa) pa.innerHTML = '';
  }

  function setMessage(msg, cls = 'msg-info') {
    const el = document.getElementById('war-message');
    if (el) { el.className = `game-message ${cls}`; el.textContent = msg; }
  }

  function updateCounts() {
    const pc = document.getElementById('war-player-count');
    const cc = document.getElementById('war-cpu-count');
    const pt = document.getElementById('war-p-total');
    const ct = document.getElementById('war-c-total');
    const r  = document.getElementById('war-rounds');
    if (pc) pc.textContent = `${playerDeck.length} card${playerDeck.length !== 1 ? 's' : ''}`;
    if (cc) cc.textContent = `${cpuDeck.length} card${cpuDeck.length !== 1 ? 's' : ''}`;
    if (pt) pt.textContent = playerDeck.length;
    if (ct) ct.textContent = cpuDeck.length;
    if (r)  r.textContent  = rounds;
