
import type { Wallet } from '../types';

// Mocking a Solana wallet connection
export const mockConnectWallet = (): Promise<Wallet> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const wallet: Wallet = {
        address: 'SoL4n...bAtt13',
        balance: Math.floor(Math.random() * 500) + 100, // Random $SHIP balance
      };
      console.log('Mock wallet connected:', wallet);
      resolve(wallet);
    }, 500);
  });
};

export const mockDisconnectWallet = (): void => {
    console.log("Mock wallet disconnected.");
}

// Mocking a transaction, e.g., for placing a wager or buying an NFT
export const mockSignTransaction = (amount: number): Promise<{ success: boolean; signature: string }> => {
  return new Promise((resolve, reject) => {
    console.log(`Simulating transaction for ${amount} $SHIP...`);
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
