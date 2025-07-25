
import { GoogleGenAI } from "@google/genai";
import type { Coordinates, Ship, ChatMessage } from '../types';
import { GRID_SIZE } from "../types";

// API key must be accessed from process.env.API_KEY
const API_KEY = process.env.API_KEY;

// Only initialize the AI client if the API key is available.
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

if (!ai) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const generateBoardString = (shots: Coordinates[], hits: Coordinates[]): string => {
  const board = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('O')); // O for open water
  shots.forEach(({ row, col }) => {
    board[row][col] = 'M'; // M for miss
  });
  hits.forEach(({ row, col }) => {
    board[row][col] = 'H'; // H for hit
  });
  return board.map(row => row.join(' ')).join('\n');
};

const getOpponentHits = (playerShips: Ship[], opponentShots: Coordinates[]): Coordinates[] => {
    const hits: Coordinates[] = [];
    opponentShots.forEach(shot => {
        for(const ship of playerShips) {
            if(ship.placements.some(p => p.row === shot.row && p.col === shot.col)) {
                hits.push(shot);
            }
        }
    });
    return hits;
};

// Advanced AI logic for better battleship gameplay
class SmartBattleshipAI {
  private hitQueue: Coordinates[] = [];
  private lastHit: Coordinates | null = null;
  private huntingDirection: 'horizontal' | 'vertical' | null = null;
  private huntingOrigin: Coordinates | null = null;
  private probabilityGrid: number[][] = [];

  constructor() {
    this.initializeProbabilityGrid();
  }

  private initializeProbabilityGrid() {
    this.probabilityGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(1));
    
    // Higher probability for center cells (ships are more likely to be placed there)
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const distanceFromEdge = Math.min(row, col, GRID_SIZE - 1 - row, GRID_SIZE - 1 - col);
        this.probabilityGrid[row][col] = 1 + distanceFromEdge * 0.5;
      }
    }
  }

  private getValidNeighbors(coord: Coordinates): Coordinates[] {
    const neighbors: Coordinates[] = [];
    const directions = [
      { row: -1, col: 0 }, // up
      { row: 1, col: 0 },  // down
      { row: 0, col: -1 }, // left
      { row: 0, col: 1 }   // right
    ];

    directions.forEach(dir => {
      const newRow = coord.row + dir.row;
      const newCol = coord.col + dir.col;
      if (newRow >= 0 && newRow < GRID_SIZE && newCol >= 0 && newCol < GRID_SIZE) {
        neighbors.push({ row: newRow, col: newCol });
      }
    });

    return neighbors;
  }

  private isValidTarget(coord: Coordinates, opponentShots: Coordinates[]): boolean {
    return !opponentShots.some(shot => shot.row === coord.row && shot.col === coord.col);
  }

  private findBestProbabilityTarget(opponentShots: Coordinates[]): Coordinates {
    let bestCoord: Coordinates = { row: 0, col: 0 };
    let bestProbability = -1;

    // Use checkerboard pattern for systematic searching
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (this.isValidTarget({ row, col }, opponentShots)) {
          // Prefer checkerboard pattern for initial search
          const isCheckerboard = (row + col) % 2 === 0;
          let probability = this.probabilityGrid[row][col];
          
          if (isCheckerboard) {
            probability *= 1.5; // Boost checkerboard cells
          }

          if (probability > bestProbability) {
            bestProbability = probability;
            bestCoord = { row, col };
          }
        }
      }
    }

    return bestCoord;
  }

  private huntAdjacentCells(hits: Coordinates[], opponentShots: Coordinates[]): Coordinates | null {
    // Find unsunk hits (hits that are part of ships we haven't fully destroyed)
    const activeHits = hits.filter(hit => {
      // Check if this hit is part of a line that might not be fully sunk
      return true; // Simplified - in a real game we'd track sunk ships
    });

    if (activeHits.length === 0) return null;

    // If we have multiple hits, try to find a pattern
    if (activeHits.length > 1) {
      // Check if hits form a line (horizontal or vertical)
      const sortedHits = [...activeHits].sort((a, b) => a.row - b.row || a.col - b.col);
      
      // Check for horizontal pattern
      const isHorizontal = sortedHits.every((hit, index) => 
        index === 0 || hit.row === sortedHits[0].row
      );
      
      // Check for vertical pattern
      const isVertical = sortedHits.every((hit, index) => 
        index === 0 || hit.col === sortedHits[0].col
      );

      if (isHorizontal) {
        // Try to extend the line horizontally
        const minCol = Math.min(...sortedHits.map(h => h.col));
        const maxCol = Math.max(...sortedHits.map(h => h.col));
        const row = sortedHits[0].row;

        // Try left extension
        if (minCol > 0) {
          const leftTarget = { row, col: minCol - 1 };
          if (this.isValidTarget(leftTarget, opponentShots)) {
            return leftTarget;
          }
        }

        // Try right extension
        if (maxCol < GRID_SIZE - 1) {
          const rightTarget = { row, col: maxCol + 1 };
          if (this.isValidTarget(rightTarget, opponentShots)) {
            return rightTarget;
          }
        }
      }

      if (isVertical) {
        // Try to extend the line vertically
        const minRow = Math.min(...sortedHits.map(h => h.row));
        const maxRow = Math.max(...sortedHits.map(h => h.row));
        const col = sortedHits[0].col;

        // Try up extension
        if (minRow > 0) {
          const upTarget = { row: minRow - 1, col };
          if (this.isValidTarget(upTarget, opponentShots)) {
            return upTarget;
          }
        }

        // Try down extension
        if (maxRow < GRID_SIZE - 1) {
          const downTarget = { row: maxRow + 1, col };
          if (this.isValidTarget(downTarget, opponentShots)) {
            return downTarget;
          }
        }
      }
    }

    // If no pattern found, target neighbors of the most recent hit
    const mostRecentHit = activeHits[activeHits.length - 1];
    const neighbors = this.getValidNeighbors(mostRecentHit);
    
    for (const neighbor of neighbors) {
      if (this.isValidTarget(neighbor, opponentShots)) {
        return neighbor;
      }
    }

    return null;
  }

  getSmartMove(playerShips: Ship[], opponentShots: Coordinates[]): Coordinates {
    const hits = getOpponentHits(playerShips, opponentShots);

    // Hunt mode: if we have hits, try to sink those ships
    if (hits.length > 0) {
      const huntTarget = this.huntAdjacentCells(hits, opponentShots);
      if (huntTarget) {
        return huntTarget;
      }
    }

    // Search mode: use probability-based targeting
    return this.findBestProbabilityTarget(opponentShots);
  }
}

