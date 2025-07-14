
import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, Ship, Coordinates, Advantage } from '../types';
import { SHIP_CONFIG, GRID_SIZE } from '../types';
import GameBoard from './GameBoard';
import { getAiMove } from '../services/geminiService';
import { TargetIcon, ZapIcon, RadarIcon, UsersIcon } from './Icons';
import TurnSwitchScreen from './TurnSwitchScreen';
import FleetStatus from './FleetStatus';


interface AdvantageControlProps {
  advantage: Advantage | null;
  advantageUsed: boolean;
  isScanning: boolean;
  onUseAdvantage: () => void;
}
const AdvantageControl: React.FC<AdvantageControlProps> = ({ advantage, advantageUsed, isScanning, onUseAdvantage }) => {
  if (!advantage) return null;

  const advantageNameMap: Record<Advantage, string> = {
    radar_scan: 'Aegis Satellite Scan',
    extra_shot: 'Rapid Fire Protocol',
    ghost_shield: 'Ghost Shield',
  };

  const advantageDescriptionMap: Record<Advantage, string> = {
    radar_scan: 'Click to activate, then select a cell on the enemy grid to reveal a 2x2 area.',
    extra_shot: 'Passive. After your next hit, you will get an extra turn.',
    ghost_shield: 'Passive. Your opponent\'s first attack is guaranteed to miss.',
  };
  
  const canUse = advantage === 'radar_scan';

  return (
    <div className="bg-navy-800/60 border border-navy-700 rounded-lg p-4 mt-8 w-full max-w-5xl text-center">
      <h3 className="text-lg font-orbitron font-bold text-yellow-glow uppercase">Active Advantage</h3>
      <p className="font-semibold text-white">{advantageNameMap[advantage]}</p>
      {advantageUsed ? (
        <p className="text-magenta-glow font-bold">(USED)</p>
      ) : (
        <>
            <p className="text-sm text-neutral-400 mt-1">{advantageDescriptionMap[advantage]}</p>
            {canUse && (
                <button
                    onClick={onUseAdvantage}
                    disabled={isScanning}
                    className="mt-2 bg-cyan-glow/80 text-navy-900 font-bold py-2 px-4 rounded-lg text-sm hover:bg-cyan-glow flex items-center justify-center mx-auto space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RadarIcon className="w-5 h-5" />
                    <span>{isScanning ? 'SELECTING TARGET...' : 'USE SCAN'}</span>
                </button>
            )}
        </>
      )}
    </div>
  );
};


interface GameViewProps {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
  onGameEnd: (winner: 'player' | 'ai' | 'draw', gameState: GameState) => void;
}

