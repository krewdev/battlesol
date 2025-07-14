

import React, { useState } from 'react';
import type { GameMode, Nft, Wallet } from '../types';
import { getMatchFee, NFT_USAGE_FEE } from '../services/feeService';
import { DiamondIcon, CheckCircleIcon } from './Icons';

interface MatchmakingModalProps {
  mode: GameMode;
  onClose: () => void;
  onStartGame: (mode: GameMode, wager: number, selectedNft: Nft | null) => void;
  ownedNfts: Nft[];
  wallet: Wallet;
}

const WAGER_AMOUNTS = [5, 10, 25, 50];

const NftSelectionCard: React.FC<{ nft: Nft, isSelected: boolean, onSelect: () => void }> = ({ nft, isSelected, onSelect }) => {
    return (
        <div 
            onClick={onSelect}
            className={`relative bg-navy-800 border-2 rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 ${isSelected ? 'border-cyan-glow shadow-cyan' : 'border-navy-700 hover:border-cyan-glow/50'}`}
        >
            {isSelected && <CheckCircleIcon className="absolute -top-2 -right-2 w-7 h-7 text-cyan-glow bg-navy-800 rounded-full" />}
            <img src={nft.imageUrl} alt={nft.name} className="w-16 h-16 rounded-md object-cover"/>
            <div>
                <h4 className="font-bold text-white">{nft.name}</h4>
                <p className="text-xs text-neutral-400">{nft.type} Advantage</p>
            </div>
        </div>
    )
}


const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ mode, onClose, onStartGame, ownedNfts, wallet }) => {
  const [step, setStep] = useState(1);
  const [wager, setWager] = useState<number>(WAGER_AMOUNTS[0]);
  const [selectedNftId, setSelectedNftId] = useState<string | null>(null);

  const isGuest = wallet.isGuest;

  const handleStart = () => {
    const selectedNft = ownedNfts.find(nft => nft.id === selectedNftId) || null;
    const effectiveWager = isGuest ? 0 : wager;
    onStartGame(mode, effectiveWager, selectedNft);
  };
  
  const effectiveWager = isGuest ? 0 : wager;
  const matchFee = isGuest ? 0 : getMatchFee(effectiveWager);
  const nftFee = isGuest ? 0 : (selectedNftId !== null ? NFT_USAGE_FEE : 0);
  const totalFeeCost = matchFee + nftFee;
  const totalGemCost = effectiveWager + totalFeeCost;
  const canAfford = wallet.gems >= totalGemCost;

  const renderContent = () => {
    if (step === 1) { // Wager selection
      return (
        <div className="animate-fade-in">
          <h3 className="text-xl font-orbitron text-center text-cyan-glow mb-6">STEP 1: SET YOUR WAGER</h3>
          {isGuest ? (
            <div className="text-center p-6 bg-navy-900/50 rounded-lg">
                <p className="text-2xl font-bold text-white flex items-center justify-center gap-2">WAGER: 0 <DiamondIcon className="w-6 h-6"/></p>
                <p className="text-neutral-400 mt-2">This is a free trial run. No Gems will be wagered.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center items-center space-x-4 mb-8">
                {WAGER_AMOUNTS.map(amount => (
                  <button 
                    key={amount} 
                    onClick={() => setWager(amount)}
                    className={`px-8 py-4 rounded-lg font-orbitron font-bold text-2xl border-2 transition-all duration-200 flex items-center gap-2 ${wager === amount ? 'bg-cyan-glow text-navy-900 border-cyan-glow' : 'bg-navy-700 border-navy-600 hover:border-cyan-glow/50 text-white'}`}
                  >
                    <DiamondIcon className="w-5 h-5 opacity-80"/> {amount}
                  </button>
                ))}
              </div>
              <p className="text-center text-yellow-glow font-semibold flex items-center justify-center gap-2">POTENTIAL WINNINGS: {(wager * 2).toLocaleString()} <DiamondIcon className="w-5 h-5"/></p>
            </>
          )}
        </div>
      );
    }
    
    if (step === 2) { // NFT selection
      return (
        <div className="animate-fade-in">
          <h3 className="text-xl font-orbitron text-center text-cyan-glow mb-2">STEP 2: EQUIP ADVANTAGE (OPTIONAL)</h3>
          <p className="text-center text-neutral-400 text-sm mb-6">
            {isGuest ? 'Try out a complimentary NFT for this trial match.' : `Using an NFT costs ${NFT_USAGE_FEE} Gems.`}
          </p>
          {ownedNfts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2">
                {/* No NFT Option */}
                <div 
                    onClick={() => setSelectedNftId(null)}
                    className={`relative bg-navy-800 border-2 rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-all duration-200 ${selectedNftId === null ? 'border-cyan-glow shadow-cyan' : 'border-navy-700 hover:border-cyan-glow/50'}`}
                >
                      {selectedNftId === null && <CheckCircleIcon className="absolute -top-2 -right-2 w-7 h-7 text-cyan-glow bg-navy-800 rounded-full" />}
                      <div className="w-16 h-16 rounded-md bg-navy-900 flex items-center justify-center">
                        <span className="text-3xl font-bold text-neutral-500">?</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-white">No Advantage</h4>
                        <p className="text-xs text-neutral-400">Rely on pure skill.</p>
                      </div>
                </div>
                {ownedNfts.map(nft => (
                    <NftSelectionCard 
                        key={nft.id}
                        nft={nft}
                        isSelected={selectedNftId === nft.id}
                        onSelect={() => setSelectedNftId(nft.id)}
                    />
                ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-navy-900/50 rounded-lg">
              <p className="text-neutral-300">You do not own any NFTs.</p>
              <p className="text-sm text-neutral-400">Purchase them in the NFT Armory to gain an advantage in battle.</p>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-navy-800/80 border border-navy-700 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-navy-700">
          <h2 className="text-2xl font-orbitron font-bold text-white uppercase text-center">{mode}</h2>
          <p className="text-center text-neutral-400 text-sm">Prepare for deployment</p>
        </div>

        <div className="p-8 flex-grow">
            {renderContent()}
        </div>

        <div className="p-6 bg-navy-900/50 rounded-b-2xl flex justify-between items-center">
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="bg-navy-700 hover:bg-navy-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-yellow-glow">
                  <DiamondIcon className="w-5 h-5"/>
                  <span className="font-bold">TOTAL COST: {isGuest ? 0 : totalGemCost} Gems</span>
              </div>
              {!isGuest && <p className="text-xs text-neutral-400">Wager: {wager}, Fees: {totalFeeCost}</p>}
          </div>

          <button
            onClick={step === 1 ? () => setStep(2) : handleStart}
            disabled={step === 2 && !isGuest && !canAfford}
            className="bg-magenta-glow text-white font-bold font-orbitron py-3 px-8 rounded-lg uppercase tracking-wider transition-all duration-300 hover:bg-magenta-glow/80 hover:shadow-magenta disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-600"
          >
            {step === 1 ? 'Next Step' : (isGuest ? 'Launch Battle' : (canAfford ? 'Launch Battle' : 'Insufficient Gems'))}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingModal;