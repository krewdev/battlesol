
import React, { useState, useEffect, useRef } from 'react';
import type { Wallet, SiteChatMessage } from '../types';
import { getRankDetails } from '../services/rankService';
import { RANK_ICONS, SendIcon, ChevronDownIcon, ChevronUpIcon } from './Icons';

interface SiteWideChatProps {
    wallet: Wallet;
}

const mockMessages: SiteChatMessage[] = [
    { id: '1', author: { username: 'SYSTEM', avatarUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=system&radius=25', rank: 10 }, text: 'Welcome to Battle-Sol, Commanders. The chat is now online.', timestamp: Date.now() - 60000 * 5 },
    { id: '2', author: { username: 'Player_Ace', avatarUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=ace&radius=25', rank: 4 }, text: 'Finally! Anyone up for a 50 Gem wager?', timestamp: Date.now() - 60000 * 2 },
    { id: '3', author: { username: 'Viper', avatarUrl: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=viper&radius=25', rank: 7 }, text: 'Careful what you wish for, rookie. My fleet is ready.', timestamp: Date.now() - 60000 * 1 },
];

const SiteWideChat: React.FC<SiteWideChatProps> = ({ wallet }) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<SiteChatMessage[]>(mockMessages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if(!isMinimized) {
            scrollToBottom();
        }
    }, [messages, isMinimized]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if(newMessage.trim() === '' || wallet.isGuest) return;

        const message: SiteChatMessage = {
            id: Date.now().toString(),
            author: {
                username: wallet.username,
                avatarUrl: wallet.avatarUrl,
                rank: wallet.rank,
            },
            text: newMessage,
            timestamp: Date.now(),
        };

        setMessages(prev => [...prev, message]);
        setNewMessage('');
    }
    
    const MessageItem = ({ msg }: { msg: SiteChatMessage }) => {
        const rankDetails = getRankDetails(msg.author.rank);
        const RankIcon = RANK_ICONS[rankDetails.iconName] || RANK_ICONS.cadet;
        const isSelf = msg.author.username === wallet.username;

        return (
            <div className={`flex w-full items-start gap-2.5 ${isSelf ? 'flex-row-reverse' : ''}`}>
                <img className="w-8 h-8 rounded-full border-2 border-navy-700" src={msg.author.avatarUrl} alt={`${msg.author.username} avatar`} />
                <div className={`flex flex-col gap-1 w-full max-w-[280px]`}>
                    <div className={`flex items-center space-x-2 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <span className={`text-sm font-semibold text-white ${isSelf ? 'text-cyan-glow' : 'text-magenta-glow'}`}>{msg.author.username}</span>
                        <span title={rankDetails.name}>
                          <RankIcon className="w-4 h-4 text-yellow-glow" />
                        </span>
                    </div>
                    <div className={`leading-1.5 p-3 border-gray-200 rounded-e-xl rounded-es-xl ${isSelf ? 'bg-cyan-900/80 rounded-s-xl rounded-se-none' : 'bg-navy-800'}`}>
                        <p className="text-sm font-normal text-white">{msg.text}</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={`w-full bg-navy-900/80 backdrop-blur-md border border-navy-700 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ${isMinimized ? 'h-auto' : 'h-[600px]'}`}>
            <header className="flex justify-between items-center p-3 border-b border-navy-700">
                <h3 className="font-orbitron font-bold text-white uppercase">Global Chat</h3>
                <button onClick={() => setIsMinimized(!isMinimized)} className="text-neutral-400 hover:text-white">
                    {isMinimized ? <ChevronUpIcon className="w-6 h-6"/> : <ChevronDownIcon className="w-6 h-6"/>}
                </button>
            </header>
            
            {!isMinimized && (
              <>
                <div className="flex-grow p-3 space-y-4 overflow-y-auto">
                    {messages.map(msg => <MessageItem key={msg.id} msg={msg}/>)}
                    <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-navy-700">
                    <div className="flex items-center gap-2">
                        <input 
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={wallet.isGuest ? "Connect wallet to chat" : "Type a message..."}
                            className="flex-grow bg-navy-800 border border-navy-600 rounded-lg p-2 text-white placeholder-neutral-400 focus:ring-2 focus:ring-cyan-glow focus:outline-none disabled:cursor-not-allowed"
                            disabled={wallet.isGuest}
                        />
                        <button
                            type="submit"
                            className="bg-cyan-glow text-navy-900 rounded-lg p-2 transition-colors duration-200 enabled:hover:bg-white disabled:opacity-50"
                            aria-label="Send Message"
                            disabled={!newMessage.trim() || wallet.isGuest}
                        >
                            <SendIcon className="w-6 h-6" />
                        </button>
                    </div>
                </form>
              </>
            )}
        </div>
    );
};

export default SiteWideChat;
