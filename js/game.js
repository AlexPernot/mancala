import { $, $$, randomBetween, showToast } from "./util.js";
import {
  initMarbles,
  renderAddMarbleToHole,
  renderPickMarbles,
} from "./marbleFunctions.js";
import { displayReserveScore } from "./settings.js";

/**
 * @typedef {string} Player
 * @typedef {("h11"|"h12"|"h13"|"h14"|"h15"|"h16"|"h21"|"h22"|"h23"|"h24"|"h25"|"h26"|"r1"|"r2")} Hole First char is 'h' if it's a normal hole, 'r' if it's a reserve hole.
 * Second char is player number, 1 or 2. If it's a normal hole, third char is the position, 1 to 6.
 **/

/**
 * @enum {Player}
 */
const players = {
  p1: "p1",
  p2: "p2",
};

const turnEvents = {
  extraTurn: "EXTRA_TURN",
  capture: "CAPTURE",
};
const urlParams = new URLSearchParams(window.location.search);
const playerNames = {
  p1: urlParams.get("p1") || localStorage.getItem("p1") || "Player 1",
  p2: urlParams.get("p2") || localStorage.getItem("p2") || "Player 2",
};
const marblesInitialPosition = {
  r1: 0,
  r2: 0,
  h11: 4,
  h12: 4,
  h13: 4,
  h14: 4,
  h15: 4,
  h16: 4,
  h21: 4,
  h22: 4,
  h23: 4,
  h24: 4,
  h25: 4,
  h26: 4,
};
let currentPlayer = randomBetween(0, 2) === 0 ? players.p1 : players.p2;
let isGameOver = false;
const marblesCurrentPosition = { ...marblesInitialPosition };

// RENDERING
const renderPlayers = () => {
  $("#header-content").innerHTML =
    "<b>" + playerNames[currentPlayer] + "</b> is playing";
};

// LOGIC
/**
 * Warning : we never put marbles in the other's player reserve.
 * @param {Hole} currentHoleId
 * @param {Player} playerId
 * @return {string}
 */
const getNextHole = (currentHoleId, playerId) => {
  if (currentHoleId === "r1") return "h21";
  if (currentHoleId === "r2") return "h11";
  if (currentHoleId[2] < 6)
    return (
      currentHoleId.substring(0, 2) +
      (parseInt(currentHoleId[2], 10) + 1) +
      currentHoleId.substring(3)
    );
  // Now currentHoleId is h16 or h26. We want to skip the reserve if it's not current player's.
  let mustSkipReserve = currentHoleId[1] !== playerId[1];
  if (currentHoleId === "h16") return mustSkipReserve ? "h21" : "r1";
  if (currentHoleId === "h26") return mustSkipReserve ? "h11" : "r2";

  throw new Error(
    "Cannot get hole next to id " + currentHoleId + " for player " + playerId
  );
};

const getHoleInFrontOf = (holeId) => {
  if (holeId[0] !== "h") {
    throw new Error("Hole " + holeId + " is a reserve.");
  }

  const holeInFrontOf = {
    1: "6",
    2: "5",
    3: "4",
    4: "3",
    5: "2",
    6: "1",
  };

  return `h${holeId[1] === "1" ? "2" : "1"}${holeInFrontOf[holeId[2]]}`;
};

/**
 * From a hold id, get the hole id of the hole in front of it.
 * @param {Hole} holeId The hole where the capture was made.
 */
const captureHoleInFrontOf = async (holeId) => {
  const capturedHoleId = getHoleInFrontOf(holeId);

  let marblesToMove =
    marblesCurrentPosition[holeId] + marblesCurrentPosition[capturedHoleId];
  marblesCurrentPosition[holeId] = 0;
  marblesCurrentPosition[capturedHoleId] = 0;

  let marbleHTMLElements = await renderPickMarbles(holeId);

  marbleHTMLElements = marbleHTMLElements.concat(
    await renderPickMarbles(capturedHoleId)
  );
  renderHoleUI();

  let i = 0;
  const animationPromises = [];
  while (marblesToMove > 0) {
    marblesCurrentPosition[`r${holeId[1]}`] += 1;
    marblesToMove -= 1;
    animationPromises.push(
      renderAddMarbleToHole(marbleHTMLElements[i], `r${holeId[1]}`)
    );
    i++;
  }

  return Promise.all(animationPromises);
};

const switchPlayer = async () => {
  currentPlayer = currentPlayer === players.p1 ? players.p2 : players.p1;
  await showToast(playerNames[currentPlayer] + " is playing");
};

/**
 * Take the marbles out of the clicked hole and put them one by one in the following holes.
 * @param {Hole} holeId
 * @param {Player} playerId
 * @return Promise<Array>
 */
