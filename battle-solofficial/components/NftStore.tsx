

import React from 'react';
import type { Nft, Wallet } from '../types';
import NftCard from './NftCard';

interface NftStoreProps {
  onBuyNft: (nft: Nft) => void;
  wallet: Wallet;
}

export const AVAILABLE_NFTS: Nft[] = [
  {
    id: 'nft-001',
    name: 'Aegis Satellite Scan',
    description: 'Use your turn to reveal a 2x2 area on the enemy grid, exposing what lies beneath.',
    imageUrl: 'https://picsum.photos/300/300?random=1&blur=0',
    skinImageUrl: 'https://picsum.photos/400/400?random=11&blur=0',
    price: 1500,
    advantage: 'radar_scan',
    type: 'Active',
  },
  {
    id: 'nft-002',
    name: 'Rapid Fire Protocol',
    description: 'After you successfully land a hit, you are granted an immediate second shot.',
    imageUrl: 'https://picsum.photos/300/300?random=2&blur=0',
    skinImageUrl: 'https://picsum.photos/400/400?random=12&blur=0',
    price: 2500,
    advantage: 'extra_shot',
    type: 'Passive',
  },
  {
    id: 'nft-003',
    name: 'Ghost Shield',
    description: 'The first shot fired by your opponent in the match is guaranteed to be a miss.',
    imageUrl: 'https://picsum.photos/300/300?random=3&blur=0',
    skinImageUrl: 'https://picsum.photos/400/400?random=13&blur=0',
    price: 2000,
    advantage: 'ghost_shield',
    type: 'Passive',
  },
  {
    id: 'nft-004',
    name: 'Reinforced Hull',
    description: 'Your largest ship (Carrier) starts the battle with one extra point of health.',
    imageUrl: 'https://picsum.photos/300/300?random=4&blur=0',
    skinImageUrl: 'https://picsum.photos/400/400?random=14&blur=0',
    price: 1800,
    advantage: 'reinforced_hull',
    type: 'Passive',
  },
  {
    id: 'nft-005',
    name: 'Decoy Buoy',
    description: 'Deploy a fake 1x1 ship. If the enemy hits it, their turn is wasted.',
    imageUrl: 'https://picsum.photos/300/300?random=5&blur=0',
    skinImageUrl: 'https://picsum.photos/400/400?random=15&blur=0',
    price: 1200,
    advantage: 'decoy_buoy',
    type: 'Passive',
  },
  {
    id: 'nft-006',
    name: 'Volley Fire',
    description: 'Fire a 3-cell vertical volley. Only the first hit ship in the volley takes damage.',
    imageUrl: 'https://picsum.photos/300/300?random=6&blur=0',
    skinImageUrl: 'https://picsum.photos/400/400?random=16&blur=0',
    price: 2200,
    advantage: 'volley_fire',
    type: 'Active',
  },
  {
    id: 'nft-007',
    name: 'EMP Blast',
    description: 'Use your turn to disable your opponent\'s NFT advantage for their next turn.',
    imageUrl: 'https://picsum.photos/300/300?random=7&blur=0',
    skinImageUrl: 'https://picsum.photos/400/400?random=17&blur=0',
    price: 1700,
    advantage: 'emp_blast',
    type: 'Active',
  },
  {
    id: 'nft-008',
    name: 'Sabotage Protocol',
    description: 'Gives the opponent a 25% chance to randomly miss their turn entirely.',
    imageUrl: 'https://picsum.photos/300/300?random=8&blur=0',
    skinImageUrl: 'https://picsum.photos/400/400?random=18&blur=0',
    price: 3000,
    advantage: 'sabotage',
    type: 'Passive',
  },
  {
    id: 'nft-009',
    name: 'Targeting Computer',
    description: 'If your shot is a miss, this system will auto-correct to hit a real ship, if one is available. Single use.',
    imageUrl: 'https://picsum.photos/300/300?random=9&blur=0',
    skinImageUrl: 'https://picsum.photos/400/400?random=19&blur=0',
    price: 4000,
    advantage: 'targeting_computer',
    type: 'Passive',
  },
  {
    id: 'nft-010',
    name: 'Salvage Crew',
    description: 'In the event of a loss, this crew recovers 25% of your wagered Gems.',
    imageUrl: 'https://picsum.photos/300/300?random=10&blur=0',
    skinImageUrl: 'https://picsum.photos/400/400?random=20&blur=0',
    price: 1000,
    advantage: 'salvage_crew',
    type: 'Passive',
  },
];


const NftStore: React.FC<NftStoreProps> = ({ onBuyNft, wallet }) => {
  return (
    <div className="animate-fade-in">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-orbitron font-extrabold text-white uppercase">NFT Armory</h2>
        <p className="text-neutral-400 mt-2 max-w-2xl mx-auto">Purchase tactical advantages with Gems. Equip one before a match to turn the tide of battle.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {AVAILABLE_NFTS.map(nft => (
          <NftCard key={nft.id} nft={nft} onBuy={onBuyNft} wallet={wallet} />
        ))}
      </div>
    </div>
  );
};

export default NftStore;