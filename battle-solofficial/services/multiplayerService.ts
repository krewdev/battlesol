import type { GameState, Ship, Coordinates, Nft, Wallet } from '../types';

// Real-time multiplayer service using WebSocket simulation
// In production, this would connect to a real WebSocket server

export interface MultiplayerMatch {
  id: string;
  creator: {
    address: string;
    username: string;
    avatarUrl: string;
  };
  joiner?: {
    address: string;
    username: string;
    avatarUrl: string;
  };
  wager: number;
  nftAdvantage?: string;
  status: 'waiting' | 'in_progress' | 'finished';
  createdAt: number;
  gameState?: GameState;
  currentTurn?: string; // wallet address
}

export interface MultiplayerMessage {
  type: 'match_created' | 'match_joined' | 'game_move' | 'game_ended' | 'match_cancelled';
  matchId: string;
  data: any;
  timestamp: number;
}

class MultiplayerService {
  private matches: Map<string, MultiplayerMatch> = new Map();
  private subscribers: Map<string, (message: MultiplayerMessage) => void> = new Map();
  private playerMatches: Map<string, string> = new Map(); // wallet -> matchId
  
  // Simulate WebSocket connection
  private connected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.connect();
  }

  private connect() {
    // Simulate WebSocket connection
    this.connected = true;
    console.log('🔗 Connected to multiplayer service');
    
    // Simulate periodic match updates
    setInterval(() => {
      this.simulateMatchActivity();
    }, 5000);
  }

  private simulateMatchActivity() {
    // Simulate real players creating/joining matches
    if (Math.random() > 0.7 && this.matches.size < 8) {
      this.createSimulatedMatch();
    }
    
    // Simulate matches being cancelled
    const waitingMatches = Array.from(this.matches.values()).filter(m => m.status === 'waiting');
    if (waitingMatches.length > 0 && Math.random() > 0.8) {
      const match = waitingMatches[Math.floor(Math.random() * waitingMatches.length)];
      this.cancelMatch(match.id);
    }
  }

  private createSimulatedMatch() {
    const playerNames = ['Admiral_Steel', 'CaptainThunder', 'NavalCommander', 'SeaWolf', 'DeepStrike', 'TorpedoAce'];
    const wagers = [10, 25, 50, 100, 250];
    const nftAdvantages = ['Radar Scan', 'Ghost Shield', 'Volley Fire', 'Reinforced Hull'];
    
    const match: MultiplayerMatch = {
      id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      creator: {
        address: `simulated_${Math.random().toString(36).substr(2, 9)}`,
        username: playerNames[Math.floor(Math.random() * playerNames.length)],
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${Math.random()}`
      },
      wager: wagers[Math.floor(Math.random() * wagers.length)],
      nftAdvantage: Math.random() > 0.6 ? nftAdvantages[Math.floor(Math.random() * nftAdvantages.length)] : undefined,
      status: 'waiting',
      createdAt: Date.now()
    };
    
    this.matches.set(match.id, match);
    this.notifySubscribers({
      type: 'match_created',
      matchId: match.id,
      data: match,
      timestamp: Date.now()
    });
  }

  // Create a new match
  createMatch(creator: Wallet, wager: number, nftAdvantage?: string): string {
    const matchId = `match_${Date.now()}_${creator.address.substr(-8)}`;
    
    const match: MultiplayerMatch = {
      id: matchId,
      creator: {
        address: creator.address,
        username: creator.username,
        avatarUrl: creator.avatarUrl
      },
      wager,
      nftAdvantage,
      status: 'waiting',
      createdAt: Date.now()
    };
    
    this.matches.set(matchId, match);
    this.playerMatches.set(creator.address, matchId);
    
    this.notifySubscribers({
      type: 'match_created',
      matchId,
      data: match,
      timestamp: Date.now()
    });
    
    return matchId;
  }

  // Join an existing match
  joinMatch(matchId: string, joiner: Wallet): boolean {
    const match = this.matches.get(matchId);
    if (!match || match.status !== 'waiting' || match.creator.address === joiner.address) {
      return false;
    }
    
    match.joiner = {
      address: joiner.address,
      username: joiner.username,
      avatarUrl: joiner.avatarUrl
    };
    match.status = 'in_progress';
    match.currentTurn = Math.random() > 0.5 ? match.creator.address : match.joiner.address;
    
    this.playerMatches.set(joiner.address, matchId);
    
    this.notifySubscribers({
      type: 'match_joined',
      matchId,
      data: match,
      timestamp: Date.now()
    });
    
    return true;
  }

  // Get all waiting matches
  getWaitingMatches(): MultiplayerMatch[] {
    return Array.from(this.matches.values())
      .filter(match => match.status === 'waiting')
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Get specific match
  getMatch(matchId: string): MultiplayerMatch | undefined {
    return this.matches.get(matchId);
  }

  // Get player's current match
  getPlayerMatch(walletAddress: string): MultiplayerMatch | undefined {
    const matchId = this.playerMatches.get(walletAddress);
    return matchId ? this.matches.get(matchId) : undefined;
  }

  // Send game move
  sendMove(matchId: string, playerAddress: string, move: any): boolean {
    const match = this.matches.get(matchId);
    if (!match || match.status !== 'in_progress' || match.currentTurn !== playerAddress) {
      return false;
    }
    
    // Switch turns
    if (match.creator.address === playerAddress && match.joiner) {
      match.currentTurn = match.joiner.address;
    } else if (match.joiner?.address === playerAddress) {
      match.currentTurn = match.creator.address;
    }
    
    this.notifySubscribers({
      type: 'game_move',
      matchId,
      data: { move, nextTurn: match.currentTurn },
      timestamp: Date.now()
    });
    
    return true;
  }

  // End game
  endGame(matchId: string, winner: string, gameResult: any): void {
    const match = this.matches.get(matchId);
    if (!match) return;
    
    match.status = 'finished';
    
    // Clean up player matches
    this.playerMatches.delete(match.creator.address);
    if (match.joiner) {
      this.playerMatches.delete(match.joiner.address);
    }
    
    this.notifySubscribers({
      type: 'game_ended',
      matchId,
      data: { winner, gameResult },
      timestamp: Date.now()
    });
    
    // Remove match after 30 seconds
    setTimeout(() => {
      this.matches.delete(matchId);
    }, 30000);
  }

  // Cancel match
  cancelMatch(matchId: string): void {
    const match = this.matches.get(matchId);
    if (!match || match.status !== 'waiting') return;
    
    this.playerMatches.delete(match.creator.address);
    this.matches.delete(matchId);
    
    this.notifySubscribers({
      type: 'match_cancelled',
      matchId,
      data: match,
      timestamp: Date.now()
    });
  }

  // Subscribe to match updates
  subscribe(playerId: string, callback: (message: MultiplayerMessage) => void): void {
    this.subscribers.set(playerId, callback);
  }

  // Unsubscribe from updates
  unsubscribe(playerId: string): void {
    this.subscribers.delete(playerId);
  }

  // Notify all subscribers
  private notifySubscribers(message: MultiplayerMessage): void {
    this.subscribers.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error notifying subscriber:', error);
      }
    });
  }

  // Check connection status
  isConnected(): boolean {
    return this.connected;
  }

  // Get connection info
  getConnectionInfo() {
    return {
      connected: this.connected,
      activeMatches: this.matches.size,
      waitingMatches: this.getWaitingMatches().length,
      connectedPlayers: this.subscribers.size
    };
  }
}

// Create singleton instance
export const multiplayerService = new MultiplayerService();

// Helper functions for game integration
export const createMultiplayerMatch = (creator: Wallet, wager: number, nftAdvantage?: string) => {
  return multiplayerService.createMatch(creator, wager, nftAdvantage);
};

export const joinMultiplayerMatch = (matchId: string, joiner: Wallet) => {
  return multiplayerService.joinMatch(matchId, joiner);
};

export const getAvailableMatches = () => {
  return multiplayerService.getWaitingMatches();
};

export const getPlayerCurrentMatch = (walletAddress: string) => {
  return multiplayerService.getPlayerMatch(walletAddress);
};

export const sendGameMove = (matchId: string, playerAddress: string, move: any) => {
  return multiplayerService.sendMove(matchId, playerAddress, move);
};

export const endMultiplayerGame = (matchId: string, winner: string, gameResult: any) => {
  multiplayerService.endGame(matchId, winner, gameResult);
};

export const subscribeToMatches = (playerId: string, callback: (message: MultiplayerMessage) => void) => {
  multiplayerService.subscribe(playerId, callback);
};

export const unsubscribeFromMatches = (playerId: string) => {
  multiplayerService.unsubscribe(playerId);
};

export default multiplayerService;