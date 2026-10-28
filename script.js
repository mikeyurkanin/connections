erson/**
 * Connections – customizable version
 *
 * Edit the PUZZLE object below (or use the in-app editor)
 * to define your own categories and words.
 */

// ========== DEFAULT PUZZLE (edit this or use the editor) ==========
const DEFAULT_PUZZLE = {
  title: "Connections",
  groups: [
    {
      title: "52",
      words: ["Card deck", "Weeks", "Piano white keys", "26+26"]
    },
    {
      title: "Presidents",
      words: ["Jefferson", "Washington", "Monroe", "Truman"]
    },
    {
      title: "OC",
      words: ["Ocean City", "Orange County", "Orange Crush", "Original character"]
    },
    {
      title: "Capitals named after presidents",
      words: ["Jackson", "Jefferson City", "Madison", "Lincoln"]
    }
  ]
};

// Color order matches difficulty (easiest → hardest)
const COLORS = ["yellow", "green", "blue", "purple"];
const MAX_MISTAKES = 4;

// ========== STATE ==========
let puzzle = structuredClone(DEFAULT_PUZZLE);
let remainingWords = [];
let selected = new Set();
let solvedGroups = [];
let mistakes = 0;
let gameOver = false;
let previousGuesses = new Set(); // to block exact re-guesses

// ========== DOM ==========
const boardEl = document.getElementById("board");
const solvedEl = document.getElementById("solved-groups");
const mistakeDotsEl = document.getElementById("mistake-dots");
const messageEl = document.getElementById("message");
const btnSubmit = document.getElementById("btn-submit");
const btnShuffle = document.getElementById("btn-shuffle");
const btnDeselect = document.getElementById("btn-deselect");
const btnRestart = document.getElementById("btn-restart");
const endScreen = document.getElementById("end-screen");
const endTitle = document.getElementById("end-title");
const endMessage = document.getElementById("end-message");
const btnEdit = document.getElementById("btn-edit");
const editorModal = document.getElementById("editor-modal");
const puzzleJsonEl = document.getElementById("puzzle-json");
const btnSavePuzzle = document.getElementById("btn-save-puzzle");
const btnCancelEdit = document.getElementById("btn-cancel-edit");
const btnLoadExample = document.getElementById("btn-load-example");
const editorError = document.getElementById("editor-error");

// ========== INIT ==========
function init() {
  // Try to load from localStorage (so edits persist across refreshes)
  const saved = localStorage.getItem("connections-puzzle");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (validatePuzzle(parsed)) {
        puzzle = parsed;
      }
    } catch (_) {
      // ignore bad saved data
    }
  }

  resetGame();
}

function resetGame() {
  remainingWords = puzzle.groups.flatMap((g) => g.words.map((w) => w.toUpperCase()));
  shuffle(remainingWords);
  selected.clear();
  solvedGroups = [];
  mistakes = 0;
  gameOver = false;
  previousGuesses.clear();

  renderBoard();
  renderSolved();
  renderMistakes();
  clearMessage();
  endScreen.classList.add("hidden");
  updateSubmitButton();
}

// ========== RENDERING ==========
function renderBoard() {
  boardEl.innerHTML = "";
  remainingWords.forEach((word) => {
    const btn = document.createElement("button");
    btn.className = "tile";
    btn.textContent = word;
    btn.dataset.word = word;
    if (selected.has(word)) btn.classList.add("selected");
    btn.addEventListener("click", () => toggleSelect(word));
    boardEl.appendChild(btn);
  });
}

function renderSolved() {
  solvedEl.innerHTML = "";
  solvedGroups.forEach((group, idx) => {
    const div = document.createElement("div");
    div.className = `solved-group ${COLORS[idx] || "yellow"}`;
    div.innerHTML = `
      <div class="title">${escapeHtml(group.title)}</div>
      <div class="words">${group.words.join(", ")}</div>
    `;
    solvedEl.appendChild(div);
  });
}

function renderMistakes() {
  mistakeDotsEl.innerHTML = "";
  for (let i = 0; i < MAX_MISTAKES; i++) {
    const dot = document.createElement("div");
    dot.className = "dot" + (i < mistakes ? " used" : "");
    mistakeDotsEl.appendChild(dot);
  }
}

function updateSubmitButton() {
  btnSubmit.disabled = selected.size !== 4 || gameOver;
}

// ========== GAME LOGIC ==========
function toggleSelect(word) {
  if (gameOver) return;
  if (selected.has(word)) {
    selected.delete(word);
  } else {
    if (selected.size >= 4) return;
    selected.add(word);
  }
  renderBoard();
  updateSubmitButton();
  clearMessage();
}

function deselectAll() {
  selected.clear();
  renderBoard();
  updateSubmitButton();
  clearMessage();
}

function shuffleRemaining() {
  if (gameOver) return;
  shuffle(remainingWords);
  renderBoard();
}

