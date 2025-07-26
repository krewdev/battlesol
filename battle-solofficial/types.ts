export type View = 'dashboard' | 'game' | 'nft_store' | 'deposit' | 'withdraw' | 'profile' | 'provably_fair' | 'presale';

export interface Wallet {
  address: string;
  isGuest: boolean;
  balance: number; // in $SHIP
  gems: number;
  // New properties for daily battle wager requirement
  lockedGems: number;
  wagerRequirement: number;
  rank: number;
  exp: number;
  unclaimedRake: number; // in $SHIP
  lastDailyBattle: number; // timestamp
  // New properties for profile and stats
  username: string;
  avatarUrl: string;
  totalWins: number;
  totalLosses: number;
  pnl: number; // Gem Profit/Loss
  gemsWon: number;
  gemsLost: number;
  totalWagered: number; // in Gems
}

export interface Rank {
  level: number;
  name: string;
  iconName: string;
  expToNextLevel: number;
  gemReward: number;
  rakebackPercentage: number;
}

export interface SiteChatMessage {
  id: string;
  author: {
    username: string;
    avatarUrl: string;
    rank: number;
  };
  text: string;
  timestamp: number;
}


export interface Coordinates {
  row: number;
  col: number;
}

export interface Ship {
  id: number;
  name: string;
  length: number;
  placements: Coordinates[]; // Placed cells
  hits: Coordinates[]; // Cells that have been hit
  sunk: boolean;
  extraHealth?: number;
}

export type GameStatus = 'placing_ships' | 'in_progress' | 'finished' | 'transition';
export type GameMode = 'Player vs AI' | 'Online PvP (Simulated)' | 'Daily AI Battle';
export type Turn = 'player' | 'opponent';

export type ShotResult = 'hit' | 'miss' | 'sunk' | 'decoy_hit';
export type Advantage = 'extra_shot' | 'radar_scan' | 'ghost_shield' | 'reinforced_hull' | 'decoy_buoy' | 'volley_fire' | 'emp_blast' | 'sabotage' | 'targeting_computer' | 'salvage_crew';

export interface Nft {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  skinImageUrl: string | null;
  price: number; // in Gems
  advantage: Advantage;
  type: 'Passive' | 'Active';
}

export interface GameState {
  mode: GameMode;
  wager: number; // Now in Gems
  playerShips: Ship[];
  opponentShips: Ship[];
  playerShots: Coordinates[]; // Shots player has taken
  opponentShots: Coordinates[]; // Shots opponent has taken
  status: GameStatus;
  turn: Turn;
  winner: 'player' | 'ai' | 'draw' | null;
  advantage: Advantage | null; // NFT advantage
  advantageUsed: boolean;
  transitionMessage: string;
  playerNftSkinUrl: string | null;
  hoveredCell: Coordinates | null;
  aiMode: 'searching' | 'hunting';
  aiHuntQueue: Coordinates[];
  // NFT-specific state
  reinforcedShipId: number | null;
  decoyPosition: Coordinates | null;
  isPlayerAdvantageDisabled: boolean;
  isOpponentAdvantageDisabled: boolean;
  isVolleying: boolean;
  // New decoy system
  playerDecoys: Coordinates[];
  opponentDecoys: Coordinates[];
  playerDecoysRemaining: number;
  opponentDecoysRemaining: number;
  playerTurnSkipped: boolean;
  opponentTurnSkipped: boolean;
}

export interface ChatMessage {
    author: 'user' | 'ai';
    text: string;
}

export const SHIP_CONFIG = [
  { id: 1, name: 'Carrier', length: 3 },
  { id: 2, name: 'Battleship', length: 3 },
  { id: 3, name: 'Destroyer', length: 2 },
];

export const GRID_SIZE = 8;