"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts';
import { Clock, TrendingUp, TrendingDown, Layers } from 'lucide-react';
import { clsx } from 'clsx';
import { useState } from 'react';

interface DataPoint {
    date: string;
    price: number;
}

interface GoldChartProps {
    data: DataPoint[];
    period: '7d' | '30d' | '90d' | '1y';
    onPeriodChange: (period: '7d' | '30d' | '90d' | '1y') => void;
    currentPrice: number;
}

export default function GoldChart({ data, period, onPeriodChange, currentPrice }: GoldChartProps) {
    const [hoveredData, setHoveredData] = useState<any>(null);

    const handleBuy = () => alert("Buy order executed (Simulated)");
    const handleSell = () => alert("Sell order executed (Simulated)");

    return (
        <div className="glass-panel m-4 flex-1 flex flex-col h-full relative overflow-hidden shadow-neon border-white/10 rounded-3xl">
            {/* Chart Header / Toolbar - Standard Flex Layout, NOT Absolute */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 gap-4 z-20 relative">
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 w-max shadow-lg">
                        <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse shadow-[0_0_10px_#facc15]"></div>
                        <h2 className="text-white font-bold text-xl tracking-tight flex items-center gap-2">
                            XAU/USD <span className="text-white/40 text-sm font-medium">Gold Spot</span>
                        </h2>
                    </div>
                    <div className="flex items-baseline gap-4 mt-2">
                        <span className="text-3xl md:text-5xl font-black bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-all duration-300">
                            {hoveredData ? hoveredData.price.toFixed(2) : currentPrice?.toFixed(2) || "Loading..."}
                        </span>
                        <span className="text-lg font-bold text-emerald-400 flex items-center bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 backdrop-blur-sm shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                            <TrendingUp size={20} className="mr-1" /> +0.84%
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-end gap-4">
                    <div className="flex bg-black/20 backdrop-blur-md rounded-2xl p-1 gap-1 border border-white/5 shadow-inner">
                        {['30d', '7d', '1d', '12h', '30m'].map((p) => (
                            <button
                                key={p}
                                className={clsx(
                                    "px-4 py-2 text-xs font-bold rounded-xl transition-all duration-300 uppercase tracking-wide",
                                    (p === '7d' && period === '7d') || (p === '30d' && period === '30d')
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105"
                                        : "text-white/40 hover:text-white hover:bg-white/10"
                                )}
                                onClick={() => onPeriodChange(p as any)}
                            >
                                {p}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleBuy}
                            className="bg-gradient-to-br from-emerald-400 to-emerald-600 hover:from-emerald-300 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 border border-emerald-300/30 backdrop-blur-md cursor-pointer"
                        >
                            <TrendingUp size={18} /> BUY
                        </button>
                        <button
                            onClick={handleSell}
                            className="bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-bold py-3 px-8 rounded-2xl shadow-[0_0_20px_rgba(244,63,94,0.4)] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-2 border border-rose-300/30 backdrop-blur-md cursor-pointer"
                        >
                            <TrendingDown size={18} /> SELL
                        </button>
                    </div>
                </div>
            </div>

            {/* The Chart - Adjusted padding to respect header */}
            <div className="flex-1 w-full min-h-[250px] px-4 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{ top: 20, right: 10, left: 10, bottom: 0 }}
                        onMouseMove={(e: any) => {
                            if (e.activePayload && e.activePayload[0]) {
                                setHoveredData(e.activePayload[0].payload);
                            }
                        }}
                        onMouseLeave={() => setHoveredData(null)}
                    >
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5} />
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }}
                            minTickGap={50}
                            dy={15}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 500 }}
                            tickFormatter={(value) => value.toFixed(0)}
                            width={50}
                            dx={5}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                borderColor: 'rgba(255,255,255,0.1)',
                                color: '#fff',
                                borderRadius: '16px',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
                                padding: '12px 16px',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            itemStyle={{ color: '#a78bfa', fontWeight: 'bold' }}
                            cursor={{ stroke: '#a78bfa', strokeWidth: 2, strokeDasharray: '5 5' }}
                            formatter={(value: number | undefined) => [`$${(value ?? 0).toFixed(2)}`, 'Price']}
                            separator=": "
                        />
                        <Area
                            type="monotone"
                            dataKey="price"
                            stroke="#a78bfa"
                            fillOpacity={1}
                            fill="url(#colorPrice)"
                            strokeWidth={3}
                            // Removed filter="url(#glow)" as it might interfere with activeDot rendering
                            activeDot={{ r: 8, fill: '#fff', stroke: '#a78bfa', strokeWidth: 4 }}
                        />
                        {/* Current Price Line */}
                        {currentPrice && (
                            <ReferenceLine y={currentPrice} stroke="#34d399" strokeDasharray="3 3" strokeWidth={2}>
                                <text x="1000" y="0"></text>
                            </ReferenceLine>
                        )}
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Bottom status bar in chart */}
            <div className="h-10 border-t border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-6 text-xs text-white/40 rounded-b-3xl mt-4 shrink-0">
                <div className="flex gap-6">
                    <span className="flex items-center gap-2"><Clock size={12} className="text-blue-400" /> Market Open</span>
                    <span className="flex items-center gap-2"><Layers size={12} className="text-purple-400" /> 24h Vol: <span className="text-white/70">12.5M</span></span>
                </div>
                <div className="flex gap-6">
                    <span>Spread: <span className="text-white/70">0.12</span></span>
                    <span className="text-emerald-400 font-bold flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
                        Connection Stable
                    </span>
                </div>
            </div>
        </div>
    );
}
