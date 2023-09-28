// REPRESENTS THE CONTROLLER

console.log("Hello world!");

import View from "./view.js";
// If View wasn't exported as default the syntax is changed to
// import {View} from "./view.js";
import Store from "./store.js";
import { Player } from "./types";

const players: Player[] = [
  {
    id: 1,
    name: "Player 1",
    iconClass: "fa-x",
    colorClass: "turquoise",
  },
  {
    id: 2,
    name: "Player 2",
    iconClass: "fa-o",
    colorClass: "yellow",
  },
];

function init() {
  const view = new View();
  const store = new Store("live-t3-storage-key", players);

  store.addEventListener("statechange", () => {
    view.render(store.game, store.stats);
  });

  window.addEventListener("storage", () => {
    console.log("State changed in another tab");
    view.render(store.game, store.stats);
  });

  view.render(store.game, store.stats);

  view.bindGameResetEvent((event) => {
    store.reset();

    console.log(store.stats);
  });

  view.bindNewRoundEvent((event) => {
    store.newRound();
  });

  view.bindPlayerMoveEvent((square) => {
    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    // + casts to number
    store.playerMove(+square.id);
  });
}

window.addEventListener("load", () => init());
