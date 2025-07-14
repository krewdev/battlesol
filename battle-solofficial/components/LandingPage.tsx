import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LogoIcon } from './Icons';

interface LandingPageProps {
  onPlayAsGuest: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onPlayAsGuest }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] text-center p-4 animate-fade-in">

            <div className="bg-navy-800/50 backdrop-blur-md border border-navy-700 rounded-2xl p-8 md:p-12 shadow-2xl max-w-3xl w-full">
                <div className="w-40 h-40 mx-auto mb-4">
                  <LogoIcon />
                </div>
                <h1 className="text-5xl md:text-7xl font-orbitron font-black text-white uppercase tracking-wider mb-4">
                    Battle-Sol
                </h1>
                <p className="text-neutral-300 text-lg md:text-xl mb-10 max-w-xl mx-auto">The futuristic battleship game on Solana. Wager, battle, and conquer the digital seas.</p>
                
                <div className="flex flex-col items-center gap-4 w-full max-w-xs mx-auto">
                    <WalletMultiButton className="!w-full !bg-cyan-glow !text-navy-900 !font-bold !font-orbitron !py-4 !px-8 !rounded-lg !uppercase !tracking-wider !transition-all !duration-300 hover:!bg-white hover:!shadow-cyan !transform hover:!scale-105" />
                    <p className="text-neutral-400">or</p>
                    <button 
                        onClick={onPlayAsGuest} 
                        className="w-full bg-magenta-glow text-white font-bold font-orbitron py-3 px-8 rounded-lg uppercase tracking-wider transition-all duration-300 hover:bg-magenta-glow/80 hover:shadow-magenta transform hover:scale-105"
                    >
                        Play as Guest
                    </button>
                </div>
            </div>
             <footer className="mt-8 text-neutral-500 text-sm">
                 <p>&copy; {new Date().getFullYear()} Battle-Sol. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;