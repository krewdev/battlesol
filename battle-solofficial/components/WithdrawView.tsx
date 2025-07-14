import React, { useState } from 'react';
import type { Wallet } from '../types';
import { DiamondIcon, ShipIcon, SolanaIcon, InfoIcon } from './Icons';

interface WithdrawViewProps {
  wallet: Wallet | null;
  onWithdraw: (gemAmount: number, targetCurrency: 'SOL' | '$SHIP') => void;
}

const WithdrawView: React.FC<WithdrawViewProps> = ({ wallet, onWithdraw }) => {
  const [amount, setAmount] = useState('');
  const [targetCurrency, setTargetCurrency] = useState<'SOL' | '$SHIP'>('SOL');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  if (!wallet) return null;

  const isGuestMode = wallet.isGuest;

  // Simulated market rates: 1 Gem = $1 USD
  const SOL_RATE = 150; // $150 per SOL
  const SHIP_RATE_USD = 0.5; // 1 Gem ($1) = 2 $SHIP, so 1 $SHIP = $0.5

  const withdrawableGems = wallet.gems - wallet.lockedGems;
  const numericAmount = parseFloat(amount) || 0;
  const canWithdraw = numericAmount > 0 && numericAmount <= withdrawableGems;
  
  let receiveAmount = 0;
  if (targetCurrency === 'SOL') {
      receiveAmount = numericAmount / SOL_RATE;
  } else {
      receiveAmount = numericAmount / SHIP_RATE_USD;
  }

  const handleWithdraw = () => {
    if (!canWithdraw || isGuestMode) return;
    setIsWithdrawing(true);
    setTimeout(() => {
        onWithdraw(numericAmount, targetCurrency);
        setIsWithdrawing(false);
        setAmount('');
    }, 2000);
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-orbitron font-extrabold text-white uppercase">Withdraw Gems</h2>
        <p className="text-neutral-400 mt-2 max-w-2xl mx-auto">Convert your Gems back to cryptocurrency. Withdrawals are sent to your connected wallet.</p>
      </div>

      <div className="bg-navy-800/50 backdrop-blur-md border border-navy-700 rounded-2xl p-8 shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Panel - Input */}
            <div className="bg-navy-900/50 p-6 rounded-lg border border-navy-700">
                <div className="flex justify-between items-center mb-1">
                    <label htmlFor="gem_amount" className="block text-sm font-bold text-neutral-300">AMOUNT TO WITHDRAW</label>
                    <span className="text-xs text-neutral-400">Balance: <span className="text-yellow-glow font-bold">{wallet.gems.toLocaleString()}</span> Gems</span>
                </div>
                {wallet.lockedGems > 0 && (
                     <div className="text-xs text-neutral-400 text-right mb-2">Withdrawable: <span className="text-cyan-glow font-bold">{withdrawableGems.toLocaleString()}</span></div>
                )}
                <div className="relative">
                     <input
                        id="gem_amount"
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="0"
                        className="w-full bg-navy-700 border border-navy-600 rounded-lg p-3 pr-16 text-white text-2xl font-bold focus:ring-2 focus:ring-cyan-glow focus:outline-none"
                    />
                    <DiamondIcon className="w-8 h-8 absolute right-3 top-1/2 -translate-y-1/2 text-yellow-glow/50"/>
                </div>
                <button onClick={() => setAmount(withdrawableGems.toString())} className="text-cyan-glow text-xs hover:underline mt-1">Withdraw Max Available</button>
                 
                 {wallet.lockedGems > 0 && (
                    <div className="mt-4 p-3 bg-navy-800/50 border border-navy-700 rounded-lg text-xs text-neutral-400 flex items-center gap-2">
                        <InfoIcon className="w-8 h-8 flex-shrink-0 text-cyan-glow"/>
                        <div>
                         You have <span className="font-bold text-white">{wallet.lockedGems.toLocaleString()}</span> locked Gems from daily wins. Wager <span className="font-bold text-white">{wallet.wagerRequirement.toLocaleString()}</span> more Gems to unlock them.
                        </div>
                    </div>
                )}

                <div className="mt-6">
                    <label className="block text-sm font-bold text-neutral-300 mb-2">RECEIVE CURRENCY</label>
                    <div className="flex bg-navy-800 rounded-lg p-1 border border-navy-700">
                        <button onClick={() => setTargetCurrency('SOL')} className={`w-1/2 py-2 rounded-md font-bold transition-colors flex items-center justify-center gap-2 ${targetCurrency === 'SOL' ? 'bg-cyan-glow text-navy-900' : 'text-neutral-300 hover:bg-navy-600'}`}>
                            <SolanaIcon className="w-5 h-5" /> SOL
                        </button>
                        <button onClick={() => setTargetCurrency('$SHIP')} className={`w-1/2 py-2 rounded-md font-bold transition-colors flex items-center justify-center gap-2 ${targetCurrency === '$SHIP' ? 'bg-cyan-glow text-navy-900' : 'text-neutral-300 hover:bg-navy-600'}`}>
                            <ShipIcon className="w-5 h-5" /> $SHIP
                        </button>
                    </div>
                </div>

            </div>

            {/* Right Panel - Summary */}
            <div className="text-center">
                <p className="text-neutral-400 uppercase tracking-widest">You will receive approx.</p>
                <p className="text-4xl lg:text-5xl font-orbitron font-bold text-yellow-glow my-3">
                    {receiveAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </p>
                <p className="text-2xl font-bold text-yellow-glow/80">{targetCurrency}</p>
                <p className="text-xs text-neutral-500 mt-4">Based on 1 Gem = 1 USD. Market rates are simulated.</p>

                 {isGuestMode && (
                    <div className="mt-6 p-3 bg-yellow-900/50 border border-yellow-glow/30 rounded-lg text-yellow-glow text-sm">
                        Connect a real wallet to enable withdrawals.
                    </div>
                 )}

                <button
                    onClick={handleWithdraw}
                    disabled={!canWithdraw || isWithdrawing || isGuestMode}
                    className="mt-6 w-full bg-magenta-glow text-white font-bold font-orbitron py-3 px-8 rounded-lg uppercase tracking-wider transition-all duration-300 hover:bg-magenta-glow/80 hover:shadow-magenta disabled:bg-neutral-600 disabled:cursor-not-allowed"
                >
                    {isWithdrawing ? "Processing..." : (canWithdraw ? "Confirm Withdraw" : (isGuestMode ? "Wallet Required" : "Invalid Amount"))}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawView;