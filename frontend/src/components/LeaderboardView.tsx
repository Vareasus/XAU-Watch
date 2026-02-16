"use client";

import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { clsx } from "clsx";
import { API_URL } from '../config';


interface UserHolding {
    name: string;
    holdings: { type: string; count: number }[];
    totalValue?: number;
}

const predefinedUsers: UserHolding[] = [
    {
        name: "Selo",
        holdings: [
            { type: 'ata', count: 15 },
            { type: 'gram', count: 2 },
            { type: 'quarter', count: 2 },
            { type: 'half', count: 2 },
            { type: 'gremse', count: 1 }
        ]
    },
    {
        name: "Anıl",
        holdings: [
            { type: 'ata', count: 15 },
            { type: 'quarter', count: 9 },
            { type: 'gram', count: 2 }
        ]
    },
    {
        name: "Ayça",
        holdings: [
            { type: 'gram', count: 3 }
        ]
    }
];

export default function LeaderboardView() {
    const [users, setUsers] = useState<UserHolding[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPricesAndCalculate = async () => {
            try {
                // Fetch prices from backend
                const res = await fetch(`${API_URL}/api/prices/turkey`);
                const data = await res.json();

                let prices: Record<string, number> = {};

                if (data.data && Object.keys(data.data).length > 0) {
                    // Use real data
                    Object.entries(data.data).forEach(([key, val]: [string, any]) => {
                        prices[key] = val.selling; // Use SELLING price (Market Value) as requested
                    });
                } else {
                    // Fallback prices if API fails or empty
                    prices = {
                        gram: 7350.00,
                        quarter: 12100.00,
                        half: 24200.00,
                        ata: 50100.00,
                        gremse: 120500.00
                    };
                }

                // Calculate totals
                const calculatedUsers = predefinedUsers.map(user => {
                    let total = 0;
                    user.holdings.forEach(h => {
                        const price = prices[h.type] || 0;
                        total += price * h.count;
                    });
                    return { ...user, totalValue: total };
                });

                // Sort by total value descending
                calculatedUsers.sort((a, b) => (b.totalValue || 0) - (a.totalValue || 0));

                setUsers(calculatedUsers);
                setLoading(false);

            } catch (e) {
                console.error("Failed to calculate leaderboard", e);
                setLoading(false);
            }
        };

        fetchPricesAndCalculate();
        // Refresh every minute
        const interval = setInterval(fetchPricesAndCalculate, 60000);
        return () => clearInterval(interval);
    }, []);

    const getMedalColor = (index: number) => {
        switch (index) {
            case 0: return "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]";
            case 1: return "text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.5)]";
            case 2: return "text-amber-600 drop-shadow-[0_0_10px_rgba(180,83,9,0.5)]";
            default: return "text-white/20";
        }
    };

    const getHoldingName = (key: string) => {
        const names: Record<string, string> = {
            ata: 'Ata Altın',
            gremse: 'Gremse Altın',
            half: 'Yarım Altın',
            quarter: 'Çeyrek Altın',
            gram: 'Gram Altın'
        };
        return names[key] || key;
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            notation: 'compact',
            maximumFractionDigits: 2
        }).format(value);
    };

    return (
        <div className="flex-1 glass-panel m-4 flex flex-col p-6 shadow-neon border-white/10 rounded-3xl overflow-y-auto animate-in fade-in slide-in-from-bottom-5 duration-500">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-20 py-2">
                <Trophy className="text-yellow-400" /> Leaderboard
            </h2>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-white/50">Calculating wealth...</div>
            ) : (
                <div className="overflow-x-auto pb-4">
                    <div className="space-y-4 min-w-[600px]">
                        {users.map((user, index) => (
                            <div
                                key={user.name}
                                className={clsx(
                                    "relative flex items-center justify-between p-6 rounded-3xl border transition-all hover:scale-[1.01] group overflow-hidden",
                                    index === 0 ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/20 border-yellow-500/30" :
                                        index === 1 ? "bg-white/5 border-white/10" :
                                            index === 2 ? "bg-white/5 border-white/10" : "bg-white/5 border-white/5"
                                )}
                            >
                                {/* Background Glow for 1st place */}
                                {index === 0 && <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>}

                                <div className="flex items-center gap-6">
                                    <div className={clsx("text-4xl font-black w-12 text-center flex justify-center", getMedalColor(index))}>
                                        {index === 0 ? <Crown size={42} /> : `#${index + 1}`}
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                                            {user.name}
                                            {index === 0 && <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">Leader</span>}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {user.holdings.map((h, i) => (
                                                <span key={i} className="text-xs font-mono text-white/60 bg-black/30 px-2 py-1 rounded-lg border border-white/5 flex items-center gap-1">
                                                    <span className="text-yellow-500 font-bold">{h.count}x</span> {getHoldingName(h.type)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right pl-4">
                                    <div className="text-sm text-white/40 uppercase font-bold tracking-wider mb-1">Total Wealth</div>
                                    <div className={clsx(
                                        "text-3xl font-black tracking-tighter tabular-nums whitespace-nowrap",
                                        index === 0 ? "text-yellow-400" : "text-white"
                                    )}>
                                        {formatCurrency(user.totalValue || 0)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
