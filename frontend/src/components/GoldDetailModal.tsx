"use client";

import { X, TrendingUp, TrendingDown, Calculator, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { clsx } from "clsx";

interface GoldDetailModalProps {
    gold: any;
    allPrices?: Record<string, any>;
    onClose: () => void;
}

const getWeight = (key: string) => {
    const weights: Record<string, string> = { gram_altin: '1.00g', ceyrek_altin: '1.75g', yarim_altin: '3.50g', tam_altin: '7.00g', cumhuriyet_altin: '7.21g', ata_altin: '7.21g', gremse_altin: '17.54g', bilezik_22: '1.00g', altin_14: '1.00g' };
    return weights[key] || '-';
};

const getPurity = (key: string) => {
    const purities: Record<string, string> = { gram_altin: '0.995', ceyrek_altin: '0.916', yarim_altin: '0.916', tam_altin: '0.916', cumhuriyet_altin: '0.916', ata_altin: '0.916', gremse_altin: '0.916', bilezik_22: '0.916', altin_14: '0.585' };
    return purities[key] || '-';
};

const FALLBACK_PRICES: Record<string, any> = {
    gram_altin: { name: "Gram Altın", selling: 3000.00, buying: 2950.00, change: 0.5 },
    ceyrek_altin: { name: "Çeyrek Altın", selling: 4900.00, buying: 4800.00, change: 0.8 },
    yarim_altin: { name: "Yarım Altın", selling: 9800.00, buying: 9600.00, change: 0.8 },
    tam_altin: { name: "Tam Altın", selling: 19600.00, buying: 19100.00, change: 0.8 },
    cumhuriyet_altin: { name: "Cumhuriyet Altını", selling: 20000.00, buying: 19500.00, change: 0.5 },
    ata_altin: { name: "Ata Altın", selling: 20500.00, buying: 20000.00, change: 0.1 },
    gremse_altin: { name: "Gremse Altın", selling: 49000.00, buying: 48000.00, change: 0.4 },
    bilezik_22: { name: "22 Ayar Bilezik", selling: 2800.00, buying: 2700.00, change: 0.0 },
    altin_14: { name: "14 Ayar Altın", selling: 2000.00, buying: 1900.00, change: -0.1 },
};

export default function GoldDetailModal({ gold: initialGold, onClose, allPrices = {} }: GoldDetailModalProps) {
    const [activeGold, setActiveGold] = useState(initialGold);

    // Merge live prices with fallback to ensure we always have options
    const displayPrices = (allPrices && Object.keys(allPrices).length > 0) ? allPrices : FALLBACK_PRICES;

    const [amount, setAmount] = useState<number>(1);
    const [period, setPeriod] = useState<'1D' | '1W'>('1D');
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        setActiveGold(initialGold);
    }, [initialGold]);

    useEffect(() => {
        // Generate mock historical data based on period
        const points = period === '1D' ? 24 : 7;
        const volatility = period === '1D' ? 0.005 : 0.02;

        const data = Array.from({ length: points }, (_, i) => {
            const base = activeGold.price;
            const random = 1 + (Math.random() * volatility * 2 - volatility);
            return {
                name: period === '1D' ? `${i}:00` : `Day ${i + 1}`,
                value: base * random
            };
        });
        setChartData(data);
    }, [period, activeGold]);

    const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const key = e.target.value;
        const data = displayPrices && displayPrices[key];
        if (data) {
            const newGold = {
                name: data.name,
                price: data.selling,
                buying: data.buying,
                selling: data.selling,
                change: data.change,
                weight: getWeight(key),
                purity: getPurity(key),
                key: key
            };
            setActiveGold(newGold);
        }
    };

    if (!activeGold) return null;

    const totalBuy = amount * activeGold.price; // User buys at "Selling" price
    const totalSell = amount * (activeGold.buying || activeGold.price * 0.95); // User sells at "Buying" price (approx if missing)

    const isPositive = activeGold.change >= 0;

    const [notification, setNotification] = useState<string | null>(null);

    const handleTransaction = (type: 'buy' | 'sell') => {
        if (amount <= 0) return;

        // Get existing portfolio
        const savedPortfolio = localStorage.getItem('userPortfolio');
        let portfolio = savedPortfolio ? JSON.parse(savedPortfolio) : [];

        const symbol = activeGold.name;

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
            name: activeGold.name,
            amount: amount,
            price: type === 'buy' ? activeGold.price : (activeGold.buying || activeGold.price * 0.95),
            date: new Date().toISOString(),
            type: type
        };

        const newPortfolio = [...portfolio, transaction];
        localStorage.setItem('userPortfolio', JSON.stringify(newPortfolio));

        setNotification(`Successfully ${type === 'buy' ? 'bought' : 'sold'} ${amount} ${activeGold.name}!`);
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
                        <div className="flex items-center gap-3 mb-1">
                            {/* Asset Switcher */}
                            {displayPrices && Object.keys(displayPrices).length > 0 ? (
                                <select
                                    className="bg-transparent text-2xl font-bold text-white outline-none cursor-pointer hover:bg-white/5 rounded-lg -ml-2 px-2 py-1 appearance-none"
                                    onChange={handleSwitch}
                                    value={Object.keys(displayPrices).find(key => displayPrices[key].name === activeGold.name) || ''}
                                >
                                    {Object.entries(displayPrices).map(([key, val]: [string, any]) => (
                                        <option key={key} value={key} className="bg-[#0f172a] text-white">
                                            {val.name}
                                        </option>
                                    ))}
                                    {/* Create a fallback option if the current activeGold isn't in displayPrices */}
                                    {!Object.values(displayPrices).find((p: any) => p.name === activeGold.name) && (
                                        <option value="" className="bg-[#0f172a] text-white">{activeGold.name}</option>
                                    )}
                                </select>
                            ) : (
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    {activeGold.name}
                                </h2>
                            )}

                            <span className={clsx(
                                "text-sm px-2 py-1 rounded-lg flex items-center gap-1 h-fit",
                                isPositive ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                            )}>
                                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {Math.abs(activeGold.change)}%
                            </span>
                        </div>
                        <p className="text-white/50 text-sm mt-1">{activeGold.weight || getWeight(activeGold.key)} • {activeGold.purity || getPurity(activeGold.key)} Purity</p>
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
                                ₺{activeGold.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="glass-panel p-4 rounded-2xl bg-rose-500/5 border-rose-500/20 border">
                            <span className="text-rose-400/70 text-sm font-bold uppercase tracking-wider">Bank Buying (You Sell)</span>
                            <div className="text-2xl font-black text-rose-400 mt-1">
                                ₺{(activeGold.buying || activeGold.price * 0.98).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
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
                                    ₺{(amount * activeGold.price).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
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
