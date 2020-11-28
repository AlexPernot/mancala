import { $ } from "./util.js";

const overlayUi = $("#overlay");
const aboutModalUi = $("#about-modal");
const dismissAboutUi = $("#dismiss-about-button");

const showAboutModal = () => {
  overlayUi.classList.replace("pointer-events-none", "pointer-events-all");
  aboutModalUi.classList.remove("hidden");
  setTimeout(() => {
    aboutModalUi.classList.replace("bg-opacity-0", "bg-opacity-90");
    aboutModalUi.classList.replace("text-opacity-0", "text-opacity-100");
    aboutModalUi.classList.replace("py-1", "py-8");
    setTimeout(() => {
      dismissAboutUi.classList.replace("opacity-0", "opacity-100");
    }, 200);
  }, 50);
};

const dismissAboutModal = () => {
  aboutModalUi.classList.replace("bg-opacity-90", "bg-opacity-0");
  aboutModalUi.classList.replace("text-opacity-100", "text-opacity-0");
  aboutModalUi.classList.replace("py-8", "py-1");
  dismissAboutUi.classList.replace("opacity-100", "opacity-0");
  setTimeout(() => {
    overlayUi.classList.replace("pointer-events-all", "pointer-events-none");
    aboutModalUi.classList.add("hidden");
  }, 400);
};

$("#about-button").addEventListener("click", () => {
  showAboutModal();
});

dismissAboutUi.addEventListener("click", () => {
  dismissAboutModal();
});
