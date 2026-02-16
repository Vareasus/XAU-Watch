"use client";

import { useState, useEffect } from 'react';
import { Shield, Save, RefreshCw, Activity, Database, ScrollText } from 'lucide-react';
import { clsx } from 'clsx';
import { API_URL } from '../config';

interface Limit {
    name: string;
    buy: number;
    sell: number;
}

export default function AdminView() {
    const [limits, setLimits] = useState<Record<string, Limit>>({});
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<string>("");

    // Logs State
    const [logs, setLogs] = useState<string[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(false);

    const fetchLimits = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/bot/limits`);
            const data = await res.json();
            if (data.status === 'success') {
                setLimits(data.limits);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        // Don't set global loading as we might poll
        try {
            const res = await fetch(`${API_URL}/api/admin/logs`);
            const data = await res.json();
            if (data.status === 'success') {
                setLogs(data.logs);
            }
        } catch (e) {
            console.error("Failed to fetch logs", e);
        }
    };

    useEffect(() => {
        fetchLimits();
        fetchLogs();

        // Poll logs every 5 seconds to capture new logins live
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    const updateLimit = async (asset: string, type: 'buy' | 'sell', value: number) => {
        const newLimits = { ...limits };
        newLimits[asset][type] = value;
        setLimits(newLimits);
    };

    const saveLimit = async (asset: string) => {
        const limit = limits[asset];
        setStatus("Saving...");
        try {
            const res = await fetch(`${API_URL}/api/bot/limits`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asset: asset,
                    buy: limit.buy,
                    sell: limit.sell
                })
            });
            const data = await res.json();
            if (data.status === 'success') {
                setStatus(`Saved ${limit.name}!`);
                setTimeout(() => setStatus(""), 3000);
            } else {
                setStatus("Error saving.");
            }
        } catch (e) {
            setStatus("Network error.");
        }
    };

    return (
        <div className="flex-1 glass-panel m-4 flex flex-col p-6 shadow-neon border-white/10 rounded-3xl overflow-y-auto animate-in fade-in slide-in-from-bottom-5 duration-500">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield className="text-red-500" /> Admin Panel
            </h2>
            <p className="text-white/50 mb-8">Manage Telegram Bot Thresholds & System Settings</p>

            {loading ? (
                <div className="text-white/50 flex items-center gap-2"><RefreshCw className="animate-spin" /> Loading configuration...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(limits).map(([key, limit]) => (
                        <div key={key} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-white">{limit.name}</h3>
                                <div className="text-xs font-mono text-white/40 uppercase bg-black/20 px-2 py-1 rounded">{key}</div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-green-400 font-bold uppercase tracking-wider block mb-1">Buy Target (Lower Limit)</label>
                                    <input
                                        type="number"
                                        value={limit.buy}
                                        onChange={(e) => updateLimit(key, 'buy', parseFloat(e.target.value))}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:border-green-500/50 outline-none transition-colors"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-red-400 font-bold uppercase tracking-wider block mb-1">Sell Target (Upper Limit)</label>
                                    <input
                                        type="number"
                                        value={limit.sell}
                                        onChange={(e) => updateLimit(key, 'sell', parseFloat(e.target.value))}
                                        className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:border-red-500/50 outline-none transition-colors"
                                    />
                                </div>

                                <button
                                    onClick={() => saveLimit(key)}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    <Save size={16} /> Update Config
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {status && (
                <div className="fixed bottom-8 right-8 bg-[#0f172a] border border-white/20 text-white px-6 py-3 rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-5">
                    {status}
                </div>
            )}

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
                {/* Security Logs Panel */}
                <div className="bg-black/30 border border-white/10 rounded-2xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Database size={20} className="text-purple-400" /> User Credentials Log
                    </h3>

                    <div className="bg-[#0f172a] rounded-xl p-4 h-64 overflow-y-auto font-mono text-[10px] text-white/70 shadow-inner border border-white/5 custom-scrollbar">
                        {loadingLogs && logs.length === 0 ? (
                            <div className="text-center py-10 opacity-50">Loading logs...</div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-10 opacity-30">No activity recorded yet</div>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className="mb-1 border-b border-white/5 pb-1 whitespace-pre-wrap break-all hover:bg-white/5 transition-colors px-1 rounded flex gap-2">
                                    <span className="text-blue-400 opacity-50 select-none">{i + 1}.</span>
                                    <span>{log.trim()}</span>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-2 text-right">
                        <button
                            onClick={fetchLogs}
                            className="text-xs text-white/30 hover:text-white flex items-center gap-1 ml-auto transition-colors"
                        >
                            <RefreshCw size={12} className={loadingLogs ? "animate-spin" : ""} /> Refresh Logs
                        </button>
                    </div>
                </div>

                {/* System Status Panel */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 h-fit">
                    <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                        <Activity size={20} className="text-red-400" /> System Status
                    </h3>
                    <div className="text-white/60 text-sm">
                        Bot is currently <span className="text-green-400 font-bold">ACTIVE</span>.<br />
                        Global message rate limit: 1 message / 3 hours.<br />
                        Monitoring cycle: Every 5 minutes.
                    </div>
                </div>
            </div>
        </div>
    );
}
