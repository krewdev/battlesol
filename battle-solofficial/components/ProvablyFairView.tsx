import React, { useState, useEffect } from 'react';
import { ShieldCheckIcon, EyeIcon, CodeBracketIcon, DocumentTextIcon, CheckCircleIcon, ArrowRightIcon } from './Icons';

interface GameVerification {
  gameId: string;
  playerCommitment: string;
  opponentCommitment: string;
  serverSeed: string;
  playerShips: Array<{id: number, positions: Array<{row: number, col: number}>}>;
  opponentShips: Array<{id: number, positions: Array<{row: number, col: number}>}>;
  winner: 'player' | 'opponent' | 'draw';
  verified: boolean;
}

const ProvablyFairView: React.FC = () => {
  const [gameToVerify, setGameToVerify] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<GameVerification | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const handleVerifyGame = async () => {
    if (!gameToVerify.trim()) return;
    
    setIsVerifying(true);
    
    // Simulate blockchain verification (in real implementation, this would query the smart contract)
    setTimeout(() => {
      const mockResult: GameVerification = {
        gameId: gameToVerify,
        playerCommitment: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        opponentCommitment: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        serverSeed: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
        playerShips: [
          { id: 1, positions: [{row: 0, col: 0}, {row: 0, col: 1}, {row: 0, col: 2}] },
          { id: 2, positions: [{row: 2, col: 2}, {row: 2, col: 3}, {row: 2, col: 4}] },
          { id: 3, positions: [{row: 4, col: 1}, {row: 4, col: 2}] },
        ],
        opponentShips: [
          { id: 1, positions: [{row: 1, col: 5}, {row: 2, col: 5}, {row: 3, col: 5}] },
          { id: 2, positions: [{row: 5, col: 0}, {row: 5, col: 1}, {row: 5, col: 2}] },
          { id: 3, positions: [{row: 0, col: 6}, {row: 1, col: 6}] },
        ],
        winner: Math.random() > 0.5 ? 'player' : 'opponent',
        verified: true,
      };
      setVerificationResult(mockResult);
      setIsVerifying(false);
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="bg-navy-800/50 backdrop-blur-md border border-navy-700 rounded-2xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ShieldCheckIcon className="w-12 h-12 text-cyan-glow" />
            <h1 className="text-4xl font-orbitron font-bold text-white uppercase">Provably Fair Gaming</h1>
          </div>
          <p className="text-lg text-neutral-300 max-w-3xl mx-auto">
            Battle Sol uses blockchain technology and cryptographic commitments to ensure every game is completely fair and verifiable.
            No cheating, no manipulation - just pure skill and strategy.
          </p>
        </div>

        {/* How It Works Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-orbitron font-bold text-cyan-glow mb-6 text-center uppercase">How Provable Fairness Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-navy-900/50 p-6 rounded-lg border border-navy-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-cyan-glow text-navy-900 rounded-full flex items-center justify-center font-bold">1</div>
                <h3 className="text-lg font-bold text-white">Commitment Phase</h3>
              </div>
              <p className="text-neutral-300 text-sm">
                Before the game starts, both players submit a cryptographic hash (commitment) of their ship positions plus a secret nonce. 
                This locks in their moves without revealing them.
              </p>
            </div>

            <div className="bg-navy-900/50 p-6 rounded-lg border border-navy-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-magenta-glow text-navy-900 rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="text-lg font-bold text-white">Game Execution</h3>
              </div>
              <p className="text-neutral-300 text-sm">
                The game is played using the committed positions. A server seed provides additional randomness for any random events. 
                All game data is recorded on the Solana blockchain.
              </p>
            </div>

            <div className="bg-navy-900/50 p-6 rounded-lg border border-navy-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-yellow-glow text-navy-900 rounded-full flex items-center justify-center font-bold">3</div>
                <h3 className="text-lg font-bold text-white">Verification</h3>
              </div>
              <p className="text-neutral-300 text-sm">
                After the game, both players reveal their ship positions and nonces. Anyone can verify that the commitments match 
                and the game was played fairly using our smart contract.
              </p>
            </div>
          </div>
        </div>

        {/* Game Verification Tool */}
        <div className="mb-12">
          <h2 className="text-2xl font-orbitron font-bold text-yellow-glow mb-6 text-center uppercase">Verify a Game</h2>
          <div className="bg-navy-900/30 p-6 rounded-lg border border-navy-600">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Enter Game ID or Transaction Signature"
                value={gameToVerify}
                onChange={(e) => setGameToVerify(e.target.value)}
                className="flex-1 bg-navy-700 border border-navy-600 rounded-lg p-3 text-white placeholder-neutral-400 focus:ring-2 focus:ring-cyan-glow focus:outline-none"
              />
              <button
                onClick={handleVerifyGame}
                disabled={isVerifying || !gameToVerify.trim()}
                className="bg-cyan-glow text-navy-900 font-bold py-3 px-6 rounded-lg hover:bg-cyan-glow/80 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-navy-900"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <EyeIcon className="w-5 h-5" />
                    Verify Game
                  </>
                )}
              </button>
            </div>

            {verificationResult && (
              <div className="border-t border-navy-600 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-400" />
                  <span className="text-lg font-bold text-green-400">Game Verified Successfully</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-400 uppercase mb-2">Game Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-300">Game ID:</span>
                        <span className="text-white font-mono">{verificationResult.gameId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-300">Winner:</span>
                        <span className={`font-bold ${verificationResult.winner === 'player' ? 'text-cyan-glow' : 'text-magenta-glow'}`}>
                          {verificationResult.winner === 'player' ? 'Player 1' : verificationResult.winner === 'opponent' ? 'Player 2' : 'Draw'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-300">Status:</span>
                        <span className="text-green-400 font-bold">Verified ✓</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-neutral-400 uppercase mb-2">Cryptographic Proofs</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-neutral-300">Player Commitment:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-navy-800 p-1 rounded font-mono text-cyan-300 flex-1 truncate">
                            {verificationResult.playerCommitment}
                          </code>
                          <button
                            onClick={() => copyToClipboard(verificationResult.playerCommitment)}
                            className="text-neutral-400 hover:text-white"
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-300">Opponent Commitment:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-navy-800 p-1 rounded font-mono text-magenta-300 flex-1 truncate">
                            {verificationResult.opponentCommitment}
                          </code>
                          <button
                            onClick={() => copyToClipboard(verificationResult.opponentCommitment)}
                            className="text-neutral-400 hover:text-white"
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-neutral-300">Server Seed:</span>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="text-xs bg-navy-800 p-1 rounded font-mono text-yellow-300 flex-1 truncate">
                            {verificationResult.serverSeed}
                          </code>
                          <button
                            onClick={() => copyToClipboard(verificationResult.serverSeed)}
                            className="text-neutral-400 hover:text-white"
                          >
                            <DocumentTextIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  className="mt-4 flex items-center gap-2 text-cyan-glow hover:text-cyan-300 transition-colors"
                >
                  <CodeBracketIcon className="w-5 h-5" />
                  {showTechnicalDetails ? 'Hide' : 'Show'} Technical Details
                  <ArrowRightIcon className={`w-4 h-4 transition-transform ${showTechnicalDetails ? 'rotate-90' : ''}`} />
                </button>

                {showTechnicalDetails && (
                  <div className="mt-4 p-4 bg-navy-800/50 rounded-lg border border-navy-600">
                    <h5 className="text-sm font-bold text-white mb-3">Ship Positions (Revealed)</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h6 className="text-xs font-bold text-cyan-glow mb-2">Player 1 Ships</h6>
                        <div className="space-y-1 text-xs font-mono">
                          {verificationResult.playerShips.map((ship, index) => (
                            <div key={index} className="text-neutral-300">
                              Ship {ship.id}: {ship.positions.map(pos => `[${pos.row},${pos.col}]`).join(', ')}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-magenta-glow mb-2">Player 2 Ships</h6>
                        <div className="space-y-1 text-xs font-mono">
                          {verificationResult.opponentShips.map((ship, index) => (
                            <div key={index} className="text-neutral-300">
                              Ship {ship.id}: {ship.positions.map(pos => `[${pos.row},${pos.col}]`).join(', ')}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Smart Contract Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-orbitron font-bold text-magenta-glow mb-6 text-center uppercase">Smart Contract Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-navy-900/30 p-6 rounded-lg border border-navy-600">
              <h3 className="text-lg font-bold text-white mb-4">Contract Address</h3>
              <div className="flex items-center gap-2">
                <code className="text-sm bg-navy-800 p-2 rounded font-mono text-cyan-300 flex-1">
                  BattLeSoLGaMeSmArTcOnTrAcTsPrOvAbLyFaIr111111
                </code>
                <button
                  onClick={() => copyToClipboard('BattLeSoLGaMeSmArTcOnTrAcTsPrOvAbLyFaIr111111')}
                  className="text-neutral-400 hover:text-white"
                >
                  <DocumentTextIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-neutral-400 mt-2">
                Deployed on Solana Mainnet. All game logic and fairness mechanisms are enforced by this immutable smart contract.
              </p>
            </div>

            <div className="bg-navy-900/30 p-6 rounded-lg border border-navy-600">
              <h3 className="text-lg font-bold text-white mb-4">Key Features</h3>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  Cryptographic commitments prevent cheating
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  On-chain randomness for fair gameplay
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  Automatic prize distribution
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-green-400" />
                  Public verification of all games
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="text-center">
          <h2 className="text-2xl font-orbitron font-bold text-white mb-4 uppercase">Why Provably Fair Matters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4">
              <ShieldCheckIcon className="w-8 h-8 text-cyan-glow mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Complete Transparency</h3>
              <p className="text-sm text-neutral-300">
                Every game move is recorded on the blockchain and can be independently verified by anyone.
              </p>
            </div>
            <div className="p-4">
              <EyeIcon className="w-8 h-8 text-magenta-glow mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">No Trust Required</h3>
              <p className="text-sm text-neutral-300">
                You don't need to trust us - the smart contract enforces fairness automatically.
              </p>
            </div>
            <div className="p-4">
              <CodeBracketIcon className="w-8 h-8 text-yellow-glow mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Open Source</h3>
              <p className="text-sm text-neutral-300">
                Our smart contract code is public and audited, ensuring complete transparency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProvablyFairView;