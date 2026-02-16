"use client";

import { Monitor, X, Wallet, Bell, LogOut } from 'lucide-react';
import { clsx } from "clsx";
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const assets = [
    { label: "XAU/USD", active: true },
    { label: "XAG/USD", active: false },
    { label: "XPT/USD", active: false },
    { label: "Gold Futures", active: false },
];

interface TopBarProps {
    userRole: 'admin' | 'user';
    onLogout: () => void;
}

export default function TopBar({ userRole, onLogout }: TopBarProps) {
    const [balance, setBalance] = useState<number>(0);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            notation: 'compact',
            maximumFractionDigits: 2
        }).format(value);
    };

    useEffect(() => {
        if (userRole !== 'admin') return; // Don't fetch private balance if not admin

        const fetchData = async () => {
            try {
                // 1. Fetch Prices & Calculate Balance (Only needed for admin display here)
                // ... (Logic to fetch balance)
                // Actually, balance calculation depends on Anıl's holdings. 
                // We should keep fetching but only display if admin.
                // Re-using existing fetch logic but maybe optimize later.

                const priceRes = await fetch(`${API_URL}/api/prices/turkey`);
                const priceData = await priceRes.json();

                let prices: Record<string, number> = {};
                if (priceData.data) {
                    Object.entries(priceData.data).forEach(([key, val]: [string, any]) => {
                        prices[key] = val.selling;
                    });
                } else {
                    prices = { gram: 7350, quarter: 12100, ata: 50100 };
                }

                const total = (15 * (prices['ata'] || 0)) +
                    (9 * (prices['quarter'] || 0)) +
                    (2 * (prices['gram'] || 0));
                setBalance(total);

                // 2. Fetch Notifications 
                // Notifications might be public? Or Admin only? User asked for "Admin Panel" separate.
                // Assuming notifications are system alerts, maybe useful for all?
                // But "my info" implies balance. I'll keep notifications for all for now, or hide if desired.
                // Let's hide notifications for Guest too if they are "Bot Alerts" for Anıl's strategy.
                if (userRole === 'admin') {
                    const noteRes = await fetch(`${API_URL}/api/bot/notifications`);
                    const noteData = await noteRes.json();
                    if (noteData.status === 'success') {
                        setNotifications(noteData.notifications);
                    }
                }

            } catch (e) {
                console.error("Failed to fetch data", e);
                // Fallback
                const fallbackTotal = (15 * 50100) + (9 * 12100) + (2 * 7350);
                setBalance(fallbackTotal);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [userRole]);

    return (
        <div className="h-20 glass-panel m-4 mt-0 mb-4 px-6 flex items-center justify-between shadow-neon border-white/10 shrink-0 relative z-50">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-blue-300 font-bold bg-white/5 px-4 py-2 rounded-xl">
                    <Monitor size={18} className="drop-shadow-[0_0_5px_rgba(59,130,246,0.6)]" />
                    <span className="text-sm tracking-widest uppercase">AurumWatch</span>
                </div>

                <div className="flex items-center gap-2">
                    {assets.map((asset, index) => (
                        <div
                            key={index}
                            className={clsx(
                                "relative px-4 py-3 rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-300 transform font-semibold text-xs uppercase tracking-wider backdrop-blur-md",
                                asset.active
                                    ? "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.2)] scale-105"
                                    : "text-white/40 hover:text-white hover:bg-white/5 hover:scale-105 border border-transparent"
                            )}
                        >
                            <span>{asset.label}</span>
                            {asset.active && <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-yellow-500/10 to-orange-500/5 blur-md -z-10" />}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider mb-1">
                        {userRole === 'admin' ? "Anıl's Balance" : "Market Overview"}
                    </span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(34,197,94,0.4)]">
                        {userRole === 'admin' ? formatCurrency(balance) : "Active"}
                    </span>
                </div>

                <div className="flex gap-3 relative">
                    {userRole === 'admin' && (
                        <>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="w-12 h-12 glass-button rounded-full flex items-center justify-center text-white/70 hover:text-blue-400 hover:border-blue-500/50 relative"
                            >
                                <Bell size={20} />
                                {notifications.length > 0 && (
                                    <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0f172a]"></span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute top-14 right-0 w-80 bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[60]">
                                    <div className="p-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                                        <span className="text-sm font-bold text-white">Notifications</span>
                                        <span className="text-xs text-white/40">{notifications.length} messages</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-4 text-center text-white/30 text-xs">No notifications yet</div>
                                        ) : (
                                            notifications.map((note, i) => (
                                                <div key={i} className="p-3 border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <div className="text-xs text-white/80 whitespace-pre-wrap font-sans">{note.text}</div>
                                                    <div className="text-[10px] text-white/30 mt-1 text-right">
                                                        {new Date(note.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/10 hover:border-yellow-400/50 transition-colors shadow-lg cursor-pointer"
                        >
                            <div className={`w-full h-full bg-gradient-to-br ${userRole === 'admin' ? 'from-indigo-500 to-purple-600' : 'from-gray-600 to-gray-700'} flex items-center justify-center text-white font-bold text-lg`}>
                                {userRole === 'admin' ? 'A' : 'G'}
                            </div>
                        </button>

                        {showUserMenu && (
                            <div className="absolute top-14 right-0 w-40 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[60]">
                                <button
                                    onClick={onLogout}
                                    className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-white/70 hover:text-red-400 text-sm flex items-center gap-2 transition-colors"
                                >
                                    <LogOut size={16} /> Log Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
