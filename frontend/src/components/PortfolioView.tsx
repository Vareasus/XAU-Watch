"use client";

import { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, History, PieChart, ArrowUpRight, ArrowDownLeft, Ban } from 'lucide-react';
import { clsx } from 'clsx';
import { API_URL } from '../config';

interface Transaction {
    id: number;
    symbol: string;
    name: string;
    amount: number;
    price: number;
    date: string;
    type: 'buy' | 'sell';
}

interface Holding {
    symbol: string;
    name: string;
    amount: number;
    avgCost: number;
    currentPrice: number;
    currentValue: number;
    pnl: number;
    pnlPercent: number;
}

export default function PortfolioView() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [holdings, setHoldings] = useState<Holding[]>([]);
    const [prices, setPrices] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    // Fetch Prices
    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const res = await fetch(`${API_URL}/api/prices/turkey`);
                const data = await res.json();
                if (data.data) {
                    setPrices(data.data);
                }
            } catch (e) {
                console.error("Failed to fetch prices", e);
            }
        };
        fetchPrices();
        const interval = setInterval(fetchPrices, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, []);

    // Load Data & Calculate
    useEffect(() => {
        const saved = localStorage.getItem('userPortfolio');
        if (saved) {
            const parsed = JSON.parse(saved);
            setTransactions(parsed.reverse()); // Newest first
        }
        setLoading(false);
    }, []);

    // Recalculate Holdings when Prices or Transactions change
    useEffect(() => {
        if (transactions.length === 0) {
            setHoldings([]);
            return;
        }

        const map: Record<string, { amount: number, invested: number, name: string }> = {};

        // Calculate Average Cost and Amounts
        // FIFO or Weighted Average? Weighted Average is standard for simple portfolios.
        // Logic:
        // Buy: Increase amount, Increase invested (amount * price)
        // Sell: Decrease amount, Decrease invested proportionally

        // Reverse back to chronological order for calculation
        const chronTransactions = [...transactions].reverse();

        chronTransactions.forEach(tx => {
            if (!map[tx.symbol]) {
                map[tx.symbol] = { amount: 0, invested: 0, name: tx.name };
            }

            if (tx.type === 'buy') {
                map[tx.symbol].amount += tx.amount;
                map[tx.symbol].invested += tx.amount * tx.price;
            } else {
                // When selling, reduce invested amount proportionally to allow PnL realization
                // Cost basis per unit
                const avgCost = map[tx.symbol].amount > 0 ? (map[tx.symbol].invested / map[tx.symbol].amount) : 0;
                map[tx.symbol].amount -= tx.amount;
                map[tx.symbol].invested -= tx.amount * avgCost;
            }
        });

        // Generate Holdings Array
        const hList: Holding[] = [];
        Object.entries(map).forEach(([symbol, data]) => {
            if (data.amount <= 0.0001) return; // Skip empty holdings

            // Find current price
            // symbol might be 'Gram Altın'. We need to match with scraper keys or use name match
            let currentPrice = 0;

            // Try to match name in prices values
            const priceEntry = Object.values(prices).find((p: any) => p.name === data.name);
            if (priceEntry) {
                currentPrice = (priceEntry as any).selling; // Market Value
            }

            const currentValue = data.amount * currentPrice;
            const avgCost = data.invested / data.amount;
            const pnl = currentValue - data.invested;
            const pnlPercent = data.invested > 0 ? (pnl / data.invested) * 100 : 0;

            hList.push({
                symbol,
                name: data.name,
                amount: data.amount,
                avgCost,
                currentPrice,
                currentValue,
                pnl,
                pnlPercent
            });
        });

        setHoldings(hList);

    }, [transactions, prices]);

    const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
    const totalCost = holdings.reduce((sum, h) => sum + (h.amount * h.avgCost), 0);
    const totalPnL = totalValue - totalCost;
    const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
    };

    if (loading) return <div className="text-white/50 p-10">Loading portfolio...</div>;

    return (
        <div className="flex-1 glass-panel m-4 flex flex-col p-6 shadow-neon border-white/10 rounded-3xl overflow-y-auto animate-in fade-in slide-in-from-bottom-5 duration-500">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3 sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-20 py-2">
                <Wallet className="text-yellow-400" /> My Portfolio
            </h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Total Wealth */}
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border border-yellow-500/30 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -z-10 group-hover:bg-yellow-500/20 transition-all"></div>
                    <div className="text-yellow-500/70 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Wallet size={16} /> Total Wealth
                    </div>
                    <div className="text-4xl font-black text-white tracking-tight tabular-nums mt-2">
                        {formatCurrency(totalValue)}
                    </div>
                </div>

                {/* Total PnL */}
                <div className={clsx(
                    "border rounded-3xl p-6 relative overflow-hidden group transition-colors",
                    totalPnL >= 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"
                )}>
                    <div className="text-white/50 text-sm font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                        <TrendingUp size={16} /> Net Profit / Loss
                    </div>
                    <div className={clsx("text-4xl font-black tracking-tight tabular-nums mt-2 flex items-center gap-2", totalPnL >= 0 ? "text-emerald-400" : "text-rose-400")}>
                        {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                        <span className="text-sm px-2 py-1 bg-black/20 rounded-lg">%{totalPnLPercent.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Holdings List */}
            <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <PieChart size={20} className="text-blue-400" /> Current Holdings
                </h3>
                {holdings.length === 0 ? (
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-8 text-center text-white/40">
                        <Ban size={32} className="mx-auto mb-2 opacity-50" />
                        No assets in portfolio. Start trading!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {holdings.map((h, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 hover:bg-white/10 transition-colors rounded-2xl p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="font-bold text-white text-lg">{h.name}</h4>
                                    <span className="bg-black/30 text-white/70 px-2 py-1 rounded-lg text-xs font-mono">
                                        {h.amount} pcs
                                    </span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div>
                                        <div className="text-xs text-white/40 uppercase">Current Value</div>
                                        <div className="text-xl font-bold text-white">{formatCurrency(h.currentValue)}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-white/40 uppercase">P/L</div>
                                        <div className={clsx("font-bold text-sm", h.pnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
                                            {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Transaction History */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <History size={20} className="text-purple-400" /> Transaction History
                </h3>
                <div className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
                    {transactions.length === 0 ? (
                        <div className="p-8 text-center text-white/40">No transactions yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-black/20 text-white/40 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Asset</th>
                                        <th className="p-4">Amount</th>
                                        <th className="p-4">Price</th>
                                        <th className="p-4">Total</th>
                                        <th className="p-4">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {transactions.map(tx => (
                                        <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <span className={clsx(
                                                    "px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 w-fit",
                                                    tx.type === 'buy' ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
                                                )}>
                                                    {tx.type === 'buy' ? <ArrowDownLeft size={12} /> : <ArrowUpRight size={12} />}
                                                    {tx.type.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-4 font-bold text-white">{tx.name}</td>
                                            <td className="p-4 text-white/70 font-mono">{tx.amount}</td>
                                            <td className="p-4 text-white/70 font-mono">{formatCurrency(tx.price)}</td>
                                            <td className="p-4 text-white font-bold font-mono">{formatCurrency(tx.price * tx.amount)}</td>
                                            <td className="p-4 text-white/30 text-xs">
                                                {new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