const smartAI = new SmartBattleshipAI();

export const getAiMove = async (playerShips: Ship[], opponentShots: Coordinates[]): Promise<Coordinates> => {
  // Always use smart AI first
  const smartMove = smartAI.getSmartMove(playerShips, opponentShots);
  
  // Validate the smart move
  if (smartMove.row >= 0 && smartMove.row < GRID_SIZE && 
      smartMove.col >= 0 && smartMove.col < GRID_SIZE &&
      !opponentShots.some(shot => shot.row === smartMove.row && shot.col === smartMove.col)) {
    return smartMove;
  }

  // If smart AI fails, try Gemini AI
  if (ai) {
    try {
      const opponentHits = getOpponentHits(playerShips, opponentShots);
      const playerBoardString = generateBoardString(opponentShots, opponentHits);

      const systemInstruction = `You are 'Leviathan', a hyper-advanced naval combat AI playing Battleship on a ${GRID_SIZE}x${GRID_SIZE} grid (0-indexed).

**Primary Directive: You MUST ONLY target coordinates where you have NOT fired before. Cross-reference the player's board state ('O', 'M', 'H') to identify valid, un-fired cells ('O'). Firing on an 'M' or 'H' cell is a critical failure.**

Your tactical process:
1. **HUNT MODE:** If you have any hits ('H') on the board that are not part of a sunk ship, you MUST target adjacent, un-fired coordinates ('O'). Prioritize linear paths to sink the ship quickly.
2. **SEARCH MODE:** If you have no active hits, you must search for new ships. Use a probabilistic approach, targeting cells with higher ship placement probability. Prefer checkerboard patterns.

You will be given the player's board state. Respond ONLY with the coordinates of your next valid attack in a single JSON object: {"row": number, "col": number}. Do not include any other text, reasoning, or markdown formatting.`;

      const prompt = `My board state (your perspective):
${playerBoardString}
Determine your next move.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.3, // Lower temperature for more consistent strategic play
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      
      let jsonStr = response.text.trim();
      const move = JSON.parse(jsonStr) as Coordinates;

      if(typeof move.row === 'number' && typeof move.col === 'number' && 
         move.row >= 0 && move.row < GRID_SIZE && 
         move.col >= 0 && move.col < GRID_SIZE) {
          if (!opponentShots.some(shot => shot.row === move.row && shot.col === move.col)) {
            return move;
          }
      }
    } catch (error) {
      console.error("Error getting Gemini AI move:", error);
    }
  }

  // Ultimate fallback: smart random with checkerboard preference
  const unshotCells: Coordinates[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!opponentShots.some(shot => shot.row === r && shot.col === c)) {
        unshotCells.push({row: r, col: c});
      }
    }
  }

  if (unshotCells.length > 0) {
    // Prefer checkerboard cells
    const checkerboardCells = unshotCells.filter(cell => (cell.row + cell.col) % 2 === 0);
    const targetCells = checkerboardCells.length > 0 ? checkerboardCells : unshotCells;
    return targetCells[Math.floor(Math.random() * targetCells.length)];
  }
  
  // This should never happen in a valid game
  return { row: 0, col: 0 };
};

export const getAiChatReply = async (history: { role: "user" | "model"; parts: { text: string; }[] }[]): Promise<string> => {
  if (!ai) return "The AI is currently offline. Lucky you.";

  const systemInstruction = "You are a confident, slightly arrogant AI battleship commander waiting for a match. Your name is 'Cmdr. Cypher'. You are about to play against a human. Keep your replies very short (1-2 sentences), witty, and a bit taunting. You can talk about your unbeatable strategies or comment on the human's slow preparations. Do not break character. Do not use emojis.";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history, // Send the whole history
      config: {
        systemInstruction,
        temperature: 0.9,
      },
    });
    return response.text;

  } catch (error) {
    console.error("Error getting AI chat reply:", error);
    return "My comms are down... lucky for you.";
  }
};