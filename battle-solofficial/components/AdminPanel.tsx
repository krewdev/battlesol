import React, { useState, useEffect } from 'react';
import { 
  getAllAccounts, 
  getActiveAccounts, 
  getAccountsSortedBy, 
  searchAccounts, 
  sendGemsToAccount, 
  getAccountStats,
  deactivateAccount,
  reactivateAccount,
  type UserAccount 
} from '../services/userManagementService';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<UserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'username' | 'gems' | 'rank' | 'createdAt' | 'lastActive' | 'totalGames'>('lastActive');
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [stats, setStats] = useState(getAccountStats());
  const [selectedAccount, setSelectedAccount] = useState<UserAccount | null>(null);
  const [gemsToSend, setGemsToSend] = useState('');
  const [showSendGemsModal, setShowSendGemsModal] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, [sortBy, showOnlyActive]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchAccounts(searchQuery);
      setFilteredAccounts(filtered);
    } else {
      setFilteredAccounts(accounts);
    }
  }, [searchQuery, accounts]);

  const loadAccounts = () => {
    const allAccounts = getAllAccounts();
    const activeAccounts = getActiveAccounts();
    const accountsToShow = showOnlyActive ? activeAccounts : allAccounts;
    const sortedAccounts = getAccountsSortedBy(sortBy);
    
    setAccounts(sortedAccounts);
    setFilteredAccounts(accountsToShow);
    setStats(getAccountStats());
  };

  const handleSendGems = () => {
    if (!selectedAccount || !gemsToSend) return;
    
    const amount = parseInt(gemsToSend);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const success = sendGemsToAccount(selectedAccount.address, amount);
    if (success) {
      alert(`Successfully sent ${amount} gems to ${selectedAccount.username}`);
      setGemsToSend('');
      setShowSendGemsModal(false);
      setSelectedAccount(null);
      loadAccounts(); // Refresh the list
    } else {
      alert('Failed to send gems');
    }
  };

  const handleToggleAccountStatus = (account: UserAccount) => {
    const success = account.isActive 
      ? deactivateAccount(account.address)
      : reactivateAccount(account.address);
    
    if (success) {
      loadAccounts(); // Refresh the list
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-navy-900 rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-navy-800 p-4 border-b border-navy-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-yellow-glow">Admin Panel - User Management</h2>
          <button 
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Stats Bar */}
        <div className="bg-navy-800 p-4 border-b border-navy-700">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <p className="text-sm text-neutral-400">Total Accounts</p>
              <p className="text-xl font-bold text-cyan-glow">{stats.totalAccounts}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Active Accounts</p>
              <p className="text-xl font-bold text-green-400">{stats.activeAccounts}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Gems</p>
              <p className="text-xl font-bold text-yellow-glow">{stats.totalGems.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Avg Gems</p>
              <p className="text-xl font-bold text-purple-400">{stats.averageGems.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Total Games</p>
              <p className="text-xl font-bold text-orange-400">{stats.totalGamesPlayed.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-navy-700">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search by username or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-white placeholder-neutral-400"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="lastActive">Last Active</option>
              <option value="username">Username</option>
              <option value="gems">Gems</option>
              <option value="rank">Rank</option>
              <option value="createdAt">Created</option>
              <option value="totalGames">Games Played</option>
            </select>
            <label className="flex items-center gap-2 text-neutral-300">
              <input
                type="checkbox"
                checked={showOnlyActive}
                onChange={(e) => setShowOnlyActive(e.target.checked)}
                className="rounded"
              />
              Show Only Active
            </label>
            <button
              onClick={loadAccounts}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Accounts List */}
        <div className="overflow-auto max-h-96">
          <table className="w-full">
            <thead className="bg-navy-800 sticky top-0">
              <tr>
                <th className="p-3 text-left text-sm font-bold text-yellow-glow">Username</th>
                <th className="p-3 text-left text-sm font-bold text-yellow-glow">Address</th>
                <th className="p-3 text-left text-sm font-bold text-yellow-glow">Gems</th>
                <th className="p-3 text-left text-sm font-bold text-yellow-glow">Rank</th>
                <th className="p-3 text-left text-sm font-bold text-yellow-glow">Games</th>
                <th className="p-3 text-left text-sm font-bold text-yellow-glow">Last Active</th>
                <th className="p-3 text-left text-sm font-bold text-yellow-glow">Status</th>
                <th className="p-3 text-left text-sm font-bold text-yellow-glow">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.address} className="border-b border-navy-700 hover:bg-navy-800">
                  <td className="p-3 text-white">{account.username}</td>
                  <td className="p-3 text-neutral-400 text-sm font-mono">
                    {account.address.slice(0, 8)}...{account.address.slice(-6)}
                  </td>
                  <td className="p-3 text-cyan-glow font-bold">{account.gems.toLocaleString()}</td>
                  <td className="p-3 text-purple-400">{account.rank}</td>
                  <td className="p-3 text-orange-400">{account.totalGamesPlayed}</td>
                  <td className="p-3 text-neutral-300 text-sm">{formatDate(account.lastActive)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      account.isActive 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {account.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowSendGemsModal(true);
                        }}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-2 py-1 rounded text-xs transition-colors"
                      >
                        Send Gems
                      </button>
                      <button
                        onClick={() => handleToggleAccountStatus(account)}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          account.isActive
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-white'
                        }`}
                      >
                        {account.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Send Gems Modal */}
        {showSendGemsModal && selectedAccount && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-navy-900 rounded-lg p-6 w-96">
              <h3 className="text-xl font-bold text-yellow-glow mb-4">
                Send Gems to {selectedAccount.username}
              </h3>
              <div className="mb-4">
                <label className="block text-sm text-neutral-300 mb-2">Amount of Gems:</label>
                <input
                  type="number"
                  value={gemsToSend}
                  onChange={(e) => setGemsToSend(e.target.value)}
                  className="w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Enter amount..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSendGems}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                >
                  Send Gems
                </button>
                <button
                  onClick={() => {
                    setShowSendGemsModal(false);
                    setSelectedAccount(null);
                    setGemsToSend('');
                  }}
                  className="flex-1 bg-navy-700 hover:bg-navy-600 text-white py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;