

import React, { useState, useEffect, useCallback } from 'react';
import type { GameState, Ship, Coordinates, Advantage, Wallet, ShotResult } from '../types';
import { SHIP_CONFIG, GRID_SIZE } from '../types';
import GameBoard from './GameBoard';
import { getAiMove } from '../services/geminiService';
import { TargetIcon, ZapIcon, RadarIcon, UsersIcon, VolleyIcon, EMPIcon, DiamondIcon } from './Icons';
import TurnSwitchScreen from './TurnSwitchScreen';
import FleetStatus from './FleetStatus';
import SiteWideChat from './SiteWideChat';
import ShotResultModal from './ShotResultModal';


interface AdvantageControlProps {
  advantage: Advantage | null;
  advantageUsed: boolean;
  isInteracting: boolean;
  onUseAdvantage: () => void;
}
const AdvantageControl: React.FC<AdvantageControlProps> = ({ advantage, advantageUsed, isInteracting, onUseAdvantage }) => {
  if (!advantage) return null;

  const advantageIconMap: Record<Advantage, React.ReactNode> = {
    radar_scan: <RadarIcon className="w-5 h-5"/>,
    volley_fire: <VolleyIcon className="w-5 h-5"/>,
    emp_blast: <EMPIcon className="w-5 h-5"/>,
    extra_shot: <ZapIcon className="w-5 h-5" />,
    ghost_shield: <ZapIcon className="w-5 h-5" />,
    reinforced_hull: <ZapIcon className="w-5 h-5" />,
    decoy_buoy: <ZapIcon className="w-5 h-5" />,
    sabotage: <ZapIcon className="w-5 h-5" />,
    targeting_computer: <ZapIcon className="w-5 h-5" />,
    salvage_crew: <ZapIcon className="w-5 h-5" />,
  }

  const advantageNameMap: Record<Advantage, string> = {
    radar_scan: 'Aegis Satellite Scan',
    extra_shot: 'Rapid Fire Protocol',
    ghost_shield: 'Ghost Shield',
    reinforced_hull: 'Reinforced Hull',
    decoy_buoy: 'Decoy Buoy',
    volley_fire: 'Volley Fire',
    emp_blast: 'EMP Blast',
    sabotage: 'Sabotage Protocol',
    targeting_computer: 'Targeting Computer',
    salvage_crew: 'Salvage Crew',
  };

  const advantageDescriptionMap: Record<Advantage, string> = {
    radar_scan: 'ACTIVE: Reveal a 2x2 area on the enemy grid.',
    extra_shot: 'PASSIVE: After your next hit, you will get an extra turn.',
    ghost_shield: 'PASSIVE: Your opponent\'s first attack is guaranteed to miss.',
    reinforced_hull: 'PASSIVE: Your largest ship can take one extra hit.',
    decoy_buoy: 'PASSIVE: A fake ship signature confuses enemy scanners.',
    volley_fire: 'ACTIVE: Fire a 3-cell vertical volley. Only the first hit deals damage.',
    emp_blast: 'ACTIVE: Disrupts enemy systems, causing them to skip their next turn.',
    sabotage: 'PASSIVE: 25% chance to cause the opponent to miss their turn.',
    targeting_computer: 'PASSIVE: If your shot misses, it will be auto-corrected to a hit (if possible).',
    salvage_crew: 'PASSIVE: If you lose, recover 25% of your wagered Gems.',
  };
  
  const activatableAdvantages: Advantage[] = ['radar_scan', 'volley_fire', 'emp_blast'];
  const canUse = advantage && activatableAdvantages.includes(advantage) && !advantageUsed;

  return (
    <div className="bg-navy-800/60 border border-navy-700 rounded-lg p-4 mt-8 w-full max-w-5xl text-center">
      <h3 className="text-lg font-orbitron font-bold text-yellow-glow uppercase">Active Advantage</h3>
      <p className="font-semibold text-white text-lg">{advantageNameMap[advantage]}</p>
      <p className="text-sm text-neutral-400 mt-1 mb-3">{advantageDescriptionMap[advantage]}</p>
      {advantageUsed ? (
        <p className="font-bold text-magenta-glow text-xl">(USED)</p>
      ) : (
        <>
            {canUse && (
                <button
                    onClick={onUseAdvantage}
                    disabled={isInteracting}
                    className="bg-cyan-glow/80 text-navy-900 font-bold py-2 px-5 rounded-lg text-sm hover:bg-cyan-glow flex items-center justify-center mx-auto space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {advantageIconMap[advantage]}
                    <span>{isInteracting ? 'ACTIVATING...' : `USE ${advantageNameMap[advantage]}`}</span>
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
  wallet: Wallet;
}

const GameView: React.FC<GameViewProps> = ({ gameState, setGameState, onGameEnd, wallet }) => {
  const [message, setMessage] = useState('Place your fleet on the board.');
  const [isScanning, setIsScanning] = useState(false);
  const [isVolleying, setIsVolleying] = useState(false);
  const [revealedCells, setRevealedCells] = useState<Coordinates[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  // New state for shot result animations
  const [shotResult, setShotResult] = useState<{
    isVisible: boolean;
    result: ShotResult | null;
    shipName?: string;
    isPlayerShot: boolean;
  }>({
    isVisible: false,
    result: null,
    shipName: undefined,
    isPlayerShot: false
  });


  const isPvp = gameState.mode === 'Online PvP (Simulated)';

  const setHoveredCell = (coords: Coordinates | null) => {
    setGameState(gs => gs ? { ...gs, hoveredCell: coords } : null);
  };

  // Run once on game start to apply passive NFT effects
  useEffect(() => {
      if(gameState.status === 'placing_ships' && gameState.advantage === 'reinforced_hull' && !gameState.reinforcedShipId) {
          const carrier = SHIP_CONFIG.find(s => s.name === 'Carrier');
          if(carrier) {
              setGameState(gs => gs ? {...gs, reinforcedShipId: carrier.id} : null);
              console.log("Reinforced Hull applied to Carrier.");
          }
      }
  }, [gameState.status, gameState.advantage, gameState.reinforcedShipId, setGameState]);

  const checkWinCondition = useCallback((): 'player' | 'ai' | null => {
    if (!gameState || (gameState.status !== 'in_progress' && gameState.status !== 'transition')) return null;

    const allPlayerShipsSunk = gameState.playerShips.length > 0 && gameState.playerShips.every(ship => ship.sunk);
    const allOpponentShipsSunk = gameState.opponentShips.length > 0 && gameState.opponentShips.every(ship => ship.sunk);

    if (allPlayerShipsSunk && allOpponentShipsSunk) {
      // This is a draw - both fleets destroyed simultaneously (very rare)
      return null; // Handle draw separately
    }
    
    if (allPlayerShipsSunk) return 'ai';
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
      setTimeout(() => onGameEnd(winner, finalGameState), 2000); // Reduced delay for better UX
    } else if (gameState && gameState.status === 'in_progress') {
      // Check for draw condition
      const allPlayerShipsSunk = gameState.playerShips.length > 0 && gameState.playerShips.every(ship => ship.sunk);
      const allOpponentShipsSunk = gameState.opponentShips.length > 0 && gameState.opponentShips.every(ship => ship.sunk);
      
      if (allPlayerShipsSunk && allOpponentShipsSunk) {
        const finalGameState = { ...gameState, status: 'finished' as const, winner: null };
        setGameState(finalGameState);
        setMessage('Draw! Both fleets have been destroyed.');
        setTimeout(() => onGameEnd('draw', finalGameState), 2000);
      }
    }
  }, [gameState, checkWinCondition, onGameEnd, setGameState, isPvp]);


  const handleAiTurn = useCallback(async () => {
    if (!gameState || gameState.turn !== 'opponent' || gameState.status !== 'in_progress' || isPvp) return;

    setIsAiThinking(true);
    setMessage('Enemy is targeting...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Reduced delay for better pacing
    
    // Handle EMP NFT
    if (gameState.isOpponentAdvantageDisabled) {
      setMessage('Enemy systems are still offline from our EMP! Turn skipped.');
      setGameState(gs => gs ? { ...gs, turn: 'player', isOpponentAdvantageDisabled: false } : null);
      setIsAiThinking(false);
      return;
    }

    // Handle Sabotage NFT
    if(gameState.advantage === 'sabotage' && !gameState.advantageUsed && Math.random() < 0.25) {
        setMessage('Our Sabotage Protocol was successful! Enemy turn skipped.');
        setGameState(gs => gs ? {...gs, turn: 'player', advantageUsed: true} : null);
        setIsAiThinking(false);
        return;
    }

    // Handle Ghost Shield NFT
    if (gameState.advantage === 'ghost_shield' && !gameState.advantageUsed) {
        // Ghost shield causes the first enemy shot to miss automatically
        const randomRow = Math.floor(Math.random() * GRID_SIZE);
        const randomCol = Math.floor(Math.random() * GRID_SIZE);
        setMessage('Enemy shot was deflected by our Ghost Shield!');
        setGameState(gs => gs ? { 
          ...gs, 
          opponentShots: [...gs.opponentShots, {row: randomRow, col: randomCol}], 
          turn: 'player', 
          advantageUsed: true 
        } : null);
        setIsAiThinking(false);
        return;
    }

    try {
      let aiMove: Coordinates = await getAiMove(gameState.playerShips, gameState.opponentShots);

      // Validate AI move
      if (gameState.opponentShots.some(shot => shot.row === aiMove.row && shot.col === aiMove.col)) {
        console.error('AI tried to fire at already targeted coordinates, using fallback');
        // Find a valid fallback move
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (!gameState.opponentShots.some(shot => shot.row === r && shot.col === c)) {
              aiMove = { row: r, col: c };
              break;
            }
          }
        }
      }

      // Handle Decoy System
      const isDecoyHit = gameState.playerDecoys.some(d => d.row === aiMove.row && d.col === aiMove.col);
      if (isDecoyHit) {
        setMessage("Success! The enemy hit our decoy and lost their turn!");
        setShotResult({
          isVisible: true,
          result: 'decoy_hit',
          isPlayerShot: false
        });
        
        // Remove the hit decoy and skip AI's turn
        const updatedDecoys = gameState.playerDecoys.filter(d => 
          !(d.row === aiMove.row && d.col === aiMove.col)
        );
        
        setGameState(gs => gs ? { 
          ...gs, 
          playerDecoys: updatedDecoys,
          opponentShots: [...gs.opponentShots, aiMove], 
          playerTurnSkipped: true,
          turn: 'player' // Player gets another turn
        } : null);
        setIsAiThinking(false);
        return;
      }
      
      // Process Move
      let hitShip: Ship | undefined;
      for (const ship of gameState.playerShips) {
          if (ship.placements.some(p => p.row === aiMove.row && p.col === aiMove.col)) {
              hitShip = ship;
              break;
          }
      }

      if (hitShip) {
          let wasReinforcedHit = false;
          let newHits = [...hitShip.hits];
          let newExtraHealth = hitShip.extraHealth;
          
          // Check if this is a hit on a reinforced ship with extra health
          if (hitShip.id === gameState.reinforcedShipId && (hitShip.extraHealth || 0) > 0) {
              wasReinforcedHit = true;
              newExtraHealth = (hitShip.extraHealth || 1) - 1;
              // Don't add to hits if reinforced ship still has extra health
              if (newExtraHealth <= 0) {
                newHits.push(aiMove);
              }
          } else {
              newHits.push(aiMove);
          }

          const sunk = newHits.length === hitShip.placements.length;
          
          const updatedShips = gameState.playerShips.map(s => 
            s.id === hitShip!.id ? { 
              ...s, 
              hits: newHits, 
              sunk, 
              extraHealth: newExtraHealth 
            } : s
          );

          if (wasReinforcedHit && (newExtraHealth || 0) > 0) {
               setMessage(`Enemy hit our Reinforced ${hitShip.name}, but it holds! (${newExtraHealth} extra health remaining)`);
               // Show hit animation for reinforced hull
               setShotResult({
                 isVisible: true,
                 result: 'hit',
                 isPlayerShot: false
               });
          } else if (sunk) {
              setMessage(`Enemy sunk our ${hitShip.name}!`);
              // Show sunk animation
              setShotResult({
                isVisible: true,
                result: 'sunk',
                shipName: hitShip.name,
                isPlayerShot: false
              });
          } else {
              setMessage(`Enemy hit our ${hitShip.name}!`);
              // Show hit animation
              setShotResult({
                isVisible: true,
                result: 'hit',
                isPlayerShot: false
              });
          }
          
          setGameState(gs => gs ? { 
            ...gs, 
            playerShips: updatedShips, 
            opponentShots: [...gs.opponentShots, aiMove], 
            turn: 'player' 
          } : null);

      } else {
        setMessage('Enemy shot missed!');
        // Show miss animation
        setShotResult({
          isVisible: true,
          result: 'miss',
          isPlayerShot: false
        });
        
        setGameState(gs => gs ? { 
          ...gs, 
          opponentShots: [...gs.opponentShots, aiMove], 
          turn: 'player' 
        } : null);
      }
    } catch (error) {
      console.error('Error in AI turn:', error);
      setMessage('Enemy systems malfunction! Turn skipped.');
      setGameState(gs => gs ? { ...gs, turn: 'player' } : null);
    } finally {
      setIsAiThinking(false);
    }
  }, [gameState, setGameState, isPvp]);


  useEffect(() => {
    if (gameState?.turn === 'opponent' && gameState.status === 'in_progress' && !isPvp && !isAiThinking) {
        const winner = checkWinCondition();
        if (!winner) {
            setIsAiThinking(true);
            handleAiTurn().finally(() => setIsAiThinking(false));
        }
    }
  }, [gameState?.turn, gameState?.status, handleAiTurn, checkWinCondition, isPvp, isAiThinking]);

  const handlePlayerFire = (coords: Coordinates) => {
    if (gameState?.status !== 'in_progress' || (gameState.turn !== 'player' && !isPvp) || isScanning || isVolleying) return;

    // Validate coordinates
    if (coords.row < 0 || coords.row >= GRID_SIZE || coords.col < 0 || coords.col >= GRID_SIZE) {
      setMessage("Invalid target coordinates.");
      return;
    }

    if (gameState.playerShots.some(shot => shot.row === coords.row && shot.col === coords.col)) {
      setMessage("You've already fired at these coordinates.");
      return;
    }
    
    if (isVolleying) {
        handleVolleyFire(coords.col);
        return;
    }

    let targetCoords = coords;
    let hitShip: Ship | undefined;
    const findHitShip = (c: Coordinates) => gameState.opponentShips.find(ship => 
      ship.placements.some(p => p.row === c.row && p.col === c.col)
    );
    
    hitShip = findHitShip(targetCoords);

    // Targeting Computer NFT Logic
    if (!hitShip && gameState.advantage === 'targeting_computer' && !gameState.advantageUsed) {
        const allShipCells = gameState.opponentShips.flatMap(s => s.placements);
        const openShipCells = allShipCells.filter(cell => 
          !gameState.playerShots.some(shot => shot.row === cell.row && shot.col === cell.col)
        );
        
        if (openShipCells.length > 0) {
            targetCoords = openShipCells[Math.floor(Math.random() * openShipCells.length)];
            hitShip = findHitShip(targetCoords);
            setMessage("Targeting Computer engaged! Shot redirected to enemy vessel.");
            setGameState(gs => gs ? { ...gs, advantageUsed: true } : null);
            
            // Add a small delay to show the targeting computer effect
            setTimeout(() => {
              processPlayerShot(targetCoords, hitShip);
            }, 500);
            return;
        }
    }

    processPlayerShot(targetCoords, hitShip);
  };

  const processPlayerShot = (targetCoords: Coordinates, hitShip: Ship | undefined) => {
    if (!gameState) return;

    // Check if player hit a decoy
    const isDecoyHit = gameState.opponentDecoys.some(d => d.row === targetCoords.row && d.col === targetCoords.col);
    
    if (isDecoyHit) {
        setMessage('Decoy hit! Enemy turn lost!');
        setShotResult({
          isVisible: true,
          result: 'decoy_hit',
          isPlayerShot: true
        });
        
        // Remove the hit decoy and skip opponent's turn
        const updatedDecoys = gameState.opponentDecoys.filter(d => 
          !(d.row === targetCoords.row && d.col === targetCoords.col)
        );
        
        setGameState(gs => gs ? { 
          ...gs, 
          opponentDecoys: updatedDecoys,
          playerShots: [...gs.playerShots, targetCoords], 
          opponentTurnSkipped: true,
          turn: 'player' // Player gets another turn
        } : null);
        return;
    }

    if (hitShip) {
        let nextTurn: 'player' | 'opponent' = 'opponent';
        let shotMessage = `Direct hit on enemy ${hitShip.name}!`;
        
        // Extra shot NFT logic
        if (gameState.advantage === 'extra_shot' && !gameState.advantageUsed) {
            nextTurn = 'player';
            shotMessage = 'Rapid Fire Protocol activated! Direct hit - you get another shot!';
            setGameState(gs => gs ? { ...gs, advantageUsed: true } : null);
        }
        
        const newHits = [...hitShip.hits, targetCoords];
        const sunk = newHits.length === hitShip.placements.length;
        
        if (sunk) {
          shotMessage = `Critical hit! Enemy ${hitShip.name} has been sunk!`;
          // Show sunk animation
          setShotResult({
            isVisible: true,
            result: 'sunk',
            shipName: hitShip.name,
            isPlayerShot: true
          });
        } else {
          // Show hit animation
          setShotResult({
            isVisible: true,
            result: 'hit',
            isPlayerShot: true
          });
        }
        
        setMessage(shotMessage);
        
        const updatedShips = gameState.opponentShips.map(s => {
            if (s.id === hitShip!.id) {
                return { ...s, hits: newHits, sunk };
            }
            return s;
        });
        
        setGameState(gs => gs ? { 
          ...gs, 
          opponentShips: updatedShips, 
          playerShots: [...gs.playerShots, targetCoords], 
          turn: nextTurn 
        } : null);
    } else {
        setMessage('Shot missed! Enemy vessel evaded.');
        // Show miss animation
        setShotResult({
          isVisible: true,
          result: 'miss',
          isPlayerShot: true
        });
        
        setGameState(gs => gs ? { 
          ...gs, 
          playerShots: [...gs.playerShots, targetCoords], 
          turn: 'opponent' 
        } : null);
    }
  };
  
  const handlePlacementComplete = (placedShips: Ship[], decoys?: Coordinates[]) => {
      const shipsWithHealth = placedShips.map(ship => ({
          ...ship,
          extraHealth: ship.id === gameState.reinforcedShipId ? 1 : 0
      }));

      if (isPvp) {
         // First placement belongs to Player 1 (turn === 'player')
         if (gameState.playerShips.length === 0) {
             // Save Player 1 fleet and hand device to Player 2
             setGameState(gs => gs ? {
                 ...gs,
                 playerShips: shipsWithHealth,
                 playerDecoys: decoys || [],
                 status: 'transition',
                 turn: 'opponent',
                 transitionMessage: 'Player 2, prepare to place your fleet.'
             } : null);
             return;
         }

         // Second placement belongs to Player 2
         if (gameState.opponentShips.length === 0) {
             setGameState(gs => gs ? {
                 ...gs,
                 opponentShips: shipsWithHealth,
                 opponentDecoys: decoys || [],
                 status: 'transition',
                 turn: 'player',
                 transitionMessage: 'All fleets deployed. Player 1 takes the first shot.'
             } : null);
             return;
         }
      } else { // PvE
        const opponentShips = placeOpponentShips();
        const opponentDecoys = placeOpponentDecoysWithShips(opponentShips);
        setGameState(gs => gs ? { 
            ...gs, 
            playerShips: shipsWithHealth,
            opponentShips,
            playerDecoys: decoys || [],
            opponentDecoys,
            status: 'in_progress',
        } : null);
        setMessage("All fleets deployed. Engage the enemy!");
      }
  };

  const handleUseAdvantage = () => {
    if (!gameState || gameState.advantageUsed) return;
    
    switch(gameState.advantage) {
      case 'radar_scan':
        setIsScanning(true);
        setMessage('Radar activated. Select a target cell on the enemy grid.');
        break;
      case 'volley_fire':
        setIsVolleying(true);
        setMessage('Volley Fire activated. Select a target column to fire upon.');
        break;
      case 'emp_blast':
        setMessage('EMP Blast fired! Enemy systems disrupted.');
        setGameState(gs => gs ? { ...gs, advantageUsed: true, isOpponentAdvantageDisabled: true } : null);
        break;
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

  const handleVolleyFire = (col: number) => {
    if (!gameState || !isVolleying) return;
    
    // Validate column
    if (col < 0 || col >= GRID_SIZE) {
      setMessage('Invalid column selected for volley fire.');
      return;
    }
    
    const shotsInColumn: Coordinates[] = Array.from({length: GRID_SIZE}, (_, row) => ({row, col}));
    const validShots = shotsInColumn.filter(shot => 
      !gameState.playerShots.some(existingShot => 
        existingShot.row === shot.row && existingShot.col === shot.col
      )
    );
    
    if (validShots.length === 0) {
      setMessage('All targets in this column have already been fired upon!');
      return;
    }
    
    const newPlayerShots = [...gameState.playerShots, ...validShots];
    let firstHitFound = false;
    let hitMessage = 'Volley fire - all shots missed!';
    let hitShip: Ship | undefined;

    const updatedShips = gameState.opponentShips.map(ship => {
        let shipWasHitThisVolley = false;
        const newHits = [...ship.hits];
        
        validShots.forEach(shot => {
            const isAlreadyHit = ship.hits.some(h => h.row === shot.row && h.col === shot.col);
            const isShipAtLocation = ship.placements.some(p => p.row === shot.row && p.col === shot.col);
            
            if (!isAlreadyHit && isShipAtLocation && !firstHitFound) {
                newHits.push(shot);
                firstHitFound = true;
                shipWasHitThisVolley = true;
                hitShip = ship;
            }
        });

        if (shipWasHitThisVolley) {
            const sunk = newHits.length === ship.placements.length;
            hitMessage = `Volley fire connected with enemy ${ship.name}!`;
            if (sunk) hitMessage = `Volley fire obliterated the enemy ${ship.name}!`;
            return { ...ship, hits: newHits, sunk };
        }
        return ship;
    });
    
    setMessage(hitMessage);
    setGameState(gs => gs ? {
        ...gs,
        opponentShips: updatedShips,
        playerShots: newPlayerShots,
        turn: 'opponent',
        advantageUsed: true,
    } : null);
    setIsVolleying(false);
  }

  const handleFireOrAbility = (coords: Coordinates) => {
    if (isScanning) {
        handleScan(coords);
    } else if (isVolleying) {
        handleVolleyFire(coords.col);
    } else {
        handlePlayerFire(coords);
    }
  }

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

  const currentPlayerName = gameState.turn === 'player' ? 'Your Fleet' : (isPvp ? 'Player 2' : 'AI Fleet');
  const enemyPlayerName = gameState.turn === 'player' ? (isPvp ? 'Player 2' : 'Enemy Waters') : 'Player 1';

  return (
    <div className="flex flex-col xl:flex-row gap-8 items-start">
      <div className="flex-grow flex flex-col items-center animate-fade-in w-full">
        <div className="bg-navy-800/60 border border-navy-700 rounded-lg p-4 mb-8 w-full max-w-5xl text-center shadow-lg">
          <h2 className="text-xl font-orbitron font-bold text-cyan-glow uppercase tracking-widest flex items-center justify-center space-x-3">
              {gameState.status === 'in_progress' && (isPvp ? <UsersIcon className="w-6 h-6 text-yellow-glow" /> : (gameState.turn === 'player' ? <ZapIcon className="w-6 h-6 text-yellow-glow"/> : <TargetIcon className="w-6 h-6 text-magenta-glow animate-pulse"/>))}
              <span>{message}</span>
          </h2>
          {gameState.wager > 0 && (
              <p className="text-sm text-neutral-400 flex items-center justify-center gap-2">Wager: {gameState.wager} <DiamondIcon className="w-4 h-4 text-yellow-glow/80"/></p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-7xl">
          {/* Player Side */}
          <div className="bg-navy-900/40 border border-cyan-glow/30 rounded-lg p-4 flex flex-col items-center shadow-cyan/20 shadow-lg">
              <h3 className="text-2xl font-orbitron font-bold mb-4 text-cyan-glow uppercase">
                {currentPlayerName}
              </h3>
              <GameBoard 
                  isPlayerBoard={true}
                  gameState={gameState}
                  onPlacementComplete={handlePlacementComplete}
              />
              <FleetStatus title="Fleet Status" ships={gameState.playerShips} isOpponent={false} />
          </div>
          
          {/* Opponent Side */}
          <div className="bg-navy-900/40 border border-magenta-glow/30 rounded-lg p-4 flex flex-col items-center shadow-magenta/20 shadow-lg">
              <h3 className="text-2xl font-orbitron font-bold mb-4 text-magenta-glow uppercase">
                {enemyPlayerName}
              </h3>
              <GameBoard 
                  isPlayerBoard={false}
                  gameState={gameState}
                  onFire={handleFireOrAbility}
                  isScanning={isScanning || isVolleying}
                  revealedCells={revealedCells}
                  hoveredCell={gameState.hoveredCell}
                  onHover={setHoveredCell}
              />
              <FleetStatus title="Intel Report" ships={gameState.opponentShips} isOpponent={true} />
          </div>
        </div>

        {gameState.status === 'in_progress' && gameState.advantage && (
          <AdvantageControl 
              advantage={gameState.advantage} 
              advantageUsed={gameState.advantageUsed}
              isInteracting={isScanning || isVolleying}
              onUseAdvantage={handleUseAdvantage}
          />
        )}
      </div>
      <div className="w-full xl:w-[380px] xl:max-w-[380px] flex-shrink-0 sticky top-24">
        <SiteWideChat wallet={wallet} />
      </div>
      
      {/* Shot Result Modal */}
      <ShotResultModal
        isVisible={shotResult.isVisible}
        result={shotResult.result}
        shipName={shotResult.shipName}
        isPlayerShot={shotResult.isPlayerShot}
        onClose={() => setShotResult({
          isVisible: false,
          result: null,
          shipName: undefined,
          isPlayerShot: false
        })}
      />
    </div>
  );
};


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

const placeOpponentDecoys = (): Coordinates[] => {
    const decoys: Coordinates[] = [];
    
    for (let i = 0; i < 2; i++) {
        let placed = false;
        while (!placed) {
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);
            
            const newDecoy = { row, col };
            const isOverlappingWithDecoys = decoys.some(d => d.row === row && d.col === col);
            
            if (!isOverlappingWithDecoys) {
                decoys.push(newDecoy);
                placed = true;
            }
        }
    }
    
    return decoys;
};

const placeOpponentDecoysWithShips = (opponentShips: Ship[]): Coordinates[] => {
    const decoys: Coordinates[] = [];
    const allShipPlacements = opponentShips.flatMap(ship => ship.placements);

    for (let i = 0; i < 2; i++) {
        let placed = false;
        while (!placed) {
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);
            
            const newDecoy = { row, col };
            const isOverlappingWithShips = allShipPlacements.some(p => p.row === row && p.col === col);
            const isOverlappingWithDecoys = decoys.some(d => d.row === row && d.col === col);
            
            if (!isOverlappingWithShips && !isOverlappingWithDecoys) {
                decoys.push(newDecoy);
                placed = true;
            }
        }
    }
    
    return decoys;
};


export default GameView;
