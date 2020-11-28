import { randomBetween, $ } from "./util.js";
import { transitionTime } from "./settings.js";

/**
 * Returns an array in which the first element is the top coordinate and the second is the left coordinate
 * @return {string[]}
 */
const pickRandomMarbleCoordinate = () => [
  randomBetween(30, 140),
  randomBetween(10, 30),
];

const initMarbles = (initialPositions) => {
  for (const [hole, marbleCount] of Object.entries(initialPositions)) {
    // We clear the hole
    $("#" + hole).innerHTML = "";

    for (let i = 0; i < marbleCount; i++) {
      const [top, left] = pickRandomMarbleCoordinate();
      const marbleContainer = document.createElement("div");
      marbleContainer.style.position = "absolute";
      marbleContainer.style.top = top + "px";
      marbleContainer.style.left = left + "px";

      const marble = document.createElement("img");
      marble.src = "img/gems/" + randomBetween(0, 17) + ".png";
      marble.draggable = false;
      marble.style.transform = "rotate(" + randomBetween(0, 359) + "deg)";

      marbleContainer.appendChild(marble);
      $("#" + hole).append(marbleContainer);
    }
  }
};

const renderPickMarbles = async (holeId) => {
  const animationPromises = [];
  const marbleHTMLElements = [];

  for (const marble of $("#" + holeId).children) {
    marbleHTMLElements.push(marble);
    animationPromises.push(renderPickMarble(marble));
  }

  await Promise.all(animationPromises);
  return marbleHTMLElements;
};

const renderPickMarble = (marble) => {
  return new Promise((resolve) => {
    marble.classList.add("animate-marble-pick");

    setTimeout(() => {
      marble.classList.remove("animate-marble-pick");
      marble.parentNode.removeChild(marble);

      resolve();
    }, transitionTime);
  });
};

/**
 * Display the animation of adding a marble to a hole
 * @param {HTMLElement} marble An Img tag
 * @param {Hole} holeId
 */
const renderAddMarbleToHole = (marble, holeId) => {
  return new Promise((resolve) => {
    $("#" + holeId).appendChild(marble);
    const [top, left] = pickRandomMarbleCoordinate();
    marble.style.top = top + "px";
    marble.style.left = left + "px";
    marble.classList.add("animate-marble-drop");

    setTimeout(() => {
      marble.classList.remove("animate-marble-drop");
      resolve();
    }, transitionTime);
  });
};

export {
  initMarbles,
  pickRandomMarbleCoordinate,
  renderPickMarbles,
  renderAddMarbleToHole,
};
