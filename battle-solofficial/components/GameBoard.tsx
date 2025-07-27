import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, Coordinates, Ship } from '../types';
import { GRID_SIZE, SHIP_CONFIG } from '../types';
import { DecoyIcon, TargetReticuleIcon } from './Icons';

interface GameBoardProps {
  isPlayerBoard: boolean;
  gameState: GameState;
  onFire?: (coords: Coordinates) => void;
  onPlacementComplete?: (ships: Ship[], decoys?: Coordinates[]) => void;
  isScanning?: boolean;
  revealedCells?: Coordinates[];
  hoveredCell?: Coordinates | null;
  onHover?: (coords: Coordinates | null) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ isPlayerBoard, gameState, onFire, onPlacementComplete, isScanning, revealedCells, hoveredCell, onHover }) => {
  const [placingShips, setPlacingShips] = useState<Ship[]>([]);
  const [currentShipIndex, setCurrentShipIndex] = useState(0);
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');
  const [invalidPlacement, setInvalidPlacement] = useState<Coordinates[]>([]);
  const [isPlacingDecoys, setIsPlacingDecoys] = useState(false);
  const [placedDecoys, setPlacedDecoys] = useState<Coordinates[]>([]);
  const [currentDecoyIndex, setCurrentDecoyIndex] = useState(0);
  const [message, setMessage] = useState('');

  let shipsToDisplay: Ship[];
  let shotsToDisplay: Coordinates[];

  if (isPlayerBoard) {
    shipsToDisplay = gameState.status === 'placing_ships' ? placingShips : gameState.playerShips;
    shotsToDisplay = gameState.opponentShots;
  } else {
    shipsToDisplay = gameState.opponentShips;
    shotsToDisplay = gameState.playerShots;
  }

  const resetPlacementState = () => {
    setPlacingShips([]);
    setCurrentShipIndex(0);
    setIsPlacingDecoys(false);
    setPlacedDecoys([]);
    setCurrentDecoyIndex(0);
    setMessage('');
  }

  useEffect(() => {
    if (gameState.status !== 'placing_ships') {
       resetPlacementState();
    }
  }, [gameState.status]);


  const handleCellClick = (row: number, col: number) => {
    if (gameState.status === 'finished') return;
    
    if (gameState.status === 'placing_ships' && isPlayerBoard && onPlacementComplete) {
      if (isPlacingDecoys) {
        placeDecoy(row, col);
      } else {
        placeShip(row, col);
      }
    } else if (gameState.status === 'in_progress' && !isPlayerBoard && onFire) {
      onFire({ row, col });
    }
  };

  const isAdjacentToShip = (row: number, col: number, ships: Ship[]) => {
    const adjacentOffsets = [
      { dr: -1, dc: 0 }, { dr: 1, dc: 0 }, { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
      { dr: -1, dc: -1 }, { dr: -1, dc: 1 }, { dr: 1, dc: -1 }, { dr: 1, dc: 1 }
    ];
    return adjacentOffsets.some(offset =>
      ships.some(ship =>
        ship.placements.some(p => p.row === row + offset.dr && p.col === col + offset.dc)
      )
    );
  };

  const placeDecoy = (row: number, col: number) => {
    // Check for overlap with ships
    if (shipsToDisplay.some(s => s.placements.some(p => p.row === row && p.col === col))) {
      setInvalidPlacement([{ row, col }]);
      setTimeout(() => setInvalidPlacement([]), 300);
      return;
    }
    
    // Check for overlap with other decoys
    if (placedDecoys.some(d => d.row === row && d.col === col)) {
      setInvalidPlacement([{ row, col }]);
      setTimeout(() => setInvalidPlacement([]), 300);
      return;
    }
    
    const adjacent = isAdjacentToShip(row, col, shipsToDisplay);
    if (adjacent) {
      // Show warning but allow placement
      setMessage('Warning: Placing a decoy next to a ship will cause that ship to be instantly sunk if the decoy is hit!');
      setTimeout(() => setMessage(''), 3000);
    }
    
    const newDecoys = [...placedDecoys, { row, col }];
    setPlacedDecoys(newDecoys);
    const nextDecoyIndex = currentDecoyIndex + 1;
    setCurrentDecoyIndex(nextDecoyIndex);
    
    // Continue to next decoy or complete placement
    if (nextDecoyIndex >= 2) {
      onPlacementComplete!(shipsToDisplay, newDecoys);
      resetPlacementState();
    } else {
      setMessage(`Place your ${nextDecoyIndex + 1}${nextDecoyIndex === 0 ? 'st' : 'nd'} Decoy Buoy`);
    }
  };

  const placeShip = (row: number, col: number) => {
    if (currentShipIndex >= SHIP_CONFIG.length) return;

    const shipConfig = SHIP_CONFIG[currentShipIndex];
    const newShipPlacements: Coordinates[] = [];
    let isValidPlacement = true;

    // Check if ship fits within grid bounds and doesn't overlap
    for (let i = 0; i < shipConfig.length; i++) {
      let newRow = row + (orientation === 'vertical' ? i : 0);
      let newCol = col + (orientation === 'horizontal' ? i : 0);

      // Check bounds
      if (newRow >= GRID_SIZE || newCol >= GRID_SIZE) {
        isValidPlacement = false;
        break;
      }

      // Check for overlapping with existing ships
      const isOccupied = placingShips.some(s => 
        s.placements.some(p => p.row === newRow && p.col === newCol)
      );
      
      if (isOccupied) {
        isValidPlacement = false;
        break;
      }

      newShipPlacements.push({ row: newRow, col: newCol });
    }

    if (isValidPlacement) {
      const newShip: Ship = { 
        ...shipConfig, 
        placements: newShipPlacements, 
        hits: [], 
        sunk: false 
      };
      const updatedShips = [...placingShips, newShip];
      setPlacingShips(updatedShips);
      
      const nextIndex = currentShipIndex + 1;
      setCurrentShipIndex(nextIndex);

      if (nextIndex >= SHIP_CONFIG.length) {
         // Always place 2 decoys in all game modes
         setIsPlacingDecoys(true);
         setMessage('Place your 1st Decoy Buoy');
      }
    } else {
      // Show invalid placement feedback
      const invalidCells: Coordinates[] = [];
      for (let i = 0; i < shipConfig.length; i++) {
        let tempRow = row + (orientation === 'vertical' ? i : 0);
        let tempCol = col + (orientation === 'horizontal' ? i : 0);
        if (tempRow < GRID_SIZE && tempCol < GRID_SIZE) {
          invalidCells.push({ row: tempRow, col: tempCol });
        }
      }
      setInvalidPlacement(invalidCells);
      setTimeout(() => setInvalidPlacement([]), 500); // Increased duration for better visibility
    }
  };

  const toggleOrientation = useCallback(() => {
    setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal');
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
        if (gameState.status !== 'placing_ships' || !isPlayerBoard || isPlacingDecoys) return;
        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            toggleOrientation();
        }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.status, isPlayerBoard, isPlacingDecoys, toggleOrientation]);


  const getCellContent = (row: number, col: number) => {
    const isShot = shotsToDisplay.some(s => s.row === row && s.col === col);
    const shipOnCell = shipsToDisplay.find(ship => ship.placements.some(p => p.row === row && p.col === col));
    
    // Opponent Board Hit/Miss Markers
    if (!isPlayerBoard) {
        if (isShot) {
           const isDecoyHit = gameState.opponentDecoys.some(d => d.row === row && d.col === col);
           if(isDecoyHit) {
              return <div className="absolute inset-0 bg-yellow-500/50 flex items-center justify-center"><DecoyIcon className="w-6 h-6 text-yellow-200"/></div>
           }

           if (revealedCells?.find(c => c.row === row && c.col === col) && shipOnCell) {
             return <div className="absolute inset-0 bg-yellow-800/50 flex items-center justify-center"></div>;
           }
            
           if (shipOnCell) { // A confirmed hit
              return (
                <>
                  <div className="absolute inset-0 flex items-center justify-center animate-pulse-red">
                    <div className="absolute w-[90%] h-[90%] bg-red-600 rounded-full blur-md opacity-60" />
                    <div className="absolute w-[60%] h-[60%] bg-orange-400 rounded-full blur-sm opacity-70" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-red-500/50">X</div>
                </>
              );
           }
           // A confirmed miss
           return (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1/3 h-1/3 bg-sky-400/70 rounded-full animate-pulse-blue" />
              </div>
           );
        }
        if (revealedCells?.find(c => c.row === row && c.col === col) && shipOnCell) {
             return <div className="absolute inset-0 bg-yellow-800/50 flex items-center justify-center"></div>;
        }

        return null;
    }

    // Player Board Markers
    if (gameState.playerDecoys.some(d => d.row === row && d.col === col)) {
      return <div className="absolute inset-0 flex items-center justify-center"><DecoyIcon className="w-6 h-6 text-cyan-glow"/></div>
    }
    if (isShot && shipOnCell) {
       return (
            <>
                <div className={`absolute inset-[15%] rounded-[3px] bg-gradient-to-b from-slate-600 to-slate-800 shadow-inner`} />
                <div className="absolute inset-0 bg-red-900/60 flex items-center justify-center">
                    <div className="w-full h-full animate-pulse-red opacity-80">
                        <svg className="w-full h-full text-orange-400" viewBox="0 0 10 10" fill="none">
                            <path d="M2 2L8 8M2 8L8 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            </>
        );
    }
    if (isShot) {
        return <div className="absolute inset-0 flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-sky-700/50"></div></div>;
    }
    if (shipOnCell) {
      const isReinforced = shipOnCell.id === gameState.reinforcedShipId && (shipOnCell.extraHealth || 0) > 0;
      return <div className={`absolute inset-[15%] rounded-[3px] ${isReinforced ? 'bg-gradient-to-b from-yellow-300 to-yellow-600 shadow-yellow' : 'bg-gradient-to-b from-slate-300 to-slate-500'} shadow-inner`}></div>;
    }

    return null;
  };

  const getCellStyling = (row: number, col: number) => {
    if (invalidPlacement.some(p => p.row === row && p.col === col)) {
        return 'bg-red-500/70 scale-105 z-10 animate-pulse border-red-400';
    }

    const shipOnCell = shipsToDisplay.find(ship => ship.placements.some(p => p.row === row && p.col === col));
    
    // Show sunk ships with different styling
    if (isPlayerBoard && shipOnCell?.sunk) {
      return 'bg-red-900/80 brightness-50 border-red-600';
    }
    


    // Show revealed cells from radar scan
    const isRevealed = revealedCells?.some(c => c.row === row && c.col === col);
    if(isRevealed && !shotsToDisplay.some(s => s.row === row && s.col === col)) {
      return 'bg-cyan-500/30 animate-pulse border-cyan-300';
    }
    
    // Show ship placement preview during placement phase
    if (isPlayerBoard && gameState.status === 'placing_ships' && !isPlacingDecoys && currentShipIndex < SHIP_CONFIG.length) {
      const shipConfig = SHIP_CONFIG[currentShipIndex];
      const isPreviewCell = isShipPreviewCell(row, col, shipConfig);
      if (isPreviewCell.isPreview) {
        return isPreviewCell.isValid ? 
          'bg-green-500/30 border-green-400 hover:bg-green-500/50' : 
          'bg-red-500/30 border-red-400 hover:bg-red-500/50';
      }
    }
    
    return 'bg-navy-700/30 hover:bg-navy-700/60 border-navy-600/50';
  };

  // Helper function to determine if a cell is part of ship placement preview
  const isShipPreviewCell = (row: number, col: number, shipConfig: typeof SHIP_CONFIG[0]) => {
    if (!hoveredCell || hoveredCell.row !== row || hoveredCell.col !== col) {
      return { isPreview: false, isValid: false };
    }

    // Check if ship would fit at this position
    let isValid = true;
    for (let i = 0; i < shipConfig.length; i++) {
      let checkRow = row + (orientation === 'vertical' ? i : 0);
      let checkCol = col + (orientation === 'horizontal' ? i : 0);

      if (checkRow >= GRID_SIZE || checkCol >= GRID_SIZE) {
        isValid = false;
        break;
      }

      const isOccupied = placingShips.some(s => 
        s.placements.some(p => p.row === checkRow && p.col === checkCol)
      );
      
      if (isOccupied) {
        isValid = false;
        break;
      }
    }

    return { isPreview: true, isValid };
  };

  return (
    <div className="flex flex-col items-center">
       <div className="w-full text-center h-8 mb-2">
            {!isPlayerBoard && hoveredCell && gameState.status === 'in_progress' && !isScanning && (
                <p className="font-mono text-lg text-yellow-glow animate-pulse">
                    Target: [R:{hoveredCell.row}, C:{hoveredCell.col}]
                </p>
            )}
            {!isPlayerBoard && isScanning && (
                 <p className="font-mono text-lg text-cyan-glow animate-pulse">
                    {gameState.advantage === 'volley_fire' ? 'SELECT TARGET COLUMN' : 'SELECT SCAN ORIGIN'}
                </p>
            )}
        </div>
      <div className="grid gap-1 p-2 bg-navy-900/50 border-2 border-navy-700 rounded-lg" style={{gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`}}>
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
          const row = Math.floor(index / GRID_SIZE);
          const col = index % GRID_SIZE;
          let cursorClass = 'cursor-default';
          if ((isScanning || (gameState.advantage === 'volley_fire' && onFire)) && !isPlayerBoard) cursorClass = 'cursor-pointer';
          else if (gameState.status === 'in_progress' && !isPlayerBoard) cursorClass = 'cursor-crosshair';
          else if (gameState.status === 'placing_ships' && isPlayerBoard) cursorClass = 'cursor-pointer';
          
          const isHovered = !isPlayerBoard && hoveredCell && hoveredCell.row === row && hoveredCell.col === col && gameState.status === 'in_progress';

          return (
            <div
              key={index}
              className={`w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all duration-100 border border-navy-800/50 rounded-sm relative ${getCellStyling(row,col)} ${cursorClass}`}
              onClick={() => handleCellClick(row, col)}
              onMouseEnter={() => onHover && onHover({row, col})}
              onMouseLeave={() => onHover && onHover(null)}
            >
             {getCellContent(row, col)}
             {isHovered && !isScanning && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <TargetReticuleIcon className="w-full h-full text-yellow-glow/80 animate-pulse" />
                </div>
            )}
            </div>
          );
        })}
      </div>
      {gameState.status === 'placing_ships' && isPlayerBoard && (
         <div className="mt-4 text-center p-4 bg-navy-800 rounded-lg border border-navy-700 w-full max-w-sm">
           {isPlacingDecoys ? (
              <>
                <p className="text-lg font-semibold text-cyan-glow animate-pulse">{message}</p>
                <p className="text-sm text-neutral-400 mt-2">Decoy {currentDecoyIndex + 1} of 2</p>
              </>
           ) : currentShipIndex < SHIP_CONFIG.length ? (
            <>
                <p className="text-lg font-semibold">Place your <span className="text-yellow-glow font-bold">{SHIP_CONFIG[currentShipIndex].name}</span> ({SHIP_CONFIG[currentShipIndex].length} cells)</p>
                <p className="text-sm text-neutral-400">Orientation: {orientation}</p>
                <button onClick={toggleOrientation} className="mt-2 bg-cyan-glow/80 text-navy-900 font-bold py-1 px-4 rounded-lg text-sm hover:bg-cyan-glow">
                    Toggle Orientation (R)
                </button>
            </>
           ) : null}
         </div>
      )}
      {(isPlacingDecoys || gameState.status === 'placing_decoys') && (
        <div className="mb-2 text-yellow-400 font-bold text-center">
          Avoid placing decoys next to ships or you risk losing a ship if the decoy is hit!
        </div>
      )}
    </div>
  );
};

export default GameBoard;