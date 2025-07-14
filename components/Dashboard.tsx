
import React, { useState } from 'react';
import type { GameMode, Nft } from '../types';
import GameModeCard from './GameModeCard';
import MatchmakingModal from './MatchmakingModal';
import { BotIcon, UsersIcon } from './Icons';

interface DashboardProps {
  onStartGame: (mode: GameMode, wager: number, selectedNft: Nft | null) => void;
  onNavigate: (view: 'nft_store') => void;
  ownedNfts: Nft[];
}

const Dashboard: React.FC<DashboardProps> = ({ onStartGame, onNavigate, ownedNfts }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);

  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode);
  };

  const handleCloseModal = () => {
    setSelectedMode(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-orbitron font-extrabold text-white uppercase">Choose Your Battle</h2>
        <p className="text-neutral-400 mt-2 max-w-2xl mx-auto">Select a game mode to enter the queue. Your wager determines your opponents and potential rewards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <GameModeCard
          title="Player vs AI"
          description="Test your strategies against our Gemini-powered AI opponent. Perfect for practice or solo play."
          icon={<BotIcon className="w-16 h-16" />}
          onSelect={() => handleSelectMode('Player vs AI')}
        />
        <GameModeCard
          title="Online PvP (Simulated)"
          description="Face off against another commander in a simulated online match. Features a live AI-powered opponent chat lobby."
          icon={<UsersIcon className="w-16 h-16" />}
          onSelect={() => handleSelectMode('Online PvP (Simulated)')}
          disabled={false}
        />
      </div>

      {ownedNfts.length > 0 && (
          <div className="text-center mt-16">
              <h3 className="text-2xl font-orbitron font-bold">Your NFT Advantages</h3>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {ownedNfts.map(nft => (
                      <div key={nft.id} className="bg-navy-700 p-4 rounded-lg border border-cyan-glow/30">
                          <p className="font-bold">{nft.name}</p>
                          <p className="text-sm text-neutral-300">{nft.description}</p>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {selectedMode && (
        <MatchmakingModal
          mode={selectedMode}
          onClose={handleCloseModal}
          onStartGame={onStartGame}
          ownedNfts={ownedNfts}
        />
      )}
    </div>
  );
};

export default Dashboard;
