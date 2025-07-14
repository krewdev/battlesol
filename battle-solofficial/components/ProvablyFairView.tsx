import React, { useState, useMemo } from 'react';
import { Buffer } from 'buffer';
import { InfoIcon } from './Icons';

// A simple SHA-256 implementation for demonstration purposes.
// A real app might use a more robust library like crypto-js or the browser's SubtleCrypto.
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

const ProvablyFairView: React.FC = () => {
    const [fleetLayout, setFleetLayout] = useState('{"ships":[{"id":1,"placements":[{"row":0,"col":0},{"row":0,"col":1}]}]}');
    const [nonce, setNonce] = useState('aSecretKey123');
    const [commitment, setCommitment] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);

    const generatedCommitment = useMemo(() => {
        return `hash(JSON.stringify(fleet_layout) + nonce)`;
    }, []);

    const handleGenerateCommitment = async () => {
        setIsCalculating(true);
        const dataToHash = `${fleetLayout}${nonce}`;
        const hash = await sha256(dataToHash);
        setCommitment(hash);
        setIsCalculating(false);
    };


  return (
    <div className="animate-fade-in max-w-4xl mx-auto text-neutral-300">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-orbitron font-extrabold text-white uppercase">Provably Fair Gaming</h2>
        <p className="text-neutral-400 mt-2 max-w-3xl mx-auto">
            Battle-Sol uses a cryptographic "commit-reveal" scheme on the Solana blockchain to ensure that neither player can cheat by moving their ships mid-game.
        </p>
      </div>

      <div className="bg-navy-800/50 backdrop-blur-md border border-navy-700 rounded-2xl p-8 shadow-2xl space-y-8">
        <div>
            <h3 className="text-2xl font-orbitron font-bold text-cyan-glow mb-2">How It Works: The Commit-Reveal Scheme</h3>
            <ol className="list-decimal list-inside space-y-2 text-lg">
                <li><span className="font-bold text-white">Commit Phase:</span> Before the game starts, you arrange your fleet. Your app then combines your ship layout with a secret, random key (a "nonce"). It calculates a unique, irreversible fingerprint (a SHA-256 hash) of this combination. This hash is your "commitment."</li>
                <li><span className="font-bold text-white">On-Chain Submission:</span> You submit only this commitment hash to the smart contract on the blockchain. Your ship layout remains secret. Your opponent does the same.</li>
                <li><span className="font-bold text-white">Gameplay:</span> You play the game, taking shots. Because the commitments are locked on-chain, neither player can change their ship locations.</li>
                <li><span className="font-bold text-white">Reveal Phase:</span> At the end of the game, you reveal your original ship layout and the secret nonce. The smart contract re-calculates the hash and verifies that it matches your initial commitment. If it matches, the game is valid. If not, the cheater forfeits.</li>
            </ol>
        </div>

        <div className="border-t border-navy-700 pt-8">
            <h3 className="text-2xl font-orbitron font-bold text-yellow-glow mb-4">Interactive Verifier</h3>
            <p className="mb-6">See for yourself how a commitment is generated. Any tiny change to the layout or the nonce will produce a completely different hash. This is the power of cryptography.</p>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-neutral-300 mb-1">FLEET LAYOUT (JSON)</label>
                    <textarea 
                        value={fleetLayout}
                        onChange={(e) => setFleetLayout(e.target.value)}
                        rows={4}
                        className="w-full font-mono bg-navy-700 border border-navy-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-glow focus:outline-none"
                    />
                </div>
                 <div>
                    <label className="block text-sm font-bold text-neutral-300 mb-1">SECRET NONCE (A RANDOM STRING)</label>
                    <input 
                        type="text"
                        value={nonce}
                        onChange={(e) => setNonce(e.target.value)}
                        className="w-full font-mono bg-navy-700 border border-navy-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-glow focus:outline-none"
                    />
                </div>
                 <button 
                    onClick={handleGenerateCommitment}
                    disabled={isCalculating}
                    className="w-full bg-magenta-glow text-white font-bold font-orbitron py-3 px-8 rounded-lg uppercase tracking-wider transition-all duration-300 hover:bg-magenta-glow/80 hover:shadow-magenta disabled:opacity-50"
                 >
                     {isCalculating ? 'Calculating...' : 'Generate Commitment Hash'}
                 </button>
                 {commitment && (
                     <div className="animate-fade-in">
                        <label className="block text-sm font-bold text-neutral-300 mb-1">RESULTING COMMITMENT (SHA-256 HASH)</label>
                        <p className="font-mono text-sm text-yellow-glow bg-navy-900/50 p-4 rounded-lg break-all">{commitment}</p>
                     </div>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProvablyFairView;