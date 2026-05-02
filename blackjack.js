/* ============================================================
   BLACKJACK — Casino rules, single deck (reshuffled as needed)
   ============================================================ */
(function() {
  let deck, playerHand, dealerHand, chips, bet, gamePhase;
  // phase: 'bet' | 'player' | 'dealer' | 'over'

  function init() {
    chips     = 500;
    bet       = 50;
    gamePhase = 'bet';
    deck      = new Deck(6);

    buildGameScreen('blackjack', 'BLACKJACK', `
      <div class="table-felt" style="max-width:700px;width:100%">
        <div class="bj-table" id="bj-table">
          <!-- Dealer -->
          <div>
            <div class="hand-label">DEALER</div>
            <div class="card-hand" id="bj-dealer-hand"></div>
            <div id="bj-dealer-score" class="bj-score-badge" style="visibility:hidden">0</div>
          </div>

          <div id="bj-message" class="game-message msg-info" style="min-height:2.5rem">— PLACE YOUR BET —</div>

          <!-- Player -->
          <div>
            <div class="hand-label">YOU</div>
            <div class="card-hand" id="bj-player-hand"></div>
            <div id="bj-player-score" class="bj-score-badge" style="visibility:hidden">0</div>
          </div>
        </div>
      </div>

      <!-- Bet / Controls -->
      <div class="info-panel" style="max-width:500px;width:100%">
        <div class="stat-row" style="justify-content:center;gap:32px;margin-bottom:16px">
          <div class="stat-item">
            <div class="stat-label">Chips</div>
            <div class="stat-value" id="bj-chips">500</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Bet</div>
            <div class="stat-value text-gold" id="bj-bet-display">50</div>
          </div>
        </div>

        <!-- Bet controls (visible pre-deal) -->
        <div id="bj-bet-section" class="bet-section">
          <div class="bet-label">ADJUST BET</div>
          <div class="bet-controls">
            <button class="bet-btn" onclick="BJ.adjustBet(-25)">−</button>
            <input class="bet-input" type="number" id="bj-bet-input" value="50" min="10" max="500">
            <button class="bet-btn" onclick="BJ.adjustBet(25)">+</button>
          </div>
          <div class="btn-row" style="margin-top:12px">
            <button class="btn btn-secondary" onclick="BJ.adjustBet(0, 0.5)">½</button>
            <button class="btn btn-secondary" onclick="BJ.adjustBet(0, 2)">×2</button>
            <button class="btn btn-primary" onclick="BJ.deal()" id="bj-deal-btn">DEAL</button>
          </div>
        </div>

        <!-- Action buttons (visible during player turn) -->
        <div id="bj-action-section" class="btn-row hidden">
          <button class="btn btn-primary" id="bj-hit-btn"    onclick="BJ.hit()">HIT</button>
          <button class="btn btn-secondary" id="bj-stand-btn" onclick="BJ.stand()">STAND</button>
          <button class="btn btn-ghost" id="bj-double-btn"   onclick="BJ.doubleDown()">DOUBLE DOWN</button>
        </div>

        <!-- New round button (visible after round ends) -->
        <div id="bj-new-round-section" class="btn-row hidden">
          <button class="btn btn-primary" onclick="BJ.newRound()">NEXT ROUND</button>
          <button class="btn btn-ghost" onclick="goHome()">LEAVE TABLE</button>
        </div>
      </div>
    `);

    render();
  }

  function render() {
    document.getElementById('bj-chips').textContent = chips;
    document.getElementById('bj-bet-display').textContent = bet;
    const input = document.getElementById('bj-bet-input');
    if (input) input.value = bet;
  }

  function setMessage(msg, cls = 'msg-info') {
    const el = document.getElementById('bj-message');
    if (!el) return;
    el.className = `game-message ${cls}`;
    el.textContent = msg;
  }

  function showSection(id) {
    ['bj-bet-section','bj-action-section','bj-new-round-section'].forEach(s => {
      const el = document.getElementById(s);
      if (el) el.classList.add('hidden');
    });
    const target = document.getElementById(id);
