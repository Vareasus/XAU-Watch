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

    const [notification, setNotification] = useState<string | null>(null);

    const handleTransaction = (type: 'buy' | 'sell') => {
        if (amount <= 0) return;

        // Get existing portfolio
        const savedPortfolio = localStorage.getItem('userPortfolio');
        let portfolio = savedPortfolio ? JSON.parse(savedPortfolio) : [];

        // Determine symbol key (this requires gold object to have a key, or we generate one)
        // Since we don't have the explicit key passed in props, we can try to derive it or use name
        // Ideally the parent should pass the key, but name is unique enough for now.
        const symbol = gold.name;

        if (type === 'sell') {
            // Check formatted ownership
            const currentOwned = portfolio
                .filter((p: any) => p.symbol === symbol)
                .reduce((acc: number, curr: any) => curr.type === 'buy' ? acc + curr.amount : acc - curr.amount, 0);

            if (currentOwned < amount) {
                setNotification("Insufficient balance to sell!");
                setTimeout(() => setNotification(null), 3000);
                return;
            }
        }

        const transaction = {
            id: Date.now(),
            symbol: symbol,
            name: gold.name,
            amount: amount,
            price: type === 'buy' ? gold.price : (gold.buying || gold.price * 0.95),
            date: new Date().toISOString(),
            type: type
        };

        const newPortfolio = [...portfolio, transaction];
        localStorage.setItem('userPortfolio', JSON.stringify(newPortfolio));

        setNotification(`Successfully ${type === 'buy' ? 'bought' : 'sold'} ${amount} ${gold.name}!`);
        setTimeout(() => {
            setNotification(null);
            onClose(); // Close modal on success
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center pt-8 p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0f172a] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Notification Toast */}
                {notification && (
                    <div className={clsx(
                        "absolute top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg z-50 font-bold transition-all animate-in slide-in-from-top-5",
                        notification.includes("Insufficient") ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                    )}>
                        {notification}
                    </div>
                )}

                {/* Header */}
                <div className="p-6 pt-8 border-b border-white/5 flex justify-between items-center bg-white/5">
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

                    {/* Transaction Section */}
                    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-2xl p-6 border border-white/10 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Calculator size={18} className="text-indigo-400" /> Trade Simulation
                            </h3>
                            <div className="text-xs text-white/40 uppercase tracking-widest font-bold">Virtual Portfolio</div>
                        </div>

                        <div className="flex items-center gap-4 bg-black/20 p-4 rounded-xl border border-white/5">
                            <div className="flex-1">
                                <label className="text-white/50 text-xs uppercase font-bold block mb-2">Quantity</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        value={amount}
                                        onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                                        className="bg-transparent text-2xl font-mono text-white w-full outline-none placeholder-white/20"
                                        placeholder="0"
                                    />
                                    <span className="text-white/30 font-bold">Pcs</span>
                                </div>
                            </div>
                            <div className="h-10 w-px bg-white/10"></div>
                            <div className="flex-1 text-right">
                                <label className="text-white/50 text-xs uppercase font-bold block mb-1">Estimated Total</label>
                                <div className="text-xl font-bold text-white tabular-nums">
                                    ₺{(amount * gold.price).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleTransaction('buy')}
                                disabled={amount <= 0}
                                className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                            >
                                Buy (Al)
                            </button>
                            <button
                                onClick={() => handleTransaction('sell')}
                                disabled={amount <= 0}
                                className="bg-rose-500 hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-rose-500/20"
                            >
                                Sell (Sat)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
