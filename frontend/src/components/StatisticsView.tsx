"use client";

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Coins, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { clsx } from "clsx";
import { API_URL } from '../config';

import GoldDetailModal from './GoldDetailModal';

// Mock Data for Sparklines
const generateSparkline = () => Array.from({ length: 20 }, (_, i) => ({
    value: 5000 + Math.random() * 500 - 250
}));

export default function StatisticsView() {


    const [goldTypes, setGoldTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedGold, setSelectedGold] = useState<any>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchPrices = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

            try {
                const res = await fetch(`${API_URL}/api/prices/turkey`, {
                    signal: controller.signal
                });
                const data = await res.json();

                if (isMounted) {
                    if (data.data && Object.keys(data.data).length > 0) {
                        const mapped = Object.entries(data.data).map(([key, val]: [string, any]) => ({
                            name: val.name,
                            key: key,
                            weight: getWeight(key),
                            purity: getPurity(key),
                            price: val.selling,
                            change: val.change || 0.5,
                            data: generateSparkline()
                        }));
                        setGoldTypes(mapped);
                    } else {
                        throw new Error("Empty data");
                    }
                }
            } catch (e) {
                if (isMounted) {
                    console.warn("Using fallback data due to fetch error:", e);
                    setGoldTypes([
                        { name: "Gram Altın", weight: "1.00g", purity: "0.995", price: 7350.00, change: 1.2, data: generateSparkline() },
                        { name: "Çeyrek Altın", weight: "1.75g", purity: "0.916", price: 12100.00, change: 0.8, data: generateSparkline() },
                        { name: "Yarım Altın", weight: "3.50g", purity: "0.916", price: 24200.00, change: 0.5, data: generateSparkline() },
                        { name: "Tam Altın", weight: "7.00g", purity: "0.916", price: 48000.00, change: 0.3, data: generateSparkline() },
                        { name: "Cumhuriyet", weight: "7.21g", purity: "0.916", price: 49500.00, change: -0.2, data: generateSparkline() },
                        { name: "Ata Altın", weight: "7.21g", purity: "0.916", price: 50100.00, change: 0.1, data: generateSparkline() },
                        { name: "Gremse Altın", weight: "17.54g", purity: "0.916", price: 120500.00, change: 0.4, data: generateSparkline() },
                        { name: "22 Ayar Bilezik", weight: "1.00g", purity: "0.916", price: 6800.00, change: 0.0, data: generateSparkline() },
                        { name: "14 Ayar Altın", weight: "1.00g", purity: "0.585", price: 4500.00, change: -0.1, data: generateSparkline() },
                    ]);
                }
            } finally {
                clearTimeout(timeoutId);
                if (isMounted) setLoading(false);
            }
        };

        fetchPrices();
        const interval = setInterval(fetchPrices, 30000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, []);

    const getWeight = (key: string) => {
        const weights: Record<string, string> = { gram: '1.00g', quarter: '1.75g', half: '3.50g', full: '7.00g', republic: '7.21g', ata: '7.21g', gremse: '17.54g', bracelet_22: '1.00g', gold_14: '1.00g' };
        return weights[key] || '-';
    };

    const getPurity = (key: string) => {
        const purities: Record<string, string> = { gram: '0.995', quarter: '0.916', half: '0.916', full: '0.916', republic: '0.916', ata: '0.916', gremse: '0.916', bracelet_22: '0.916', gold_14: '0.585' };
        return purities[key] || '-';
    };

    return (
        <div className="flex-1 glass-panel m-4 flex flex-col p-6 shadow-neon border-white/10 rounded-3xl overflow-y-auto">
            <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3 sticky top-0 bg-[#0f172a]/90 backdrop-blur-xl z-20 py-2">
                <Coins className="text-yellow-400" /> Turkish Market Statistics (TRY)
            </h2>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-white/50">Loading prices...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-6">
                    {goldTypes.map((gold, index) => (
                        <div
                            key={index}
                            className="glass-button p-5 rounded-3xl flex flex-col justify-between group hover:bg-white/10 transition-all hover:scale-[1.02] border border-white/5 shadow-lg relative overflow-hidden"
                        >
                            {/* Background Gradient */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl -z-10 group-hover:bg-yellow-500/10 transition-all"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-white text-lg tracking-wide">{gold.name}</h3>
                                    <span className="text-xs text-white/40 font-mono">{gold.weight} • {gold.purity}</span>
                                </div>
                                <div className={clsx(
                                    "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-md border border-white/5",
                                    gold.change >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                                )}>
                                    {gold.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {Math.abs(gold.change)}%
                                </div>
                            </div>

                            <div className="mb-4">
                                <div className="text-2xl font-black text-white tracking-tighter tabular-nums drop-shadow-sm">
                                    ₺{Number(gold.price).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-[10px] text-white/30 uppercase tracking-widest mt-1">Current Price</div>
                            </div>

                            {/* Sparkline */}
                            <div className="h-16 w-full opacity-50 group-hover:opacity-100 transition-opacity">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={gold.data}>
                                        <defs>
                                            <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#facc15" stopOpacity={0.4} />
                                                <stop offset="100%" stopColor="#facc15" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke="#facc15"
                                            fill={`url(#gradient-${index})`}
                                            strokeWidth={2}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <button
                                onClick={() => setSelectedGold(gold)}
                                className="mt-4 w-full py-2 bg-white/5 hover:bg-yellow-500/20 text-white/60 hover:text-yellow-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border border-white/5 group-hover:border-yellow-500/30"
                            >
                                View Details <ArrowUpRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedGold && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100 }}>
                    <GoldDetailModal
                        gold={selectedGold}
                        onClose={() => setSelectedGold(null)}
                    />
                </div>
            )}
        </div>
    );
}
