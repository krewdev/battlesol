
/**
 * This service centralizes all game-related fee calculations.
 * The goal is to make the house edge and game economy easily adjustable.
 */

/**
 * The fee in Gems required to use any NFT advantage in a match.
 */
export const NFT_USAGE_FEE = 2;

/**
 * Calculates the Gem fee required to start a match based on the wager size.
 * This is the house rake.
 * @param wager The amount of Gems being wagered.
 * @returns The fee in Gems.
 */
export const getMatchFee = (wager: number): number => {
    // 3% of the wager, with a minimum of 1 gem.
    const fee = Math.max(1, Math.ceil(wager * 0.03));
    return fee;
};
