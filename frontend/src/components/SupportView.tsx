"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

const initialMessages: Message[] = [
    { id: 1, text: "Hello! I'm AurumBot, your AI market assistant. How can I help you with gold prices or market analysis today?", sender: 'bot', timestamp: new Date() }
];

export default function SupportView() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now(),
            text: input,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate LLM response delay
        setTimeout(() => {
            const botResponse = generateResponse(userMsg.text);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: botResponse,
                sender: 'bot',
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 1500);
    };

    const generateResponse = (query: string): string => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('gold') || lowerQuery.includes('price')) {
            return "The current spot price of Gold (XAU/USD) is approximately $5043.11. Market volatility is moderate. Would you like a technical analysis?";
        }
        if (lowerQuery.includes('buy') || lowerQuery.includes('sell')) {
            return "Based on current RSI levels (65), gold is approaching overbought territory. However, long-term trends remain bullish. Please consult a financial advisor for specific advice.";
        }
        if (lowerQuery.includes('gram') || lowerQuery.includes('try')) {
            return "Gram Gold in TRY is currently trading around 3250 TRY. This is calculated based on the global spot price.";
        }
        if (lowerQuery.includes('thank')) {
            return "You're welcome! Let me know if you need anything else.";
        }
        return "I can assist with real-time gold data, market sentiment, and technical indicators. What specifically are you interested in?";
    };

    return (
        <div className="flex-1 glass-panel m-4 flex flex-col shadow-neon border-white/10 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500 relative">
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-md z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Bot size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-lg">Aurum Support AI</h2>
                        <span className="text-emerald-400 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span> Online
                        </span>
                    </div>
                </div>
                <button className="text-white/40 hover:text-white transition-colors">
                    <HelpCircle size={24} />
                </button>
            </div>

            {/* Messages Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth"
            >
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={clsx(
                            "flex w-full",
                            msg.sender === 'user' ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={clsx(
                            "max-w-[80%] rounded-2xl p-4 shadow-md backdrop-blur-sm border border-white/5 flex gap-3",
                            msg.sender === 'user'
                                ? "bg-blue-600 text-white rounded-tr-none"
                                : "bg-white/10 text-gray-100 rounded-tl-none"
                        )}>
                            {msg.sender === 'bot' && <Bot size={16} className="mt-1 shrink-0 text-blue-300" />}
                            <div className="flex flex-col">
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <span className="text-[10px] opacity-50 mt-1 self-end">
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            {msg.sender === 'user' && <User size={16} className="mt-1 shrink-0 text-blue-200" />}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start w-full">
                        <div className="bg-white/10 rounded-2xl p-4 rounded-tl-none flex items-center gap-1 w-16 h-10">
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                            <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/5 border-t border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-3 bg-white/5 rounded-2xl px-4 py-2 border border-white/10 focus-within:border-blue-500/50 focus-within:bg-white/10 transition-all shadow-inner">
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/30 py-2"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
