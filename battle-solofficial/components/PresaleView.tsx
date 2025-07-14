

import React, { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const PresaleCountdown: React.FC = () => {
    const calculateTimeLeft = () => {
        const difference = +new Date('2024-12-31T23:59:59') - +new Date();
        let timeLeft: { [key: string]: number } = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents = Object.entries(timeLeft).map(([interval, value]) => {
        if (isNaN(value)) return null;
        return (
            <div key={interval} className="flex flex-col items-center">
                <span className="text-4xl md:text-5xl font-orbitron font-bold text-white">{String(value).padStart(2, '0')}</span>
                <span className="text-xs text-neutral-400 uppercase">{interval}</span>
            </div>
        );
    });

    return (
        <div className="flex justify-center gap-4 md:gap-8">
            {timerComponents.length ? timerComponents : <span className="text-2xl font-bold text-yellow-glow">Presale has ended!</span>}
        </div>
    );
};

const PresaleProgress: React.FC = () => {
    const raised = 356.78;
    const hardCap = 1000;
    const percentage = (raised / hardCap) * 100;

    return (
        <div className="w-full">
            <div className="flex justify-between items-center text-sm font-semibold text-neutral-300 mb-2">
                <span>Raised: <span className="text-white">{raised.toLocaleString()} SOL</span></span>
                <span>Hard Cap: <span className="text-white">{hardCap.toLocaleString()} SOL</span></span>
            </div>
            <div className="w-full bg-navy-700 rounded-full h-4 border-2 border-navy-800">
                <div 
                    className="bg-gradient-to-r from-magenta-glow to-cyan-glow h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
};

const PresaleView: React.FC = () => {
    const presaleRate = 5000;
    const [solAmount, setSolAmount] = useState('1');
    const [shipAmount, setShipAmount] = useState(presaleRate.toString());

    const handleSolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) {
            setSolAmount(value);
            const sol = parseFloat(value);
            if (!isNaN(sol)) {
                setShipAmount((sol * presaleRate).toLocaleString());
            } else {
                setShipAmount('0');
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center text-center p-4 animate-fade-in">
             <div className="bg-navy-800/50 backdrop-blur-md border border-navy-700 rounded-2xl p-8 md:p-12 shadow-2xl max-w-2xl w-full">
                <h1 className="text-4xl md:text-5xl font-orbitron font-black text-white uppercase tracking-wider mb-2">
                    <span className="text-yellow-glow">$SHIP</span> Token Presale
                </h1>
                <p className="text-neutral-300 text-lg mb-8">Fuel the future of on-chain gaming. Secure your $SHIP tokens now.</p>
                
                <div className="mb-8">
                    <PresaleCountdown />
                </div>

                <div className="mb-8">
                    <PresaleProgress />
                </div>

                <div className="bg-navy-900/70 p-6 rounded-lg border border-navy-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                        <div>
                            <label className="block text-left text-sm font-bold text-neutral-300 mb-1">YOU CONTRIBUTE (SOL)</label>
                            <input 
                                type="text"
                                value={solAmount}
                                onChange={handleSolChange}
                                className="w-full bg-navy-700 border border-navy-600 rounded-lg p-3 text-white text-2xl font-bold focus:ring-2 focus:ring-cyan-glow focus:outline-none"
                            />
                        </div>
                         <div>
                            <label className="block text-left text-sm font-bold text-neutral-300 mb-1">YOU RECEIVE ($SHIP)</label>
                            <input 
                                type="text"
                                value={shipAmount}
                                readOnly
                                className="w-full bg-navy-700/50 border border-navy-600 rounded-lg p-3 text-yellow-glow text-2xl font-bold focus:outline-none"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 text-right">Presale Rate: 1 SOL = {presaleRate.toLocaleString()} $SHIP</p>

                    <div className="mt-6 w-full">
                      <WalletMultiButton className="!w-full !bg-magenta-glow !text-white !font-bold !font-orbitron !py-4 !px-8 !rounded-lg !uppercase !tracking-wider !transition-all !duration-300 hover:!bg-magenta-glow/80 hover:!shadow-magenta !transform hover:!scale-105" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PresaleView;