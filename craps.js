/* ============================================================
   CRAPS — Casino craps with pass/don't pass, come bets, odds
   ============================================================ */
(function() {
  let chips, bets, point, phase, die1, die2;
  // phase: 'comeout' | 'point'
  // bets: { pass, dontPass, come, field }

  const PASS_PAYOUTS   = { 7:2, 11:2, 2:0, 3:0, 12:0 };
  const FIELD_NUMBERS  = [2,3,4,9,10,11,12];
  const FIELD_PAYOUTS  = { 2:3, 3:2, 4:2, 9:2, 10:2, 11:2, 12:3 };

  function init() {
    chips = 500;
    resetBets();
    point  = null;
    phase  = 'comeout';
    die1   = 1; die2 = 1;

    buildGameScreen('craps', 'CRAPS', `
      <div class="craps-table" style="max-width:700px;width:100%">

        <!-- Point marker -->
        <div style="display:flex;align-items:center;justify-content:center;gap:16px;margin-bottom:12px">
          <div style="font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--text-dim)">POINT</div>
          <div class="craps-point-marker off" id="craps-point-marker">OFF</div>
          <div id="craps-phase-label" style="font-size:0.7rem;letter-spacing:0.2em;text-transform:uppercase;color:var(--red-dim)">COME-OUT ROLL</div>
        </div>

        <!-- Dice -->
        <div class="craps-dice-area">
          <div class="die" id="craps-die1">⚀</div>
          <div class="craps-total" id="craps-total">—</div>
          <div class="die" id="craps-die2">⚀</div>
        </div>

        <!-- Message -->
        <div id="craps-message" class="game-message msg-info">Place your bets, then roll!</div>

        <!-- Bet tiles -->
        <div class="craps-bets-grid" id="craps-bets-grid">
          <div class="craps-bet-tile" id="tile-pass" onclick="CRAPS.toggleBet('pass')">
            <div class="craps-bet-tile-label">PASS LINE</div>
            <div class="craps-bet-tile-amt" id="amt-pass">0</div>
            <div class="craps-bet-tile-payout">Pays 1:1</div>
          </div>
          <div class="craps-bet-tile" id="tile-dontPass" onclick="CRAPS.toggleBet('dontPass')">
            <div class="craps-bet-tile-label">DON'T PASS</div>
            <div class="craps-bet-tile-amt" id="amt-dontPass">0</div>
            <div class="craps-bet-tile-payout">Pays 1:1</div>
          </div>
          <div class="craps-bet-tile" id="tile-come" onclick="CRAPS.toggleBet('come')">
            <div class="craps-bet-tile-label">COME</div>
            <div class="craps-bet-tile-amt" id="amt-come">0</div>
            <div class="craps-bet-tile-payout">Pays 1:1</div>
          </div>
          <div class="craps-bet-tile" id="tile-field" onclick="CRAPS.toggleBet('field')">
            <div class="craps-bet-tile-label">FIELD</div>
            <div class="craps-bet-tile-amt" id="amt-field">0</div>
            <div class="craps-bet-tile-payout">2,12=2:1 | 3,4,9,10,11=1:1</div>
          </div>
        </div>
      </div>

      <!-- Bet size + Roll -->
      <div class="info-panel" style="max-width:600px;width:100%">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap">
          <div class="stat-item">
            <div class="stat-label">Your Chips</div>
            <div class="stat-value" id="craps-chips">500</div>
          </div>
          <div class="bet-section">
            <div class="bet-label">BET AMOUNT</div>
            <div class="bet-controls">
              <button class="bet-btn" onclick="CRAPS.adjustBetSize(-10)">−</button>
              <input class="bet-input" type="number" id="craps-bet-size" value="25" min="5" max="500" style="width:80px">
              <button class="bet-btn" onclick="CRAPS.adjustBetSize(10)">+</button>
            </div>
          </div>
          <div class="btn-row">
            <button class="btn btn-primary" id="craps-roll-btn" onclick="CRAPS.roll()">🎲 ROLL</button>
            <button class="btn btn-ghost" onclick="CRAPS.clearBets()">CLEAR BETS</button>
          </div>
        </div>
      </div>

      <!-- Quick bet chips -->
      <div class="btn-row">
        <button class="btn btn-ghost" style="font-size:0.75rem;padding:6px 12px" onclick="CRAPS.quickBet('pass',25)">+$25 PASS</button>
        <button class="btn btn-ghost" style="font-size:0.75rem;padding:6px 12px" onclick="CRAPS.quickBet('field',25)">+$25 FIELD</button>
        <button class="btn btn-ghost" onclick="CRAPS.newGame()">RESET</button>
      </div>
    `);

    renderAll();
  }

  function resetBets() {
    bets = { pass: 0, dontPass: 0, come: 0, field: 0 };
  }
