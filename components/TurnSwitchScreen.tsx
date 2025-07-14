
import React from 'react';

interface TurnSwitchScreenProps {
  message: string;
  onReady: () => void;
  turn: 'player' | 'opponent';
}

const TurnSwitchScreen: React.FC<TurnSwitchScreenProps> = ({ message, onReady, turn }) => {
  const playerName = turn === 'player' ? 'Player 1' : 'Player 2';
  const playerColor = turn === 'player' ? 'text-cyan-glow' : 'text-magenta-glow';

  return (
    <div className="fixed inset-0 bg-navy-900 flex items-center justify-center z-[100] animate-fade-in">
      <div className="text-center p-8">
        <h1 className={`text-5xl md:text-7xl font-orbitron font-black uppercase tracking-widest ${playerColor}`}>
          {playerName}'s Turn
        </h1>
        <p className="text-neutral-300 text-xl mt-4 mb-12 max-w-lg">{message}</p>
        <button
          onClick={onReady}
          className="bg-yellow-glow text-navy-900 font-bold font-orbitron py-4 px-12 rounded-lg uppercase tracking-wider transition-all duration-300 hover:bg-white hover:shadow-yellow transform hover:scale-105"
        >
          Ready
        </button>
      </div>
    </div>
  );
};

export default TurnSwitchScreen;