
export interface Wallet {
  address: string;
  balance: number; // in $SHIP
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
}

export type GameStatus = 'placing_ships' | 'in_progress' | 'finished' | 'transition';
export type GameMode = 'Player vs AI' | 'Online PvP (Simulated)';
export type Turn = 'player' | 'opponent';

export type ShotResult = 'hit' | 'miss' | 'sunk';
export type Advantage = 'extra_shot' | 'radar_scan' | 'ghost_shield';

export interface Nft {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  skinImageUrl: string;
  price: number; // in $SHIP
  advantage: Advantage;
}

export interface GameState {
  mode: GameMode;
  wager: number;
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