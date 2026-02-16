"use client";

import { X, TrendingUp, TrendingDown, Calculator, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { clsx } from "clsx";

interface GoldDetailModalProps {
    gold: any;
    onClose: () => void;
}

export default function GoldDetailModal({ gold, onClose }: GoldDetailModalProps) {
    const [amount, setAmount] = useState<number>(1);
    const [period, setPeriod] = useState<'1D' | '1W'>('1D');
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        // Generate mock historical data based on period
        const points = period === '1D' ? 24 : 7;
        const volatility = period === '1D' ? 0.005 : 0.02;

        const data = Array.from({ length: points }, (_, i) => {
            const base = gold.price;
            const random = 1 + (Math.random() * volatility * 2 - volatility);
            return {
                name: period === '1D' ? `${i}:00` : `Day ${i + 1}`,
                value: base * random
            };
        });
        setChartData(data);
    }, [period, gold]);

    if (!gold) return null;

    const totalBuy = amount * gold.price; // User buys at "Selling" price
    const totalSell = amount * (gold.buying || gold.price * 0.95); // User sells at "Buying" price (approx if missing)

    const isPositive = gold.change >= 0;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            {gold.name}
                            <span className={clsx(
                                "text-sm px-2 py-1 rounded-lg flex items-center gap-1",
                                isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                            )}>
                                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {Math.abs(gold.change)}%
                            </span>
                        </h2>
                        <p className="text-white/50 text-sm mt-1">{gold.weight} • {gold.purity} Purity</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="text-white/70" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-8">

                    {/* Prices Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="glass-panel p-4 rounded-2xl bg-emerald-500/5 border-emerald-500/20 border">
                            <span className="text-emerald-400/70 text-sm font-bold uppercase tracking-wider">Bank Selling (You Buy)</span>
                            <div className="text-2xl font-black text-emerald-400 mt-1">
                                ₺{gold.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl bg-rose-500/5 border-rose-500/20 border">
                            <span className="text-rose-400/70 text-sm font-bold uppercase tracking-wider">Bank Buying (You Sell)</span>
                            <div className="text-2xl font-black text-rose-400 mt-1">
                                ₺{(gold.buying || gold.price * 0.98).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    {/* Chart Section */}
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <TrendingUp size={18} className="text-yellow-400" /> Price History
                            </h3>
                            <div className="flex gap-1 bg-black/20 p-1 rounded-lg">
                                {['1D', '1W'].map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPeriod(p as any)}
                                        className={clsx(
                                            "px-3 py-1 text-xs font-bold rounded-md transition-all",
                                            period === p ? "bg-yellow-500 text-black" : "text-white/50 hover:text-white"
                                        )}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis domain={['auto', 'auto']} stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₺${val}`} width={60} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                        itemStyle={{ color: '#facc15' }}
                                        labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                                        formatter={(val: any) => [`₺${Number(val).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`, 'Price']}
                                    />
                                    <Area type="monotone" dataKey="value" stroke="#facc15" strokeWidth={2} fill="url(#chartGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Calculator Section */}
                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/10">
                        <h3 className="text-white font-bold flex items-center gap-2 mb-4">
                            <Calculator size={18} className="text-indigo-400" /> Calculate Value
                        </h3>

                        <div className="flex items-center gap-4 mb-6">
                            <label className="text-white/70 text-sm">Quantity:</label>
                            <input
                                type="number"
                                min="0"
                                value={amount}
                                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                                className="bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-white font-mono w-32 focus:outline-none focus:border-yellow-500/50"
                            />
                            <span className="text-white/50 text-sm">pieces</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 p-4 rounded-xl">
                                <div className="text-white/50 text-xs uppercase mb-1">Total Cost to Buy</div>
                                <div className="text-xl font-bold text-emerald-400 tabular-nums">
                                    ₺{totalBuy.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                            <div className="bg-black/20 p-4 rounded-xl">
                                <div className="text-white/50 text-xs uppercase mb-1">Total Value to Sell</div>
                                <div className="text-xl font-bold text-rose-400 tabular-nums">
                                    ₺{totalSell.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
