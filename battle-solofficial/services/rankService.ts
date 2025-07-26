
import type { Rank } from '../types';

// Define the rank progression, rewards, and rakeback
const ranksData: Omit<Rank, 'expToNextLevel'>[] = [
    { level: 1, name: 'Cadet', iconName: 'cadet', gemReward: 100, rakebackPercentage: 0.02 },
    { level: 2, name: 'Ensign', iconName: 'ensign', gemReward: 150, rakebackPercentage: 0.025 },
    { level: 3, name: 'Lieutenant', iconName: 'lieutenant', gemReward: 200, rakebackPercentage: 0.03 },
    { level: 4, name: 'Commander', iconName: 'commander', gemReward: 250, rakebackPercentage: 0.035 },
    { level: 5, name: 'Captain', iconName: 'captain', gemReward: 350, rakebackPercentage: 0.04 },
    { level: 6, name: 'Commodore', iconName: 'commodore', gemReward: 500, rakebackPercentage: 0.05 },
    { level: 7, name: 'Rear Admiral', iconName: 'rear_admiral', gemReward: 750, rakebackPercentage: 0.06 },
    { level: 8, name: 'Vice Admiral', iconName: 'vice_admiral', gemReward: 1000, rakebackPercentage: 0.07 },
    { level: 9, name: 'Admiral', iconName: 'admiral', gemReward: 1500, rakebackPercentage: 0.08 },
    { level: 10, name: 'Grand Admiral', iconName: 'grand_admiral', gemReward: 2500, rakebackPercentage: 0.10 },
];


// Calculate EXP needed for each level using a formula
const calculateExpForLevel = (level: number): number => {
    if (level === 1) return 0;
    // Exponential curve for EXP makes leveling up progressively harder
    return Math.floor(100 * Math.pow(level - 1, 1.8));
};

export const RANKS: Rank[] = ranksData.map(rank => ({
    ...rank,
    expToNextLevel: rank.level < 10 ? calculateExpForLevel(rank.level + 1) : -1 // -1 signifies max level
}));

export const getRankDetails = (level: number): Rank => {
    const rank = RANKS.find(r => r.level === level);
    // If somehow a level beyond the max is achieved, return the max rank details
    return rank || { ...RANKS[RANKS.length - 1], level, name: 'Grand Admiral', expToNextLevel: -1 };
};

export const getExpForLevel = (level: number): number => {
    return calculateExpForLevel(level);
}

/**
 * Calculates EXP gained from a match.
 * @param wager The amount of Gems wagered.
 * @param isWin True if the player won, false otherwise.
 * @returns The amount of EXP gained.
 */
export const calculateExpGain = (wager: number, isWin: boolean): number => {
    const baseExp = Math.floor(wager * 0.2); // 20% of wager as base EXP
    const winBonus = isWin ? Math.floor(wager * 0.15) : 0; // 15% of wager as win bonus
    const total = baseExp + winBonus;
    const MIN_EXP = 10; // Ensure every game is rewarding
    return total > 0 ? total : MIN_EXP;
};

/**
 * Calculates the amount of gems to add to the player's claimable rakeback balance.
 * Rakeback is paid in gems and is a percentage of the wager amount.
 * @param wager The amount of Gems wagered.
 * @param rakebackPercentage The player's current rakeback percentage.
 * @returns The amount of gems to add to the unclaimedRake balance.
 */
export const calculateRakeback = (wager: number, rakebackPercentage: number): number => {
    // Rakeback is a direct percentage of the wager amount in gems
    // This makes it more transparent and easier to understand
    const rakebackInGems = wager * rakebackPercentage;
    return Math.floor(rakebackInGems); // Round down to avoid fractional gems
};
