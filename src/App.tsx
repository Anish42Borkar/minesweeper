import { useEffect, useRef } from 'react';

import './App.css';
import { useMinesweeper } from './hooks/useMinesweeper';
import { BOARD_SIZE, TITLE_STATUSES } from './constant';

function App() {
  const boxRef = useRef<HTMLDivElement>(null);
  const { board, numberOfMines, onRightClick, revealTile, resultMessage } =
    useMinesweeper();

  useEffect(() => {
    boxRef?.current?.style?.setProperty('--size', `${BOARD_SIZE}`);
  }, []);

  return (
    <main>
      <h1 className='title'>Minesweeper</h1>
      
      <p className='msg'>{resultMessage} </p>
      <div className='subtext'>Mines Left: {numberOfMines}</div>
      <div ref={boxRef} className='board'>
        {board?.map((tiles) => {
          return tiles.map((tile) => {
            return (
              <button
                key={tile.x + tile.y}
                className=''
                data-status={
                  TITLE_STATUSES[
                    tile.status.toUpperCase() as keyof typeof TITLE_STATUSES
                  ]
                }
                onClick={() => {
                  revealTile(tile);
                }}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onRightClick(tile);
                }}
                aria-label={tile.text === '' ? 'blank box' : tile.text}
              >
                {tile.text}
              </button>
            );
          });
        })}
      </div>
    </main>
  );
}

export default App;
