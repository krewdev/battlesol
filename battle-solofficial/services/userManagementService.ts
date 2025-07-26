import type { Wallet } from '../types';

export interface UserAccount extends Wallet {
  createdAt: Date;
  lastActive: Date;
  totalGamesPlayed: number;
  totalWagered: number;
  totalWon: number;
  isActive: boolean;
}

class UserManagementService {
  private userAccounts: Map<string, UserAccount> = new Map();
  private readonly STORAGE_KEY = 'battle_sol_user_accounts';

  constructor() {
    this.loadAccountsFromStorage();
  }

  /**
   * Register a new user account when they connect their wallet
   */
  registerUser(wallet: Wallet): UserAccount {
    const existingAccount = this.userAccounts.get(wallet.address);
    if (existingAccount) {
      // Update last active time
      existingAccount.lastActive = new Date();
      existingAccount.isActive = true;
      this.saveAccountsToStorage();
      return existingAccount;
    }

    const newAccount: UserAccount = {
      ...wallet,
      createdAt: new Date(),
      lastActive: new Date(),
      totalGamesPlayed: 0,
      totalWagered: 0,
      totalWon: 0,
      isActive: true
    };

    this.userAccounts.set(wallet.address, newAccount);
    this.saveAccountsToStorage();
    console.log(`📝 Registered new user account: ${newAccount.username} (${wallet.address})`);
    return newAccount;
  }

  /**
   * Get all registered user accounts
   */
  getAllAccounts(): UserAccount[] {
    return Array.from(this.userAccounts.values());
  }

  /**
   * Get active user accounts (used within last 30 days)
   */
  getActiveAccounts(): UserAccount[] {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return this.getAllAccounts().filter(account => 
      account.isActive && account.lastActive > thirtyDaysAgo
    );
  }

  /**
   * Get account by wallet address
   */
  getAccount(walletAddress: string): UserAccount | undefined {
    return this.userAccounts.get(walletAddress);
  }

  /**
   * Update account statistics after a game
   */
  updateAccountStats(walletAddress: string, gameStats: {
    wager: number;
    won: boolean;
    amountWon?: number;
  }): void {
    const account = this.userAccounts.get(walletAddress);
    if (!account) return;

    account.totalGamesPlayed += 1;
    account.totalWagered += gameStats.wager;
    account.lastActive = new Date();
    
    if (gameStats.won && gameStats.amountWon) {
      account.totalWon += gameStats.amountWon;
    }

    this.saveAccountsToStorage();
  }

  /**
   * Send gems to any registered account
   */
  sendGemsToAccount(targetAddress: string, amount: number, fromAddress?: string): boolean {
    const targetAccount = this.userAccounts.get(targetAddress);
    if (!targetAccount) {
      console.error(`❌ Target account not found: ${targetAddress}`);
      return false;
    }

    // Update target account's gems
    targetAccount.gems += amount;
    targetAccount.lastActive = new Date();
    
    // Log the transaction
    console.log(`💎 Sent ${amount} gems to ${targetAccount.username} (${targetAddress})${fromAddress ? ` from ${fromAddress}` : ''}`);
    
    this.saveAccountsToStorage();
    return true;
  }

  /**
   * Get accounts sorted by various criteria
   */
  getAccountsSortedBy(sortBy: 'username' | 'gems' | 'rank' | 'createdAt' | 'lastActive' | 'totalGames'): UserAccount[] {
    const accounts = this.getAllAccounts();
    
    switch (sortBy) {
      case 'username':
        return accounts.sort((a, b) => a.username.localeCompare(b.username));
      case 'gems':
        return accounts.sort((a, b) => b.gems - a.gems);
      case 'rank':
        return accounts.sort((a, b) => b.rank - a.rank);
      case 'createdAt':
        return accounts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      case 'lastActive':
        return accounts.sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
      case 'totalGames':
        return accounts.sort((a, b) => b.totalGamesPlayed - a.totalGamesPlayed);
      default:
        return accounts;
    }
  }

  /**
   * Search accounts by username or address
   */
  searchAccounts(query: string): UserAccount[] {
    const accounts = this.getAllAccounts();
    const lowerQuery = query.toLowerCase();
    
    return accounts.filter(account => 
      account.username.toLowerCase().includes(lowerQuery) ||
      account.address.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get account statistics
   */
  getAccountStats(): {
    totalAccounts: number;
    activeAccounts: number;
    totalGems: number;
    averageGems: number;
    totalGamesPlayed: number;
  } {
    const accounts = this.getAllAccounts();
    const activeAccounts = this.getActiveAccounts();
    
    const totalGems = accounts.reduce((sum, account) => sum + account.gems, 0);
    const totalGamesPlayed = accounts.reduce((sum, account) => sum + account.totalGamesPlayed, 0);
    
    return {
      totalAccounts: accounts.length,
      activeAccounts: activeAccounts.length,
      totalGems,
      averageGems: accounts.length > 0 ? Math.round(totalGems / accounts.length) : 0,
      totalGamesPlayed
    };
  }

  /**
   * Deactivate an account (mark as inactive)
   */
  deactivateAccount(walletAddress: string): boolean {
    const account = this.userAccounts.get(walletAddress);
    if (!account) return false;

    account.isActive = false;
    this.saveAccountsToStorage();
    console.log(`🔒 Deactivated account: ${account.username} (${walletAddress})`);
    return true;
  }

  /**
   * Reactivate an account
   */
  reactivateAccount(walletAddress: string): boolean {
    const account = this.userAccounts.get(walletAddress);
    if (!account) return false;

    account.isActive = true;
    account.lastActive = new Date();
    this.saveAccountsToStorage();
    console.log(`🔓 Reactivated account: ${account.username} (${walletAddress})`);
    return true;
  }

  private saveAccountsToStorage(): void {
    try {
      const accountsData = Array.from(this.userAccounts.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(accountsData));
    } catch (error) {
      console.error('Failed to save accounts to storage:', error);
    }
  }

  private loadAccountsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const accountsData: [string, UserAccount][] = JSON.parse(stored);
        this.userAccounts = new Map(accountsData);
        console.log(`📊 Loaded ${this.userAccounts.size} user accounts from storage`);
      }
    } catch (error) {
      console.error('Failed to load accounts from storage:', error);
    }
  }
}

// Create singleton instance
const userManagementService = new UserManagementService();

// Export functions
export const registerUser = (wallet: Wallet) => userManagementService.registerUser(wallet);
export const getAllAccounts = () => userManagementService.getAllAccounts();
export const getActiveAccounts = () => userManagementService.getActiveAccounts();
export const getAccount = (walletAddress: string) => userManagementService.getAccount(walletAddress);
export const updateAccountStats = (walletAddress: string, gameStats: any) => userManagementService.updateAccountStats(walletAddress, gameStats);
export const sendGemsToAccount = (targetAddress: string, amount: number, fromAddress?: string) => userManagementService.sendGemsToAccount(targetAddress, amount, fromAddress);
export const getAccountsSortedBy = (sortBy: any) => userManagementService.getAccountsSortedBy(sortBy);
export const searchAccounts = (query: string) => userManagementService.searchAccounts(query);
export const getAccountStats = () => userManagementService.getAccountStats();
export const deactivateAccount = (walletAddress: string) => userManagementService.deactivateAccount(walletAddress);
export const reactivateAccount = (walletAddress: string) => userManagementService.reactivateAccount(walletAddress);