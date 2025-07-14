
import React from 'react';
import { RANKS, getRankDetails } from '../services/rankService';
import { DiamondIcon, TrophyIcon, RANK_ICONS } from './Icons';

interface RankSystemInfoProps {
  onClose: () => void;
}

const RankSystemInfo: React.FC<RankSystemInfoProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in" onClick={onClose}>
      <div className="bg-navy-800 border-2 border-navy-700 rounded-2xl shadow-lg w-full max-w-4xl p-8 m-4 text-center flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-orbitron font-bold text-white uppercase mb-4 flex items-center justify-center gap-3"><TrophyIcon className="w-8 h-8 text-cyan-glow"/> Player Rank System</h2>
        <p className="text-neutral-400 mb-6">Gain EXP by playing matches. Level up your Rank to earn Gem rewards and increase your Rakeback rate on PvP matches.</p>
        <div className="flex-grow overflow-y-auto pr-4">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-navy-800 z-10">
              <tr className="border-b border-navy-600">
                <th className="p-3 text-sm font-bold text-yellow-glow uppercase tracking-wider">Rank</th>
                <th className="p-3 text-sm font-bold text-yellow-glow uppercase tracking-wider">Total EXP For Next</th>
                <th className="p-3 text-sm font-bold text-yellow-glow uppercase tracking-wider">Gem Reward</th>
                <th className="p-3 text-sm font-bold text-yellow-glow uppercase tracking-wider">Rakeback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-700">
              {RANKS.map(rank => {
                const RankIcon = RANK_ICONS[rank.iconName] || RANK_ICONS.cadet;
                return (
                    <tr key={rank.level} className="hover:bg-navy-700/50">
                        <td className="p-3 font-bold text-white text-lg">
                            <div className="flex items-center gap-3">
                                <RankIcon className="w-6 h-6 text-yellow-glow" />
                                <span>{rank.level}. {rank.name}</span>
                            </div>
                        </td>
                        <td className="p-3 text-neutral-200">{rank.expToNextLevel > 0 ? rank.expToNextLevel.toLocaleString() + ' EXP' : 'MAX'}</td>
                        <td className="p-3 text-cyan-glow font-semibold flex items-center gap-2">
                            <DiamondIcon className="w-5 h-5" />
                            {rank.gemReward.toLocaleString()}
                        </td>
                        <td className="p-3 text-cyan-glow font-semibold">{(rank.rakebackPercentage * 100).toFixed(1)}%</td>
                    </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full max-w-xs mx-auto bg-yellow-glow text-navy-900 font-bold font-orbitron py-3 px-8 rounded-lg uppercase tracking-wider transition-all duration-300 hover:bg-white hover:shadow-yellow"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RankSystemInfo;
