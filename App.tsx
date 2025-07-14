
import React, { useState, useEffect, useCallback } from 'react';
import type { Wallet, GameState, GameMode, Nft } from './types';
import { mockConnectWallet, mockDisconnectWallet } from './services/solanaService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GameView from './components/GameView';
import NftStore from './components/NftStore';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';

type View = 'dashboard' | 'game' | 'nft_store';

interface GameOverModalProps {
  winnerName: string;
  isDraw: boolean;
  wager: number;
  onClose: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ winnerName, isDraw, wager, onClose }) => {
  const isPlayerWinner = winnerName === 'Player 1';
  
  let title;
  let message;

  if (isDraw) {
    title = 'DRAW';
    message = `The match is a draw. Your wager of ${wager} $SHIP has been returned.`;
  } else if (isPlayerWinner) {
    title = 'VICTORY!';
    message = `Congratulations, ${winnerName}! You have won the pot of ${wager * 2} $SHIP!`;
  } else {
    title = 'DEFEAT';
    message = `The fleet of ${winnerName} is victorious. You lost ${wager} $SHIP.`;
  }

  const titleColor = isPlayerWinner ? 'text-cyan-glow' : 'text-magenta-glow';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in">
      <div className="bg-navy-800 border-2 border-navy-700 rounded-2xl shadow-lg w-full max-w-lg p-8 m-4 text-center">
        <h1 className={`text-6xl md:text-8xl font-orbitron font-black uppercase tracking-widest ${titleColor} mb-4`}>
          {title}
        </h1>
        <p className="text-neutral-300 text-lg mb-8">{message}</p>
        <button
          onClick={onClose}
          className="w-full max-w-xs mx-auto bg-yellow-glow text-navy-900 font-bold font-orbitron py-3 px-8 rounded-lg uppercase tracking-wider transition-all duration-300 hover:bg-white hover:shadow-yellow"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [nfts, setNfts] = useState<Nft[]>([]); // User's purchased NFTs
  const [gameOverData, setGameOverData] = useState<{ winnerName: string, isDraw: boolean, wager: number } | null>(null);


  useEffect(() => {
    // Simulate fetching user's NFTs on wallet connection
    if (wallet) {
      // In a real app, you would fetch this from a blockchain account
      console.log("Wallet connected, could fetch NFTs here.");
    }
  }, [wallet]);

  const handleConnectWallet = async () => {
    const connectedWallet = await mockConnectWallet();
    setWallet(connectedWallet);
  };

  const handleDisconnectWallet = () => {
    mockDisconnectWallet();
    setWallet(null);
    setView('dashboard');
    setGameState(null);
  };

  const handleStartGame = (mode: GameMode, wager: number, selectedNft: Nft | null) => {
    if (!wallet) return;

    // Simulate wager transaction
    const newBalance = wallet.balance - wager;
    if (newBalance < 0) {
      alert("Insufficient $SHIP balance for this wager.");
      return;
    }
    setWallet({ ...wallet, balance: newBalance });
    
    console.log(`Starting ${mode} game with a wager of ${wager} $SHIP. NFT advantage: ${selectedNft?.name || 'None'}`);

    const isPvp = mode === 'Online PvP (Simulated)';
    setGameState({
      mode,
      wager,
      playerShips: [],
      opponentShips: [],
      playerShots: [],
      opponentShots: [],
      status: isPvp ? 'transition' : 'placing_ships',
      turn: 'player',
      winner: null,
      advantage: mode === 'Player vs AI' ? selectedNft?.advantage || null : null,
      advantageUsed: false,
      transitionMessage: isPvp ? 'Player 1, prepare to place your fleet.' : '',
      playerNftSkinUrl: mode === 'Player vs AI' ? selectedNft?.skinImageUrl || null : null,
      hoveredCell: null,
      aiMode: 'searching',
      aiHuntQueue: [],
    });
    setView('game');
  };

  const handleGameEnd = useCallback((winner: 'player' | 'ai' | 'draw', finalGameState: GameState) => {
    if (!wallet || !finalGameState) return;

    const getWinnerName = () => {
        if (winner === 'draw') return '';
        if (winner === 'player') return 'Player 1';
        if (finalGameState.mode === 'Online PvP (Simulated)') return 'Player 2';
        return 'AI';
    };

    const winnerName = getWinnerName();
    const isDraw = winner === 'draw';

    if (winner === 'player') {
      const winnings = finalGameState.wager * 2;
      setWallet(w => w ? { ...w, balance: w.balance + winnings } : null);
    } else if (isDraw) {
        setWallet(w => w ? { ...w, balance: w.balance + finalGameState.wager } : null);
    }
    
    setGameOverData({ winnerName, isDraw, wager: finalGameState.wager });
    setGameState(null); // Clear game state
    setView('dashboard'); // Go to dashboard view underneath the modal
  }, [wallet]);

  const handleCloseGameOverModal = () => {
    setGameOverData(null);
  };

  const handleBuyNft = (nft: Nft) => {
    if (!wallet) return;
    
    const newBalance = wallet.balance - nft.price;
    if (newBalance < 0) {
      alert("Insufficient $SHIP balance to buy this NFT.");
      return;
    }

    setWallet({ ...wallet, balance: newBalance });
    setNfts(prev => [...prev, nft]);
    alert(`Successfully purchased ${nft.name}!`);
    setView('dashboard');
  };

  const renderView = () => {
    if (!wallet) {
        return <LandingPage onConnectWallet={handleConnectWallet} />;
    }

    switch (view) {
      case 'game':
        if (!gameState) return <Dashboard onStartGame={handleStartGame} onNavigate={setView} ownedNfts={nfts} />;
        return <GameView gameState={gameState} setGameState={setGameState} onGameEnd={handleGameEnd} />;
      case 'nft_store':
        return <NftStore onBuyNft={handleBuyNft} />;
      default:
        return <Dashboard onStartGame={handleStartGame} onNavigate={setView} ownedNfts={nfts} />;
    }
  };

  return (
    <div className="bg-navy-900 min-h-screen text-white font-sans flex flex-col">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0"></div>
      {wallet && <Header wallet={wallet} onDisconnect={handleDisconnectWallet} onNavigate={setView} />}
      <main className="flex-grow container mx-auto px-4 py-8 z-10">
        {renderView()}
      </main>
      {wallet && <Footer />}
    </div>
  );
};

export default App;
