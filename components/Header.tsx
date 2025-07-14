
import React from 'react';
import type { Wallet } from '../types';
import { ShipIcon, WalletIcon } from './Icons';

interface HeaderProps {
  wallet: Wallet | null;
  onDisconnect: () => void;
  onNavigate: (view: 'dashboard' | 'nft_store') => void;
}

const Header: React.FC<HeaderProps> = ({ wallet, onDisconnect, onNavigate }) => {
  return (
    <header className="bg-navy-800/50 backdrop-blur-sm border-b border-navy-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => wallet && onNavigate('dashboard')}
        >
          <div className="w-10 h-10 bg-cyan-glow/20 rounded-full flex items-center justify-center border-2 border-cyan-glow">
            <ShipIcon className="w-6 h-6 text-cyan-glow" />
          </div>
          <h1 className="text-2xl font-orbitron font-bold text-white uppercase">
            Battle-Sol
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          {wallet && (
            <>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="text-neutral-300 hover:text-cyan-glow font-semibold transition-colors duration-200"
              >
                Dashboard
              </button>
              <button 
                onClick={() => onNavigate('nft_store')}
                className="text-neutral-300 hover:text-cyan-glow font-semibold transition-colors duration-200"
              >
                NFT Store
              </button>
              <div className="bg-navy-700 rounded-lg p-2 flex items-center space-x-3 border border-navy-700">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-white">{wallet.address}</span>
                  <span className="text-xs font-semibold text-yellow-glow">{wallet.balance.toLocaleString()} $SHIP</span>
                </div>
                <WalletIcon className="w-6 h-6 text-cyan-glow" />
              </div>
              <button
                onClick={onDisconnect}
                className="bg-magenta-glow/80 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-magenta-glow hover:shadow-magenta text-sm"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
