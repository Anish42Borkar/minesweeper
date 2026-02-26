import { TITLE_STATUSES } from '../constant';
import type { BoardT, PositionT } from '../types';

export function getMinesPositions(boardSize: number, nunberOfMines: number) {
  const positions: PositionT[] = [];
  while (positions.length < nunberOfMines) {
    const position = {
      x: numberOfPosition(boardSize),
      y: numberOfPosition(boardSize),
    };

    if (!positions.some((p) => matchPosition(p, position))) {
      positions.push(position);
    }
  }
  return positions;
}

export function matchPosition(a: PositionT, b: PositionT) {
  return a.x === b.x && a.y === b.y;
}

export function numberOfPosition(size: number) {
  return Math.floor(Math.random() * size);
}

export function checkWin(board: BoardT[][]) {
  return board.every((row) =>
    row.every(
      (tile) =>
        tile.status === 'number' ||
        (tile.mine && (tile.status === 'hidden' || tile.status === 'marked')),
    ),
  );
}

export function checkLose(board: BoardT[][]) {
  return board.some((row) =>
    row.some((tile) => tile.status === TITLE_STATUSES.MINE),
  );
}
