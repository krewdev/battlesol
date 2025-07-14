import type { Wallet } from '../types';

// A list of predefined, cool-looking sci-fi avatars for players to choose from.
export const AVATAR_LIST = [
  'https://i.imgur.com/K5a2O1j.png',
  'https://i.imgur.com/eG1fKzq.png',
  'https://i.imgur.com/sC4tWzA.png',
  'https://i.imgur.com/gTqYq7R.png',
  'https://i.imgur.com/tYpZ9uB.png',
  'https://i.imgur.com/rXQ8V4N.png',
  'https://i.imgur.com/uD4L5jF.png',
  'https://i.imgur.com/wI9N6vN.png',
  'https://i.imgur.com/yO8Z7bE.png',
  'https://i.imgur.com/jM8cZ3D.png',
  'https://i.imgur.com/bW3vX8P.png',
  'https://i.imgur.com/aI7xT8H.png',
  'https://i.imgur.com/9S6F5YQ.png',
  'https://i.imgur.com/cK2Z9pM.png',
  'https://i.imgur.com/pL0jS8X.png',
  'https://i.imgur.com/mN7T6pI.png',
  'https://i.imgur.com/fJ4hD8K.png',
  'https://i.imgur.com/7gH2jJk.png',
  'https://i.imgur.com/qR8vB0N.png',
  'https://i.imgur.com/uX5Y7sL.png',
];


/**
 * Creates a new, default user profile for a newly connected wallet address.
 * In a real application, you would first check if a profile for this address
 * already exists on your backend.
 * @param address The base58 encoded public key of the user's wallet.
 * @returns A new Wallet object with default values.
 */
export const initializeUserProfile = (address: string): Wallet => {
  const isGuest = address.startsWith('GUEST');
  const randomSeed = address.substring(address.length - 4);
  const wallet: Wallet = {
    address: address,
    isGuest: isGuest,
    balance: isGuest ? 1000 : Math.floor(Math.random() * 500) + 100,
    gems: isGuest ? 5000 : Math.floor(Math.random() * 2000),
    lockedGems: 0,
    wagerRequirement: 0,
    rank: 1,
    exp: 0,
    unclaimedRake: 0,
    lastDailyBattle: 0,
    username: isGuest ? 'Guest' : `Cmdr_${randomSeed}`,
    avatarUrl: AVATAR_LIST[0],
    totalWins: 0,
    totalLosses: 0,
    pnl: 0,
    gemsWon: 0,
    gemsLost: 0,
    totalWagered: 0,
  };
  console.log('User profile initialized:', wallet);
  return wallet;
};

// Mocking a transaction, e.g., for placing a wager or buying an NFT
export const mockSignTransaction = (amount: number): Promise<{ success: boolean; signature: string }> => {
  return new Promise((resolve, reject) => {
    console.log(`Simulating transaction for ${amount} Gems...`);
    setTimeout(() => {
      if (Math.random() > 0.05) { // 95% success rate
        const signature = `mock_tx_${Date.now()}_${Math.random().toString(36).substring(2)}`;
        console.log('Mock transaction successful:', signature);
        resolve({ success: true, signature });
      } else {
        console.error('Mock transaction failed.');
        reject({ success: false, message: 'Transaction rejected by user.' });
      }
    }, 1000);
  });
};