

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import type { Wallet, GameState, GameMode, Nft, View } from './types';
import { initializeUserProfile } from './services/solanaService';
import { getRankDetails, calculateExpGain, calculateRakeback } from './services/rankService';
import { getMatchFee, NFT_USAGE_FEE } from './services/feeService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import GameView from './components/GameView';
import NftStore, { AVAILABLE_NFTS } from './components/NftStore';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import DepositView from './components/DepositView';
import WithdrawView from './components/WithdrawView';
import ProfileView from './components/ProfileView';
import GameOverModal from './components/GameOverModal';
import ProvablyFairView from './components/ProvablyFairView';
import PresaleView from './components/PresaleView';

const App: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [nfts, setNfts] =useState<Nft[]>([]); // User's purchased NFTs
  const [gameOverData, setGameOverData] = useState<{ winnerName: string, isDraw: boolean, wager: number, expGained: number, isPlayerWinner: boolean, isGuest: boolean } | null>(null);
  
  const walletAdapter = useWallet();

  // Effect to sync app state with wallet adapter state
  useEffect(() => {
    // A real wallet has connected, and we don't have a profile or the current profile is a guest
    if (walletAdapter.connected && walletAdapter.publicKey && (!wallet || wallet.isGuest)) {
      const userProfile = initializeUserProfile(walletAdapter.publicKey.toBase58());
      setWallet(userProfile);
      setView('dashboard');
    } 
    // A real wallet has disconnected, and we were NOT in guest mode.
    else if (!walletAdapter.connected && wallet && !wallet.isGuest) {
      setWallet(null);
      setView('dashboard');
      setGameState(null);
    }
  }, [walletAdapter.connected, walletAdapter.publicKey, wallet]);


  const handlePlayAsGuest = useCallback(() => {
    const guestProfile = initializeUserProfile('GUEST_BATTLE_SOL_SIMULATION_ADDR');
    // For trial runs, grant the guest some NFTs to try out
    const trialNfts = AVAILABLE_NFTS.filter((n: Nft) => ['radar_scan', 'reinforced_hull', 'decoy_buoy'].includes(n.advantage));
    setNfts(trialNfts);
    setWallet(guestProfile);
  }, []);

  const handleDisconnect = useCallback(() => {
    if (wallet?.isGuest) {
        setWallet(null);
        setView('dashboard');
        setGameState(null);
        setNfts([]);
    } else if (walletAdapter.connected) {
        walletAdapter.disconnect();
        // The useEffect hook will handle the state reset.
    }
  }, [wallet, walletAdapter]);


  const handleStartGame = (mode: GameMode, wager: number, selectedNft: Nft | null) => {
    if (!wallet) return;

    // Guest mode is a free trial
    if (wallet.isGuest) {
        setGameState({
            mode: 'Player vs AI',
            wager: 0,
            advantage: selectedNft?.advantage || null,
            playerShips: [], opponentShips: [], playerShots: [], opponentShots: [], status: 'placing_ships', turn: 'player', winner: null, advantageUsed: false, transitionMessage: '', playerNftSkinUrl: null, hoveredCell: null, aiMode: 'searching', aiHuntQueue: [], reinforcedShipId: null, decoyPosition: null, isPlayerAdvantageDisabled: false, isOpponentAdvantageDisabled: false, isVolleying: false, playerDecoys: [], opponentDecoys: [], playerDecoysRemaining: 2, opponentDecoysRemaining: 2, playerTurnSkipped: false, opponentTurnSkipped: false,
        });
        setView('game');
        return;
    }

    const matchFee = wager > 0 ? getMatchFee(wager) : 0;
    const nftFee = selectedNft ? NFT_USAGE_FEE : 0;
    const totalFeeCost = matchFee + nftFee;
    const totalGemCost = wager + totalFeeCost;

     if (wallet.gems < totalGemCost) {
      alert(`Insufficient Gems. This match costs ${wager} (wager) + ${totalFeeCost} (fees) = ${totalGemCost} Gems to start.`);
      return;
    }

    let newWagerRequirement = wallet.wagerRequirement;
    let gemsToUnlock = 0;
    if (wallet.wagerRequirement > 0 && wager > 0) {
        const amountToApply = Math.min(wager, wallet.wagerRequirement);
        newWagerRequirement -= amountToApply;
        gemsToUnlock = Math.min(wallet.lockedGems, amountToApply);
    }
    
    setWallet(w => w ? { 
        ...w, 
        gems: w.gems - totalGemCost + gemsToUnlock,
        lockedGems: w.lockedGems - gemsToUnlock,
        wagerRequirement: newWagerRequirement,
        totalWagered: w.totalWagered + wager,
        gemsLost: w.gemsLost + totalFeeCost,
    } : null);
    
    console.log(`Starting ${mode} game. Wager: ${wager} Gems. Fees: ${totalFeeCost} Gems. NFT: ${selectedNft?.name || 'None'}`);

    const isPvp = mode === 'Online PvP (Simulated)';
    setGameState({
      mode,
      wager,
      playerShips: [],
      opponentShips: [],
      playerShots: [],
      opponentShots: [],
      status: isPvp ? 'transition' : 'placing_ships',
      turn: 'player',
      winner: null,
      advantage: mode !== 'Daily AI Battle' ? selectedNft?.advantage || null : null,
      advantageUsed: false,
      transitionMessage: isPvp ? 'Player 1, prepare to place your fleet.' : '',
      playerNftSkinUrl: mode === 'Player vs AI' ? selectedNft?.skinImageUrl || null : null,
      hoveredCell: null,
      aiMode: 'searching',
      aiHuntQueue: [],
      reinforcedShipId: null,
      decoyPosition: null,
      isPlayerAdvantageDisabled: false,
      isOpponentAdvantageDisabled: false,
      isVolleying: false,
      playerDecoys: [],
      opponentDecoys: [],
      playerDecoysRemaining: 2,
      opponentDecoysRemaining: 2,
      playerTurnSkipped: false,
      opponentTurnSkipped: false,
    });
    setView('game');
  };

  const handleGameEnd = useCallback((winner: 'player' | 'ai' | 'draw', finalGameState: GameState) => {
    if (!wallet || !finalGameState) return;

    const isWin = winner === 'player';
    const isDraw = winner === 'draw';
    const isPvP = finalGameState.mode === 'Online PvP (Simulated)';
    const winnerName = isDraw ? '' : (isWin ? wallet.username : (isPvP ? 'Player 2' : 'AI'));
    
    // Guest mode does not grant rewards or EXP
    if (wallet.isGuest) {
        setGameOverData({ winnerName, isDraw, wager: 0, expGained: 0, isPlayerWinner: isWin, isGuest: true });
        setGameState(null);
        setView('dashboard');
        return;
    }

    let newGems = wallet.gems;
    let newGemsWon = wallet.gemsWon;
    let newLockedGems = wallet.lockedGems;
    let newWagerRequirement = wallet.wagerRequirement;
    let newPnl = wallet.pnl;
    let newWins = wallet.totalWins;
    let newLosses = wallet.totalLosses;

    if (finalGameState.mode === 'Daily AI Battle' && isWin) {
      const rankDetails = getRankDetails(wallet.rank);
      const gemReward = Math.floor(rankDetails.gemReward * 0.3); // 30% of rank up reward for daily win
      newGems += gemReward; // Direct gems instead of locked gems for better gameplay
      newGemsWon += gemReward;
      alert(`Daily Battle victory! You earned ${gemReward} Gems based on your rank!`);
    }

    const expGained = finalGameState.wager > 0 ? calculateExpGain(finalGameState.wager, isWin) : 0;
    const rakebackGained = isPvP ? calculateRakeback(finalGameState.wager, getRankDetails(wallet.rank).rakebackPercentage) : 0;

    if (finalGameState.wager > 0) {
        if (isWin) {
            const winnings = finalGameState.wager * 2;
            newGems += winnings;
            newGemsWon += winnings;
            newPnl += finalGameState.wager;
            newWins++;
        } else if (isDraw) {
            newGems += finalGameState.wager;
        } else {
            newPnl -= finalGameState.wager;
            newLosses++;
        }
        
        if (!isWin && !isDraw && finalGameState.advantage === 'salvage_crew') {
            const recoveredAmount = finalGameState.wager * 0.25;
            newGems += recoveredAmount;
            newGemsWon += recoveredAmount;
            newPnl += recoveredAmount;
            console.log(`Salvage Crew recovered 25% of wager (${recoveredAmount} Gems)!`);
        }
    }

    let newExp = wallet.exp + expGained;
    let newRank = wallet.rank;
    let rankDetails = getRankDetails(newRank);

    while (rankDetails.expToNextLevel > 0 && newExp >= rankDetails.expToNextLevel) {
        newGems += rankDetails.gemReward;
        newGemsWon += rankDetails.gemReward;
        newRank++;
        const newRankDetails = getRankDetails(newRank);
        alert(`Rank up to ${newRankDetails.name}! Gained ${rankDetails.gemReward} gems.`);
        rankDetails = newRankDetails;
    }
    
    setWallet(w => w ? {
        ...w,
        gems: newGems,
        lockedGems: newLockedGems,
        wagerRequirement: newWagerRequirement,
        rank: newRank,
        exp: newExp,
        unclaimedRake: w.unclaimedRake + rakebackGained,
        pnl: newPnl,
        totalWins: newWins,
        totalLosses: newLosses,
        gemsWon: newGemsWon
    } : null);
    
    setGameOverData({ winnerName, isDraw, wager: finalGameState.wager, expGained, isPlayerWinner: isWin, isGuest: false });
    setGameState(null);
    setView('dashboard');
  }, [wallet]);

  const handleCloseGameOverModal = () => {
    setGameOverData(null);
  };

  const handleBuyNft = (nft: Nft) => {
    if (!wallet) return;

    if(wallet.isGuest) {
      alert("Please connect a wallet to purchase NFTs.");
      return;
    }
    
    if (wallet.gems < nft.price) {
      alert("Insufficient Gems to buy this NFT. Please make a deposit.");
      return;
    }

    setWallet({ ...wallet, gems: wallet.gems - nft.price, gemsLost: wallet.gemsLost + nft.price });
    setNfts(prev => [...prev, nft]);
    alert(`Successfully purchased ${nft.name}!`);
    setView('dashboard');
  };

  const handleDeposit = (gemAmount: number) => {
    if (!wallet) return;
    setWallet(w => w ? { ...w, gems: w.gems + gemAmount, gemsWon: w.gemsWon + gemAmount } : null);
    alert(`${gemAmount.toLocaleString()} Gems have been added to your account!`);
    setView('dashboard');
  };

  const handleWithdraw = (gemAmount: number, targetCurrency: 'SOL' | '$SHIP') => {
    if (!wallet || wallet.isGuest) return;

    const withdrawableGems = wallet.gems - wallet.lockedGems;
    if (gemAmount > withdrawableGems) {
      alert("Withdrawal amount exceeds your available gem balance.");
      return;
    }
    
    const SOL_RATE = 150; 
    const SHIP_RATE_USD = 0.5;
    
    let receivedAmount = 0;
    if (targetCurrency === 'SOL') {
        receivedAmount = gemAmount / SOL_RATE;
        console.log(`Withdrew ${receivedAmount.toFixed(4)} SOL`);
        setWallet(w => w ? { ...w, gems: w.gems - gemAmount, gemsLost: w.gemsLost + gemAmount } : null);
    } else {
        receivedAmount = gemAmount / SHIP_RATE_USD;
        setWallet(w => w ? { ...w, balance: w.balance + receivedAmount, gems: w.gems - gemAmount, gemsLost: w.gemsLost + gemAmount } : null);
    }
    
    alert(`Withdrawal successful! You have received approx. ${receivedAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })} ${targetCurrency}.`);
    setView('dashboard');
  };
  
  const handleClaimRakeback = () => {
    if (!wallet || wallet.isGuest || wallet.unclaimedRake <= 0) return;
    const amountClaimed = wallet.unclaimedRake;
    setWallet(w => w ? {
        ...w,
        balance: w.balance + w.unclaimedRake,
        unclaimedRake: 0
    } : null);
    alert(`Successfully claimed ${amountClaimed.toFixed(2)} $SHIP in rakeback!`);
  }

  const handleRedeemCode = (code: string) => {
    if (!wallet || wallet.isGuest) return;
    if (code === 'BATTLE2024') {
        const reward = 500;
        setWallet(w => w ? {...w, gems: w.gems + reward, gemsWon: w.gemsWon + reward } : null);
        alert(`Code redeemed! You received ${reward} Gems!`);
    } else if (code === 'test') {
        const reward = 1;
        const lockRequirement = 5;
        setWallet(w => w ? {
            ...w,
            lockedGems: w.lockedGems + reward,
            wagerRequirement: w.wagerRequirement + lockRequirement
        } : null);
        alert(`Daily code redeemed! You received ${reward} locked Gem. Wager ${lockRequirement} Gems to unlock.`);
    } else {
        alert('Invalid or expired code.');
    }
  }
  
  const handleUpdateProfile = (newUsername: string, newAvatar: string) => {
    if (!wallet || wallet.isGuest) return;
    setWallet(w => w ? { ...w, username: newUsername, avatarUrl: newAvatar } : null);
    alert('Profile updated successfully!');
  };

  const handleStartDailyBattle = () => {
    if (!wallet || wallet.isGuest) return;

    const now = Date.now();
    const last = wallet.lastDailyBattle;
    const hoursSinceLast = (now - last) / (1000 * 60 * 60);
    if (last !== 0 && hoursSinceLast < 22) {
        alert("Daily battle is not available yet.");
        return;
    }

    setWallet(w => w ? {...w, lastDailyBattle: now} : null);

    setGameState({
      mode: 'Daily AI Battle',
      wager: 0,
      playerShips: [],
      opponentShips: [],
      playerShots: [],
      opponentShots: [],
      status: 'placing_ships',
      turn: 'player',
      winner: null,
      advantage: null,
      advantageUsed: false,
      transitionMessage: '',
      playerNftSkinUrl: null,
      hoveredCell: null,
      aiMode: 'searching',
      aiHuntQueue: [],
      reinforcedShipId: null,
      decoyPosition: null,
      isPlayerAdvantageDisabled: false,
      isOpponentAdvantageDisabled: false,
      isVolleying: false,
      playerDecoys: [],
      opponentDecoys: [],
      playerDecoysRemaining: 2,
      opponentDecoysRemaining: 2,
      playerTurnSkipped: false,
      opponentTurnSkipped: false,
    });
    setView('game');
  };

  const renderView = () => {
    if (!wallet) {
        return <LandingPage onPlayAsGuest={handlePlayAsGuest} />;
    }
    
    const dashboardProps = {
      wallet,
      onStartGame: handleStartGame,
      onNavigate: setView,
      ownedNfts: nfts,
      onStartDailyBattle: handleStartDailyBattle,
      onClaimRakeback: handleClaimRakeback,
      onRedeemCode: handleRedeemCode
    };

    switch (view) {
      case 'game':
        if (!gameState) return <Dashboard {...dashboardProps} />;
        return <GameView gameState={gameState} setGameState={setGameState} onGameEnd={handleGameEnd} wallet={wallet} />;
      case 'nft_store':
        return <NftStore onBuyNft={handleBuyNft} wallet={wallet}/>;
      case 'deposit':
        return <DepositView onDeposit={handleDeposit} />;
      case 'withdraw':
        return <WithdrawView wallet={wallet} onWithdraw={handleWithdraw} />;
      case 'profile':
        return <ProfileView wallet={wallet} onUpdateProfile={handleUpdateProfile} />;
      case 'provably_fair':
        return <ProvablyFairView />;
      case 'presale':
        return <PresaleView />;
      default:
        return <Dashboard {...dashboardProps} />;
    }
  };

  return (
    <div className="bg-navy-900 min-h-screen text-white font-sans flex flex-col">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 z-0"></div>
      {wallet && <Header wallet={wallet} onNavigate={setView} onDisconnect={handleDisconnect} />}
      <main className="flex-grow container mx-auto px-4 py-8 z-10">
        {renderView()}
      </main>
      {wallet && <Footer />}
      {gameOverData && <GameOverModal {...gameOverData} onClose={handleCloseGameOverModal} />}
    </div>
  );
};

export default App;