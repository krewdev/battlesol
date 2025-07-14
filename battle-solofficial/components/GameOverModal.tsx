

import React from 'react';
import type { DiamondIcon } from './Icons';

interface GameOverModalProps {
  winnerName: string;
  isDraw: boolean;
  wager: number;
  expGained: number;
  onClose: () => void;
  isPlayerWinner: boolean;
  isGuest: boolean;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ winnerName, isDraw, wager, expGained, onClose, isPlayerWinner, isGuest }) => {
  
  let title;
  let message;

  if (isGuest) {
    title = isPlayerWinner ? 'TRIAL COMPLETE' : 'SIMULATION ENDED';
    message = "You've experienced a taste of naval command and the power of NFT advantages. Connect your wallet to play for real rewards, earn EXP, and climb the ranks!";
  } else if (isDraw) {
    title = 'DRAW';
    message = `The match is a draw. Your wager of ${wager} Gems has been returned. You earned ${expGained} EXP.`;
  } else if (isPlayerWinner) {
    title = 'VICTORY!';
    message = `Congratulations, ${winnerName}! You have won the pot of ${wager * 2} Gems and earned ${expGained} EXP!`;
  } else {
    title = 'DEFEAT';
    message = `The fleet of ${winnerName} is victorious. You lost ${wager} Gems but earned ${expGained} EXP.`;
  }

  const titleColor = isGuest ? 'text-yellow-glow' : (isPlayerWinner ? 'text-cyan-glow' : 'text-magenta-glow');

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

export default GameOverModal;