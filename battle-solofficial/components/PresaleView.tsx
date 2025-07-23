

import React, { useState, useEffect } from 'react';
import { ShipIcon, DiamondIcon, ClockIcon, UsersIcon, TrophyIcon, StarIcon, ArrowRightIcon, CheckCircleIcon } from './Icons';

interface PresaleStats {
  totalSold: number;
  maxSupply: number;
  currentPrice: number;
  timeRemaining: number;
  participantCount: number;
  totalRaised: number;
}

interface PricePhase {
  phase: number;
  name: string;
  price: number;
  supply: number;
  sold: number;
  bonus: string;
  isActive: boolean;
}

const PresaleView: React.FC = () => {
  const [purchaseAmount, setPurchaseAmount] = useState<number>(100);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Mock presale data (in real implementation, this would come from the smart contract)
  const [presaleStats, setPresaleStats] = useState<PresaleStats>({
    totalSold: 2847500,
    maxSupply: 10000000,
    currentPrice: 0.08, // SOL per SHIP
    timeRemaining: 432000, // seconds
    participantCount: 1247,
    totalRaised: 227800, // SOL
  });

  const pricePhases: PricePhase[] = [
    {
      phase: 1,
      name: "Early Bird",
      price: 0.05,
      supply: 2000000,
      sold: 2000000,
      bonus: "100% bonus tokens",
      isActive: false,
    },
    {
      phase: 2,
      name: "Phase 1",
      price: 0.08,
      supply: 3000000,
      sold: 847500,
      bonus: "50% bonus tokens",
      isActive: true,
    },
    {
      phase: 3,
      name: "Phase 2",
      price: 0.12,
      supply: 3000000,
      sold: 0,
      bonus: "25% bonus tokens",
      isActive: false,
    },
    {
      phase: 4,
      name: "Final Phase",
      price: 0.15,
      supply: 2000000,
      sold: 0,
      bonus: "No bonus",
      isActive: false,
    },
  ];

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const calculatePurchase = (solAmount: number) => {
    const activePhase = pricePhases.find(p => p.isActive);
    if (!activePhase) return { tokens: 0, bonus: 0, total: 0 };
    
    const baseTokens = solAmount / activePhase.price;
    const bonusMultiplier = activePhase.bonus.includes('100%') ? 1 : 
                           activePhase.bonus.includes('50%') ? 0.5 : 
                           activePhase.bonus.includes('25%') ? 0.25 : 0;
    const bonusTokens = baseTokens * bonusMultiplier;
    const totalTokens = baseTokens + bonusTokens;
    
    return {
      tokens: Math.floor(baseTokens),
      bonus: Math.floor(bonusTokens),
      total: Math.floor(totalTokens),
    };
  };

  const handlePurchase = async () => {
    setIsPurchasing(true);
    
    // Simulate smart contract interaction
    setTimeout(() => {
      const purchase = calculatePurchase(purchaseAmount);
      alert(`Purchase successful! You received ${purchase.total.toLocaleString()} $SHIP tokens (${purchase.bonus.toLocaleString()} bonus tokens included)`);
      
      // Update stats
      setPresaleStats(prev => ({
        ...prev,
        totalSold: prev.totalSold + purchase.total,
        totalRaised: prev.totalRaised + purchaseAmount,
        participantCount: prev.participantCount + 1,
      }));
      
      setIsPurchasing(false);
    }, 2000);
  };

  const purchase = calculatePurchase(purchaseAmount);
  const progressPercentage = (presaleStats.totalSold / presaleStats.maxSupply) * 100;
  const currentPhase = pricePhases.find(p => p.isActive);
  const phaseProgress = currentPhase ? (currentPhase.sold / currentPhase.supply) * 100 : 0;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      <div className="bg-navy-800/50 backdrop-blur-md border border-navy-700 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <ShipIcon className="w-16 h-16 text-yellow-glow animate-pulse" />
            <div>
              <h1 className="text-5xl font-orbitron font-bold text-white uppercase">$SHIP Token</h1>
              <p className="text-xl text-yellow-glow font-bold">Presale Now Live</p>
            </div>
          </div>
          <p className="text-lg text-neutral-300 max-w-4xl mx-auto">
            Get early access to $SHIP tokens - the native currency of Battle Sol. 
            Stake, earn rewards, participate in governance, and unlock exclusive NFTs.
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="bg-navy-900/50 border border-navy-600 rounded-xl p-6 mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <ClockIcon className="w-6 h-6 text-red-400" />
            <h3 className="text-xl font-bold text-white">Presale Ends In</h3>
          </div>
          <div className="text-3xl font-orbitron font-bold text-red-400">
            {formatTime(presaleStats.timeRemaining)}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Presale Stats */}
          <div className="xl:col-span-1 space-y-6">
            {/* Overall Progress */}
            <div className="bg-navy-900/50 border border-navy-600 rounded-xl p-6">
              <h3 className="text-xl font-bold text-cyan-glow mb-4 flex items-center gap-2">
                <TrophyIcon className="w-6 h-6" />
                Presale Progress
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-neutral-300">Total Sold</span>
                    <span className="text-white font-bold">{presaleStats.totalSold.toLocaleString()} / {presaleStats.maxSupply.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-navy-800 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-cyan-glow to-yellow-glow h-3 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">{progressPercentage.toFixed(1)}% Complete</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-navy-800/50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-white">{presaleStats.totalRaised.toLocaleString()}</div>
                    <div className="text-xs text-neutral-400">SOL Raised</div>
                  </div>
                  <div className="bg-navy-800/50 p-3 rounded-lg">
                    <div className="text-lg font-bold text-white">{presaleStats.participantCount.toLocaleString()}</div>
                    <div className="text-xs text-neutral-400">Participants</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Phases */}
            <div className="bg-navy-900/50 border border-navy-600 rounded-xl p-6">
              <h3 className="text-xl font-bold text-magenta-glow mb-4">Price Phases</h3>
              <div className="space-y-3">
                {pricePhases.map((phase) => (
                  <div 
                    key={phase.phase}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      phase.isActive 
                        ? 'border-yellow-glow bg-yellow-glow/10' 
                        : phase.sold >= phase.supply 
                          ? 'border-green-400/50 bg-green-400/10' 
                          : 'border-navy-600 bg-navy-800/30'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-bold ${phase.isActive ? 'text-yellow-glow' : 'text-white'}`}>
                        {phase.name}
                      </span>
                      <span className="text-sm font-bold text-white">
                        {phase.price} SOL
                      </span>
                    </div>
                    <div className="text-xs text-neutral-300 mb-1">
                      {phase.sold.toLocaleString()} / {phase.supply.toLocaleString()} sold
                    </div>
                    <div className="w-full bg-navy-800 rounded-full h-1.5 mb-2">
                      <div 
                        className={`h-1.5 rounded-full transition-all ${
                          phase.isActive ? 'bg-yellow-glow' : 'bg-green-400'
                        }`}
                        style={{ width: `${(phase.sold / phase.supply) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-cyan-300">{phase.bonus}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column - Purchase Interface */}
          <div className="xl:col-span-1">
            <div className="bg-navy-900/50 border border-navy-600 rounded-xl p-6 sticky top-24">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Buy $SHIP Tokens</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-neutral-300 mb-2">
                    Amount (SOL)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                      min="0.1"
                      step="0.1"
                      className="w-full bg-navy-700 border border-navy-600 rounded-lg p-4 text-white text-xl font-bold text-center focus:ring-2 focus:ring-cyan-glow focus:outline-none"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
                      SOL
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[1, 5, 10, 25].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setPurchaseAmount(amount)}
                        className="flex-1 py-2 px-3 bg-navy-700 hover:bg-navy-600 border border-navy-600 rounded text-sm text-white transition-colors"
                      >
                        {amount} SOL
                      </button>
                    ))}
                  </div>
                </div>

                {/* Purchase Calculator */}
                <div className="bg-navy-800/50 p-4 rounded-lg border border-navy-600">
                  <h4 className="text-sm font-bold text-neutral-300 mb-3">You Will Receive:</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Base Tokens:</span>
                      <span className="text-white font-bold">{purchase.tokens.toLocaleString()} $SHIP</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Bonus Tokens:</span>
                      <span className="text-yellow-glow font-bold">+{purchase.bonus.toLocaleString()} $SHIP</span>
                    </div>
                    <div className="border-t border-navy-600 pt-2">
                      <div className="flex justify-between">
                        <span className="text-white font-bold">Total:</span>
                        <span className="text-cyan-glow font-bold text-lg">{purchase.total.toLocaleString()} $SHIP</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing || purchaseAmount <= 0}
                  className="w-full bg-gradient-to-r from-cyan-glow to-yellow-glow text-navy-900 font-bold font-orbitron py-4 px-6 rounded-lg uppercase tracking-wider transition-all duration-300 hover:shadow-lg hover:shadow-cyan-glow/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isPurchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-navy-900"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShipIcon className="w-5 h-5" />
                      Buy $SHIP Tokens
                    </>
                  )}
                </button>

                <div className="text-xs text-neutral-400 text-center">
                  Minimum purchase: 0.1 SOL • Smart contract verified ✓
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Token Utility */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-navy-900/50 border border-navy-600 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <StarIcon className="w-6 h-6 text-yellow-glow" />
                Token Utility
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-bold">Gaming Currency</div>
                    <div className="text-sm text-neutral-300">Use $SHIP for wagers, tournaments, and in-game purchases</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-bold">Staking Rewards</div>
                    <div className="text-sm text-neutral-300">Stake $SHIP to earn passive income and platform fees</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-bold">Governance Rights</div>
                    <div className="text-sm text-neutral-300">Vote on platform updates and new game features</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-bold">Exclusive NFTs</div>
                    <div className="text-sm text-neutral-300">Access to limited edition ship skins and advantages</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-white font-bold">Tournament Entry</div>
                    <div className="text-sm text-neutral-300">Required for high-stakes tournaments and events</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-navy-900/50 border border-navy-600 rounded-xl p-6">
              <h3 className="text-xl font-bold text-white mb-4">Tokenomics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-300">Total Supply:</span>
                  <span className="text-white font-bold">100M $SHIP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">Presale:</span>
                  <span className="text-white font-bold">10M (10%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">Liquidity:</span>
                  <span className="text-white font-bold">20M (20%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">Team:</span>
                  <span className="text-white font-bold">15M (15%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">Rewards:</span>
                  <span className="text-white font-bold">30M (30%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">Marketing:</span>
                  <span className="text-white font-bold">10M (10%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-300">Reserve:</span>
                  <span className="text-white font-bold">15M (15%)</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-cyan-glow/20 to-yellow-glow/20 border border-cyan-glow/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-2">Smart Contract</h3>
              <p className="text-sm text-neutral-300 mb-3">
                Fully audited and verified on Solana blockchain
              </p>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-navy-800 p-2 rounded font-mono text-cyan-300 flex-1 truncate">
                  BattLeSoLGaMeSmArTcOnTrAcTsPrOvAbLyFaIr111111
                </code>
                <button className="text-neutral-400 hover:text-white">
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PresaleView;