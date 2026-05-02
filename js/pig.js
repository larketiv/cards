/* ============================================================
   PIG — Push-your-luck dice game. First to 100 wins.
   Player vs AI. Roll a 1 = lose turn score. Bank to keep it.
   ============================================================ */
(function() {
  let playerTotal, cpuTotal, turnScore, currentDie, isPlayerTurn, gameOver, rolling;
  const WIN_SCORE = 100;

  function init() {
    buildGameScreen('pig', 'PIG', `
      <div class="pig-layout">
        <!-- Scores -->
        <div class="pig-scores">
          <div class="pig-player-score" id="pig-cpu-box">
            <div class="pig-player-name">THE DEVIL</div>
            <div class="pig-total-score" id="pig-cpu-total">0</div>
            <div class="pig-turn-score" id="pig-cpu-turn">Turn: 0</div>
          </div>
          <div style="font-family:'Rye',serif;font-size:0.9rem;color:var(--red-dim);align-self:center;padding:0 8px">VS</div>
          <div class="pig-player-score" id="pig-player-box">
            <div class="pig-player-name">YOU</div>
            <div class="pig-total-score" id="pig-player-total">0</div>
            <div class="pig-turn-score" id="pig-player-turn">Turn: 0</div>
          </div>
        </div>

        <!-- Progress bars -->
        <div style="width:100%;max-width:400px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px">
            <span style="font-size:0.65rem;letter-spacing:0.2em;color:var(--text-dim)">PROGRESS TO ${WIN_SCORE}</span>
          </div>
          <div style="background:rgba(0,0,0,0.4);border-radius:4px;height:8px;overflow:hidden;margin-bottom:4px">
            <div id="pig-player-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--red-blood),var(--red-vivid));transition:width 0.5s;border-radius:4px"></div>
          </div>
          <div style="background:rgba(0,0,0,0.4);border-radius:4px;height:8px;overflow:hidden">
            <div id="pig-cpu-bar" style="height:100%;width:0%;background:linear-gradient(90deg,var(--gold-dark),var(--gold-bright));transition:width 0.5s;border-radius:4px"></div>
          </div>
        </div>

        <!-- Die Area -->
        <div class="pig-die-area">
          <div id="pig-die-container" style="min-height:74px;display:flex;align-items:center;justify-content:center">
            <div class="die pig-die" id="pig-die" style="opacity:0.3">⚀</div>
          </div>
          <div id="pig-turn-label" style="font-size:0.75rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--text-dim)">YOUR TURN</div>
        </div>

        <!-- Message -->
        <div id="pig-message" class="game-message msg-info">Roll the die!</div>

        <!-- Buttons -->
        <div class="btn-row" id="pig-buttons">
          <button class="btn btn-primary" id="pig-roll-btn" onclick="PIG.roll()">🎲 ROLL</button>
          <button class="btn btn-secondary" id="pig-bank-btn" onclick="PIG.bank()" disabled>BANK IT</button>
        </div>
        <div id="pig-new-game-btn" class="btn-row hidden">
          <button class="btn btn-primary" onclick="PIG.newGame()">PLAY AGAIN</button>
          <button class="btn btn-ghost" onclick="goHome()">LEAVE</button>
        </div>
      </div>
    `);
    newGame();
  }

  function newGame() {
    playerTotal   = 0;
    cpuTotal      = 0;
    turnScore     = 0;
    currentDie    = 1;
    isPlayerTurn  = true;
    gameOver      = false;
    rolling       = false;

    document.getElementById('pig-new-game-btn').classList.add('hidden');
    document.getElementById('pig-buttons').classList.remove('hidden');
    document.getElementById('pig-roll-btn').disabled = false;
    document.getElementById('pig-bank-btn').disabled = true;

    updateDisplay();
    setMessage('Roll the die!', 'msg-info');
    setActiveSide('player');
  }

  function setActiveSide(side) {
    const pb = document.getElementById('pig-player-box');
    const cb = document.getElementById('pig-cpu-box');
    const lbl = document.getElementById('pig-turn-label');
    if (pb) pb.classList.toggle('active', side === 'player');
    if (cb) cb.classList.toggle('active', side === 'cpu');
    if (lbl) lbl.textContent = side === 'player' ? 'YOUR TURN' : "DEVIL'S TURN";
  }

  function setMessage(msg, cls = 'msg-info') {
    const el = document.getElementById('pig-message');
    if (el) { el.className = `game-message ${cls}`; el.textContent = msg; }
  }

  function updateDisplay() {
    document.getElementById('pig-player-total').textContent = playerTotal;
    document.getElementById('pig-cpu-total').textContent    = cpuTotal;
