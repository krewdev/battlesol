
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


export const getAiMove = async (playerShips: Ship[], opponentShots: Coordinates[]): Promise<Coordinates> => {
  if (!ai) {
    // Fallback simple random AI if API key is not present
    let row, col;
    do {
      row = Math.floor(Math.random() * GRID_SIZE);
      col = Math.floor(Math.random() * GRID_SIZE);
    } while (opponentShots.some(shot => shot.row === row && shot.col === col));
    return { row, col };
  }

  const opponentHits = getOpponentHits(playerShips, opponentShots);
  const playerBoardString = generateBoardString(opponentShots, opponentHits);

  const systemInstruction = `You are 'Leviathan', a hyper-advanced naval combat AI playing Battleship on a ${GRID_SIZE}x${GRID_SIZE} grid (0-indexed).

**Primary Directive: You MUST ONLY target coordinates where you have NOT fired before. Cross-reference the player's board state ('O', 'M', 'H') to identify valid, un-fired cells ('O'). Firing on an 'M' or 'H' cell is a critical failure.**

Your tactical process:
1.  **HUNT MODE:** If you have any hits ('H') on the board that are not part of a sunk ship, you MUST target adjacent, un-fired coordinates ('O'). Prioritize linear paths to sink the ship quickly.
2.  **SEARCH MODE:** If you have no active hits, you must search for new ships. Use a probabilistic 'checkerboard' pattern, targeting only un-fired 'O' cells. Do not fire randomly.

You will be given the player's board state. Respond ONLY with the coordinates of your next valid attack in a single JSON object: {\"row\": number, \"col\": number}. Do not include any other text, reasoning, or markdown formatting.`;

  const prompt = `My board state (your perspective):
${playerBoardString}
Determine your next move.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.5,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    let jsonStr = response.text.trim();
    const move = JSON.parse(jsonStr) as Coordinates;

    if(typeof move.row === 'number' && typeof move.col === 'number' && move.row >= 0 && move.row < GRID_SIZE && move.col >= 0 && move.col < GRID_SIZE) {
        if (opponentShots.some(shot => shot.row === move.row && shot.col === move.col)) {
             console.error("AI returned an already fired upon coordinate. Falling back.", move);
             throw new Error("AI returned an already fired upon coordinate.");
        }
        return move;
    }
    throw new Error("Invalid coordinate format from AI");

  } catch (error) {
    console.error("Error getting AI move, falling back to random:", error);
    // Fallback in case of API error or invalid response
    // Smarter fallback: checkerboard pattern
    const unshotCells: Coordinates[] = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        // Simple checkerboard logic (r+c is even)
        if ((r + c) % 2 === 0 && !opponentShots.some(shot => shot.row === r && shot.col === c)) {
          unshotCells.push({row: r, col: c});
        }
      }
    }

    if (unshotCells.length > 0) {
        return unshotCells[Math.floor(Math.random() * unshotCells.length)];
    }
    
    // Ultimate fallback if checkerboard is full
    let row, col;
    do {
      row = Math.floor(Math.random() * GRID_SIZE);
      col = Math.floor(Math.random() * GRID_SIZE);
    } while (opponentShots.some(shot => shot.row === row && shot.col === col));
    return { row, col };
  }
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