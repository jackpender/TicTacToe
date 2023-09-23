// REPRESENTS THE CONTROLLER

console.log("Hello world!");

import View from "./view.js";
// If View wasn't exported as default the syntax is changed to
// import {View} from "./view.js";
import Store from "./store.js";

const App = {
  $: {
    menu: document.querySelector('[data-id="menu"]'),
    menuItems: document.querySelector('[data-id="menu-items"]'),
    resetBtn: document.querySelector('[data-id="reset-btn"]'),
    newRountBtn: document.querySelector('[data-id="new-round-btn"]'),
    squares: document.querySelectorAll('[data-id="square"]'),
    modal: document.querySelector('[data-id="modal"]'),
    modalText: document.querySelector('[data-id="modal-text"]'),
    modalBtn: document.querySelector('[data-id="modal-btn"]'),
    turn: document.querySelector('[data-id="turn"]'),
  },

  //   When tracking state the goal is to keep it as small as possible i.e have the least no. of variables to keep track of
  state: {
    // currentPlayer: 1,
    moves: [],
  },

  getGameStatus(moves) {
    const p1Moves = moves
      .filter((move) => move.playerId === 1)
      .map((move) => +move.squareId);
    const p2Moves = moves
      .filter((move) => move.playerId === 2)
      .map((move) => +move.squareId);

    const winningPatterns = [
      [1, 2, 3],
      [1, 5, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 5, 7],
      [3, 6, 9],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winner = null;

    winningPatterns.forEach((pattern) => {
      const p1Wins = pattern.every((v) => p1Moves.includes(v));
      const p2Wins = pattern.every((v) => p2Moves.includes(v));

      if (p1Wins) winner = 1;
      if (p2Wins) winner = 2;
    });

    return {
      status: moves.length === 9 || winner != null ? "complete" : "in-progress", //in progress or complete
      winner, // winner is either 1 or 2, null is a tie
    };
  },

  init() {
    App.registerEventListeners();
  },

  registerEventListeners() {
    App.$.menu.addEventListener("click", (event) => {
      App.$.menuItems.classList.toggle("hidden");
    });

    App.$.resetBtn.addEventListener("click", (event) => {
      console.log("Reset the game!");
      App.$.squares.forEach((square) => square.replaceChildren());
    });

    App.$.newRountBtn.addEventListener("click", (event) => {
      console.log("New round!");
      App.$.squares.forEach((square) => square.replaceChildren());
    });

    App.$.modalBtn.addEventListener("click", (event) => {
      App.state.moves = [];
      // Empty out sqaure contents
      App.$.squares.forEach((square) => square.replaceChildren());
      App.$.modal.classList.add("hidden");
    });

    App.$.squares.forEach((square) => {
      square.addEventListener("click", (event) => {
        console.log(`Square with ID ${event.target.id} was clicked`);
        // console.log("Square with ID " + event.target.id + " was clicked");
        console.log(`Current player is  ${App.state.currentPlayer}`);

        const hasMove = (squareId) => {
          const existingMove = App.state.moves.find(
            (move) => move.squareId === squareId
          );
          return existingMove !== undefined;
        };

        //Check to see if square is empty
        if (hasMove(+square.id)) {
          return;
        }

        const lastMove = App.state.moves.at(-1);
        const getOppositePlayer = (playerId) => (playerId === 1 ? 2 : 1);
        // If moves length is 0, set current player to 1, otherwise (:) set it to the opposite of the last moves playerId
        const currentPlayer =
          App.state.moves.length === 0
            ? 1
            : getOppositePlayer(lastMove.playerId);
        const nextPlayer = getOppositePlayer(currentPlayer);

        const squareIcon = document.createElement("i");
        const turnIcon = document.createElement("i");

        const turnLabel = document.createElement("p");
        turnLabel.innerText = `Player ${nextPlayer}, you are up!`;

        if (currentPlayer === 1) {
          squareIcon.classList.add("fa-solid", "fa-x", "yellow");
          turnIcon.classList.add("fa-solid", "fa-o", "turquoise");
          turnLabel.classList = "turquoise";
        } else {
          squareIcon.classList.add("fa-solid", "fa-o", "turquoise");
          turnIcon.classList.add("fa-solid", "fa-x", "yellow");
          turnLabel.classList = "yellow";
        }

        App.$.turn.replaceChildren(turnIcon, turnLabel);

        App.state.moves.push({
          squareId: +square.id,
          playerId: currentPlayer,
        });

        square.replaceChildren(squareIcon);

        // Check winner or tie
        const game = App.getGameStatus(App.state.moves);

        if (game.status === "complete") {
          App.$.modal.classList.remove("hidden");

          let message = "";
          if (game.winner) {
            message = `Player ${game.winner} wins!`;
            // alert(`Player ${game.winner} wins!`);
          } else {
            message = "Tie game.";
            // alert("Tie!");
          }

          App.$.modalText.textContent = message;
        }
      });
    });
  },
};

// App.$.menu.addEventListener("click", (event) => {
//   //   console.log(event.target);
//   App.$.menuItems.classList.toggle("hidden");
// });

// // Once all the HTML has been safely loaded into the document, the init function is called
// window.addEventListener("load", () => App.init());

const players = [
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

  // function initView() {
  //   view.closeAll();
  //   view.clearMoves();
  //   view.setTurnIndicator(store.game.currentPlayer);
  //   view.updateScoreboard(
  //     store.stats.playerWithStats[0].wins,
  //     store.stats.playerWithStats[1].wins,
  //     store.stats.ties
  //   );
  //   view.initializeMoves(store.game.moves);
  // }

  window.addEventListener("storage", () => {
    console.log("State changed in another tab");
    // initView();
    view.render(store.game, store.stats);
  });

  // initView();
  view.render(store.game, store.stats);

  // console.log(store.game);

  view.bindGameResetEvent((event) => {
    // console.log("Reset Event");
    // console.log(event);

    // view.closeAll();

    store.reset();

    // view.clearMoves();

    // view.setTurnIndicator(store.game.currentPlayer);

    // view.updateScoreboard(
    //   store.stats.playerWithStats[0].wins,
    //   store.stats.playerWithStats[1].wins,
    //   store.stats.ties
    // );

    // initView();
    // view.render(store.game, store.stats);

    console.log(store.stats);
  });

  view.bindNewRoundEvent((event) => {
    // console.log("New Round Event");
    // console.log(event);

    store.newRound();

    // initView();
    // view.render(store.game, store.stats);
  });

  view.bindPlayerMoveEvent((square) => {
    // const clickedSquare = event.target;

    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    // view.handlePlayerMove(square, store.game.currentPlayer);

    // + casts to number
    store.playerMove(+square.id);

    // if (store.game.status.isComplete) {
    //   view.openModal(
    //     store.game.status.winner
    //       ? `${store.game.status.winner.name} wins!`
    //       : "Tie!"
    //   );

    //   return;
    // }

    // view.setTurnIndicator(store.game.currentPlayer);

    // view.render(store.game, store.stats);
  });
}

window.addEventListener("load", () => init());
