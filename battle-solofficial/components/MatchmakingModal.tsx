

import React, { useState, useEffect } from 'react';
import type { GameMode, Nft, Wallet } from '../types';
import { getMatchFee, NFT_USAGE_FEE } from '../services/feeService';
import { DiamondIcon, CheckCircleIcon, PlusIcon, ClockIcon, UsersIcon } from './Icons';
import { 
  getAvailableMatches, 
  createMultiplayerMatch, 
  joinMultiplayerMatch, 
  subscribeToMatches, 
  unsubscribeFromMatches,
  type MultiplayerMatch 
} from '../services/multiplayerService';
import { 
  createBetaTester, 
  getBetaMatches, 
  createBetaMatch, 
  joinBetaMatch,
  getBetaInstructions,
  type BetaTestingWallet 
} from '../services/betaTestingService';

interface MatchmakingModalProps {
  mode: GameMode;
  onClose: () => void;
  onStartGame: (mode: GameMode, wager: number, selectedNft: Nft | null) => void;
  ownedNfts: Nft[];
  wallet: Wallet;
}

const WAGER_AMOUNTS = [5, 10, 25, 50, 100, 250];
const MIN_CUSTOM_WAGER = 0.1;
const MAX_CUSTOM_WAGER = 100000;

const NftSelectionCard: React.FC<{ nft: Nft, isSelected: boolean, onSelect: () => void }> = ({ nft, isSelected, onSelect }) => {
    return (
        <div 
            onClick={onSelect}
            className={`relative bg-navy-800 border-2 rounded-lg p-3 flex items-center gap-3 cursor-pointer nft-card-hover ${isSelected ? 'border-cyan-glow shadow-cyan' : 'border-navy-700 hover:border-cyan-glow/50'}`}
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
  const [isCustomWager, setIsCustomWager] = useState(false);
  const [customWagerAmount, setCustomWagerAmount] = useState<string>('');
  const [matchQueue, setMatchQueue] = useState<MultiplayerMatch[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [isBetaMode, setIsBetaMode] = useState(false);
  const [betaTester, setBetaTester] = useState<BetaTestingWallet | null>(null);
  const [showBetaInstructions, setShowBetaInstructions] = useState(false);

  const isGuest = wallet.isGuest;
  const isPvP = mode === 'Online PvP (Simulated)';

  // Initialize beta testing or live mode
  useEffect(() => {
    if (isPvP) {
      // Check if user wants beta testing (for now, default to beta for easier testing)
      const shouldUseBeta = true; // In production, this would be a user choice
      
      if (shouldUseBeta) {
        setIsBetaMode(true);
        const tester = createBetaTester(wallet);
        setBetaTester(tester);
        setMatchQueue(getBetaMatches());
      } else {
        setIsBetaMode(false);
        setMatchQueue(getAvailableMatches());
        
        // Subscribe to real-time match updates
        subscribeToMatches(wallet.address, (message) => {
          if (message.type === 'match_created' || message.type === 'match_cancelled') {
            setMatchQueue(getAvailableMatches());
          }
        });
      }
    }

    return () => {
      if (isPvP && !isBetaMode) {
        unsubscribeFromMatches(wallet.address);
      }
    };
  }, [isPvP, wallet.address]);

  // Update match queue periodically
  useEffect(() => {
    if (!isPvP) return;
    
    const interval = setInterval(() => {
      if (isBetaMode) {
        setMatchQueue(getBetaMatches());
      } else {
        setMatchQueue(getAvailableMatches());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isPvP, isBetaMode]);

  const handleStart = () => {
    const selectedNft = ownedNfts.find(nft => nft.id === selectedNftId) || null;
    let effectiveWager = isGuest ? 0 : wager;
    
    if (isCustomWager && customWagerAmount) {
      effectiveWager = parseFloat(customWagerAmount);
    }
    
    // Create match in multiplayer service
    if (isPvP) {
      if (isBetaMode && betaTester) {
        createBetaMatch(betaTester, effectiveWager);
      } else {
        createMultiplayerMatch(wallet, effectiveWager, selectedNft?.name);
      }
    }
    
    onStartGame(mode, effectiveWager, selectedNft);
  };

  const handleJoinMatch = (match: MultiplayerMatch) => {
    const selectedNft = ownedNfts.find(nft => nft.id === selectedNftId) || null;
    
    // Join match in multiplayer service
    if (isBetaMode && betaTester) {
      joinBetaMatch(match.id, betaTester);
    } else {
      joinMultiplayerMatch(match.id, wallet);
    }
    
    onStartGame(mode, match.wager, selectedNft);
  };
  
  const effectiveWager = isGuest ? 0 : (isCustomWager ? parseFloat(customWagerAmount) || 0 : wager);
  const matchFee = isGuest ? 0 : getMatchFee(effectiveWager);
  const nftFee = isGuest ? 0 : (selectedNftId !== null ? NFT_USAGE_FEE : 0);
  const totalFeeCost = matchFee + nftFee;
  const totalGemCost = effectiveWager + totalFeeCost;
  const canAfford = wallet.gems >= totalGemCost;
  
  const isValidCustomWager = isCustomWager ? 
    (parseFloat(customWagerAmount) >= MIN_CUSTOM_WAGER && parseFloat(customWagerAmount) <= MAX_CUSTOM_WAGER) : 
    true;

  const formatTimeAgo = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  const getMatchCreatorName = (match: MultiplayerMatch) => {
    return match.creator.username;
  };

  const getMatchNftAdvantage = (match: MultiplayerMatch) => {
    return match.nftAdvantage;
  };

  const renderContent = () => {
    if (step === 1) { // Wager selection
      return (
        <div className="animate-fade-in">
          <h3 className="text-xl font-orbitron text-center text-cyan-glow mb-6">
            {isPvP ? 'STEP 1: SET WAGER OR JOIN MATCH' : 'STEP 1: SET YOUR WAGER'}
          </h3>
          
          {isPvP && (
            <div className="mb-8">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UsersIcon className="w-5 h-5" />
                Available Matches
              </h4>
                             <div className="max-h-48 overflow-y-auto space-y-2 mb-6">
                 {matchQueue.length > 0 ? (
                   matchQueue.map(match => (
                     <div
                       key={match.id}
                       onClick={() => setSelectedMatchId(match.id)}
                       className={`match-queue-item p-4 rounded-lg cursor-pointer ${
                         selectedMatchId === match.id ? 'border-cyan-glow shadow-cyan' : ''
                       }`}
                     >
                       <div className="flex justify-between items-center">
                         <div>
                           <div className="font-bold text-white">{getMatchCreatorName(match)}</div>
                           <div className="text-sm text-neutral-400 flex items-center gap-2">
                             <ClockIcon className="w-4 h-4" />
                             {formatTimeAgo(match.createdAt)}
                             {isBetaMode && <span className="text-xs bg-green-600 px-2 py-1 rounded">BETA</span>}
                           </div>
                         </div>
                         <div className="text-right">
                           <div className="font-bold text-yellow-glow flex items-center gap-1">
                             <DiamondIcon className="w-4 h-4" />
                             {match.wager}
                           </div>
                           {getMatchNftAdvantage(match) && (
                             <div className="text-xs text-cyan-400">{getMatchNftAdvantage(match)}</div>
                           )}
                         </div>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-center p-6 bg-navy-900/50 rounded-lg">
                     <p className="text-neutral-400">
                       {isBetaMode ? 'No beta matches available. Create your own!' : 'No matches available. Create your own!'}
                     </p>
                   </div>
                 )}
               </div>
              
              <div className="border-t border-navy-700 pt-6">
                <h4 className="text-lg font-bold text-white mb-4">Create New Match</h4>
              </div>
            </div>
          )}
          
          {isGuest ? (
            <div className="text-center p-6 bg-navy-900/50 rounded-lg">
                <p className="text-2xl font-bold text-white flex items-center justify-center gap-2">WAGER: 0 <DiamondIcon className="w-6 h-6"/></p>
                <p className="text-neutral-400 mt-2">This is a free trial run. No Gems will be wagered.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-center items-center space-x-2 mb-4 flex-wrap gap-2">
                {WAGER_AMOUNTS.map(amount => (
                  <button 
                    key={amount} 
                    onClick={() => {
                      setWager(amount);
                      setIsCustomWager(false);
                      setSelectedMatchId(null);
                    }}
                    className={`wager-card px-6 py-3 rounded-lg font-orbitron font-bold text-lg border-2 transition-all duration-200 flex items-center gap-2 ${
                      wager === amount && !isCustomWager && !selectedMatchId ? 'selected' : ''
                    }`}
                  >
                    <DiamondIcon className="w-4 h-4 opacity-80"/> {amount}
                  </button>
                ))}
              </div>
              
              <div className="text-center mb-4">
                <button
                  onClick={() => {
                    setIsCustomWager(!isCustomWager);
                    setSelectedMatchId(null);
                  }}
                  className={`custom-match-card px-6 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto ${
                    isCustomWager ? 'border-purple-500' : ''
                  }`}
                >
                  <PlusIcon className="w-5 h-5" />
                  Custom Amount
                </button>
              </div>
              
              {isCustomWager && (
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2">
                    <DiamondIcon className="w-5 h-5 text-yellow-glow" />
                    <input
                      type="number"
                      min={MIN_CUSTOM_WAGER}
                      max={MAX_CUSTOM_WAGER}
                      step="0.1"
                      value={customWagerAmount}
                      onChange={(e) => setCustomWagerAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="bg-navy-700 border border-navy-600 rounded-lg px-4 py-2 text-white text-center font-bold text-xl focus:border-cyan-glow focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-neutral-400 text-center mt-2">
                    Min: {MIN_CUSTOM_WAGER} | Max: {MAX_CUSTOM_WAGER.toLocaleString()}
                  </p>
                </div>
              )}
              
              {selectedMatchId && (
                <div className="text-center p-4 bg-cyan-900/20 border border-cyan-500 rounded-lg">
                  <p className="text-cyan-400 font-bold">Joining match for {matchQueue.find(m => m.id === selectedMatchId)?.wager} Gems</p>
                </div>
              )}
              
              {!selectedMatchId && !isCustomWager && (
                <p className="text-center text-yellow-glow font-semibold flex items-center justify-center gap-2">
                  POTENTIAL WINNINGS: {(wager * 2).toLocaleString()} <DiamondIcon className="w-5 h-5"/>
                </p>
              )}
              
              {!selectedMatchId && isCustomWager && isValidCustomWager && customWagerAmount && (
                <p className="text-center text-yellow-glow font-semibold flex items-center justify-center gap-2">
                  POTENTIAL WINNINGS: {(parseFloat(customWagerAmount) * 2).toLocaleString()} <DiamondIcon className="w-5 h-5"/>
                </p>
              )}
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
                    className={`relative bg-navy-800 border-2 rounded-lg p-3 flex items-center gap-3 cursor-pointer nft-card-hover ${selectedNftId === null ? 'border-cyan-glow shadow-cyan' : 'border-navy-700 hover:border-cyan-glow/50'}`}
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

  const canProceed = () => {
    if (step === 1) {
      if (selectedMatchId) return true;
      if (isCustomWager) return isValidCustomWager && customWagerAmount;
      return true;
    }
    return step === 2 && (!isGuest ? canAfford : true);
  };

  const getButtonText = () => {
    if (step === 1) return selectedMatchId ? 'Join Match' : 'Next Step';
    if (step === 2) {
      if (isGuest) return 'Launch Battle';
      return canAfford ? 'Launch Battle' : 'Insufficient Gems';
    }
    return 'Continue';
  };

  const handleMainAction = () => {
    if (step === 1) {
      if (selectedMatchId) {
        const match = matchQueue.find(m => m.id === selectedMatchId);
        if (match) {
          handleJoinMatch(match);
          return;
        }
      }
      setStep(2);
    } else {
      handleStart();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-navy-800/80 border border-navy-700 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-navy-700">
          <h2 className="text-2xl font-orbitron font-bold text-white uppercase text-center">{mode}</h2>
          <p className="text-center text-neutral-400 text-sm">Prepare for deployment</p>
          
          {isPvP && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="betaMode"
                  checked={isBetaMode}
                  onChange={(e) => {
                    setIsBetaMode(e.target.checked);
                    if (e.target.checked) {
                      const tester = createBetaTester(wallet);
                      setBetaTester(tester);
                      setMatchQueue(getBetaMatches());
                    } else {
                      setBetaTester(null);
                      setMatchQueue(getAvailableMatches());
                    }
                  }}
                  className="w-4 h-4 text-green-600 bg-navy-700 border-navy-600 rounded focus:ring-green-500"
                />
                <label htmlFor="betaMode" className="text-sm text-white">
                  🧪 Beta Testing Mode (Free Play)
                </label>
              </div>
              
              {isBetaMode && (
                <button
                  onClick={() => setShowBetaInstructions(!showBetaInstructions)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                >
                  What's this?
                </button>
              )}
            </div>
          )}
          
          {showBetaInstructions && (
            <div className="mt-4 p-4 bg-green-900/20 border border-green-600 rounded-lg">
              <h4 className="font-bold text-green-400 mb-2">🧪 Beta Testing Mode</h4>
              <ul className="text-xs text-green-300 space-y-1">
                {getBetaInstructions().map((instruction, index) => (
                  <li key={index}>{instruction}</li>
                ))}
              </ul>
            </div>
          )}
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
              {!isGuest && <p className="text-xs text-neutral-400">Wager: {effectiveWager}, Fees: {totalFeeCost}</p>}
          </div>

          <button
            onClick={handleMainAction}
            disabled={!canProceed()}
            className="bg-magenta-glow text-white font-bold font-orbitron py-3 px-8 rounded-lg uppercase tracking-wider transition-all duration-300 hover:bg-magenta-glow/80 hover:shadow-magenta disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-neutral-600"
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingModal;