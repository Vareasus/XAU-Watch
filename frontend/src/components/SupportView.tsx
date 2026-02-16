"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { API_URL } from '../config';

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
    const [prices, setPrices] = useState<Record<string, any>>({});

    useEffect(() => {
        // Fetch real prices for the bot context
        const fetchPrices = async () => {
            try {
                const res = await fetch(`${API_URL}/api/prices/turkey`);
                const data = await res.json();
                if (data.data) {
                    setPrices(data.data); // Store key -> { selling, buying, name, change }
                }
            } catch (e) {
                console.error("Bot failed to fetch prices", e);
            }
        };
        fetchPrices();
    }, []);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userText = input;
        const userMsg: Message = {
            id: Date.now(),
            text: userText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate "thinking"
        setTimeout(() => {
            const botResponse = generateSmartResponse(userText);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: botResponse,
                sender: 'bot',
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 1000 + Math.random() * 1000);
    };

    const generateSmartResponse = (query: string): string => {
        const q = query.toLowerCase();

        // 1. Greetings
        if (q.match(/^(merhaba|selam|hi|hello|hey)/)) {
            return "Merhaba! Size güncel altın fiyatları, piyasa analizleri ve portföy durumu hakkında yardımcı olabilirim. Ne öğrenmek istersiniz?";
        }

        // 2. Price Queries (Dynamic)
        // Check for specific gold types
        const typeMap: Record<string, string> = {
            'gram': 'gram_altin',
            'çeyrek': 'ceyrek_altin',
            'ceyrek': 'ceyrek_altin',
            'yarım': 'yarim_altin',
            'yarim': 'yarim_altin',
            'tam': 'tam_altin', // Adjust if key differs
            'ata': 'ata_altin',
            'gremse': 'gremse_altin',
            'cumhuriyet': 'cumhuriyet_altini',
            'bilezik': 'billezik_22', // Adjust key
            '22 ayar': 'bilezik_22'
        };

        let foundKey = Object.keys(typeMap).find(k => q.includes(k));

        if (foundKey) {
            const apiKey = typeMap[foundKey];
            const priceInfo = prices[apiKey];

            if (priceInfo) {
                const sellPrice = priceInfo.selling?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
                const buyPrice = priceInfo.buying?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });

                if (q.includes('al') || q.includes('boz')) {
                    return `${priceInfo.name} bozdururken (banka alış) yaklaşık ${buyPrice}, alırken ise ${sellPrice} seviyesindedir.`;
                }
                return `${priceInfo.name} şu an piyasada ${sellPrice} satış fiyatından işlem görüyor.`;
            } else {
                // Try fuzzy search in prices if exact map fails
                const fuzzyKey = Object.keys(prices).find(k => k.includes(foundKey!) || prices[k].name?.toLowerCase().includes(foundKey!));
                if (fuzzyKey) {
                    const p = prices[fuzzyKey];
                    return `${p.name} güncel fiyatı: ${p.selling?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}`;
                }
            }
        }

        // 3. General "Gold" query
        if (q.includes('altın') || q.includes('gold') || q.includes('piyasa')) {
            const gram = prices['gram_altin']?.selling;
            if (gram) {
                return `Altın piyasası hareketli. Gram altın şu an ${gram.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} seviyesinde. Diğer çeşitleri sormak ister misiniz? (Örn: Çeyrek, Ata)`;
            }
            return "Piyasa verilerini şu an güncelliyorum, birazdan tekrar deneyin.";
        }

        // 4. Investment Advice (Safety)
        if (q.includes('yatırım') || q.includes('almalı mı') || q.includes('düşer mi') || q.includes('çıkar mı')) {
            return "Yapay zeka asistanı olarak doğrudan yatırım tavsiyesi veremem. Ancak teknik göstergeler piyasanın volatilitesini gösteriyor. Karar vermeden önce güncel grafikleri incelemenizi öneririm.";
        }

        // 5. Fallback / "Chat GPT style" phrasing
        const fallbacks = [
            "Bunu tam anlayamadım, ama altın fiyatları hakkında sorarsan yardımcı olabilirim.",
            "Detaylı analiz için grafikleri kontrol edebilirsin. Belirli bir altın türü sormak ister misin?",
            "Şu an veritabanımda bu bilgi yok. Ama Gram, Çeyrek veya Ata altın fiyatlarını sorabilirsin."
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
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