function submitGuess() {
  if (selected.size !== 4 || gameOver) return;

  const guess = Array.from(selected).sort().join("|");
  if (previousGuesses.has(guess)) {
    showMessage("Already guessed", "wrong");
    return;
  }
  previousGuesses.add(guess);

  // Check exact match against any remaining group
  const matchedGroup = puzzle.groups.find((g) => {
    if (solvedGroups.some((s) => s.title === g.title)) return false;
    const groupWords = g.words.map((w) => w.toUpperCase()).sort();
    const selectedWords = Array.from(selected).sort();
    return arraysEqual(groupWords, selectedWords);
  });

  if (matchedGroup) {
    // Correct!
    solvedGroups.push({
      title: matchedGroup.title,
      words: matchedGroup.words.map((w) => w.toUpperCase())
    });
    remainingWords = remainingWords.filter((w) => !selected.has(w));
    selected.clear();
    renderSolved();
    renderBoard();
    showMessage("Correct!", "correct");
    updateSubmitButton();

    if (solvedGroups.length === 4) {
      endGame(true);
    }
    return;
  }

  // Check "one away" (exactly 3 words from any remaining group)
  let oneAway = false;
  for (const g of puzzle.groups) {
    if (solvedGroups.some((s) => s.title === g.title)) continue;
    const groupSet = new Set(g.words.map((w) => w.toUpperCase()));
    let overlap = 0;
    for (const w of selected) {
      if (groupSet.has(w)) overlap++;
    }
    if (overlap === 3) {
      oneAway = true;
      break;
    }
  }

  mistakes++;
  renderMistakes();
  selected.clear();
  renderBoard();
  updateSubmitButton();

  if (oneAway) {
    showMessage("One away...", "one-away");
  } else {
    showMessage("Incorrect", "wrong");
    boardEl.classList.add("shake");
    setTimeout(() => boardEl.classList.remove("shake"), 400);
  }

  if (mistakes >= MAX_MISTAKES) {
    endGame(false);
  }
}

function endGame(won) {
  gameOver = true;
  updateSubmitButton();

  // Reveal remaining groups if lost
  if (!won) {
    puzzle.groups.forEach((g) => {
      if (!solvedGroups.some((s) => s.title === g.title)) {
        solvedGroups.push({
          title: g.title,
          words: g.words.map((w) => w.toUpperCase())
        });
      }
    });
    remainingWords = [];
    renderSolved();
    renderBoard();
  }

  endTitle.textContent = won ? "Congratulations!" : "Next time!";
  endMessage.textContent = won
    ? "You found all four connections."
    : "Better luck next time.";
  endScreen.classList.remove("hidden");
}

// ========== HELPERS ==========
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function showMessage(text, type = "") {
  messageEl.textContent = text;
  messageEl.className = "message " + type;
}

function clearMessage() {
  messageEl.textContent = "";
  messageEl.className = "message";
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ========== EDITOR ==========
function openEditor() {
  puzzleJsonEl.value = JSON.stringify(puzzle, null, 2);
  editorError.textContent = "";
  editorModal.classList.remove("hidden");
}

function closeEditor() {
  editorModal.classList.add("hidden");
}

function loadExample() {
  puzzleJsonEl.value = JSON.stringify(DEFAULT_PUZZLE, null, 2);
  editorError.textContent = "";
}

function savePuzzle() {
  let data;
  try {
    data = JSON.parse(puzzleJsonEl.value);
  } catch (e) {
    editorError.textContent = "Invalid JSON: " + e.message;
    return;
  }

  if (!validatePuzzle(data)) {
    editorError.textContent =
      "Puzzle must have exactly 4 groups, each with a title and exactly 4 words.";
    return;
  }

  // Normalize to uppercase words
  data.groups = data.groups.map((g) => ({
    title: g.title.trim(),
    words: g.words.map((w) => String(w).trim().toUpperCase())
  }));

  // Check for duplicate words
  const allWords = data.groups.flatMap((g) => g.words);
  if (new Set(allWords).size !== 16) {
    editorError.textContent = "All 16 words must be unique.";
    return;
  }

  puzzle = data;
  localStorage.setItem("connections-puzzle", JSON.stringify(puzzle));
  closeEditor();
  resetGame();
}

function validatePuzzle(data) {
  if (!data || !Array.isArray(data.groups) || data.groups.length !== 4) return false;
  for (const g of data.groups) {
    if (!g.title || typeof g.title !== "string") return false;
    if (!Array.isArray(g.words) || g.words.length !== 4) return false;
  }
  return true;
}

// ========== EVENTS ==========
btnSubmit.addEventListener("click", submitGuess);
btnShuffle.addEventListener("click", shuffleRemaining);
btnDeselect.addEventListener("click", deselectAll);
btnRestart.addEventListener("click", resetGame);
btnEdit.addEventListener("click", openEditor);
btnCancelEdit.addEventListener("click", closeEditor);
btnLoadExample.addEventListener("click", loadExample);
btnSavePuzzle.addEventListener("click", savePuzzle);

// Close modal on backdrop click
editorModal.addEventListener("click", (e) => {
  if (e.target === editorModal) closeEditor();
});

// Keyboard: Enter to submit when 4 selected
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && selected.size === 4 && !gameOver) {
    submitGuess();
  }
});

// Start
init();
