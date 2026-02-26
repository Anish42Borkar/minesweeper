// Logic

import { useEffect, useState } from 'react';
import { BOARD_SIZE, NUMBER_OF_MINES, TITLE_STATUSES } from '../constant';
import type { BoardT } from '../types';
import {
  checkLose,
  checkWin,
  getMinesPositions,
  matchPosition,
} from '../util/helper';

export function useMinesweeper() {
  const [board, setBoard] = useState<BoardT[][]>();
  const [stopGame, setStopGame] = useState(false);
  const [numberOfMines, setNumberOfMines] = useState(NUMBER_OF_MINES);
  const [resultMessage, setResultMessage] = useState('');
  const blastSound = new Audio('/bombSound.mp3');
  const digSound = new Audio('/digSound.mp3');

  function createBoard(boardSize: number, nunberOfMines: number) {
    const board = [];
    const minePositions = getMinesPositions(boardSize, nunberOfMines);

    for (let x = 0; x < boardSize; x++) {
      let row = [];
      for (let y = 0; y < boardSize; y++) {
        const tile = {
          x,
          y,
          mine: minePositions.some((p) => matchPosition(p, { x, y })),
          status: TITLE_STATUSES.HIDDEN,
          text: '',
        };

        row.push(tile);
      }

      board.push(row);
    }

    return board;
  }

  function listMineLeft() {
    const totalMarked =
      board?.reduce((count, row) => {
        return (
          count +
          row.filter((item) => item.status === TITLE_STATUSES.MARKED).length
        );
      }, 0) ?? 0;
    console.log(totalMarked, NUMBER_OF_MINES - totalMarked);

    setNumberOfMines(NUMBER_OF_MINES - totalMarked);
  }

  function onRightClick(tile: BoardT) {
    markTile(tile);
  }

  // this function is to mar the tile if its a mine
  function markTile(tile: BoardT, stopSound = false) {
    if (stopGame) return;

    if (
      tile.status !== TITLE_STATUSES.HIDDEN &&
      tile.status !== TITLE_STATUSES.MARKED
    ) {
      return;
    }
    setBoard((prev) => {
      const newBoard = [...prev!];
      const newRow = [...newBoard[tile.x]];
      let newTile;
      if (!stopSound) {
        digSound.currentTime = 0;
        digSound.play();
      }

      if (newRow[tile.y].status === 'marked') {
        newTile = { ...newRow[tile.y], status: TITLE_STATUSES.HIDDEN };
      } else {
        newTile = { ...newRow[tile.y], status: TITLE_STATUSES.MARKED };
      }

      newRow[tile.y] = newTile;
      newBoard[tile.x] = newRow;

      return newBoard;
    });
  }

  function revealTile(tile: BoardT) {
    if (stopGame) return;
    setBoard((prev) => {
      if (!prev) return prev;
      const board = prev.map((row) => row.map((t) => ({ ...t })));
      function flood(t: BoardT) {
        const current = board[t.x][t.y];
        if (current.status !== 'hidden') return;
        if (current.mine) {
          current.status = 'mine';
          return;
        }
        const adjacent = nearbyTiles(t.x, t.y);
        // in every interation mine are getting checked on all sides of the cordinates
        const mines = adjacent.filter((n) => board[n.x][n.y].mine).length;
        current.status = 'number';
        current.text = mines ? String(mines) : '';
        // all adjacent value gets marked by number status if mines are zero
        if (mines === 0) {
          adjacent.forEach(flood);
        }
      }
      flood(tile);
      return board;
    });
    // checkGameEnd(board!);
  }

  //   this function this to travel
  //   left, right
  //   up, down
  //   diagonals
  //   to count the number of total mine
  function nearbyTiles(x: number, y: number) {
    const tiles = [];
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
      for (let yOffset = -1; yOffset <= 1; yOffset++) {
        // console.log(
        //   x,
        //   [x + xOffset],
        //   ' xOffset ',
        //   y,
        //   [y + yOffset],
        //   ' yOffset'
        // );

        const tile = board?.[x + xOffset]?.[y + yOffset];
        if (tile) tiles.push(tile);
      }
    }

    return tiles;
  }

  function checkGameEnd(board: BoardT[][]) {
    const win = checkWin(board);
    const lose = checkLose(board);
    console.log(lose, ' lose');

    return { win, lose };
  }

  function getAllMineTiles(board: BoardT[][]): BoardT[] {
    return board.flat().filter((tile) => tile.mine);
  }

  function revealAllMinesAnimated(delay = 500) {
    setStopGame(true);

    digSound.ended;

    // The purpose of the first setBoard (the outer one)
    // # It exists ONLY to safely get the current board state
    // # It does NOT exist to update the UI
    setBoard((prev) => {
      if (!prev) return prev;

      const mines = getAllMineTiles(prev);
      console.log(mines, ' Mine');
      let index = 0;

      const interval = setInterval(() => {
        setBoard((current) => {
          if (!current) return current;

          if (index >= mines.length) {
            clearInterval(interval);
            return current;
          }

          const mine = mines[index];
          index++;

          // 🔊 play sound
          blastSound.currentTime = 0;
          blastSound.play();

          return current.map((row) =>
            row.map((tile) =>
              tile.x === mine.x && tile.y === mine.y
                ? { ...tile, status: TITLE_STATUSES.MINE }
                : tile,
            ),
          );
        });
      }, delay);

      return prev;
    });
  }

  useEffect(() => {
    setBoard(createBoard(BOARD_SIZE, NUMBER_OF_MINES));
  }, []);

  useEffect(() => {
    listMineLeft();
    if (!board || stopGame) return;
    const { lose, win } = checkGameEnd(board);

    if (win) {
      setStopGame(true);
      setResultMessage('You Win');
    }

    if (lose) {
      if (lose) {
        const copyBoard = board.map((row) => row.map((t) => ({ ...t })));

        copyBoard.forEach((row) =>
          row.forEach((tile) => {
            if (tile.status === TITLE_STATUSES.MARKED) markTile(tile, true);
            if (tile.mine) revealAllMinesAnimated();
          }),
        );
        setResultMessage('You Lose');
      }

      setStopGame(true);
    }
  }, [board]);

  return {
    createBoard,
    board,
    setBoard,
    numberOfMines,
    setNumberOfMines,
    onRightClick,
    revealTile,
    checkGameEnd,
    resultMessage,
  };
}