const moveMarbles = async (holeId, playerId) => {
  let currentPosition = holeId;
  let marblesToMove = marblesCurrentPosition[holeId];
  marblesCurrentPosition[holeId] = 0;

  // Play "pick" animations
  const marbleHTMLElements = await renderPickMarbles(holeId);

  let i = 0;
  // Add marbles to next holes
  while (marblesToMove > 0) {
    currentPosition = getNextHole(currentPosition, playerId);
    marblesCurrentPosition[currentPosition] += 1;
    marblesToMove -= 1;
    await renderAddMarbleToHole(marbleHTMLElements[i], currentPosition);
    i++;
  }

  // Extra turn rule
  if (
    (currentPosition === "r1" && playerId === players.p1) ||
    (currentPosition === "r2" && playerId === players.p2)
  ) {
    return [turnEvents.extraTurn, currentPlayer];
  }

  // Capture rule
  if (
    currentPosition[0] === "h" &&
    currentPosition[1] === currentPlayer[1] &&
    marblesCurrentPosition[currentPosition] === 1
  ) {
    const capturedHoleId = getHoleInFrontOf(currentPosition);

    if (marblesCurrentPosition[capturedHoleId] > 0) {
      return [turnEvents.capture, currentPosition];
    }
  }

  return [];
};

const checkGameOver = () => {
  let p1HoleSum = 0;
  let p2HoleSum = 0;

  for (const [holeId, marbleCount] of Object.entries(marblesCurrentPosition)) {
    if (holeId.startsWith("h1")) {
      p1HoleSum += marbleCount;
    } else if (holeId.startsWith("h2")) {
      p2HoleSum += marbleCount;
    }
  }

  return p1HoleSum === 0 || p2HoleSum === 0;
};

const endGame = async () => {
  await showToast("Let's count the score!");

  let marblesToMoveP1 = 0;
  let marblesToMoveP2 = 0;
  let marbleHTMLElements = [];
  let animationPromises = [];

  $$(".hole").forEach((hole) => {
    if (hole.id[0] === "r") return;

    if (hole.id.startsWith("h1")) {
      marblesToMoveP1 += marblesCurrentPosition[hole.id];
    } else if (hole.id.startsWith("h2")) {
      marblesToMoveP2 += marblesCurrentPosition[hole.id];
    }

    marblesCurrentPosition[hole.id] = 0;
    animationPromises.push(
      renderPickMarbles(hole.id).then((marbles) => {
        marbleHTMLElements = marbleHTMLElements.concat(marbles);
      })
    );
  });

  renderHoleUI();

  Promise.all(animationPromises).then(async () => {
    let i = 0;
    while (marblesToMoveP1 > 0) {
      marblesCurrentPosition["r1"] += 1;
      marblesToMoveP1 -= 1;
      await renderAddMarbleToHole(marbleHTMLElements[i], "r1");
      renderHoleUI();
      i++;
    }
    while (marblesToMoveP2 > 0) {
      marblesCurrentPosition["r2"] += 1;
      marblesToMoveP2 -= 1;
      await renderAddMarbleToHole(marbleHTMLElements[i], "r2");
      renderHoleUI();
      i++;
    }

    if (marblesCurrentPosition["r1"] > marblesCurrentPosition["r2"]) {
      await showToast(playerNames["p1"] + " wins!", 5000);
    } else if (marblesCurrentPosition["r1"] < marblesCurrentPosition["r2"]) {
      await showToast(playerNames["p2"] + " wins!", 5000);
    } else {
      await showToast("It's a draw!", 5000);
    }
  });
};

// UI
const renderHoleUI = (displayHighlight = false) => {
  $$(".hole").forEach((hole) => {
    // Render playable holes with a highlight
    if (
      displayHighlight &&
      hole.id[0] === "h" &&
      hole.id[1] === currentPlayer[1]
    ) {
      hole.classList.add("highlight");
    } else {
      hole.classList.remove("highlight");
    }

    // Update marble count
    if (
      hole.id[0] === "h" ||
      (hole.id[0] === "r" && displayReserveScore) ||
      isGameOver
    ) {
      const marbleCountUi = Object.values(hole.parentNode.children).find((o) =>
        o.classList.contains("marble-count")
      );
      marbleCountUi.innerText =
        marblesCurrentPosition[hole.id] > 0
          ? marblesCurrentPosition[hole.id]
          : "";
    }
  });
};

$$(".hole").forEach((hole) =>
  hole.addEventListener("click", async () => {
    // Check that a player can only click on their holes
    if (hole.id[0] === "h" && hole.id[1] === currentPlayer[1]) {
      const [turnEvent, eventData] = await moveMarbles(hole.id, currentPlayer);
      if (turnEvent === turnEvents.capture) {
        await showToast("Capture!");
        // eventData is the holeId where the capture was made
        await captureHoleInFrontOf(eventData);
      }
      renderHoleUI();

      if (checkGameOver()) {
        isGameOver = true;
        return await endGame();
      }

      if (turnEvent === turnEvents.extraTurn) {
        await showToast("Extra turn!");
      } else {
        await switchPlayer();
        renderPlayers();
      }
      renderHoleUI(true);
    }
  })
);

// STARTUP
initMarbles(marblesInitialPosition);
renderHoleUI(true);
renderPlayers();
