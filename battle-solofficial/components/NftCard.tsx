

import React from 'react';
import type { Nft, Wallet } from '../types';
import { DiamondIcon } from './Icons';

interface NftCardProps {
  nft: Nft;
  onBuy: (nft: Nft) => void;
  wallet: Wallet;
}

const NftCard: React.FC<NftCardProps> = ({ nft, onBuy, wallet }) => {
  const canAfford = wallet.gems >= nft.price;
  const isGuest = wallet.isGuest;
  const typeColor = nft.type === 'Active' ? 'text-cyan-glow' : 'text-yellow-glow';

  const purchaseButtonText = () => {
    if (isGuest) return 'Connect Wallet';
    if (canAfford) return 'Purchase';
    return 'More Gems';
  };

  return (
    <div className="bg-navy-800/60 border border-navy-700 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-magenta-glow/70 hover:shadow-magenta transform hover:-translate-y-2">
      <div className="relative">
        <img src={nft.imageUrl} alt={nft.name} className="w-full h-56 object-cover" />
        <div className={`absolute top-2 right-2 bg-navy-900/80 px-2 py-1 rounded-md text-xs font-bold ${typeColor}`}>
          {nft.type}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-orbitron font-bold text-white mb-2">{nft.name}</h3>
        <p className="text-neutral-300 text-sm mb-4 flex-grow">{nft.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <div className="flex items-center gap-2">
            <DiamondIcon className="w-6 h-6 text-yellow-glow" />
            <span className="text-2xl font-bold text-yellow-glow">{nft.price.toLocaleString()}</span>
          </div>
          <button
            onClick={() => onBuy(nft)}
            disabled={isGuest || !canAfford}
            className="bg-magenta-glow text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:bg-magenta-glow/80 text-sm uppercase disabled:bg-neutral-600 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {purchaseButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NftCard;