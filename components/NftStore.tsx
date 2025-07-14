
import React from 'react';
import type { Nft } from '../types';
import NftCard from './NftCard';

interface NftStoreProps {
  onBuyNft: (nft: Nft) => void;
}

const AVAILABLE_NFTS: Nft[] = [
  {
    id: 'nft-001',
    name: 'Aegis Satellite Scan',
    description: 'Once per game, reveal a 2x2 area on the enemy grid. Use this early to find targets or late to confirm a kill.',
    imageUrl: 'https://i.imgur.com/3Z2YfJc.jpeg',
    skinImageUrl: 'https://i.imgur.com/L7sB5Wf.png',
    price: 150,
    advantage: 'radar_scan',
  },
  {
    id: 'nft-002',
    name: 'Rapid Fire Protocol',
    description: 'Once per game, if you land a hit, you can immediately fire a second shot. Chain your attacks for devastating effect.',
    imageUrl: 'https://i.imgur.com/9mG1fHl.jpeg',
    skinImageUrl: 'https://i.imgur.com/DdrYx71.png',
    price: 200,
    advantage: 'extra_shot',
  },
  {
    id: 'nft-003',
    name: 'Ghost Shield',
    description: 'Your opponent\'s first shot against you is guaranteed to be a miss, regardless of where they fire.',
    imageUrl: 'https://i.imgur.com/1n3bQ6C.jpeg',
    skinImageUrl: 'https://i.imgur.com/kP8tA2B.png',
    price: 120,
    advantage: 'ghost_shield',
  }
];


const NftStore: React.FC<NftStoreProps> = ({ onBuyNft }) => {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-orbitron font-extrabold text-white uppercase">NFT Armory</h2>
        <p className="text-neutral-400 mt-2 max-w-2xl mx-auto">Purchase tactical advantages with $SHIP. These single-use NFTs can be equipped before a match to turn the tide of battle.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {AVAILABLE_NFTS.map(nft => (
          <NftCard key={nft.id} nft={nft} onBuy={onBuyNft} />
        ))}
      </div>
    </div>
  );
};

export default NftStore;
