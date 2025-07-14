
import React, { useState } from 'react';
import { BtcIcon, SolanaIcon, UsdcIcon, DiamondIcon, CopyIcon, QrCodeIcon, ShipIcon } from './Icons';

interface DepositViewProps {
  onDeposit: (gemAmount: number) => void;
}

type Crypto = 'SOL' | 'USDC' | 'BTC' | '$SHIP';
type DepositMode = 'auto' | 'manual';

// NEW LOGIC: Gems are pegged to USD ($1 = 1 Gem).
// Rates represent the current USD value of one unit of the crypto.
// NOTE: These are simulated prices for demonstration. A real app would use a live price feed API.
const CRYPTO_CONFIG = {
  SOL: {
    name: 'Solana',
    icon: SolanaIcon,
    rate: 150, // 1 SOL = $150 USD = 150 Gems
    address: 'SoL4n...DepositAddressForSOL',
  },
  USDC: {
    name: 'USDC',
    icon: UsdcIcon,
    rate: 1, // 1 USDC = $1 USD = 1 Gem
    address: 'USDC...DepositAddressForUSDC',
  },
  BTC: {
    name: 'Bitcoin',
    icon: BtcIcon,
    rate: 65000, // 1 BTC = $65,000 USD = 65,000 Gems
    address: 'bc1q...DepositAddressForBTC',
  },
  '$SHIP': {
      name: '$SHIP',
      icon: ShipIcon,
      rate: 2, // SPECIAL PROMO: 1 $SHIP = 2 Gems
      address: 'SHIP...DepositAddressForSHIP',
  }
};

const DepositView: React.FC<DepositViewProps> = ({ onDeposit }) => {
  const [selectedCrypto, setSelectedCrypto] = useState<Crypto>('$SHIP');
  const [depositMode, setDepositMode] = useState<DepositMode>('auto');
  const [amount, setAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDeposit = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
        alert('Please enter a valid amount.');
        return;
    }
    const gemsToReceive = numericAmount * CRYPTO_CONFIG[selectedCrypto].rate;
    setIsDepositing(true);

    // Simulate network delay
    setTimeout(() => {
        onDeposit(gemsToReceive);
        setIsDepositing(false);
        setAmount('');
    }, 2000);
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(CRYPTO_CONFIG[selectedCrypto].address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  
  const gemsToGet = (parseFloat(amount) || 0) * CRYPTO_CONFIG[selectedCrypto].rate;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl md:text-5xl font-orbitron font-extrabold text-white uppercase">Deposit Gems</h2>
        <p className="text-neutral-400 mt-2 max-w-2xl mx-auto">Acquire Gems to play matches and purchase NFTs. Gems are pegged 1:1 with USD. <br/><span className="text-yellow-glow font-bold">Special Offer: Deposit $SHIP for a 1:2 Gem conversion!</span></p>
      </div>

      <div className="bg-navy-800/50 backdrop-blur-md border border-navy-700 rounded-2xl p-8 shadow-2xl">
        {/* Crypto Selection */}
        <div className="mb-8">
            <h3 className="text-lg font-orbitron font-bold text-neutral-200 mb-4 text-center">1. Select Currency</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(Object.keys(CRYPTO_CONFIG) as Crypto[]).map(cryptoKey => {
                    const crypto = CRYPTO_CONFIG[cryptoKey];
                    const isSelected = selectedCrypto === cryptoKey;
                    return (
                        <button key={cryptoKey} onClick={() => setSelectedCrypto(cryptoKey)} className={`relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all duration-300 ${isSelected ? 'bg-navy-700 border-cyan-glow' : 'bg-navy-800 border-navy-700 hover:border-cyan-glow/50'}`}>
                            <crypto.icon className="w-10 h-10 text-white" />
                            <span className="font-semibold text-white">{crypto.name}</span>
                            {cryptoKey === '$SHIP' && <span className="text-xs font-bold text-yellow-glow absolute -top-2 bg-navy-800 px-2 rounded-full border-2 border-yellow-glow">PROMO</span>}
                        </button>
                    )
                })}
            </div>
        </div>
        
        {/* Deposit Mode */}
        <div className="mb-8">
            <h3 className="text-lg font-orbitron font-bold text-neutral-200 mb-4 text-center">2. Choose Deposit Method</h3>
            <div className="flex bg-navy-900/50 rounded-lg p-1 border border-navy-700">
                <button onClick={() => setDepositMode('auto')} className={`w-1/2 py-2 rounded-md font-bold transition-colors ${depositMode === 'auto' ? 'bg-cyan-glow text-navy-900' : 'text-neutral-300 hover:bg-navy-700'}`}>Automatic (Simulated)</button>
                <button onClick={() => setDepositMode('manual')} className={`w-1/2 py-2 rounded-md font-bold transition-colors ${depositMode === 'manual' ? 'bg-cyan-glow text-navy-900' : 'text-neutral-300 hover:bg-navy-700'}`}>Manual</button>
            </div>
        </div>

        {/* Deposit Panel */}
        <div className="bg-navy-900/50 p-6 rounded-lg border border-navy-700 min-h-[250px] flex flex-col justify-center">
            {depositMode === 'auto' ? (
                <div className="w-full max-w-sm mx-auto text-center">
                    <label className="block text-sm font-bold text-neutral-300 mb-2">DEPOSIT AMOUNT ({selectedCrypto})</label>
                    <input 
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                        placeholder="0.00"
                        className="w-full bg-navy-700 border border-navy-600 rounded-lg p-3 text-white text-2xl font-bold focus:ring-2 focus:ring-cyan-glow focus:outline-none text-center"
                    />
                    <div className="flex items-center justify-center gap-4 my-4 text-xl">
                        <span className="text-neutral-300">YOU RECEIVE</span>
                        <div className="flex items-center gap-2 font-bold text-yellow-glow">
                            <DiamondIcon className="w-6 h-6"/>
                            <span>{gemsToGet.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                        </div>
                    </div>
                     <button
                      onClick={handleDeposit}
                      disabled={isDepositing || !amount}
                      className="w-full bg-magenta-glow text-white font-bold font-orbitron py-3 px-8 rounded-lg uppercase tracking-wider transition-all duration-300 hover:bg-magenta-glow/80 hover:shadow-magenta disabled:bg-neutral-600 disabled:cursor-not-allowed"
                    >
                      {isDepositing ? 'PROCESSING...' : `DEPOSIT ${selectedCrypto}`}
                    </button>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-sm text-yellow-glow mb-4 max-w-md mx-auto">Send only <span className="font-bold">{CRYPTO_CONFIG[selectedCrypto].name}</span> to this address. Sending other assets will result in permanent loss.</p>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                       <div className="bg-navy-700 p-3 rounded-lg flex items-center gap-3">
                            <QrCodeIcon className="w-20 h-20 text-cyan-glow flex-shrink-0"/>
                            <div className="text-left">
                                <label className="text-xs text-neutral-400">DEPOSIT ADDRESS</label>
                                <p className="font-mono text-white break-all">{CRYPTO_CONFIG[selectedCrypto].address}</p>
                            </div>
                       </div>
                        <button onClick={handleCopy} className="bg-cyan-glow/80 text-navy-900 font-bold py-2 px-4 rounded-lg flex items-center gap-2 hover:bg-white transition-colors">
                            <CopyIcon className="w-5 h-5"/>
                            <span>{copied ? 'COPIED!' : 'COPY'}</span>
                        </button>
                    </div>
                    <p className="text-neutral-500 text-xs mt-4">Your account will be credited after network confirmations.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DepositView;
