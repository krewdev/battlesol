import type { Wallet, Nft } from '../types';
import { AVAILABLE_NFTS } from '../components/NftStore';

// Beta Testing Service - Provides free gameplay for testing
export interface BetaTestingWallet extends Wallet {
  isBetaTester: boolean;
  betaCredits: number; // Virtual credits for testing
  testingSession: string;
}

export interface BetaTestingMatch {
  id: string;
  participants: string[];
  wager: number; // Virtual wager (no real cost)
  status: 'waiting' | 'in_progress' | 'finished';
  createdAt: number;
  isBetaMatch: true;
}

class BetaTestingService {
  private betaTesters: Map<string, BetaTestingWallet> = new Map();
  private betaMatches: Map<string, BetaTestingMatch> = new Map();
  private sessionId: string;

  constructor() {
    this.sessionId = `beta_${Date.now()}`;
    console.log('🧪 Beta Testing Service initialized');
  }

  // Convert regular wallet to beta testing wallet
  createBetaTester(wallet: Wallet): BetaTestingWallet {
    const betaTester: BetaTestingWallet = {
      ...wallet,
      isBetaTester: true,
      betaCredits: 10000, // Start with 10,000 virtual gems
      testingSession: this.sessionId,
      gems: 10000, // Override gems for testing
      balance: 1000, // Override $SHIP balance for testing
      // Give all NFTs for free testing
      address: wallet.address || `beta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    this.betaTesters.set(betaTester.address, betaTester);
    console.log(`🧪 Created beta tester: ${betaTester.username}`);
    
    return betaTester;
  }

  // Get or create beta tester
  getBetaTester(walletAddress?: string): BetaTestingWallet {
    if (walletAddress && this.betaTesters.has(walletAddress)) {
      return this.betaTesters.get(walletAddress)!;
    }

    // Create new beta tester
    const newBetaTester: BetaTestingWallet = {
      address: walletAddress || `beta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isGuest: !walletAddress,
      balance: 1000,
      gems: 10000,
      lockedGems: 0,
      wagerRequirement: 0,
      rank: 1,
      exp: 0,
      unclaimedRake: 0,
      lastDailyBattle: 0,
      username: `BetaTester_${Math.floor(Math.random() * 1000)}`,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=beta${Math.random()}`,
      totalWins: 0,
      totalLosses: 0,
      pnl: 0,
      gemsWon: 0,
      gemsLost: 0,
      totalWagered: 0,
      isBetaTester: true,
      betaCredits: 10000,
      testingSession: this.sessionId
    };

    this.betaTesters.set(newBetaTester.address, newBetaTester);
    return newBetaTester;
  }

  // Get all available NFTs for free (beta testing)
  getBetaTestingNFTs(): Nft[] {
    return AVAILABLE_NFTS.map(nft => ({
      ...nft,
      price: 0 // Free for beta testing
    }));
  }

  // Purchase NFT with virtual credits (no real cost)
  purchaseBetaNFT(walletAddress: string, nftId: string): boolean {
    const betaTester = this.betaTesters.get(walletAddress);
    if (!betaTester) return false;

    const nft = AVAILABLE_NFTS.find(n => n.id === nftId);
    if (!nft) return false;

    // Always allow purchase for beta testers (virtual transaction)
    console.log(`🧪 Beta tester ${betaTester.username} purchased ${nft.name} (virtual)`);
    return true;
  }

  // Create beta match (no real wagering)
  createBetaMatch(creator: BetaTestingWallet, wager: number): string {
    const matchId = `beta_match_${Date.now()}_${creator.address.substr(-8)}`;
    
    const match: BetaTestingMatch = {
      id: matchId,
      participants: [creator.address],
      wager, // Virtual wager
      status: 'waiting',
      createdAt: Date.now(),
      isBetaMatch: true
    };

    this.betaMatches.set(matchId, match);
    console.log(`🧪 Created beta match: ${matchId} with virtual wager: ${wager}`);
    
    return matchId;
  }

  // Join beta match
  joinBetaMatch(matchId: string, joiner: BetaTestingWallet): boolean {
    const match = this.betaMatches.get(matchId);
    if (!match || match.status !== 'waiting' || match.participants.includes(joiner.address)) {
      return false;
    }

    match.participants.push(joiner.address);
    match.status = 'in_progress';
    
    console.log(`🧪 ${joiner.username} joined beta match: ${matchId}`);
    return true;
  }

  // End beta match (virtual rewards)
  endBetaMatch(matchId: string, winner: string): void {
    const match = this.betaMatches.get(matchId);
    if (!match) return;

    match.status = 'finished';
    
    const winnerTester = this.betaTesters.get(winner);
    if (winnerTester) {
      // Give virtual rewards
      winnerTester.betaCredits += match.wager * 2;
      winnerTester.gems += match.wager * 2;
      winnerTester.totalWins += 1;
      winnerTester.gemsWon += match.wager * 2;
      
      console.log(`🧪 Beta match ended. Winner: ${winnerTester.username} (virtual rewards: ${match.wager * 2})`);
    }

    // Update loser stats
    match.participants.forEach(participantAddress => {
      if (participantAddress !== winner) {
        const loserTester = this.betaTesters.get(participantAddress);
        if (loserTester) {
          loserTester.totalLosses += 1;
          loserTester.gemsLost += match.wager;
        }
      }
    });

    // Clean up match after 30 seconds
    setTimeout(() => {
      this.betaMatches.delete(matchId);
    }, 30000);
  }

  // Get beta testing stats
  getBetaStats() {
    return {
      totalBetaTesters: this.betaTesters.size,
      activeBetaMatches: Array.from(this.betaMatches.values()).filter(m => m.status === 'in_progress').length,
      waitingBetaMatches: Array.from(this.betaMatches.values()).filter(m => m.status === 'waiting').length,
      sessionId: this.sessionId
    };
  }

  // Check if wallet is beta tester
  isBetaTester(walletAddress: string): boolean {
    return this.betaTesters.has(walletAddress);
  }

  // Get all beta matches
  getBetaMatches(): BetaTestingMatch[] {
    return Array.from(this.betaMatches.values())
      .filter(match => match.status === 'waiting')
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Reset beta tester (for testing purposes)
  resetBetaTester(walletAddress: string): void {
    const betaTester = this.betaTesters.get(walletAddress);
    if (betaTester) {
      betaTester.betaCredits = 10000;
      betaTester.gems = 10000;
      betaTester.balance = 1000;
      betaTester.totalWins = 0;
      betaTester.totalLosses = 0;
      betaTester.gemsWon = 0;
      betaTester.gemsLost = 0;
      betaTester.totalWagered = 0;
      console.log(`🧪 Reset beta tester: ${betaTester.username}`);
    }
  }

  // Enable beta testing mode for any wallet
  enableBetaMode(wallet: Wallet): BetaTestingWallet {
    return this.createBetaTester(wallet);
  }

  // Get testing instructions
  getBetaInstructions(): string[] {
    return [
      "🧪 Welcome to Beta Testing Mode!",
      "• All gameplay is FREE - no real gems or gas fees",
      "• You start with 10,000 virtual gems and 1,000 $SHIP tokens",
      "• All NFTs are available for free testing",
      "• Create matches, join games, test all features",
      "• Your progress is saved during this testing session",
      "• No blockchain transactions are made",
      "• Perfect for testing gameplay mechanics and UI",
      "• Report any bugs or issues you find!",
      "• Have fun testing Battle Sol! ⚓️"
    ];
  }
}

// Create singleton instance
export const betaTestingService = new BetaTestingService();

// Helper functions
export const createBetaTester = (wallet?: Wallet) => {
  return betaTestingService.getBetaTester(wallet?.address);
};

export const getBetaTestingNFTs = () => {
  return betaTestingService.getBetaTestingNFTs();
};

export const purchaseBetaNFT = (walletAddress: string, nftId: string) => {
  return betaTestingService.purchaseBetaNFT(walletAddress, nftId);
};

export const createBetaMatch = (creator: BetaTestingWallet, wager: number) => {
  return betaTestingService.createBetaMatch(creator, wager);
};

export const joinBetaMatch = (matchId: string, joiner: BetaTestingWallet) => {
  return betaTestingService.joinBetaMatch(matchId, joiner);
};

export const endBetaMatch = (matchId: string, winner: string) => {
  betaTestingService.endBetaMatch(matchId, winner);
};

export const getBetaStats = () => {
  return betaTestingService.getBetaStats();
};

export const isBetaTester = (walletAddress: string) => {
  return betaTestingService.isBetaTester(walletAddress);
};

export const getBetaMatches = () => {
  return betaTestingService.getBetaMatches();
};

export const enableBetaMode = (wallet: Wallet) => {
  return betaTestingService.enableBetaMode(wallet);
};

export const getBetaInstructions = () => {
  return betaTestingService.getBetaInstructions();
};

export default betaTestingService;