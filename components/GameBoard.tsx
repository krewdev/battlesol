
import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, Coordinates, Ship } from '../types';
import { GRID_SIZE, SHIP_CONFIG } from '../types';

interface GameBoardProps {
  isPlayerBoard: boolean;
  gameState: GameState;
  onFire?: (coords: Coordinates) => void;
  onPlacementComplete?: (ships: Ship[]) => void;
  onScan?: (coords: Coordinates) => void;
  revealedCells?: Coordinates[];
  isScanning?: boolean;
  hoveredCell?: Coordinates | null;
  onHover?: (coords: Coordinates | null) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ isPlayerBoard, gameState, onFire, onPlacementComplete, onScan, revealedCells, isScanning, hoveredCell, onHover }) => {
  const [placingShips, setPlacingShips] = useState<Ship[]>([]);
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [invalidPlacement, setInvalidPlacement] = useState<Coordinates[]>([]);

  const isPvp = gameState.mode === 'Online PvP (Simulated)';
  const isP1Turn = gameState.turn === 'player';

  let shipsToDisplay: Ship[];
  let shotsToDisplay: Coordinates[];

  if (isPlayerBoard) {
    if (gameState.status === 'placing_ships') {
       shipsToDisplay = placingShips;
    } else {
       shipsToDisplay = (isPvp && !isP1Turn) ? gameState.opponentShips : gameState.playerShips;
    }
    shotsToDisplay = (isPvp && !isP1Turn) ? gameState.playerShots : gameState.opponentShots;
  } else {
    shipsToDisplay = isPvp ? ((!isP1Turn) ? gameState.playerShips : gameState.opponentShips) : gameState.opponentShips;
    shotsToDisplay = (isPvp && !isP1Turn) ? gameState.opponentShots : gameState.playerShots;
  }

  useEffect(() => {
    if (gameState.status !== 'placing_ships') {
        setPlacingShips([]);
        setCurrentShipIndex(0);
    }
  }, [gameState.status]);


  const handleCellClick = (row: number, col: number) => {
    if (gameState.status === 'finished') return;
    
    if (isScanning && !isPlayerBoard && onScan) {
      onScan({ row, col });
      return;
    }
    if (gameState.status === 'placing_ships' && isPlayerBoard && onPlacementComplete) {
      placeShip(row, col);
    } else if (gameState.status === 'in_progress' && !isPlayerBoard && onFire) {
      onFire({ row, col });
    }
  };

  const placeShip = (row: number, col: number) => {
    if (currentShipIndex >= SHIP_CONFIG.length) return;

    const shipConfig = SHIP_CONFIG[currentShipIndex];
    const newShipPlacements: Coordinates[] = [];
    let isValidPlacement = true;

    for (let i = 0; i < shipConfig.length; i++) {
      let newRow = row;
      let newCol = col;
      if (orientation === 'horizontal') {
        newCol += i;
      } else {
        newRow += i;
      }

      if (newRow >= GRID_SIZE || newCol >= GRID_SIZE || placingShips.some(s => s.placements.some(p => p.row === newRow && p.col === newCol))) {
        isValidPlacement = false;
        for (let j = 0; j < shipConfig.length; j++) {
            let tempRow = row + (orientation === 'vertical' ? j : 0);
            let tempCol = col + (orientation === 'horizontal' ? j : 0);
            if(tempRow < GRID_SIZE && tempCol < GRID_SIZE) newShipPlacements.push({ row: tempRow, col: tempCol });
        }
        break;
      }
      newShipPlacements.push({ row: newRow, col: newCol });
    }

    if (isValidPlacement) {
      const newShip: Ship = { ...shipConfig, placements: newShipPlacements, hits: [], sunk: false };
      const updatedShips = [...placingShips, newShip];
      setPlacingShips(updatedShips);
      
      if (currentShipIndex + 1 >= SHIP_CONFIG.length) {
         onPlacementComplete!(updatedShips);
         setPlacingShips([]);
         setCurrentShipIndex(0);
      } else {
         setCurrentShipIndex(currentShipIndex + 1);
      }
    } else {
      setInvalidPlacement(newShipPlacements);
      setTimeout(() => setInvalidPlacement([]), 300);
    }
  };
  
  const getCellState = (row: number, col: number) => {
    const isHovered = !isPlayerBoard && hoveredCell && hoveredCell.row === row && hoveredCell.col === col && gameState.status === 'in_progress';
    if(isHovered) return 'bg-yellow-glow/30 border-2 border-yellow-glow';

    const isInvalid = invalidPlacement.some(p => p.row === row && p.col === col);
    if(isInvalid) return 'bg-red-900/80 scale-110 z-10';

    const isShot = shotsToDisplay.some(s => s.row === row && s.col === col);
    const shipOnCell = shipsToDisplay.find(ship => ship.placements.some(p => p.row === row && p.col === col));
    
    if (isPlayerBoard && shipOnCell?.sunk) {
      return 'bg-neutral-800 border-2 border-red-800';
    }

    if(isPlayerBoard) {
       const myShipOnCell = shipsToDisplay.find(ship => ship.placements.some(p => p.row === row && p.col === col));
       if (isShot && myShipOnCell) return 'bg-red-500/80 animate-pulse'; // Player ship hit
       if (isShot) return 'bg-blue-300/30'; // Miss on player board
       if (myShipOnCell) return 'bg-cyan-glow/60'; // Player ship
    } else { // Opponent board
       const isRevealed = revealedCells?.some(c => c.row === row && c.col === col);
       if (isShot && shipOnCell) return 'bg-red-500/80 animate-pulse'; // Hit on opponent
       if (isShot) return 'bg-blue-300/30'; // Miss on opponent
       if (isRevealed && !isShot) return 'bg-cyan-900/50'; // Sonar pinged water
    }
    return 'bg-navy-700/50 hover:bg-navy-700';
  };
  
  const toggleOrientation = useCallback(() => {
    setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal');
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        if (gameState.status !== 'placing_ships' || !isPlayerBoard) return;
        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            toggleOrientation();
        }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.status, isPlayerBoard, toggleOrientation]);


  return (
    <div className="flex flex-col items-center">
      <div className="grid gap-1 p-2 bg-navy-900/50 border-2 border-navy-700 rounded-lg" style={{gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`}}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const row = Math.floor(index / GRID_SIZE);
          const col = index % GRID_SIZE;
          let cursorClass = 'cursor-default';
          if (isScanning && !isPlayerBoard) cursorClass = 'cursor-pointer';
          else if (gameState.status === 'in_progress' && !isPlayerBoard) cursorClass = 'cursor-crosshair';
          else if (gameState.status === 'placing_ships' && isPlayerBoard) cursorClass = 'cursor-pointer';

          return (
            <div
              key={index}
              className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all duration-100 border border-navy-800 rounded-sm relative ${getCellState(row,col)} ${cursorClass}`}
              onClick={() => handleCellClick(row, col)}
              onMouseEnter={() => onHover && onHover({row, col})}
              onMouseLeave={() => onHover && onHover(null)}
            >
              {getCellState(row,col).includes('red-500') && <span className="text-xl font-black">X</span>}
              {getCellState(row,col).includes('blue-300') && <div className="w-2 h-2 rounded-full bg-blue-300"></div>}
            </div>
          );
        })}
      </div>
      {gameState.status === 'placing_ships' && isPlayerBoard && currentShipIndex < SHIP_CONFIG.length && (
         <div className="mt-4 text-center p-4 bg-navy-800 rounded-lg border border-navy-700 w-full max-w-sm">
           <p className="text-lg font-semibold">Place your <span className="text-yellow-glow font-bold">{SHIP_CONFIG[currentShipIndex].name}</span> ({SHIP_CONFIG[currentShipIndex].length} cells)</p>
           <p className="text-sm text-neutral-400">Orientation: {orientation}</p>
           <button onClick={toggleOrientation} className="mt-2 bg-cyan-glow/80 text-navy-900 font-bold py-1 px-4 rounded-lg text-sm hover:bg-cyan-glow">
             Toggle Orientation (R)
           </button>
         </div>
      )}
    </div>
  );
};

export default GameBoard;
