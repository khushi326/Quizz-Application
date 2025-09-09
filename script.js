
const EMOJIS = ["🐶","🐱","🦊","🐼","🦁","🐵","🐸","🐨","🐯","🐷","🐔","🐻"];


const boardEl = document.getElementById('board');
const movesEl = document.getElementById('moves');
const timerEl = document.getElementById('timer');
const bestEl = document.getElementById('best');
const overlay = document.getElementById('overlay');
const finalMoves = document.getElementById('finalMoves');
const finalTime = document.getElementById('finalTime');
const finalBest = document.getElementById('finalBest');

const restartBtn = document.getElementById('restartBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const playAgain = document.getElementById('playAgain');
const closeModal = document.getElementById('closeModal');

const BEST_KEY = 'memory_best_time_v1';

let cardSymbols = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let matchedCount = 0;
let moves = 0;
let timer = null;
let secondsElapsed = 0;
let totalCards = 24; 

let bestTime = Number(localStorage.getItem(BEST_KEY)) || null;
bestEl.textContent = bestTime ? formatTime(bestTime) : '--';


function initGame(){
  resetState();
  setupCards();
  renderBoard();
  startTimer();
}

function resetState(){
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  matchedCount = 0;
  moves = 0;
  movesEl.textContent = moves;
  clearInterval(timer);
  secondsElapsed = 0;
  timerEl.textContent = "00:00";
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden','true');
}

function setupCards(){
  const pairs = totalCards / 2;
  let pool = [];
  for(let i=0;i<pairs;i++){
    pool.push(EMOJIS[i % EMOJIS.length]);
  }
  cardSymbols = shuffle([...pool, ...pool]);
}

function renderBoard(){
  boardEl.innerHTML = '';
  cardSymbols.forEach((sym, idx) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.setAttribute('data-symbol', sym);
    card.setAttribute('data-index', idx);
    card.setAttribute('aria-label', 'Memory card');
    card.innerHTML = `
      <div class="card-inner">
        <div class="face front" aria-hidden="true">?</div>
        <div class="face back" aria-hidden="true">${sym}</div>
      </div>
    `;
    card.addEventListener('click', onCardClick);
    boardEl.appendChild(card);
  });
}

function onCardClick(e){
  const card = e.currentTarget;
  if(lockBoard) return;
  if(card === firstCard) return;
  if(card.classList.contains('matched')) return;

  flipCard(card);

  if(!firstCard){
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;
  moves++;
  movesEl.textContent = moves;

  const a = firstCard.getAttribute('data-symbol');
  const b = secondCard.getAttribute('data-symbol');

  if(a === b){
    markMatched(firstCard);
    markMatched(secondCard);
    matchedCount += 2;
    resetTurn(true);
    if(matchedCount === totalCards){
      finishGame();
    }
  } else {
    setTimeout(() => {
      unflipCard(firstCard);
      unflipCard(secondCard);
      resetTurn(false);
    }, 900);
  }
}

function flipCard(card){
  card.classList.add('flipped');
}
function unflipCard(card){
  card.classList.remove('flipped');
}
function markMatched(card){
  card.classList.add('matched');
  card.setAttribute('aria-hidden','true');
}
function resetTurn(){
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}
function finishGame(){
  clearInterval(timer);
  const timeUsed = secondsElapsed;
  finalMoves.textContent = `Moves: ${moves}`;
  finalTime.textContent = `Time: ${formatTime(timeUsed)}`;

  let bestText = '';
  if(!bestTime || timeUsed < bestTime){
    bestTime = timeUsed;
    localStorage.setItem(BEST_KEY, String(bestTime));
    bestEl.textContent = formatTime(bestTime);
    bestText = 'New best time! 🎉';
  } else {
    bestText = `Best: ${formatTime(bestTime)}`;
  }
  finalBest.textContent = bestText;

  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden','false');
}

function shuffle(array){
  for(let i = array.length -1; i>0; i--){
    const j = Math.floor(Math.random() * (i+1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function startTimer(){
  clearInterval(timer);
  timer = setInterval(() => {
    secondsElapsed++;
    timerEl.textContent = formatTime(secondsElapsed);
  }, 1000);
}

function formatTime(sec){
  const mm = String(Math.floor(sec/60)).padStart(2,'0');
  const ss = String(sec % 60).padStart(2,'0');
  return `${mm}:${ss}`;
}

restartBtn.addEventListener('click', () => {
  if(confirm('Restart the game?')){
    setupCards();
    renderBoard();
    resetState();
    startTimer();
  }
});

shuffleBtn.addEventListener('click', () => {
  setupCards();
  renderBoard();
  resetState();
  startTimer();
});

playAgain.addEventListener('click', () => {
  setupCards();
  renderBoard();
  resetState();
  startTimer();
});
closeModal.addEventListener('click', () => {
  overlay.classList.remove('show');
  overlay.setAttribute('aria-hidden','true');
});

initGame();