
import React, { useState } from 'react';
import type { Wallet } from '../types';
import { getRankDetails, getExpForLevel } from '../services/rankService';
import { AVATAR_LIST } from '../services/solanaService';
import { DiamondIcon, PencilIcon, ShipIcon, TrophyIcon, UserCircleIcon, CheckCircleIcon, XMarkIcon, InfoIcon } from './Icons';

interface ProfileViewProps {
  wallet: Wallet;
  onUpdateProfile: (newUsername: string, newAvatar: string) => void;
}

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, colorClass }) => (
    <div className={`bg-navy-900/50 p-4 rounded-lg flex items-center gap-4 border-l-4 ${colorClass}`}>
        <div className={`p-2 rounded-full bg-navy-800 ${colorClass.replace('border-', 'text-')}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-neutral-400">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
        </div>
    </div>
);


const EditProfileModal: React.FC<{ wallet: Wallet, onClose: () => void, onSave: (name: string, avatar: string) => void }> = ({ wallet, onClose, onSave }) => {
    const [username, setUsername] = useState(wallet.username);
    const [avatar, setAvatar] = useState(wallet.avatarUrl);

    const handleSave = () => {
        if (username.trim().length >= 3 && username.trim().length <= 16) {
            onSave(username, avatar);
            onClose();
        } else {
            alert('Username must be between 3 and 16 characters.');
        }
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in" onClick={onClose}>
            <div className="bg-navy-800 border-2 border-navy-700 rounded-2xl shadow-lg w-full max-w-2xl p-8 m-4 flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-orbitron font-bold text-white uppercase">Edit Profile</h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white"><XMarkIcon className="w-7 h-7"/></button>
                 </div>
                 
                 <div className="mb-6">
                    <label className="block text-sm font-bold text-neutral-300 mb-2">USERNAME (3-16 CHARACTERS)</label>
                    <input 
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-navy-700 border border-navy-600 rounded-lg p-3 text-white text-lg font-bold focus:ring-2 focus:ring-cyan-glow focus:outline-none"
                    />
                 </div>

                 <div className="mb-6">
                    <label className="block text-sm font-bold text-neutral-300 mb-2">CHOOSE AVATAR</label>
                    <div className="grid grid-cols-5 md:grid-cols-10 gap-3 overflow-y-auto max-h-48 pr-2">
                        {AVATAR_LIST.map(url => (
                             <div key={url} className="relative cursor-pointer" onClick={() => setAvatar(url)}>
                                <img src={url} alt="avatar option" className={`w-full rounded-full transition-all duration-200 ${avatar === url ? 'ring-4 ring-cyan-glow' : 'opacity-70 hover:opacity-100'}`} />
                                {avatar === url && <CheckCircleIcon className="absolute -bottom-1 -right-1 w-6 h-6 text-cyan-glow bg-navy-800 rounded-full"/>}
                            </div>
                        ))}
                    </div>
                 </div>

                <button
                  onClick={handleSave}
                  className="mt-4 w-full bg-magenta-glow text-white font-bold font-orbitron py-3 px-8 rounded-lg uppercase tracking-wider transition-all duration-300 hover:bg-magenta-glow/80 hover:shadow-magenta"
                >
                  Save Changes
                </button>
            </div>
        </div>
    )
}

const ProfileView: React.FC<ProfileViewProps> = ({ wallet, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false);
  const rankDetails = getRankDetails(wallet.rank);
  const expForCurrentLevel = getExpForLevel(wallet.rank);

  const expProgress = () => {
    if (rankDetails.expToNextLevel < 0) return 100; // Max rank
    const levelExp = rankDetails.expToNextLevel - expForCurrentLevel;
    const currentExpInLevel = wallet.exp - expForCurrentLevel;
    return levelExp > 0 ? (currentExpInLevel / levelExp) * 100 : 100;
  };
  
  const totalGames = wallet.totalWins + wallet.totalLosses;
  const winRate = totalGames > 0 ? ((wallet.totalWins / totalGames) * 100).toFixed(1) : '0.0';
  const netGems = wallet.gemsWon - wallet.gemsLost;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <div className="bg-navy-800/50 backdrop-blur-md border border-navy-700 rounded-2xl shadow-2xl p-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
            <div className="relative">
                <img src={wallet.avatarUrl} alt="Player Avatar" className="w-32 h-32 rounded-full bg-navy-700 border-4 border-cyan-glow shadow-cyan" />
                <button onClick={() => setIsEditing(true)} className="absolute bottom-0 right-0 bg-magenta-glow text-white p-2 rounded-full hover:scale-110 transition-transform">
                    <PencilIcon className="w-5 h-5"/>
                </button>
            </div>
            <div className="flex-grow text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-orbitron font-extrabold text-white uppercase">{wallet.username}</h2>
                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <TrophyIcon className="w-6 h-6 text-yellow-glow"/>
                    <p className="text-xl font-bold text-yellow-glow">{rankDetails.name} (Rank {rankDetails.level})</p>
                </div>
                {/* EXP Bar */}
                <div className="mt-4">
                    <div className="flex justify-between text-sm text-neutral-300 mb-1">
                        <span>EXP</span>
                        <span>{wallet.exp.toLocaleString()} / {rankDetails.expToNextLevel > 0 ? rankDetails.expToNextLevel.toLocaleString() : 'MAX'}</span>
                    </div>
                    <div className="w-full bg-navy-900 rounded-full h-2.5">
                        <div className="bg-cyan-glow h-2.5 rounded-full" style={{ width: `${expProgress()}%` }}></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div>
            <h3 className="text-2xl font-orbitron font-bold text-white uppercase mb-4">Commander Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 <StatCard label="Total Wins" value={wallet.totalWins} icon={<TrophyIcon className="w-6 h-6"/>} colorClass="border-cyan-glow" />
                 <StatCard label="Total Losses" value={wallet.totalLosses} icon={<XMarkIcon className="w-6 h-6"/>} colorClass="border-magenta-glow" />
                 <StatCard label="Win Rate" value={`${winRate}%`} icon={<UserCircleIcon className="w-6 h-6"/>} colorClass="border-yellow-glow" />
                 
                 <StatCard label="Total Wagered (Gems)" value={wallet.totalWagered.toLocaleString()} icon={<DiamondIcon className="w-6 h-6"/>} colorClass="border-yellow-glow" />
                 <StatCard 
                    label="Gem PNL" 
                    value={wallet.pnl.toLocaleString()} 
                    icon={<DiamondIcon className="w-6 h-6"/>} 
                    colorClass={wallet.pnl >= 0 ? 'border-cyan-glow' : 'border-magenta-glow'}
                 />
                 <StatCard label="Gems Won (Total)" value={wallet.gemsWon.toLocaleString()} icon={<DiamondIcon className="w-6 h-6"/>} colorClass="border-cyan-glow" />
                 
                 <StatCard label="Locked Gems" value={wallet.lockedGems.toLocaleString()} icon={<DiamondIcon className="w-6 h-6"/>} colorClass="border-neutral-500" />
                 <StatCard label="Wager Requirement" value={wallet.wagerRequirement.toLocaleString()} icon={<InfoIcon className="w-6 h-6"/>} colorClass="border-neutral-500" />
                 <StatCard label="$SHIP Balance" value={wallet.balance.toLocaleString(undefined, {maximumFractionDigits: 2})} icon={<ShipIcon className="w-6 h-6"/>} colorClass="border-white" />

            </div>
        </div>
      </div>
      {isEditing && <EditProfileModal wallet={wallet} onClose={() => setIsEditing(false)} onSave={onUpdateProfile} />}
    </div>
  );
};

export default ProfileView;
