
import React, { useState, useEffect } from 'react';
import type { GameMode, Nft, ChatMessage } from '../types';
import ChatBox from './ChatBox';
import { getAiChatReply } from '../services/geminiService';

interface MatchmakingModalProps {
  mode: GameMode;
  onClose: () => void;
  onStartGame: (mode: GameMode, wager: number, selectedNft: Nft | null) => void;
  ownedNfts: Nft[];
}

const WAGER_AMOUNTS = [10, 25, 50, 100];

const MatchmakingModal: React.FC<MatchmakingModalProps> = ({ mode, onClose, onStartGame, ownedNfts }) => {
  const [wager, setWager] = useState<number>(WAGER_AMOUNTS[0]);
  const [selectedNftId, setSelectedNftId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  const isOnlinePvp = mode === 'Online PvP (Simulated)';

  useEffect(() => {
    if (isOnlinePvp) {
      setMessages([{ author: 'ai', text: "Another challenger? Let's see if you're worth my time. Make your preparations." }]);
    }
  }, [isOnlinePvp]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = { author: 'user', text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsAiTyping(true);

    const geminiHistory = newMessages.map(m => ({
        role: m.author === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: m.text }]
    }));
    
    try {
        const aiReplyText = await getAiChatReply(geminiHistory);
        const aiMessage: ChatMessage = { author: 'ai', text: aiReplyText };
        setMessages(prev => [...prev, aiMessage]);
    } catch(e) {
        console.error("Failed to get AI reply", e);
        const errorMessage: ChatMessage = { author: 'ai', text: "My comms are failing... lucky you."};
        setMessages(prev => [...prev, errorMessage]);
    } finally {
        setIsAiTyping(false);
    }
  };

  const handleStart = () => {
    const selectedNft = ownedNfts.find(nft => nft.id === selectedNftId) || null;
    onStartGame(mode, wager, selectedNft);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-navy-800 border border-navy-700 rounded-2xl shadow-lg w-full max-w-md p-8 m-4 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-orbitron font-bold text-white uppercase">{mode}</h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-white text-3xl leading-none">&times;</button>
        </div>

        {isOnlinePvp && (
          <div className="mb-6 flex-grow min-h-[200px]">
            <ChatBox 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isSending={isAiTyping} 
            />
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-bold text-neutral-300 mb-2 uppercase tracking-wider">Set Your Wager ($SHIP)</label>
          <div className="grid grid-cols-4 gap-2">
            {WAGER_AMOUNTS.map(amount => (
              <button
                key={amount}
                onClick={() => setWager(amount)}
                className={`py-3 rounded-lg font-bold transition-colors duration-200 ${
                  wager === amount ? 'bg-cyan-glow text-navy-900 shadow-cyan' : 'bg-navy-700 hover:bg-navy-700/50'
                }`}
              >
                {amount}
              </button>
            ))}
          </div>
        </div>

        {mode === 'Player vs AI' && ownedNfts.length > 0 ? (
            <div className="mb-8">
                <label className="block text-sm font-bold text-neutral-300 mb-2 uppercase tracking-wider">Select NFT Advantage</label>
                <select 
                    value={selectedNftId || ''}
                    onChange={(e) => setSelectedNftId(e.target.value || null)}
                    className="w-full bg-navy-700 border border-navy-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-cyan-glow focus:outline-none"
                >
                    <option value="">None</option>
                    {ownedNfts.map(nft => (
                        <option key={nft.id} value={nft.id}>{nft.name}</option>
                    ))}
                </select>
            </div>
        ) : (isOnlinePvp &&
            <div className="mb-8 text-center bg-navy-900/50 p-3 rounded-lg">
                <p className="text-neutral-400 text-sm">NFT Advantages are disabled in PvP mode for fair play.</p>
            </div>
        )}

        <button
          onClick={handleStart}
          className="w-full bg-magenta-glow text-white font-bold font-orbitron py-3 px-8 rounded-lg uppercase tracking-wider transition-all duration-300 hover:bg-magenta-glow/80 hover:shadow-magenta"
        >
          {isOnlinePvp ? 'Start PvP Match' : 'Find Match'}
        </button>
      </div>
    </div>
  );
};

export default MatchmakingModal;
