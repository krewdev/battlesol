
import React from 'react';
import type { Nft } from '../types';

interface NftCardProps {
  nft: Nft;
  onBuy: (nft: Nft) => void;
}

const NftCard: React.FC<NftCardProps> = ({ nft, onBuy }) => {
  return (
    <div className="bg-navy-800/60 border border-navy-700 rounded-xl overflow-hidden flex flex-col transition-all duration-300 hover:border-magenta-glow/70 hover:shadow-magenta transform hover:-translate-y-2">
      <img src={nft.imageUrl} alt={nft.name} className="w-full h-56 object-cover" />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-orbitron font-bold text-white mb-2">{nft.name}</h3>
        <p className="text-neutral-300 text-sm mb-4 flex-grow">{nft.description}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-2xl font-bold text-yellow-glow">{nft.price} <span className="text-base font-normal text-white">$SHIP</span></span>
          <button
            onClick={() => onBuy(nft)}
            className="bg-magenta-glow text-white font-bold py-2 px-6 rounded-lg transition-all duration-300 hover:bg-magenta-glow/80 text-sm uppercase"
          >
            Purchase
          </button>
        </div>
      </div>
    </div>
  );
};

export default NftCard;
