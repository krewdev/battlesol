
import React, { useState } from 'react';
import { getRankDetails } from '../services/rankService';
import { DiamondIcon, ShipIcon } from './Icons';

interface DailyBattleModalProps {
  onClose: () => void;
  onStartBattle: () => void;
  onRedeemCode: (code: string) => void;
  rank: number;
}

const DailyBattleModal: React.FC<DailyBattleModalProps> = ({ onClose, onStartBattle, onRedeemCode, rank }) => {
  const [code, setCode] = useState('');
  const rankDetails = getRankDetails(rank);
  const gemReward = Math.floor(rankDetails.gemReward * 0.3); // 30% of rank up reward for daily win - increased for better rewards

  const handleRedeem = () => {
    if(code.trim()){
      onRedeemCode(code);
      setCode('');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in" onClick={onClose}>
      <div className="bg-navy-800 border-2 border-navy-700 rounded-2xl shadow-lg w-full max-w-lg p-8 m-4 text-center" onClick={e => e.stopPropagation()}>
        <div className="flex justify-center items-center gap-3 mb-4">
            <ShipIcon className="w-10 h-10 text-yellow-glow"/>
            <h2 className="text-3xl font-orbitron font-bold text-white uppercase">Daily Missions</h2>
        </div>
        <p className="text-neutral-400 mb-6">Complete your daily battle for a bonus reward or redeem a special code.</p>
        
        <div className="bg-navy-900/70 p-6 rounded-lg border border-navy-700 mb-6">
            <h3 className="text-xl font-bold font-orbitron text-cyan-glow mb-2">Daily AI Battle</h3>
            <p className="text-neutral-300 mb-4">Defeat the AI to earn a special reward. The reward increases with your rank.</p>
            <p className="mb-4 text-lg">Reward: <span className="font-bold text-yellow-glow flex items-center justify-center gap-1">{gemReward.toLocaleString()} <DiamondIcon className="w-5 h-5" /></span></p>
            <button
                onClick={onStartBattle}
                className="w-full bg-cyan-glow text-navy-900 font-bold font-orbitron py-3 px-8 rounded-lg uppercase tracking-wider transition-all duration-300 hover:bg-white hover:shadow-cyan"
            >
                Start Daily Battle
            </button>
        </div>

         <div className="bg-navy-900/70 p-6 rounded-lg border border-navy-700">
            <h3 className="text-xl font-bold font-orbitron text-magenta-glow mb-3">Redeem Code</h3>
            <div className="flex gap-2">
                <input 
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="flex-grow bg-navy-700 border border-navy-600 rounded-lg p-3 text-white font-mono tracking-widest text-center focus:ring-2 focus:ring-magenta-glow focus:outline-none"
                />
                <button
                    onClick={handleRedeem}
                    disabled={!code.trim()}
                    className="bg-magenta-glow text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Redeem
                </button>
            </div>
        </div>

         <button
          onClick={onClose}
          className="mt-8 text-neutral-400 hover:text-white transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DailyBattleModal;
