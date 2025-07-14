
import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon } from './Icons';

interface ChatBoxProps {
    messages: ChatMessage[];
    onSendMessage: (text: string) => void;
    isSending: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, onSendMessage, isSending }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (input.trim() && !isSending) {
            onSendMessage(input);
            setInput('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    }

    return (
        <div className="bg-navy-900/70 border border-navy-700 rounded-lg p-3 flex flex-col h-full">
            <div className="flex-grow overflow-y-auto pr-2 space-y-3">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.author === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[80%] rounded-lg px-3 py-2 ${msg.author === 'user' ? 'bg-cyan-glow/80 text-navy-900' : 'bg-navy-700 text-white'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isSending && (
                     <div className="flex items-start">
                        <div className="bg-navy-700 text-white rounded-lg px-3 py-2">
                           <p className="text-sm italic animate-pulse">Cmdr. Cypher is typing...</p>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-3 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Send a message..."
                    disabled={isSending}
                    className="flex-grow bg-navy-700 border border-navy-600 rounded-lg p-2 text-white placeholder-neutral-400 focus:ring-2 focus:ring-cyan-glow focus:outline-none disabled:opacity-50"
                />
                <button
                    onClick={handleSend}
                    disabled={isSending || !input.trim()}
                    className="bg-cyan-glow text-navy-900 rounded-lg p-2 transition-colors duration-200 enabled:hover:bg-white disabled:opacity-50"
                    aria-label="Send Message"
                >
                    <SendIcon className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export default ChatBox;
