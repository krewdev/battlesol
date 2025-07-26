

import React, { useState, useEffect, useRef } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import type { Wallet, View } from '../types';
import { getRankDetails } from '../services/rankService';
import { DiamondIcon, UserCircleIcon, RANK_ICONS, XMarkIcon, LogoIcon, MenuIcon } from './Icons';

interface HeaderProps {
  wallet: Wallet;
  onNavigate: (view: View) => void;
  currentView: View;
  onShowAdminPanel?: () => void;
  onDisconnect?: () => void;
}

const Header: React.FC<HeaderProps> = ({ wallet, onNavigate, currentView, onShowAdminPanel, onDisconnect }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const rankDetails = getRankDetails(wallet.rank);
  const RankIcon = RANK_ICONS[rankDetails.iconName] || RANK_ICONS.cadet;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);
  
  const handleNavigation = (view: View) => {
    onNavigate(view);
    setIsProfileOpen(false);
  }

  return (
    <header className="bg-navy-800/50 backdrop-blur-sm border-b border-navy-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => onNavigate('dashboard')}
        >
          <div className="w-12 h-12 flex items-center justify-center">
            <LogoIcon className="w-full h-full" />
          </div>
          <h1 className="text-2xl font-orbitron font-bold text-white uppercase">
            Battle-Sol
          </h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
            <button onClick={() => onNavigate('dashboard')} className="text-neutral-300 hover:text-cyan-glow font-semibold transition-colors duration-200">Dashboard</button>
            <button onClick={() => onNavigate('presale')} className="text-yellow-glow hover:text-white font-bold transition-colors duration-200 animate-pulse">Presale</button>
            <button onClick={() => onNavigate('nft_store')} className="text-neutral-300 hover:text-cyan-glow font-semibold transition-colors duration-200">NFT Armory</button>
            <button onClick={() => onNavigate('deposit')} className="text-neutral-300 hover:text-cyan-glow font-semibold transition-colors duration-200">Deposit</button>
            <button onClick={() => onNavigate('withdraw')} className="text-neutral-300 hover:text-cyan-glow font-semibold transition-colors duration-200">Withdraw</button>
            <button onClick={() => onNavigate('provably_fair')} className="text-neutral-300 hover:text-cyan-glow font-semibold transition-colors duration-200">Provably Fair</button>
        </nav>
        
        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-navy-700/70 focus:outline-none"
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
        >
          {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6 text-white"/> : <MenuIcon className="w-6 h-6 text-white"/>}
        </button>

        <div className="flex items-center gap-4">
            {/* Admin Panel Button */}
            {onShowAdminPanel && (
              <button
                onClick={onShowAdminPanel}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                Admin Panel
              </button>
            )}
            
            <div className="relative" ref={dropdownRef}>
                <button onClick={() => setIsProfileOpen(prev => !prev)} className="flex items-center gap-3 bg-navy-700/80 rounded-lg p-2 border border-navy-700 hover:border-cyan-glow/50 transition-colors">
                    <img src={wallet.avatarUrl} alt="Player Avatar" className="w-10 h-10 rounded-full bg-navy-800 border-2 border-cyan-glow"/>
                    <div>
                      <p className="font-bold text-white leading-tight text-left">{wallet.username}</p>
                      <div className="flex items-center gap-1.5 text-xs text-cyan-glow">
                        <RankIcon className="w-3 h-3"/>
                        <span>{rankDetails.name}</span>
                      </div>
                    </div>
                </button>
                {isProfileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 bg-navy-800 border-2 border-navy-700 rounded-xl shadow-2xl animate-fade-in-up origin-top-right z-[60]">
                        <div className="p-4 border-b border-navy-700">
                            <h4 className="font-bold text-white text-lg">{wallet.username}</h4>
                            <p className="text-xs text-neutral-400 truncate">{wallet.address}</p>
                        </div>
                        <div className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-300">Gems</span>
                                <div className="flex items-center gap-2 font-bold text-yellow-glow">
                                    <DiamondIcon className="w-5 h-5"/> {wallet.gems.toLocaleString()}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-neutral-300">$SHIP</span>
                                <div className="flex items-center gap-2 font-bold text-white">
                                    {wallet.balance.toLocaleString(undefined, {maximumFractionDigits: 2})}
                                </div>
                            </div>
                            {wallet.lockedGems > 0 && (
                                <div className="flex justify-between items-center opacity-70">
                                    <span className="text-neutral-400">Locked Gems</span>
                                    <div className="flex items-center gap-2 font-bold text-yellow-glow/80">
                                        <DiamondIcon className="w-5 h-5"/> {wallet.lockedGems.toLocaleString()}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-2 border-t border-navy-700 divide-y divide-navy-700/50">
                            <button onClick={() => handleNavigation('profile')} className="w-full text-left p-2 rounded-md hover:bg-navy-700 transition-colors text-white font-semibold flex items-center gap-2">
                                <UserCircleIcon className="w-5 h-5"/> View Profile
                            </button>
                             <button onClick={onDisconnect} className="w-full text-left p-2 rounded-md hover:bg-navy-700 transition-colors text-red-500 font-semibold flex items-center gap-2">
                                <XMarkIcon className="w-5 h-5"/> Disconnect
                            </button>
                        </div>
                    </div>
                )}
            </div>
             {!wallet.isGuest && (
                <WalletMultiButton style={{ 
                    backgroundColor: '#131A4A',
                    border: '1px solid #0A0F2E',
                    height: '52px'
                }} />
             )}
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-navy-800 border-t border-navy-700 px-4 py-4 space-y-2 animate-fade-in-down">
          <button onClick={() => { handleNavigation('dashboard'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-neutral-300 hover:text-cyan-glow font-semibold">Dashboard</button>
          <button onClick={() => { handleNavigation('presale'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-yellow-glow hover:text-white font-bold">Presale</button>
          <button onClick={() => { handleNavigation('nft_store'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-neutral-300 hover:text-cyan-glow font-semibold">NFT Armory</button>
          <button onClick={() => { handleNavigation('deposit'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-neutral-300 hover:text-cyan-glow font-semibold">Deposit</button>
          <button onClick={() => { handleNavigation('withdraw'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-neutral-300 hover:text-cyan-glow font-semibold">Withdraw</button>
          <button onClick={() => { handleNavigation('provably_fair'); setIsMobileMenuOpen(false); }} className="block w-full text-left text-neutral-300 hover:text-cyan-glow font-semibold">Provably Fair</button>
        </div>
      )}
    </header>
  );
};

export default Header;