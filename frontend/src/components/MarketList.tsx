"use client";

import { useState, useEffect } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ChevronUp, ChevronDown, Bell, Volume2 } from 'lucide-react';
import { clsx } from 'clsx';

// Initial data
const initialAssets = [
    { symbol: "XAU", name: "Gold Spot", price: 2024.50, change: 0.84, trend: 'up' },
    { symbol: "GC=F", name: "Gold Futures", price: 2035.10, change: 0.92, trend: 'up' },
    { symbol: "XAG", name: "Silver Spot", price: 22.45, change: -1.2, trend: 'down' },
    { symbol: "XPT", name: "Platinum", price: 890.12, change: 0.5, trend: 'up' },
    { symbol: "XPD", name: "Palladium", price: 950.45, change: -0.8, trend: 'down' },
    { symbol: "GLD", name: "SPDR Gold Shares", price: 188.45, change: 0.7, trend: 'up' },
];

// Mock chart data for sparklines
const mockSparklineData = Array(20).fill(0).map(() => ({ value: Math.random() * 100 }));

export default function MarketList() {
    const [assets, setAssets] = useState(initialAssets);

    // Simulate live price updates
    useEffect(() => {
        const interval = setInterval(() => {
            setAssets(prev => prev.map(asset => {
                const volatility = Math.random() * 0.002; // 0.2% max change
                const direction = Math.random() > 0.5 ? 1 : -1;
                const newPrice = asset.price * (1 + volatility * direction);

                return {
                    ...asset,
                    price: newPrice,
                    trend: direction > 0 ? 'up' : 'down'
                };
            }));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-80 glass-panel m-4 mt-0 mb-4 px-4 py-6 border-white/10 flex flex-col h-full overflow-hidden shrink-0 shadow-neon">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-white tracking-widest uppercase opacity-80">Precious Metals</span>
                <div className="flex gap-2">
                    <Bell size={14} className="text-white/40 hover:text-white cursor-pointer" />
                    <Volume2 size={14} className="text-white/40 hover:text-white cursor-pointer" />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto w-full no-scrollbar space-y-3">
                {assets.map((asset) => (
                    <div
                        key={asset.symbol}
                        className={clsx(
                            "glass-button flex items-center justify-between p-3 cursor-pointer group hover:bg-white/10 transition-all duration-300 transform rounded-2xl border border-white/5",
                            asset.trend === 'up'
                                ? "shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                                : "shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                        )}
                    >
                        <div className="flex items-center gap-3 w-1/3">
                            <div className={clsx(
                                "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg",
                                asset.trend === 'up' ? "bg-gradient-to-br from-green-400 to-emerald-600" : "bg-gradient-to-br from-red-400 to-rose-600"
                            )}>
                                {asset.symbol.substring(0, 1)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white">{asset.symbol}</span>
                                <span className="text-[10px] text-white/50">{asset.name}</span>
                            </div>
                        </div>

                        {/* Sparkline */}
                        <div className="w-16 h-8 opacity-50 group-hover:opacity-100 transition-opacity">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mockSparklineData}>
                                    <defs>
                                        <linearGradient id={`gradient-${asset.symbol}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={asset.trend === 'up' ? '#34d399' : '#f87171'} stopOpacity={0.8} />
                                            <stop offset="95%" stopColor={asset.trend === 'up' ? '#34d399' : '#f87171'} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke={asset.trend === 'up' ? '#34d399' : '#f87171'}
                                        fill={`url(#gradient-${asset.symbol})`}
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Price */}
                        <div className="flex flex-col items-end w-1/4">
                            <span
                                className={clsx(
                                    "text-sm font-bold transition-colors duration-300 drop-shadow-md",
                                    asset.trend === 'up' ? "text-green-400" : "text-rose-400"
                                )}
                            >
                                {asset.price.toFixed(asset.price < 10 ? 4 : 2)}
                            </span>
                            <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                {asset.trend === 'up'
                                    ? <ChevronUp size={10} className="text-green-400" />
                                    : <ChevronDown size={10} className="text-rose-400" />
                                }
                                <span
                                    className={clsx(
                                        "text-[10px] font-bold",
                                        asset.trend === 'up' ? "text-green-400" : "text-rose-400"
                                    )}
                                >
                                    {Math.abs(asset.change)}%
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
