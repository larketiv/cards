/* ============================================================
   TEXAS HOLD'EM — Player vs 3 AI opponents
   Pre-flop → Flop → Turn → River → Showdown
   ============================================================ */
(function() {
  const STARTING_CHIPS = 500;
  const BLIND_SMALL    = 10;
  const BLIND_BIG      = 20;

  let deck, pot, playerChips, players, communityCards, phase, dealerPos, currentBet, minRaise;
  let playerBet, gamePhase, actionQueue, playerFolded, inputLocked;
  // phase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'over'

  const PLAYER_IDX = 0;
  const AI_NAMES = ['GRAVEL', 'SKINNY JIM', 'THE WIDOW'];
  const AI_COLORS = ['#cc6633', '#8888cc', '#cc3366'];

  function init() {
    buildGameScreen('texasholdem', "TEXAS HOLD'EM", `
      <div class="poker-table" style="max-width:800px;width:100%">

        <!-- Opponents -->
        <div class="opponent-row" id="th-opponents"></div>

        <!-- Community Cards + Pot -->
        <div class="table-felt" style="padding:20px">
          <div class="poker-phase-label" id="th-phase-label">WAITING</div>
          <div class="community-cards" id="th-community" style="min-height:112px"></div>
          <div class="pot-display" id="th-pot" style="margin-top:8px">Pot: $0</div>
        </div>

        <!-- Player Hand + Action -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;width:100%">
          <div>
            <div class="hand-label" id="th-player-label">YOUR HAND</div>
            <div class="card-hand" id="th-player-hand"></div>
          </div>

          <!-- Hand strength indicator -->
          <div id="th-hand-strength" style="font-size:0.75rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--gold-mid);min-height:1.2em;text-align:center"></div>

          <!-- Message -->
          <div id="th-message" class="game-message msg-info" style="font-size:1rem"></div>

          <!-- Action controls -->
          <div id="th-actions" class="btn-row hidden">
            <button class="btn btn-danger" id="th-fold-btn"  onclick="TH.fold()">FOLD</button>
            <button class="btn btn-ghost"  id="th-call-btn"  onclick="TH.call()">CALL $0</button>
            <button class="btn btn-secondary" id="th-raise-btn" onclick="TH.raise()">RAISE</button>
            <button class="btn btn-primary" id="th-check-btn" onclick="TH.check()">CHECK</button>
          </div>
          <div id="th-raise-section" class="hidden" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center">
            <div class="bet-controls">
              <button class="bet-btn" onclick="TH.adjustRaise(-20)">−</button>
              <input class="bet-input" id="th-raise-input" type="number" value="40" min="20" max="500" style="width:90px">
              <button class="bet-btn" onclick="TH.adjustRaise(20)">+</button>
            </div>
            <button class="btn btn-primary" onclick="TH.confirmRaise()">RAISE TO</button>
            <button class="btn btn-ghost" onclick="TH.cancelRaise()">CANCEL</button>
          </div>

          <!-- New hand button -->
          <div id="th-new-hand-btn" class="btn-row hidden">
            <button class="btn btn-primary" onclick="TH.newHand()">NEXT HAND</button>
            <button class="btn btn-ghost"   onclick="goHome()">LEAVE</button>
          </div>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="info-panel" style="max-width:600px;width:100%">
        <div class="stat-row" style="justify-content:center;gap:24px">
          <div class="stat-item">
            <div class="stat-label">Your Stack</div>
            <div class="stat-value" id="th-player-chips">${STARTING_CHIPS}</div>
          </div>
          <div class="stat-item">
            <div class="stat-label">Dealer</div>
            <div class="stat-value" id="th-dealer-pos">—</div>
          </div>
        </div>
      </div>
    `);

    playerChips = STARTING_CHIPS;
    dealerPos   = 0;
    newHand();
  }

  function newHand() {
    if (playerChips <= 0) {
      showModal(`<div class="modal-title text-red">BROKE</div>
        <p style="color:var(--text-mid);margin:12px 0">You're out of chips. The table laughs at you.</p>
        <button class="btn btn-primary" onclick="closeModal();TH.resetGame()">REBUY</button>`);
      return;
    }

    deck           = new Deck(1);
    pot            = 0;
    communityCards = [];
