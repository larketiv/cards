/* ============================================================
   SOLITAIRE — Klondike (click-to-select, click-to-place)
   ============================================================ */
(function() {
  let tableau, foundations, stock, waste, selected, moves, timer, startTime, gameWon;
  // selected: { source, sourceIdx, cards[] }

  function init() {
    buildGameScreen('solitaire', 'SOLITAIRE', `
      <div style="width:100%;max-width:720px">
        <!-- Stats bar -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
          <div class="stat-item">
            <div class="stat-label">Moves</div>
            <div class="stat-value" id="sol-moves">0</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Time</div>
            <div class="stat-value" id="sol-timer">0:00</div>
          </div>
          <div class="btn-row">
            <button class="btn btn-ghost" style="font-size:0.75rem;padding:6px 14px" onclick="SOL.newGame()">NEW GAME</button>
            <button class="btn btn-ghost" style="font-size:0.75rem;padding:6px 14px" onclick="SOL.hint()">HINT</button>
          </div>
        </div>

        <!-- Table -->
        <div class="table-felt" style="padding:16px">
          <!-- Top row: stock/waste + foundations -->
          <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;justify-content:space-between">
            <div style="display:flex;gap:8px">
              <!-- Stock -->
              <div id="sol-stock" style="width:68px;height:100px;border:2px dashed rgba(255,255,255,0.1);border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0" onclick="SOL.clickStock()"></div>
              <!-- Waste (top 1 visible) -->
              <div id="sol-waste" style="width:68px;height:100px;border:2px dashed rgba(255,255,255,0.06);border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0" onclick="SOL.clickWaste()"></div>
            </div>
            <!-- Foundations -->
            <div style="display:flex;gap:8px" id="sol-foundations"></div>
          </div>

          <!-- Tableau -->
          <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:8px" id="sol-tableau"></div>
        </div>

        <div id="sol-message" class="game-message msg-info" style="font-size:0.9rem;min-height:2rem"></div>
      </div>
    `);

    newGame();
  }

  function newGame() {
    clearInterval(timer);
    moves     = 0;
    gameWon   = false;
    selected  = null;
    startTime = Date.now();

    // Deal
    const deck = new Deck(1);
    tableau     = Array.from({length:7}, () => []);
    foundations = Array.from({length:4}, () => []);
    stock       = [];
    waste       = [];

    for (let col = 0; col < 7; col++) {
      for (let row = col; row < 7; row++) {
        const c = deck.deal();
        c.faceUp = (row === col);
        tableau[col].push(c);
      }
    }
    while (!deck.isEmpty()) {
      const c = deck.deal();
      c.faceUp = false;
      stock.push(c);
    }

    document.getElementById('sol-moves').textContent = '0';
    setMessage('');

    timer = setInterval(() => {
      if (gameWon) { clearInterval(timer); return; }
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const m = Math.floor(elapsed / 60);
      const s = elapsed % 60;
      const el = document.getElementById('sol-timer');
      if (el) el.textContent = `${m}:${s.toString().padStart(2,'0')}`;
    }, 1000);

    render();
  }

  function setMessage(msg, cls = 'msg-info') {
    const el = document.getElementById('sol-message');
    if (el) { el.className = `game-message ${cls}`; el.textContent = msg; }
  }

  function render() {
    renderStock();
