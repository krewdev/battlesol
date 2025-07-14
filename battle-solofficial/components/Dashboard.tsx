


import React, { useState } from 'react';
import type { GameMode, Nft, Wallet, View } from '../types';
import { getRankDetails } from '../services/rankService';
import GameModeCard from './GameModeCard';
import MatchmakingModal from './MatchmakingModal';
import RankSystemInfo from './RankSystemInfo';
import DailyBattleModal from './DailyBattleModal';
import SiteWideChat from './SiteWideChat';
import { BotIcon, UsersIcon, TrophyIcon, InfoIcon, ShipIcon } from './Icons';

interface DashboardProps {
  wallet: Wallet;
  onStartGame: (mode: GameMode, wager: number, selectedNft: Nft | null) => void;
  onStartDailyBattle: () => void;
  onClaimRakeback: () => void;
  onRedeemCode: (code: string) => void;
  ownedNfts: Nft[];
  onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ wallet, onStartGame, onStartDailyBattle, onClaimRakeback, onRedeemCode, ownedNfts, onNavigate }) => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [showRankInfo, setShowRankInfo] = useState(false);
  const [showDailyModal, setShowDailyModal] = useState(false);
  
  const rankDetails = getRankDetails(wallet.rank);

  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode);
  };

  const handleCloseModal = () => {
    setSelectedMode(null);
  };
  
  const isDailyBattleAvailable = () => {
      const now = Date.now();
      const last = wallet.lastDailyBattle;
      if (!last) return true;
      const hoursSinceLast = (now - last) / (1000 * 60 * 60);
      return hoursSinceLast >= 22; // Allow some leeway
  }
  const dailyBattleAvailable = isDailyBattleAvailable();

  const handleStartDailyBattle = () => {
      onStartDailyBattle();
      setShowDailyModal(false);
  }
  
  const isGuest = wallet.isGuest;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      <div className="xl:col-span-8 animate-fade-in">
        {isGuest && (
             <div className="bg-cyan-900/50 border-2 border-cyan-glow/60 rounded-2xl p-6 text-center mb-12 shadow-cyan">
                <h2 className="text-2xl font-orbitron font-bold text-white">Welcome, Commander!</h2>
                <p className="text-neutral-300 mt-2 max-w-2xl mx-auto">You are playing in Guest Mode. Enjoy a trial run against the AI with complimentary NFTs! To unlock PvP, daily rewards, and rank progression, please connect your Solana wallet.</p>
            </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Rank & Rewards */}
            <div className={`lg:col-span-2 bg-navy-800/50 backdrop-blur-md border border-navy-700 rounded-2xl p-6 ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <h3 className="text-xl font-orbitron font-bold text-white uppercase mb-4 flex items-center gap-2"><TrophyIcon className="w-6 h-6 text-cyan-glow"/>Rank & Rewards</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-navy-900/50 p-4 rounded-lg">
                        <p className="text-sm text-neutral-400">Current Rank</p>
                        <p className="text-2xl font-bold text-white">{rankDetails.name}</p>
                    </div>
                    <div className="bg-navy-900/50 p-4 rounded-lg">
                        <p className="text-sm text-neutral-400">Rakeback Rate</p>
                        <p className="text-2xl font-bold text-cyan-glow">{(rankDetails.rakebackPercentage * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-navy-900/50 p-4 rounded-lg">
                        <p className="text-sm text-neutral-400">Claimable Rake</p>
                        <p className="text-2xl font-bold text-yellow-glow">{wallet.unclaimedRake.toFixed(2)} <span className="text-lg">$SHIP</span></p>
                    </div>
                </div>
                <div className="flex gap-4 mt-4">
                    <button onClick={() => setShowRankInfo(true)} disabled={isGuest} className="flex-1 bg-navy-700 hover:bg-navy-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                        <InfoIcon className="w-5 h-5"/> Rank Details
                    </button>
                    <button onClick={onClaimRakeback} disabled={wallet.unclaimedRake <= 0 || isGuest} className="flex-1 bg-yellow-glow text-navy-900 font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white">
                        {isGuest ? 'Connect Wallet' : 'Claim Rakeback'}
                    </button>
                </div>
            </div>
            {/* Daily Missions */}
            <div className={`bg-navy-800/50 backdrop-blur-md border border-navy-700 rounded-2xl p-6 flex flex-col ${isGuest ? 'opacity-50 cursor-not-allowed' : ''}`}>
                 <h3 className="text-xl font-orbitron font-bold text-white uppercase mb-4 flex items-center gap-2"><ShipIcon className="w-6 h-6 text-yellow-glow"/>Daily Missions</h3>
                 <div className="flex-grow flex flex-col items-center justify-center bg-navy-900/50 p-4 rounded-lg">
                    <p className="text-neutral-300 text-center mb-4">Engage in a free daily battle for bonus Gem rewards!</p>
                     <button onClick={() => setShowDailyModal(true)} disabled={!dailyBattleAvailable || isGuest} className="w-full bg-cyan-glow text-navy-900 font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white">
                        {isGuest ? 'Connect Wallet to Play' : (dailyBattleAvailable ? 'Missions & Codes' : 'Available Tomorrow')}
                    </button>
                 </div>
            </div>
        </div>


        <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-orbitron font-extrabold text-white uppercase">Choose Your Battle</h2>
            <p className="text-neutral-400 mt-2 max-w-2xl mx-auto">Select a game mode to enter the queue. Your wager determines your opponents and potential rewards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <GameModeCard
            title="Player vs AI"
            description={isGuest ? "Play a free trial match with complimentary NFTs. No cost, no rewards." : "Test your strategies against our AI opponent. Earn EXP and Gem rewards."}
            icon={<BotIcon className="w-16 h-16" />}
            onSelect={() => handleSelectMode('Player vs AI')}
            />
            <GameModeCard
            title="Provably Fair PvP (Simulated)"
            description="Face off against another commander using our on-chain fairness model. Higher risk, higher rewards."
            icon={<UsersIcon className="w-16 h-16" />}
            onSelect={() => handleSelectMode('Online PvP (Simulated)')}
            disabled={isGuest}
            />
        </div>
      </div>
      
      <div className="xl:col-span-4">
        <div className="sticky top-24">
            <SiteWideChat wallet={wallet} />
        </div>
      </div>


      {selectedMode && (
        <MatchmakingModal
          mode={selectedMode}
          onClose={handleCloseModal}
          onStartGame={onStartGame}
          ownedNfts={ownedNfts}
          wallet={wallet}
        />
      )}
      
      {showRankInfo && <RankSystemInfo onClose={() => setShowRankInfo(false)} />}

      {showDailyModal && (
        <DailyBattleModal 
            onClose={() => setShowDailyModal(false)}
            onStartBattle={handleStartDailyBattle}
            onRedeemCode={onRedeemCode}
            rank={wallet.rank}
        />
      )}

    </div>
  );
};

export default Dashboard;