const GameView: React.FC<GameViewProps> = ({ gameState, setGameState, onGameEnd }) => {
  const [message, setMessage] = useState('Place your fleet on the board.');
  const [isScanning, setIsScanning] = useState(false);
  const [revealedCells, setRevealedCells] = useState<Coordinates[]>([]);

  const isPvp = gameState.mode === 'Online PvP (Simulated)';

  const setHoveredCell = (coords: Coordinates | null) => {
    setGameState(gs => gs ? { ...gs, hoveredCell: coords } : null);
  };

  const checkWinCondition = useCallback((): 'player' | 'ai' | null => {
    if (!gameState || (gameState.status !== 'in_progress' && gameState.status !== 'transition')) return null;

    const allPlayerShipsSunk = gameState.playerShips.length > 0 && gameState.playerShips.every(ship => ship.sunk);
    const allOpponentShipsSunk = gameState.opponentShips.length > 0 && gameState.opponentShips.every(ship => ship.sunk);

    if (allPlayerShipsSunk) return 'ai'; // 'ai' doubles as P2 win marker in PvP
    if (allOpponentShipsSunk) return 'player';
    
    return null;
  }, [gameState]);

  useEffect(() => {
    const winner = checkWinCondition();
    if (winner && gameState && gameState.status === 'in_progress') {
      const finalGameState = { ...gameState, status: 'finished' as const, winner };
      setGameState(finalGameState);
      const winnerName = winner === 'player' ? 'Player 1' : (isPvp ? 'Player 2' : 'The AI');
      setMessage(winner === 'player' ? 'Victory! All enemy ships have been sunk.' : `Defeat! ${winnerName} has won.`);
      setTimeout(() => onGameEnd(winner, finalGameState), 2000); // Delay for final state view
    }
  }, [gameState, checkWinCondition, onGameEnd, setGameState, isPvp]);


  const handleAiTurn = useCallback(async () => {
    if (!gameState || gameState.turn !== 'opponent' || gameState.status !== 'in_progress' || isPvp) return;

    setMessage('Enemy is targeting...');
    await new Promise(resolve => setTimeout(resolve, 1200));

    if (gameState.advantage === 'ghost_shield' && !gameState.advantageUsed) {
        const randomRow = Math.floor(Math.random() * GRID_SIZE);
        const randomCol = Math.floor(Math.random() * GRID_SIZE);
        setMessage('Enemy shot was deflected by our Ghost Shield!');
        setGameState(gs => gs ? { ...gs, opponentShots: [...gs.opponentShots, {row: randomRow, col: randomCol}], turn: 'player', advantageUsed: true } : null);
        return;
    }

    let aiMove: Coordinates;
    let huntQueue = [...gameState.aiHuntQueue];

    // 1. Determine Target
    if (gameState.aiMode === 'hunting' && huntQueue.length > 0) {
        let nextTarget: Coordinates | undefined;
        while(huntQueue.length > 0) {
            const potentialTarget = huntQueue.shift(); // Get next target from queue
            if (potentialTarget && !gameState.opponentShots.some(shot => shot.row === potentialTarget.row && shot.col === potentialTarget.col)) {
                nextTarget = potentialTarget;
                break;
            }
        }
        
        if (nextTarget) {
            aiMove = nextTarget;
        } else {
            // Hunt queue exhausted, switch back to searching
            aiMove = await getAiMove(gameState.playerShips, gameState.opponentShots);
            setGameState(gs => gs ? { ...gs, aiMode: 'searching', aiHuntQueue: [] } : null);
        }
    } else { // Searching mode
        aiMove = await getAiMove(gameState.playerShips, gameState.opponentShots);
    }
    
    // 2. Process Move
    let hitShip: Ship | undefined;
    for (const ship of gameState.playerShips) {
        if (ship.placements.some(p => p.row === aiMove.row && p.col === aiMove.col)) {
            hitShip = ship;
            break;
        }
    }

    if (hitShip) {
        const newHits = [...hitShip.hits, aiMove];
        const sunk = newHits.length === hitShip.placements.length;
        
        const updatedShips = gameState.playerShips.map(s => s.id === hitShip!.id ? { ...s, hits: newHits, sunk } : s);

        if (sunk) {
            setMessage(`Enemy sunk our ${hitShip.name}!`);
            // Ship sunk, clear the hunt queue and go back to searching
            huntQueue = [];
            setGameState(gs => gs ? { ...gs, playerShips: updatedShips, opponentShots: [...gs.opponentShots, aiMove], turn: 'player', aiMode: 'searching', aiHuntQueue: [] } : null);
        } else {
            setMessage(`Enemy hit our ${hitShip.name}!`);
            // Add adjacent cells to the hunt queue
            const adjacent = [
                { row: aiMove.row - 1, col: aiMove.col }, { row: aiMove.row + 1, col: aiMove.col },
                { row: aiMove.row, col: aiMove.col - 1 }, { row: aiMove.row, col: aiMove.col + 1 },
            ];
            
            for(const cell of adjacent) {
                if(cell.row >= 0 && cell.row < GRID_SIZE && cell.col >= 0 && cell.col < GRID_SIZE) {
                    if (!huntQueue.some(c => c.row === cell.row && c.col === cell.col) && !gameState.opponentShots.some(s => s.row === cell.row && s.col === cell.col)) {
                       huntQueue.push(cell);
                    }
                }
            }
            setGameState(gs => gs ? { ...gs, playerShips: updatedShips, opponentShots: [...gs.opponentShots, aiMove], turn: 'player', aiMode: 'hunting', aiHuntQueue: huntQueue } : null);
        }
    } else {
      setMessage('Enemy shot missed!');
      setGameState(gs => gs ? { ...gs, opponentShots: [...gs.opponentShots, aiMove], turn: 'player', aiHuntQueue: huntQueue } : null);
    }
  }, [gameState, setGameState, isPvp]);


  useEffect(() => {
    if (gameState?.turn === 'opponent' && gameState.status === 'in_progress' && !isPvp) {
        const winner = checkWinCondition();
        if (!winner) {
            handleAiTurn();
        }
    }
  }, [gameState?.turn, gameState?.status, handleAiTurn, checkWinCondition, isPvp]);

  const handlePlayerFire = (coords: Coordinates) => {
    if (gameState?.status !== 'in_progress' || (gameState.turn !== 'player' && !isPvp)) return;

    const isP1Turn = gameState.turn === 'player';
    const shots = isP1Turn ? gameState.playerShots : gameState.opponentShots;
    if (shots.some(shot => shot.row === coords.row && shot.col === coords.col)) {
      setMessage("You've already fired at these coordinates.");
      return;
    }

    const targetShips = isP1Turn ? gameState.opponentShips : gameState.playerShips;
    let hitShip: Ship | undefined;
    for (const ship of targetShips) {
        if (ship.placements.some(p => p.row === coords.row && p.col === coords.col)) {
            hitShip = ship;
            break;
        }
    }
    
    if (isPvp) {
      const nextTurn = isP1Turn ? 'opponent' : 'player';
      const transitionMessage = `${nextTurn === 'player' ? 'Player 1' : 'Player 2'}'s Turn.`;
      
      setGameState(gs => {
        if (!gs) return null;
        const newShots = [...(isP1Turn ? gs.playerShots : gs.opponentShots), coords];
        let newTargetShips = [...targetShips];

        if (hitShip) {
            setMessage(`Direct hit on an enemy vessel!`);
            newTargetShips = targetShips.map(s => {
              if (s.id === hitShip!.id) {
                  const newHits = [...s.hits, coords];
                  const sunk = newHits.length === s.placements.length;
                  if(sunk) setMessage(`Success! Enemy ${hitShip.name} has been sunk!`);
                  return { ...s, hits: newHits, sunk };
              }
              return s;
            });
        } else {
             setMessage('Our shot landed in the water. Miss!');
        }
        
        return {
          ...gs,
          playerShips: isP1Turn ? gs.playerShips : newTargetShips,
          opponentShips: isP1Turn ? newTargetShips : gs.opponentShips,
          playerShots: isP1Turn ? newShots : gs.playerShots,
          opponentShots: isP1Turn ? gs.opponentShots : newShots,
          status: 'transition',
          turn: nextTurn,
          transitionMessage,
        }
      });
    } else { // PvE Logic
      let nextTurn: 'player' | 'opponent' = 'opponent';
      let advantageNowUsed = gameState.advantageUsed;
      
      if (hitShip) {
          if (gameState.advantage === 'extra_shot' && !gameState.advantageUsed) {
              nextTurn = 'player';
              advantageNowUsed = true;
              setMessage('Rapid Fire Protocol! You get an extra shot.');
          } else {
              setMessage(`Direct hit on an enemy vessel!`);
          }
          const updatedShips = gameState.opponentShips.map(s => {
              if (s.id === hitShip!.id) {
                  const newHits = [...s.hits, coords];
                  const sunk = newHits.length === s.placements.length;
                  if(sunk) setMessage(`Success! Enemy ${hitShip.name} has been sunk!`);
                  return { ...s, hits: newHits, sunk };
              }
              return s;
          });
          setGameState(gs => gs ? { ...gs, opponentShips: updatedShips, playerShots: [...gs.playerShots, coords], turn: nextTurn, advantageUsed: advantageNowUsed } : null);
      } else {
          setMessage('Our shot landed in the water. Miss!');
          setGameState(gs => gs ? { ...gs, playerShots: [...gs.playerShots, coords], turn: 'opponent' } : null);
      }
    }
  };
  
  const handlePlacementComplete = (placedShips: Ship[]) => {
      if (isPvp) {
        const isP1Placing = gameState.turn === 'player';
        if (isP1Placing) {
           setGameState(gs => gs ? {
             ...gs,
             playerShips: placedShips,
             status: 'transition',
             turn: 'opponent',
             transitionMessage: 'Player 2, prepare to place your fleet.'
           } : null);
        } else { // P2 is placing
          setGameState(gs => gs ? {
             ...gs,
             opponentShips: placedShips,
             status: 'transition',
             turn: 'player',
             transitionMessage: 'The battle begins! Player 1, take your first shot.'
           } : null);
        }
      } else { // PvE
        const opponentShips = placeOpponentShips();
        setGameState(gs => gs ? { 
            ...gs, 
            playerShips: placedShips,
            opponentShips,
            status: 'in_progress',
        } : null);
        setMessage("All fleets deployed. Engage the enemy!");
      }
  };

  const handleUseAdvantage = () => {
    if(gameState?.advantage === 'radar_scan' && !gameState.advantageUsed) {
        setIsScanning(true);
        setMessage('Radar activated. Select a target cell on the enemy grid.');
    }
  };

  const handleScan = (coords: Coordinates) => {
    if (!isScanning) return;
    const newRevealed: Coordinates[] = [];
    for(let r = 0; r < 2; r++) {
        for(let c = 0; c < 2; c++) {
            const cell = { row: coords.row + r, col: coords.col + c };
            if (cell.row < GRID_SIZE && cell.col < GRID_SIZE) {
                newRevealed.push(cell);
            }
        }
    }
    setRevealedCells(prev => [...prev, ...newRevealed]);
    setGameState(gs => gs ? { ...gs, advantageUsed: true } : null);
    setIsScanning(false);
    setMessage('Scan complete. Enemy grid area revealed.');
  };

  const handleReadyForTurn = () => {
    if (!gameState) return;
    const isStartingGame = gameState.opponentShips.length > 0;
    setGameState(gs => gs ? {
      ...gs,
      status: isStartingGame ? 'in_progress' : 'placing_ships',
      transitionMessage: ''
    }: null);
    const whoseTurn = gameState.turn === 'player' ? 'Player 1' : 'Player 2';
    if (!isStartingGame) {
        setMessage(`${whoseTurn}, place your fleet.`);
    } else {
        setMessage(`${whoseTurn}, it's your turn to fire.`);
    }
  };

  if (!gameState) return <div>Loading game...</div>;
  
  if (gameState.status === 'transition') {
      return <TurnSwitchScreen message={gameState.transitionMessage} onReady={handleReadyForTurn} turn={gameState.turn} />;
  }

  const currentPlayerName = gameState.turn === 'player' ? 'Player 1' : (isPvp ? 'Player 2' : 'AI');
  const enemyPlayerName = gameState.turn === 'player' ? (isPvp ? 'Player 2' : 'AI') : 'Player 1';

  const playerBoardShips = (isPvp && gameState.turn !== 'player') ? gameState.opponentShips : gameState.playerShips;
  const opponentSunkShips = gameState.opponentShips.filter(s => s.sunk);


  return (
    <div className="flex flex-col items-center animate-fade-in w-full">
      <div className="bg-navy-800/60 border border-navy-700 rounded-lg p-4 mb-8 w-full max-w-5xl text-center">
        <h2 className="text-xl font-orbitron font-bold text-cyan-glow uppercase tracking-widest flex items-center justify-center space-x-3">
            {gameState.status === 'in_progress' && (isPvp ? <UsersIcon className="w-6 h-6 text-yellow-glow" /> : (gameState.turn === 'player' ? <ZapIcon className="w-6 h-6 text-yellow-glow"/> : <TargetIcon className="w-6 h-6 text-magenta-glow animate-pulse"/>))}
            <span>{message}</span>
        </h2>
        <p className="text-sm text-neutral-400">Wager: {gameState.wager} $SHIP</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
        {/* Player Side */}
        <div className="bg-navy-900/40 border border-cyan-glow/30 rounded-lg p-4 flex flex-col items-center">
            <h3 className="text-2xl font-orbitron font-bold mb-4 text-cyan-glow">
              YOUR FLEET {isPvp && `(${currentPlayerName})`}
            </h3>
            <div className="flex flex-col md:flex-row gap-4 w-full items-center md:items-start">
                {gameState.playerNftSkinUrl && (
                    <div className="flex-shrink-0">
                        <h4 className="text-lg font-orbitron text-yellow-glow mb-2 text-center">EQUIPPED</h4>
                        <img src={gameState.playerNftSkinUrl} alt="NFT Skin" className="w-28 h-28 rounded-lg border-2 border-yellow-glow shadow-yellow" />
                    </div>
                )}
                <div className="flex-grow">
                    <GameBoard 
                        isPlayerBoard={true}
                        gameState={gameState}
                        onPlacementComplete={handlePlacementComplete}
                    />
                </div>
            </div>
             <FleetStatus title="Fleet Status" ships={playerBoardShips} isOpponent={false} />
        </div>
        
        {/* Opponent Side */}
        <div className="bg-navy-900/40 border border-magenta-glow/30 rounded-lg p-4 flex flex-col items-center">
             <h3 className="text-2xl font-orbitron font-bold mb-4 text-magenta-glow">
              ENEMY WATERS {isPvp && `(${enemyPlayerName})`}
             </h3>
             <div className="w-full text-center h-8 mb-2">
                {gameState.hoveredCell && gameState.status === 'in_progress' && (
                    <p className="font-mono text-lg text-yellow-glow animate-pulse">
                        Target: [R:{gameState.hoveredCell.row}, C:{gameState.hoveredCell.col}]
                    </p>
                )}
            </div>
            <GameBoard 
                isPlayerBoard={false}
                gameState={gameState}
                onFire={handlePlayerFire}
                onScan={handleScan}
                isScanning={isScanning}
                revealedCells={revealedCells}
                hoveredCell={gameState.hoveredCell}
                onHover={setHoveredCell}
            />
            <FleetStatus title="Known Enemy Ships" ships={opponentSunkShips} isOpponent={true} />
        </div>
      </div>

      {gameState.status === 'in_progress' && !isPvp && (
        <AdvantageControl 
            advantage={gameState.advantage} 
            advantageUsed={gameState.advantageUsed}
            isScanning={isScanning}
            onUseAdvantage={handleUseAdvantage}
        />
      )}
    </div>
  );
};


// Helper to place opponent ships randomly
const placeOpponentShips = (): Ship[] => {
    const ships: Ship[] = [];
    const placements: Coordinates[] = [];

    for (const shipConfig of SHIP_CONFIG) {
        let placed = false;
        while(!placed) {
            const isHorizontal = Math.random() > 0.5;
            const startRow = Math.floor(Math.random() * (GRID_SIZE - (isHorizontal ? 0 : shipConfig.length)));
            const startCol = Math.floor(Math.random() * (GRID_SIZE - (isHorizontal ? shipConfig.length : 0)));
            
            const shipPlacements: Coordinates[] = [];
            let valid = true;
            for (let i = 0; i < shipConfig.length; i++) {
                const row = startRow + (isHorizontal ? 0 : i);
                const col = startCol + (isHorizontal ? i : 0);
                if (placements.some(p => p.row === row && p.col === col)) {
                    valid = false;
                    break;
                }
                shipPlacements.push({ row, col });
            }

            if (valid) {
                ships.push({ ...shipConfig, placements: shipPlacements, hits: [], sunk: false });
                placements.push(...shipPlacements);
                placed = true;
            }
        }
    }
    return ships;
};


export default GameView;
