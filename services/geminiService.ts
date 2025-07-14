
import { GoogleGenAI } from "@google/genai";
import type { Coordinates, Ship, ChatMessage } from '../types';
import { GRID_SIZE } from "../types";

// This is a placeholder. In a real app, use environment variables.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

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
  if (!API_KEY) {
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

  const systemInstruction = `You are a strategic AI opponent in a game of Battleship on a ${GRID_SIZE}x${GRID_SIZE} grid (0-indexed).
You will be given the state of the player's board, where 'O' is open water, 'M' is a miss you've already made, and 'H' is a hit.
Your goal is to sink all the player's ships.
Analyze the board. If you have existing hits ('H'), you must "hunt" for the rest of the ship by firing at adjacent, un-fired cells.
If you have no hits, "search" for a new ship by firing at a strategic, un-fired cell. Avoid clustering all your shots.
Respond ONLY with the coordinates of your next attack in JSON format: {\"row\": number, \"col\": number}. Do not provide any other text or explanation.`;

  const prompt = `My board state:
${playerBoardString}

Your previous shots are marked as 'M' or 'H'.
Determine your next move.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.9,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
        jsonStr = match[2].trim();
    }

    const move = JSON.parse(jsonStr) as Coordinates;

    if(typeof move.row === 'number' && typeof move.col === 'number' && move.row >= 0 && move.row < GRID_SIZE && move.col >= 0 && move.col < GRID_SIZE) {
        // Check if move is valid (not already shot)
        if (opponentShots.some(shot => shot.row === move.row && shot.col === move.col)) {
             throw new Error("AI returned an already fired upon coordinate.");
        }
        return move;
    }
    throw new Error("Invalid coordinate format from AI");

  } catch (error) {
    console.error("Error getting AI move, falling back to random:", error);
    // Fallback in case of API error or invalid response
    let row, col;
    do {
      row = Math.floor(Math.random() * GRID_SIZE);
      col = Math.floor(Math.random() * GRID_SIZE);
    } while (opponentShots.some(shot => shot.row === row && shot.col === col));
    return { row, col };
  }
};

export const getAiChatReply = async (history: { role: "user" | "model"; parts: { text: string; }[] }[]): Promise<string> => {
  if (!API_KEY) return "The AI is currently offline. Lucky you.";

  const systemInstruction = "You are a confident, slightly arrogant AI battleship commander waiting for a match. Your name is 'Cmdr. Cypher'. You are about to play against a human. Keep your replies very short (1-2 sentences), witty, and a bit taunting. You can talk about your unbeatable strategies or comment on the human's slow preparations. Do not break character. Do not use emojis.";
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
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
