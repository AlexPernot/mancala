import { transitionTime } from "./settings.js";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);
const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min)) + min;

const overlayUi = $("#overlay");
const overlayTextUi = $("#overlay-text-container");

const showToast = (str, duration = 2000) => {
  overlayUi.classList.replace("pointer-events-none", "pointer-events-all");
  overlayTextUi.innerText = str;
  overlayTextUi.classList.replace("bg-opacity-0", "bg-opacity-75");
  overlayTextUi.classList.replace("text-opacity-0", "text-opacity-100");
  overlayTextUi.classList.replace("py-1", "py-8");
  return new Promise((resolve) => {
    setTimeout(() => {
      overlayTextUi.classList.replace("bg-opacity-75", "bg-opacity-0");
      overlayTextUi.classList.replace("text-opacity-100", "text-opacity-0");
      overlayTextUi.classList.replace("py-8", "py-1");
      resolve();
    }, duration);
  }).then(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        overlayUi.classList.replace(
          "pointer-events-all",
          "pointer-events-none"
        );
        overlayTextUi.innerHTML = "&nbsp;";
        resolve();
      }, transitionTime);
    });
  });
};

export { $, $$, randomBetween, showToast };
