import type { Wallet } from '../types';

// A list of predefined, cool-looking sci-fi avatars for players to choose from.
export const AVATAR_LIST = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=commander1&backgroundColor=1e40af',
  'https://api.dicebear.com/7.x/bottts/svg?seed=commander2&backgroundColor=7c3aed',
  'https://api.dicebear.com/7.x/bottts/svg?seed=commander3&backgroundColor=dc2626',
  'https://api.dicebear.com/7.x/bottts/svg?seed=commander4&backgroundColor=059669',
  'https://api.dicebear.com/7.x/bottts/svg?seed=commander5&backgroundColor=ea580c',
  'https://api.dicebear.com/7.x/bottts/svg?seed=admiral1&backgroundColor=0891b2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=admiral2&backgroundColor=be123c',
  'https://api.dicebear.com/7.x/bottts/svg?seed=admiral3&backgroundColor=4338ca',
  'https://api.dicebear.com/7.x/bottts/svg?seed=admiral4&backgroundColor=16a34a',
  'https://api.dicebear.com/7.x/bottts/svg?seed=admiral5&backgroundColor=c2410c',
  'https://api.dicebear.com/7.x/bottts/svg?seed=captain1&backgroundColor=9333ea',
  'https://api.dicebear.com/7.x/bottts/svg?seed=captain2&backgroundColor=0f766e',
  'https://api.dicebear.com/7.x/bottts/svg?seed=captain3&backgroundColor=b91c1c',
  'https://api.dicebear.com/7.x/bottts/svg?seed=captain4&backgroundColor=1d4ed8',
  'https://api.dicebear.com/7.x/bottts/svg?seed=captain5&backgroundColor=15803d',
  'https://api.dicebear.com/7.x/bottts/svg?seed=fleet1&backgroundColor=7c2d12',
  'https://api.dicebear.com/7.x/bottts/svg?seed=fleet2&backgroundColor=581c87',
  'https://api.dicebear.com/7.x/bottts/svg?seed=fleet3&backgroundColor=166534',
  'https://api.dicebear.com/7.x/bottts/svg?seed=fleet4&backgroundColor=991b1b',
  'https://api.dicebear.com/7.x/bottts/svg?seed=fleet5&backgroundColor=1e3a8a',
];

// Fallback avatar generator function
export const generateFallbackAvatar = (seed: string): string => {
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${seed}&backgroundColor=1e40af`;
};

// Function to validate and get a working avatar URL
export const getValidAvatarUrl = async (url: string, fallbackSeed: string): Promise<string> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      return url;
    }
  } catch (error) {
    console.warn('Avatar URL failed to load:', url);
  }
  return generateFallbackAvatar(fallbackSeed);
};

// Function to initialize guest profile
export const initializeGuestProfile = (): Wallet => {
  const guestId = `GUEST_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  return initializeUserProfile(guestId);
};

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
  const avatarIndex = Math.floor(Math.random() * AVATAR_LIST.length);
  
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
    username: isGuest ? `Guest_${randomSeed}` : `Cmdr_${randomSeed}`,
    avatarUrl: AVATAR_LIST[avatarIndex],
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