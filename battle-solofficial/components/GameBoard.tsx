import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, Coordinates, Ship, DefenseBuoy } from '../types';
import { GRID_SIZE, SHIP_CONFIG } from '../types';
import { DecoyIcon, TargetReticuleIcon } from './Icons';

interface GameBoardProps {
  isPlayerBoard: boolean;
  gameState: GameState;
  onFire?: (coords: Coordinates) => void;
  onPlacementComplete?: (ships: Ship[], decoy?: Coordinates, defenseBuoys?: DefenseBuoy[]) => void;
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
  const [isPlacingDecoy, setIsPlacingDecoy] = useState(false);
  const [isPlacingDefenseBuoys, setIsPlacingDefenseBuoys] = useState(false);
  const [placedDefenseBuoys, setPlacedDefenseBuoys] = useState<DefenseBuoy[]>([]);
  const [buoysToPlace, setBuoysToPlace] = useState(0);

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
    setIsPlacingDecoy(false);
    setIsPlacingDefenseBuoys(false);
    setPlacedDefenseBuoys([]);
    setBuoysToPlace(0);
  }

  useEffect(() => {
    if (gameState.status !== 'placing_ships') {
       resetPlacementState();
    }
  }, [gameState.status]);


  const handleCellClick = (row: number, col: number) => {
    if (gameState.status === 'finished') return;
    
    if (gameState.status === 'placing_ships' && isPlayerBoard && onPlacementComplete) {
      if (isPlacingDefenseBuoys) {
        placeDefenseBuoy(row, col);
      } else if (isPlacingDecoy) {
        placeDecoy(row, col);
      } else {
        placeShip(row, col);
      }
    } else if (gameState.status === 'in_progress' && !isPlayerBoard && onFire) {
      onFire({ row, col });
    }
  };

  const placeDefenseBuoy = (row: number, col: number) => {
    // Check if position is occupied by ship or another buoy
    if (placingShips.some(s => s.placements.some(p => p.row === row && p.col === col)) ||
        placedDefenseBuoys.some(b => b.position.row === row && b.position.col === col)) {
        setInvalidPlacement([{ row, col }]);
        setTimeout(() => setInvalidPlacement([]), 300);
        return;
    }

    const newBuoy: DefenseBuoy = {
      id: placedDefenseBuoys.length,
      position: { row, col },
      owner: 'player',
      used: false
    };

    const updatedBuoys = [...placedDefenseBuoys, newBuoy];
    setPlacedDefenseBuoys(updatedBuoys);
    
    const remainingBuoys = buoysToPlace - 1;
    setBuoysToPlace(remainingBuoys);

    if (remainingBuoys === 0) {
      // All buoys placed, check for NFT decoy next
      if (gameState.advantage === 'decoy_buoy') {
        setIsPlacingDefenseBuoys(false);
        setIsPlacingDecoy(true);
      } else {
        onPlacementComplete!(placingShips, undefined, updatedBuoys);
        resetPlacementState();
      }
    }
  };

  const placeDecoy = (row: number, col: number) => {
    if (placingShips.some(s => s.placements.some(p => p.row === row && p.col === col)) ||
        placedDefenseBuoys.some(b => b.position.row === row && b.position.col === col)) {
        setInvalidPlacement([{ row, col }]);
        setTimeout(() => setInvalidPlacement([]), 300);
        return;
    }
    onPlacementComplete!(placingShips, {row, col}, placedDefenseBuoys);
    resetPlacementState();
  }

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
         // Start defense buoy placement (2 buoys for all players)
         setIsPlacingDefenseBuoys(true);
         setBuoysToPlace(2);
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
        if (gameState.status !== 'placing_ships' || !isPlayerBoard || isPlacingDecoy) return;
        if (e.key === 'r' || e.key === 'R') {
            e.preventDefault();
            toggleOrientation();
        }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.status, isPlayerBoard, isPlacingDecoy, toggleOrientation]);


  const getCellContent = (row: number, col: number) => {
    const isShot = shotsToDisplay.some(s => s.row === row && s.col === col);
    const shipOnCell = shipsToDisplay.find(ship => ship.placements.some(p => p.row === row && p.col === col));
    
    // Opponent Board Hit/Miss Markers
    if (!isPlayerBoard) {
        if (isShot) {
           const isDecoyHit = gameState.decoyPosition?.row === row && gameState.decoyPosition?.col === col;
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
    if (gameState.decoyPosition?.row === row && gameState.decoyPosition?.col === col) {
      return <div className="absolute inset-0 flex items-center justify-center"><DecoyIcon className="w-6 h-6 text-cyan-glow"/></div>
    }

    // Show defense buoys on player board
    const defenseBuoyOnCell = gameState.defenseBuoys.find(buoy => 
      buoy.position.row === row && buoy.position.col === col && buoy.owner === 'player'
    );
    if (defenseBuoyOnCell) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-4 h-4 rounded-full ${defenseBuoyOnCell.used ? 'bg-gray-500' : 'bg-blue-500'} border-2 border-white animate-pulse`} />
        </div>
      );
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
    
    // Show decoy position
    if(isPlayerBoard && gameState.decoyPosition?.row === row && gameState.decoyPosition?.col === col) {
        return 'bg-cyan-900/50 border-cyan-400';
    }

    // Show defense buoy positions
    const defenseBuoyOnCell = gameState.defenseBuoys.find(buoy => 
      buoy.position.row === row && buoy.position.col === col && 
      (isPlayerBoard ? buoy.owner === 'player' : buoy.owner === 'opponent')
    );
    if (defenseBuoyOnCell) {
      return defenseBuoyOnCell.used ? 'bg-gray-700/50 border-gray-400' : 'bg-blue-900/50 border-blue-400';
    }

    // Show revealed cells from radar scan
    const isRevealed = revealedCells?.some(c => c.row === row && c.col === col);
    if(isRevealed && !shotsToDisplay.some(s => s.row === row && s.col === col)) {
      return 'bg-cyan-500/30 animate-pulse border-cyan-300';
    }
    
    // Show defense buoy placement preview
    if (isPlayerBoard && gameState.status === 'placing_ships' && isPlacingDefenseBuoys) {
      const isOccupied = placingShips.some(s => s.placements.some(p => p.row === row && p.col === col)) ||
                        placedDefenseBuoys.some(b => b.position.row === row && b.position.col === col);
      if (hoveredCell && hoveredCell.row === row && hoveredCell.col === col) {
        return isOccupied ? 
          'bg-red-500/30 border-red-400 hover:bg-red-500/50' : 
          'bg-blue-500/30 border-blue-400 hover:bg-blue-500/50';
      }
    }

    // Show ship placement preview during placement phase
    if (isPlayerBoard && gameState.status === 'placing_ships' && !isPlacingDecoy && !isPlacingDefenseBuoys && currentShipIndex < SHIP_CONFIG.length) {
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
           {isPlacingDefenseBuoys ? (
              <p className="text-lg font-semibold text-blue-400 animate-pulse">Place Defense Buoys ({buoysToPlace} remaining)</p>
           ) : isPlacingDecoy ? (
              <p className="text-lg font-semibold text-cyan-glow animate-pulse">Place your Decoy Buoy</p>
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
    </div>
  );
};

export default GameBoard;