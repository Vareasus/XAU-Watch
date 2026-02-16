"use client";

import { useState } from 'react';
import { Search, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from "clsx";

const marketItems = [
    { symbol: "XAU/USD", name: "Gold Spot vs US Dollar", type: "Forex", price: 5043.11, change: 0.84 },
    { symbol: "XAG/USD", name: "Silver Spot vs US Dollar", type: "Forex", price: 23.45, change: -1.2 },
    { symbol: "TRY/XAU", name: "Turkish Lira Gold Gram", type: "Commodity", price: 2450.50, change: 1.5 },
    { symbol: "GC=F", name: "Gold Futures", type: "Futures", price: 5055.20, change: 0.9 },
    { symbol: "GLD", name: "SPDR Gold Shares", type: "ETF", price: 188.45, change: 0.7 },
    { symbol: "BTC/USD", name: "Bitcoin vs US Dollar", type: "Crypto", price: 67890.12, change: -2.5 },
];

export default function SearchView() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredItems = marketItems.filter(item =>
        item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex-1 glass-panel m-4 flex flex-col p-8 shadow-neon border-white/10 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                <Search className="text-yellow-400" /> Search Markets
            </h2>

            {/* Search Input */}
            <div className="relative mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                    type="text"
                    placeholder="Search by symbol or name (e.g. XAU, Gold, TRY)..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-yellow-400/50 focus:bg-white/10 transition-all text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-yellow-400/20 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white font-bold border border-white/10">
                                    {item.symbol.substring(0, 2)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">{item.symbol}</h3>
                                    <p className="text-white/40 text-sm">{item.name} • <span className="text-yellow-400/80">{item.type}</span></p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <span className="block font-bold text-white text-lg">${item.price.toFixed(2)}</span>
                                    <span className={clsx("text-sm font-medium flex items-center justify-end gap-1", item.change >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                        {item.change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                        {Math.abs(item.change)}%
                                    </span>
                                </div>
                                <ChevronRight className="text-white/20 group-hover:text-white transition-colors" />
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 text-white/30">
                        No markets found matching "{searchTerm}"
                    </div>
                )}
            </div>
        </div>
    );
}
